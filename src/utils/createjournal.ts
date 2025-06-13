"use server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { journals, documents, quizzes, users } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { generateQuizFromGemini } from "src/app/api/gemini/gemini";
import { revalidatePath } from "next/cache";

export async function createJournal(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  let userResult = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  if (!userResult.length) {
    const [newUser] = await db
      .insert(users)
      .values({
        userId: userId,
        email: "unknown@example.com",
        username: null,
        profileImageUrl: null,
        createdAt: new Date(),
      })
      .returning();
    if (!newUser) throw new Error("Failed to create user in database.");
    userResult = [newUser];
  }

  const userUuid = userResult[0]?.userId;
  if (!userUuid) throw new Error("User ID not found after user creation.");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const fileUrl = formData.get("fileUrl") as string;
  const fileKey = formData.get("fileKey") as string;
  const fileName = formData.get("fileName") as string;
  const fileSize = Number(formData.get("fileSize"));

  if (!title || !fileUrl || !fileKey || !fileName || isNaN(fileSize)) {
    throw new Error("Title and PDF are required");
  }

  const [newJournal] = await db
    .insert(journals)
    .values({
      id: crypto.randomUUID(),
      userId: userUuid,
      title,
      description: description || null,
      lastModified: new Date(),
      createdAt: new Date(),
    })
    .returning();

  if (!newJournal) throw new Error("Failed to create journal");

  await db.insert(documents).values({
    id: crypto.randomUUID(),
    journalId: newJournal.id,
    url: fileUrl,
    key: fileKey,
    name: fileName,
    size: fileSize,
    uploadedAt: new Date(),
  });

  const generatedQuiz = await generateQuizFromGemini(formData);
  await db.insert(quizzes).values({
    id: crypto.randomUUID(),
    journalId: newJournal.id,
    questions: generatedQuiz.questions,
    createdAt: new Date(),
  });

  redirect(`/journal/${newJournal.id}`);
}

export async function deleteJournal(journalId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  if (!userResult.length || !userResult[0]) {
    throw new Error("User not found in database.");
  }

  const userUuid = userResult[0].userId;

  const journalResult = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, journalId), eq(journals.userId, userUuid)))
    .limit(1);

  if (!journalResult.length) {
    throw new Error("Journal not found or you do not have permission to delete it.");
  }

  await db.delete(quizzes).where(eq(quizzes.journalId, journalId));
  await db.delete(documents).where(eq(documents.journalId, journalId));
  await db.delete(journals).where(eq(journals.id, journalId));

  revalidatePath("/journal");
}
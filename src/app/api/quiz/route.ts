import { NextResponse } from "next/server";
import { generateQuizFromGemini } from "~/app/api/gemini/gemini";
import { db } from "~/server/db";
import { quizzes } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const journalId = formData.get("journalId") as string;

  if (!journalId) {
    return NextResponse.json({ error: "Journal ID is required" }, { status: 400 });
  }

  try {
    const quiz = await generateQuizFromGemini(formData);
    await db.insert(quizzes).values({
      id: crypto.randomUUID(),
      journalId,
      questions: quiz.questions,
      createdAt: new Date(),
    });
    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
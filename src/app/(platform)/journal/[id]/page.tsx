// src/app/(platform)/journal/[id]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { journals, documents, quizzes, users } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { FileText, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

type JournalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function JournalPage({ params }: JournalPageProps) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Please sign in to view this journal.</p>
            <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              <a href="/sign-in">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { id } = await params;

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  if (!userResult.length || !userResult[0]) {
    throw new Error("User not found in database. Please contact support.");
  }

  const userUuid = userResult[0]!.userId;

  const journalResult = await db
    .select()
    .from(journals)
    .where(and(eq(journals.id, id), eq(journals.userId, userUuid)))
    .leftJoin(documents, eq(documents.journalId, journals.id))
    .leftJoin(quizzes, eq(quizzes.journalId, journals.id));

  if (!journalResult.length) {
    notFound();
  }

  const [result] = journalResult;
  if (!result) {
    notFound();
  }

  const journal = {
    id: result.journal.id,
    title: result.journal.title,
    description: result.journal.description || "",
    createdAt: result.journal.createdAt.toISOString(),
    lastModified: result.journal.lastModified.toISOString(),
    pdfUrl: result.document?.url || "",
    quiz: result.quiz || null,
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-gray-900">{journal.title}</CardTitle>
            <p className="text-sm text-gray-600">
              Created: {new Date(journal.createdAt).toLocaleString()} | Last Modified:{" "}
              {new Date(journal.lastModified).toLocaleString()}
            </p>
          </CardHeader>
          {journal.description && (
            <CardContent>
              <p className="text-gray-700">{journal.description}</p>
            </CardContent>
          )}
        </Card>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Uploaded PDF</CardTitle>
            </CardHeader>
            <CardContent>
              {journal.pdfUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start text-indigo-600 hover:bg-indigo-50"
                >
                  <a href={journal.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-5 w-5 mr-2" />
                    View PDF
                  </a>
                </Button>
              ) : (
                <p className="text-gray-600">No PDF uploaded.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              {journal.quiz ? (
                <div className="space-y-4">
                  <p className="font-semibold text-gray-900">Quiz Available</p>
                  <Button asChild variant="outline" className="mt-2">
                    <Link href={`/journal/${journal.id}/quiz/${journal.quiz.id}`}>
                      Take Quiz
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="mt-2 ml-2">
                    <Link href={`/journal/${journal.id}/quiz/${journal.quiz.id}/results`}>
                      View Results
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">No quiz available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button asChild variant="outline" className="text-indigo-600 hover:bg-indigo-50">
            <Link href="/journal">
              <ChevronRight className="h-4 w-4 mr-2" />
              Back to Journals
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
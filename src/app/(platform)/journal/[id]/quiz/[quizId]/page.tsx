// src/app/(platform)/journal/[id]/quiz/[quizId]/page.tsx
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { quizzes } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import QuizClient from "./QuizClient";

type QuizPageProps = {
  params: Promise<{ id: string; quizId: string }>;
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-xl font-semibold">Authentication Required</h2>
          <p className="text-gray-600 mt-2">Please sign in to take this quiz.</p>
          <a
            href="/sign-in"
            className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const resolvedParams = await params; // Await the params promise
  const { id, quizId } = resolvedParams;

  const quizResult = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quizResult.length) {
    notFound();
    return null;
  }

  const rawQuiz = quizResult[0];

  if (!rawQuiz) {
    notFound();
    return null;
  }

  const quiz = {
    ...rawQuiz,
    questions:
      typeof rawQuiz.questions === "string"
        ? JSON.parse(rawQuiz.questions)
        : rawQuiz.questions,
    responses:
      rawQuiz.responses && typeof rawQuiz.responses === "string"
        ? JSON.parse(rawQuiz.responses)
        : rawQuiz.responses,
    userId: rawQuiz.userId ?? undefined,
    score: rawQuiz.score ?? undefined,
    totalQuestions: rawQuiz.totalQuestions ?? undefined,
  };

  return <QuizClient quiz={quiz} journalId={id} />;
}
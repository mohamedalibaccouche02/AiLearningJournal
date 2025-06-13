// src/app/(platform)/journal/[id]/quiz/[quizId]/results/page.tsx
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { db } from "~/server/db";
import { quizzes } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { Button } from "src/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Progress } from "src/components/ui/progress";

type QuizQuestion = {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correct: string; // Correct answer text
};
type QuizResponse = { questionId: string; selectedAnswer: string; isCorrect: boolean };
type Quiz = {
  id: string;
  journalId: string;
  questions: QuizQuestion[] | string; // Handle stringified JSON
  userId?: string;
  score?: number;
  totalQuestions?: number;
  responses?: QuizResponse[] | string; // Handle stringified JSON
};

type QuizResultsPageProps = {
  params: Promise<{ id: string; quizId: string }>;
};

export default async function QuizResultsPage({ params }: QuizResultsPageProps) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Please sign in to view quiz results.</p>
            <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
              <a href="/sign-in">Sign In</a>
            </Button>
          </CardContent>
        </Card>
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
  }

  const rawQuiz = quizResult[0];
  if (!rawQuiz || !rawQuiz.userId || rawQuiz.userId !== userId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>No Results Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">You haven’t taken this quiz yet.</p>
              <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                <Link href={`/journal/${id}/quiz/${quizId}`}>Take Quiz</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Parse JSON fields if necessary
  const quiz: Quiz = {
    ...rawQuiz,
    questions:
      typeof rawQuiz.questions === "string"
        ? JSON.parse(rawQuiz.questions)
        : rawQuiz.questions || [],
    responses:
      typeof rawQuiz.responses === "string"
        ? JSON.parse(rawQuiz.responses)
        : rawQuiz.responses || [],
    userId: rawQuiz.userId ?? undefined,
    score: rawQuiz.score ?? 0,
    totalQuestions: rawQuiz.totalQuestions ?? (rawQuiz.questions ? (rawQuiz.questions as QuizQuestion[]).length : 0),
  };

  // Log for debugging
  if (!quiz.responses || quiz.responses.length === 0) {
    console.warn(`No responses found for quiz ${quizId}, user ${userId}`);
  }

  const totalQuestions = quiz.totalQuestions ?? 0;
  const score = quiz.score;
  const percentage = totalQuestions > 0 ? ((score ?? 0) / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Completed!</CardTitle>
            <p className="text-gray-600">You’ve completed the quiz on {id}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{score} / {totalQuestions}</p>
              <p className="text-gray-500">Correct answers</p>
            </div>
            <Progress value={percentage} className="h-3" />
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Review Your Answers:</h3>
              {(Array.isArray(quiz.questions) ? quiz.questions : []).map((question: QuizQuestion, index: number) => {
                const responsesArray: QuizResponse[] = Array.isArray(quiz.responses)
                  ? quiz.responses
                  : typeof quiz.responses === "string"
                  ? JSON.parse(quiz.responses)
                  : [];
                const userResponse = responsesArray.find((r: QuizResponse) => r.questionId === question.id);
                const correctAnswerText = question.correct;
                const selectedAnswerText = userResponse
                  ? question.options.find((opt) => opt.id === userResponse.selectedAnswer)?.text || "Not answered"
                  : "Not answered";
                const isCorrect = userResponse?.isCorrect ?? false;

                return (
                  <div key={question.id} className="border p-4 rounded-md">
                    <p className="font-medium">Question {index + 1}: {question.text}</p>
                    <p className="text-sm text-gray-600">Correct Answer: {correctAnswerText}</p>
                    <p className="text-sm text-gray-600">Your Answer: {selectedAnswerText}</p>
                    {userResponse && isCorrect && <p className="text-sm text-green-600">Correct!</p>}
                    {userResponse && !isCorrect && <p className="text-sm text-red-600">Incorrect!</p>}
                  </div>
                );
              })}
            </div>
            <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Link href={`/journal/${id}`}>
                <ChevronRight className="h-4 w-4 mr-2" />
                Back to Journal
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
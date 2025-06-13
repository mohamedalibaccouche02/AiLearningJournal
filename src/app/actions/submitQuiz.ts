// src/app/actions/submitQuiz.ts
"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { quizzes } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function submitQuiz(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const quizId = formData.get("quizId") as string;
  const responses = JSON.parse(formData.get("responses") as string) as {
    questionId: string;
    selectedAnswer: string;
  }[];

  // Validate input
  if (!quizId || !responses || responses.length === 0) {
    throw new Error("Invalid quizId or responses data");
  }

  const quizResult = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.id, quizId))
    .limit(1);

  if (!quizResult.length) throw new Error("Quiz not found");

  const quiz = quizResult[0];
  if (!quiz) throw new Error("Quiz not found");
  let correctAnswers = 0;

  const questions = (typeof quiz.questions === "string"
    ? JSON.parse(quiz.questions)
    : quiz.questions) as Array<{
      id: string;
      text: string;
      options: { id: string; text: string }[];
      correct: string;
    }>;

  // Validate that all question IDs in responses match the quiz
  const questionIds = new Set(questions.map(q => q.id));
  const invalidResponses = responses.filter(r => !questionIds.has(r.questionId));
  if (invalidResponses.length > 0) {
    console.warn("Invalid response IDs detected:", invalidResponses);
  }

  const evaluatedResponses = questions.map((question) => {
    const userResponse = responses.find((r) => r.questionId === question.id);
    const selectedOption = question.options.find((opt) => opt.id === userResponse?.selectedAnswer);
    const selectedText = selectedOption?.text || "";
    const isCorrect = selectedText.toLowerCase() === question.correct.toLowerCase();
    if (isCorrect) correctAnswers++;
    return { questionId: question.id, selectedAnswer: selectedText, isCorrect };
  });

  // Enhanced retry logic with detailed logging
  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await db.transaction(async (tx) => {
        await tx
          .update(quizzes)
          .set({
            userId,
            score: correctAnswers,
            totalQuestions: questions.length,
            responses: evaluatedResponses,
          })
          .where(eq(quizzes.id, quizId));
      });
      console.log(`Successfully updated quiz ${quizId} on attempt ${attempt}`);
      break; // Success, exit loop
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`Database update failed after ${maxRetries} attempts for quiz ${quizId}:`, error);
        throw error; // Throw on last attempt
      }
      console.error(`Database update failed (attempt ${attempt}/${maxRetries} for quiz ${quizId}):`, error);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }

  return {
    success: true,
    score: correctAnswers,
    totalQuestions: questions.length,
  };
}
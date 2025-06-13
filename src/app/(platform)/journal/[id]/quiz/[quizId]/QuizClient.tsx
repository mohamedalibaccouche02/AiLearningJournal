// src/app/(platform)/journal/[id]/quiz/[quizId]/QuizClient.tsx
"use client";
import { useState, useEffect, useTransition } from "react";
import { Button } from "src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { RadioGroup, RadioGroupItem } from "src/components/ui/radio-group";
import { Label } from "src/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Progress } from "src/components/ui/progress";
import { Loader2 } from "lucide-react";
import { submitQuiz } from "~/app/actions/submitQuiz";

type QuizQuestion = { id: string; text: string; options: { id: string; text: string }[]; correct: string };
type Quiz = {
  id: string;
  journalId: string;
  title?: string;
  questions: QuizQuestion[];
  userId?: string;
  score?: number;
  totalQuestions?: number;
  responses?: { questionId: string; selectedAnswer: string; isCorrect: boolean }[];
};

export default function QuizClient({ quiz, journalId }: { quiz: Quiz; journalId: string }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (quiz.questions) {
      const initialAnswers = quiz.questions.reduce((acc, q) => {
        acc[q.id] = selectedAnswers[q.id] || "";
        return acc;
      }, {} as Record<string, string>);
      setSelectedAnswers(initialAnswers);
    }
  }, [quiz.questions]);

  useEffect(() => {
    console.log("Initial quiz questions:", quiz.questions);
  }, [quiz.questions]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => {
      const newAnswers = { ...prev, [questionId]: answerId };
      console.log(`Selected for ${questionId}: ${answerId}, Full state:`, newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      let correctAnswers = 0;
      quiz.questions.forEach((question) => {
        const selectedOption = question.options.find((opt) => opt.id === selectedAnswers[question.id]);
        const selectedText = selectedOption ? selectedOption.text : "";
        if (selectedText === question.correct) correctAnswers++;
      });
      setScore(correctAnswers);
      setQuizCompleted(true);
    }
  };

 const handleFinish = () => {
  startTransition(async () => {
    const formData = new FormData();
    formData.set("quizId", quiz.id);
    const responses = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] || "",
    }));
    formData.set("responses", JSON.stringify(responses));
    try {
      await submitQuiz(formData); // Save to DB
      router.push(`/journal/${journalId}/quiz/${quiz.id}/results`);
    } catch (error) {
      toast.error("Failed to save results: " + (error as Error).message);
    }
  });
};

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (quizCompleted) {
    const totalQuestions = quiz.questions.length;
    const percentage = (score / totalQuestions) * 100;

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Completed!</CardTitle>
              <p className="text-gray-600">You’ve completed the quiz on {quiz.title || "Unknown"}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{score} / {totalQuestions}</p>
                <p className="text-gray-500">Correct answers</p>
              </div>
              <Progress value={percentage} className="h-3" />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Your Answers:</h3>
                {quiz.questions.map((question, index) => {
                  const selectedOption = question.options.find((opt) => opt.id === selectedAnswers[question.id]);
                  const selectedText = selectedOption ? selectedOption.text : "Not answered";
                  const isCorrect = selectedText === question.correct;

                  return (
                    <div key={question.id} className="border p-4 rounded-md">
                      <p className="font-medium">Question {index + 1}: {question.text}</p>
                      <p className="text-sm text-gray-600">Correct Answer: {question.correct}</p>
                      <p className="text-sm text-gray-600">Your Answer: {selectedText}</p>
                      {isCorrect && selectedAnswers[question.id] && (
                        <p className="text-sm text-green-600">Correct!</p>
                      )}
                      {!isCorrect && selectedAnswers[question.id] && (
                        <p className="text-sm text-red-600">Incorrect!</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button onClick={handleFinish} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Finish
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestionId = quiz.questions[currentQuestion]?.id ?? "";
  const isAnswerSelected = !!selectedAnswers[currentQuestionId];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </p>
            <Progress
              value={((currentQuestion + 1) / quiz.questions.length) * 100}
              className="h-2"
            />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <h3 className="text-lg font-medium">{quiz.questions[currentQuestion]?.text ?? ""}</h3>
              <RadioGroup
                value={selectedAnswers[currentQuestionId] || ""}
                onValueChange={(value) => handleAnswerSelect(currentQuestionId, value)}
              >
                {quiz.questions[currentQuestion]?.options?.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-100">
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                )) || []}
              </RadioGroup>
              <Button
                onClick={handleNext}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={!isAnswerSelected}
              >
                {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
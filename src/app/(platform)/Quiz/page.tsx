// app/(platform)/Quiz/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "src/components/ui/card";
import { RadioGroup, RadioGroupItem } from "src/components/ui/radio-group";
import { Label } from "src/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Progress } from "src/components/ui/progress";
import { Loader2, Upload } from "lucide-react";
import { UploadButton } from "~/utils/uploadthing";
import "@uploadthing/react/styles.css";

async function generateQuiz(formData: FormData) {
  const response = await fetch("/api/quiz", {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("Failed to generate quiz");
  return await response.json();
}

export default function QuizBuilderPage() {
  const [quiz, setQuiz] = useState<{ id: string; title?: string; questions: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleGenerateQuiz = useCallback(async () => {
    if (fileUrl) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.set("title", "Generated Quiz");
        formData.set("fileUrl", fileUrl);
        formData.set("fileKey", "tempKey");
        formData.set("fileName", "temp.pdf");
        formData.set("fileSize", "0");
        const quizData = await generateQuiz(formData);
        setQuiz(quizData);
      } catch (error) {
        toast.error((error as Error).message || "Failed to generate quiz");
      } finally {
        setLoading(false);
      }
    }
  }, [fileUrl]);

  useEffect(() => {
    if (fileUrl) handleGenerateQuiz();
  }, [fileUrl, handleGenerateQuiz]);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      let correctAnswers = 0;
      quiz?.questions.forEach((question) => {
        const selectedOption = question.options.find((opt: { id: string; text: string }) => opt.id === selectedAnswers[question.id]);
        const selectedText = selectedOption ? selectedOption.text : "";
        if (selectedText === question.correct) correctAnswers++;
      });
      setScore(correctAnswers);
      setQuizCompleted(true);
    }
  };

  const handleFinish = () => {
    router.push("/journal"); // Adjust navigation as needed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (quizCompleted) {
    const totalQuestions = quiz?.questions.length || 0;
    const percentage = (score / totalQuestions) * 100;

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Completed!</CardTitle>
              <p className="text-gray-600">You’ve completed the quiz on {quiz?.title || "Unknown"}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold">{score} / {totalQuestions}</p>
                <p className="text-gray-500">Correct answers</p>
              </div>
              <Progress value={percentage} className="h-3" />
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Review Your Answers:</h3>
                {quiz?.questions.map((question, index) => {
                  const selectedOption = question.options.find((opt: { id: string; text: string }) => opt.id === selectedAnswers[question.id]);
                  const selectedText = selectedOption ? selectedOption.text : "Not answered";
                  const isCorrect = selectedText === question.correct;

                  return (
                    <div key={question.id} className="border p-4 rounded-md">
                      <p className="font-medium">Question {index + 1}: {question.text}</p>
                      <p className="text-sm text-gray-600">
                        Correct Answer: {question.correct}
                      </p>
                      <p className="text-sm text-gray-600">
                        Your Answer: {selectedText}
                      </p>
                      {!isCorrect && selectedAnswers[question.id] && (
                        <p className="text-sm text-red-600">Incorrect!</p>
                      )}
                      {isCorrect && selectedAnswers[question.id] && (
                        <p className="text-sm text-green-600">Correct!</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{quiz?.title || "Generate Quiz"}</CardTitle>
            <p className="text-gray-600">
              Question {currentQuestion + 1} of {quiz?.questions.length || 0}
            </p>
            <Progress
              value={((currentQuestion + 1) / (quiz?.questions.length || 1)) * 100}
              className="h-2"
            />
          </CardHeader>
          <CardContent>
            {quiz?.questions[currentQuestion] ? (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">{quiz.questions[currentQuestion].text}</h3>
                <RadioGroup
                  value={selectedAnswers[quiz.questions[currentQuestion].id] || ""}
                  onValueChange={(value) => handleAnswerSelect(quiz.questions[currentQuestion].id, value)}
                >
                  {quiz.questions[currentQuestion].options.map((option: { id: string; text: string }) => (
                    <div key={option.id} className="flex items-center space-x-2 p-3 rounded-md hover:bg-gray-100">
                      <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                      <Label htmlFor={`option-${option.id}`} className="flex-grow cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <Button
                  onClick={handleNext}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={!selectedAnswers[quiz?.questions[currentQuestion].id]}
                >
                  {currentQuestion < (quiz?.questions.length || 0) - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <UploadButton
                  endpoint="pdfUploader"
                  appearance={{
                    button: "bg-indigo-600 text-white hover:bg-indigo-700",
                    allowedContent: "text-gray-600",
                  }}
                  content={{
                    button({ ready }) {
                      return ready ? (
                        <span className="flex items-center">
                          <Upload className="h-4 w-4 mr-2" /> Upload PDF
                        </span>
                      ) : "Loading...";
                    },
                    allowedContent({ ready }) {
                      return ready ? "PDF files only (max 16MB)" : "";
                    },
                  }}
                  onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                      const uploadedFile = res[0];
                      if (uploadedFile) {
                        setFileUrl(uploadedFile.url);
                      }
                    }
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`Upload failed: ${error.message}`);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
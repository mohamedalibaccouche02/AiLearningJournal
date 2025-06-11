// src/app/api/gemini/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function getGeminiFlashcards(pdfUrl: string) {
  try {
    console.log("getGeminiFlashcards called with URL:", pdfUrl); // Debug

    // Fetch the PDF content
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from ${pdfUrl}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Convert to base64 for Gemini
    const base64PDF = pdfBuffer.toString("base64");

    // Use Gemini API to process the PDF
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64PDF,
        },
      },
      "Extract all text from this PDF and generate 5 flashcards in the format: **Flashcard X**\\nQuestion: [question]?\\nAnswer: [answer]. Ensure the questions are based on the content and answers are concise.",
    ]);

    const text = result.response.text();
    console.log("Gemini response text:", text); // Debug

    // Parse into flashcards
    const flashcards = [];
    const lines = text.split("\n");
    let currentFlashcard = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("**Flashcard")) {
        if (currentFlashcard && currentFlashcard.question && currentFlashcard.answer) {
          flashcards.push(currentFlashcard);
        }
        currentFlashcard = { question: "", answer: "" };
      } else if (trimmedLine.startsWith("Question:")) {
        if (currentFlashcard) {
          currentFlashcard.question = trimmedLine.replace("Question:", "").trim().replace("?", "");
        }
      } else if (trimmedLine.startsWith("Answer:")) {
        if (currentFlashcard) {
          currentFlashcard.answer = trimmedLine.replace("Answer:", "").trim();
        }
      }
    }

    // Add the last flashcard if it’s complete
    if (currentFlashcard && currentFlashcard.question && currentFlashcard.answer) {
      flashcards.push(currentFlashcard);
    }

    // Limit to 5 flashcards and ensure valid entries
    const validFlashcards = flashcards
      .filter((card) => card.question && card.answer)
      .slice(0, 5);

    console.log("Parsed flashcards:", validFlashcards); // Debug
    return validFlashcards.length > 0 ? validFlashcards : [];
  } catch (error) {
    console.error("getGeminiFlashcards error:", error); // Debug
    throw new Error("Failed to generate flashcards: " + (error as Error).message);
  }
}

export async function generateQuizFromGemini(formData: FormData) {
  try {
    console.log("generateQuizFromGemini called with formData:", formData); // Debug

    const fileUrl = formData.get("fileUrl") as string;

    if (!fileUrl) {
      throw new Error("Invalid input: fileUrl is required");
    }

    // Fetch the PDF content
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from ${fileUrl}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    const base64PDF = pdfBuffer.toString("base64");

    // Gemini prompt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64PDF,
        },
      },
      "Extract all text from this PDF and generate 5 multiple-choice quiz questions. Each question should have exactly 4 options and a single correct answer from those options. Use the format: **Question X**\\nText: [question text]?\\nOptions: [option1], [option2], [option3], [option4]\\nCorrect: [correct option]. Ensure questions are based on the content, options are plausible, and the correct answer is one of the four options.",
    ]);

    const text = result.response.text();
    console.log("Gemini response text for quiz:", text); // Debug

    // Parse into quiz questions
    type QuizOption = { id: string; text: string };
    type QuizQuestion = { id: string; text: string; options: QuizOption[]; correct: string };

    const questions: QuizQuestion[] = [];
    const lines = text.split("\n");
    let currentQuestion: QuizQuestion | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("**Question")) {
        if (currentQuestion && currentQuestion.text && currentQuestion.options && currentQuestion.options.length >= 4 && currentQuestion.correct) {
          questions.push(currentQuestion);
        }
        currentQuestion = { id: uuidv4(), text: "", options: [], correct: "" };
      } else if (trimmedLine.startsWith("Text:")) {
        if (currentQuestion) {
          currentQuestion.text = trimmedLine.replace("Text:", "").trim().replace("?", "");
        }
      } else if (trimmedLine.startsWith("Options:")) {
        if (currentQuestion) {
          const optionsText = trimmedLine.replace("Options:", "").trim();
          currentQuestion.options = optionsText.split(",").map((opt) => ({ id: uuidv4(), text: opt.trim() }));
        }
      } else if (trimmedLine.startsWith("Correct:")) {
        if (currentQuestion) {
          currentQuestion.correct = trimmedLine.replace("Correct:", "").trim();
        }
      }
    }

    // Add the last question if it’s complete
    if (currentQuestion && currentQuestion.text && currentQuestion.options && currentQuestion.options.length >= 4 && currentQuestion.correct) {
      questions.push(currentQuestion);
    }

    // Debug: Log all parsed questions before validation
    console.log("Parsed questions before validation:", questions);

    // Relaxed validation to match previous behavior (at least 4 options, no strict correct match)
    const validQuestions = questions.filter((q) => q.text && q.options.length >= 4 && q.correct);

    console.log("Valid questions after validation:", validQuestions);

    if (validQuestions.length === 0) {
      throw new Error("No valid quiz questions generated");
    }

    const quiz = {
      id: uuidv4(),
      title: "Generated Quiz",
      questions: validQuestions,
    };

    console.log("Generated quiz:", quiz); // Debug
    return quiz;
  } catch (error) {
    console.error("generateQuizFromGemini error:", error); // Debug
    throw new Error("Failed to generate quiz: " + (error as Error).message);
  }
}
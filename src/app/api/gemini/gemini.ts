// src/app/api/gemini/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

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
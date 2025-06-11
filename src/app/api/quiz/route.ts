// app/api/quiz/route.ts
import { NextResponse } from "next/server";
import { generateQuizFromGemini } from "~/app/api/gemini/gemini";

export async function POST(request: Request) {
  const formData = await request.formData();
  try {
    const quiz = await generateQuizFromGemini(formData);
    return NextResponse.json(quiz);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
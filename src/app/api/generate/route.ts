import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Server-side API route - GOOGLE_GENAI_API_KEY is hidden here
export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json();
    
    // This API key is only accessible on the server
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      success: true, 
      content: text,
      type 
    });
    
  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

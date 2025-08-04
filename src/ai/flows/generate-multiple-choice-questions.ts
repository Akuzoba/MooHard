// This file is machine-generated - do not edit!

"use server";

/**
 * @fileOverview Generates multiple choice questions from provided text content.
 *
 * - generateMultipleChoiceQuestions - A function that generates multiple choice questions.
 * - GenerateMultipleChoiceQuestionsInput - The input type for the generateMultipleChoiceQuestions function.
 * - GenerateMultipleChoiceQuestionsOutput - The return type for the generateMultipleChoiceQuestions function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateMultipleChoiceQuestionsInputSchema = z.object({
  textContent: z
    .string()
    .describe(
      "The text content from which to generate multiple choice questions."
    ),
});
export type GenerateMultipleChoiceQuestionsInput = z.infer<
  typeof GenerateMultipleChoiceQuestionsInputSchema
>;

const GenerateMultipleChoiceQuestionsOutputSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().describe("The multiple choice question."),
        options: z
          .array(z.string())
          .describe("The possible answers to the question."),
        correctAnswer: z
          .string()
          .describe("The correct answer to the question."),
      })
    )
    .describe("An array of multiple choice questions."),
});
export type GenerateMultipleChoiceQuestionsOutput = z.infer<
  typeof GenerateMultipleChoiceQuestionsOutputSchema
>;

// Helper function to truncate text if it's too large
function truncateText(text: string, maxTokens: number = 800000): string {
  // Rough estimation: 4 characters ≈ 1 token
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }

  console.warn(
    `Text truncated from ${text.length} to ${maxChars} characters to fit token limits`
  );
  return (
    text.substring(0, maxChars) + "\n\n[Content truncated due to length...]"
  );
}

export async function generateMultipleChoiceQuestions(
  input: GenerateMultipleChoiceQuestionsInput
): Promise<GenerateMultipleChoiceQuestionsOutput> {
  return generateMultipleChoiceQuestionsFlow(input);
}

const generateMultipleChoiceQuestionsPrompt = ai.definePrompt({
  name: "generateMultipleChoiceQuestionsPrompt",
  input: { schema: GenerateMultipleChoiceQuestionsInputSchema },
  output: { schema: GenerateMultipleChoiceQuestionsOutputSchema },
  prompt: `You are an expert educator. Generate multiple choice questions based on the content provided.

Content: {{{textContent}}}

Ensure that the questions are relevant to the content and that the correct answer is clearly identifiable.  The options should be plausible but only one should be correct.  Format the output as a JSON object. Each question should have a question field, options (array), and correctAnswer field.

Example:
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["Berlin", "Paris", "Rome", "Madrid"],
      "correctAnswer": "Paris"
    },
   {
      "question": "What is the powerhouse of the cell?",
      "options": ["Nucleus", "Cell Membrane", "Mitochondria", "Ribosome"],
      "correctAnswer": "Mitochondria"
    }
  ]
}

`,
});

const generateMultipleChoiceQuestionsFlow = ai.defineFlow(
  {
    name: "generateMultipleChoiceQuestionsFlow",
    inputSchema: GenerateMultipleChoiceQuestionsInputSchema,
    outputSchema: GenerateMultipleChoiceQuestionsOutputSchema,
  },
  async (input) => {
    try {
      // Truncate text if it's too large to prevent token limit errors
      const truncatedInput = {
        ...input,
        textContent: truncateText(input.textContent),
      };

      const { output } = await generateMultipleChoiceQuestionsPrompt(
        truncatedInput
      );
      return output!;
    } catch (error) {
      console.error("Error in generateMultipleChoiceQuestionsFlow:", error);
      // Handle API overload with a fallback response
      if (error instanceof Error && error.message.includes("overloaded")) {
        throw new Error(
          "The AI service is temporarily overloaded. Please try again in a few minutes."
        );
      }
      throw error;
    }
  }
);

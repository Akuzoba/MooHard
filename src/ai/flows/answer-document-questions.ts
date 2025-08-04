// This file is machine-generated - do not edit!

"use server";

/**
 * @fileOverview Provides an AI chatbot to answer specific questions about uploaded documents.
 *
 * - answerDocumentQuestions - A function that answers questions about the content of uploaded documents.
 * - AnswerDocumentQuestionsInput - The input type for the answerDocumentQuestions function.
 * - AnswerDocumentQuestionsOutput - The return type for the answerDocumentQuestions function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const AnswerDocumentQuestionsInputSchema = z.object({
  documentContent: z.string().describe("The content of the uploaded document."),
  question: z.string().describe("The question about the document content."),
});
export type AnswerDocumentQuestionsInput = z.infer<
  typeof AnswerDocumentQuestionsInputSchema
>;

const AnswerDocumentQuestionsOutputSchema = z.object({
  answer: z.string().describe("The answer to the question."),
});
export type AnswerDocumentQuestionsOutput = z.infer<
  typeof AnswerDocumentQuestionsOutputSchema
>;

// Helper function to truncate text if it's too large
function truncateText(text: string, maxTokens: number = 800000): string {
  // Rough estimation: 4 characters ≈ 1 token
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }

  console.warn(
    `Document content truncated from ${text.length} to ${maxChars} characters to fit token limits`
  );
  return (
    text.substring(0, maxChars) + "\n\n[Content truncated due to length...]"
  );
}

export async function answerDocumentQuestions(
  input: AnswerDocumentQuestionsInput
): Promise<AnswerDocumentQuestionsOutput> {
  return answerDocumentQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: "answerDocumentQuestionsPrompt",
  input: { schema: AnswerDocumentQuestionsInputSchema },
  output: { schema: AnswerDocumentQuestionsOutputSchema },
  prompt: `You are an intelligent study assistant. Answer the following question based on the content of the document provided.\n\nDocument Content: {{{documentContent}}}\n\nQuestion: {{{question}}}\n\nAnswer:`,
});

const answerDocumentQuestionsFlow = ai.defineFlow(
  {
    name: "answerDocumentQuestionsFlow",
    inputSchema: AnswerDocumentQuestionsInputSchema,
    outputSchema: AnswerDocumentQuestionsOutputSchema,
  },
  async (input) => {
    try {
      // Truncate document content if it's too large to prevent token limit errors
      const truncatedInput = {
        ...input,
        documentContent: truncateText(input.documentContent),
      };

      const { output } = await prompt(truncatedInput);
      return output!;
    } catch (error) {
      console.error("Error in answerDocumentQuestionsFlow:", error);
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

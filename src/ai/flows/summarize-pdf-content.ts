"use server";

/**
 * @fileOverview Summarizes key concepts from uploaded PDF study materials.
 *
 * - summarizePdfContent - A function that handles the summarization process.
 * - SummarizePdfContentInput - The input type for the summarizePdfContent function.
 * - SummarizePdfContentOutput - The return type for the summarizePdfContent function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const SummarizePdfContentInputSchema = z.object({
  pdfText: z.string().describe("The extracted text content from the PDF file."),
});
export type SummarizePdfContentInput = z.infer<
  typeof SummarizePdfContentInputSchema
>;

const SummarizePdfContentOutputSchema = z.object({
  summary: z
    .string()
    .describe("A concise summary of the key concepts from the PDF content."),
});
export type SummarizePdfContentOutput = z.infer<
  typeof SummarizePdfContentOutputSchema
>;

// Helper function to truncate text if it's too large
function truncateText(text: string, maxTokens: number = 800000): string {
  // Rough estimation: 4 characters ≈ 1 token
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) {
    return text;
  }

  console.warn(
    `PDF text truncated from ${text.length} to ${maxChars} characters to fit token limits`
  );
  return (
    text.substring(0, maxChars) + "\n\n[Content truncated due to length...]"
  );
}

export async function summarizePdfContent(
  input: SummarizePdfContentInput
): Promise<SummarizePdfContentOutput> {
  return summarizePdfContentFlow(input);
}

const prompt = ai.definePrompt({
  name: "summarizePdfContentPrompt",
  input: { schema: SummarizePdfContentInputSchema },
  output: { schema: SummarizePdfContentOutputSchema },
  prompt: `You are an expert academic assistant. Please provide a concise summary of the key concepts from the following text. The summary should be clear, informative, and helpful for students.

Text: {{{pdfText}}}`,
});

const summarizePdfContentFlow = ai.defineFlow(
  {
    name: "summarizePdfContentFlow",
    inputSchema: SummarizePdfContentInputSchema,
    outputSchema: SummarizePdfContentOutputSchema,
  },
  async (input) => {
    try {
      // Truncate text if it's too large to prevent token limit errors
      const truncatedInput = {
        ...input,
        pdfText: truncateText(input.pdfText),
      };

      const { output } = await prompt(truncatedInput);
      return output!;
    } catch (error) {
      console.error("Error in summarizePdfContentFlow:", error);
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

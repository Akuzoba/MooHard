"use server";

/**
 * @fileOverview Generates flashcards from study material content.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

// Input schema
const GenerateFlashcardsInputSchema = z.object({
  textContent: z
    .string()
    .describe("The text content to create flashcards from"),
  count: z.number().default(10).describe("Number of flashcards to generate"),
  difficulty: z
    .enum(["mixed", "easy", "medium", "hard"])
    .default("mixed")
    .describe("Target difficulty level"),
});

// Output schema for individual flashcard
const FlashcardSchema = z.object({
  front: z.string().describe("The question or prompt side of the flashcard"),
  back: z.string().describe("The answer or explanation side of the flashcard"),
  category: z
    .string()
    .describe("The topic or category this flashcard belongs to"),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .describe("Difficulty level of the flashcard"),
  tags: z
    .array(z.string())
    .describe("Relevant tags for categorization and search"),
});

const GenerateFlashcardsOutputSchema = z.array(FlashcardSchema);

type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;
type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

/**
 * Generates flashcards from the provided text content.
 */
export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  const { textContent, count = 10, difficulty = "mixed" } = input;

  const difficultyInstruction =
    difficulty === "mixed"
      ? "Create a mix of easy, medium, and hard difficulty flashcards"
      : `Focus on ${difficulty} difficulty flashcards`;

  const prompt = `
Create ${count} high-quality flashcards from the following text content. ${difficultyInstruction}.

Guidelines:
- Front: Clear, concise questions or prompts that test key concepts
- Back: Comprehensive but focused answers that aid understanding
- Focus on important concepts, definitions, processes, and relationships
- Vary question types: definitions, explanations, comparisons, applications
- Use active recall principles - questions should require thinking, not just recognition
- Include context where necessary but keep answers focused
- Categorize by main topics found in the content
- Add relevant tags for organization

Text Content:
${textContent}

Generate exactly ${count} flashcards that cover the most important concepts from this material.
`;

  const response = await ai.generate({
    prompt,
    output: {
      schema: GenerateFlashcardsOutputSchema,
    },
  });

  return response.output || [];
}

// Helper function for easier usage
export async function createFlashcards(
  textContent: string,
  options?: {
    count?: number;
    difficulty?: "mixed" | "easy" | "medium" | "hard";
  }
): Promise<GenerateFlashcardsOutput> {
  return await generateFlashcards({
    textContent,
    count: options?.count ?? 10,
    difficulty: options?.difficulty ?? "mixed",
  });
}

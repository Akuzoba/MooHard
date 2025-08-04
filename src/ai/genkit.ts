import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";

export const ai = genkit({
  plugins: [
    googleAI({
      // Add retry configuration for better reliability
      apiVersion: "v1beta",
    }),
  ],
  model: "googleai/gemini-2.5-flash",
});

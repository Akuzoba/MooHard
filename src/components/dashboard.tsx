"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { FileUploader } from "@/components/views/file-uploader";
import { SummaryView } from "@/components/views/summary-view";
import { QuizView } from "@/components/views/quiz-view";
import { FlashcardsView } from "@/components/views/flashcards-view";
import { ChatView } from "@/components/views/chat-view";
import { NotesView } from "@/components/views/notes-view";
import { summarizePdfContent } from "@/ai/flows/summarize-pdf-content";
import { generateMultipleChoiceQuestions } from "@/ai/flows/generate-multiple-choice-questions";
import { createFlashcards } from "@/ai/flows/generate-flashcards";
import type { Question, Flashcard } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type ActiveView = "summary" | "quiz" | "flashcards" | "chat" | "notes";

export function Dashboard() {
  const [documentContent, setDocumentContent] = useState("");
  const [summary, setSummary] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setDocumentContent("");
    setSummary("");
    setQuestions([]);
    setFlashcards([]);
    setError(null);
  };

  const handleGenerate = async (text: string) => {
    if (!text.trim()) {
      setError("The document appears to be empty. Please upload a valid PDF.");
      return;
    }

    setIsLoading(true);
    setDocumentContent(text);
    setError(null);

    try {
      const [summaryResult, questionsResult, flashcardsResult] =
        await Promise.all([
          summarizePdfContent({ pdfText: text }),
          generateMultipleChoiceQuestions({ textContent: text }),
          createFlashcards(text),
        ]);

      setSummary(summaryResult.summary);
      setQuestions(questionsResult.questions);
      setFlashcards(flashcardsResult);
    } catch (e) {
      console.error(e);
      setError(
        "An error occurred while generating study aids. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateQuiz = async () => {
    if (!documentContent.trim()) {
      setError("No document content available for quiz generation.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const questionsResult = await generateMultipleChoiceQuestions({
        textContent: documentContent,
      });
      setQuestions(questionsResult.questions);
    } catch (e) {
      console.error(e);
      const errorMessage =
        e instanceof Error
          ? e.message
          : "An error occurred while generating new quiz questions. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateFlashcards = async () => {
    if (!documentContent.trim()) {
      setError("No document content available for flashcard generation.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const flashcardsResult = await createFlashcards(documentContent);
      setFlashcards(flashcardsResult);
    } catch (e) {
      console.error(e);
      const errorMessage =
        e instanceof Error
          ? e.message
          : "An error occurred while generating new flashcards. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar onReset={handleReset} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 sm:ml-64">
        {!documentContent ? (
          <FileUploader
            onGenerate={handleGenerate}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <Tabs defaultValue="summary" className="flex flex-col h-full">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <div className="ml-auto">
                <Button variant="outline" onClick={handleReset}>
                  New Study Set
                </Button>
              </div>
            </div>
            <div className="flex-grow mt-4">
              <TabsContent value="summary" className="h-full">
                <SummaryView summary={summary} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="quiz" className="h-full">
                <QuizView
                  questions={questions}
                  isLoading={isLoading}
                  onRegenerateQuiz={handleRegenerateQuiz}
                  error={error}
                />
              </TabsContent>
              <TabsContent value="flashcards" className="h-full">
                <FlashcardsView
                  flashcards={flashcards}
                  isLoading={isLoading}
                  onRegenerateFlashcards={handleRegenerateFlashcards}
                  error={error}
                />
              </TabsContent>
              <TabsContent value="chat" className="h-full">
                <ChatView documentContent={documentContent} />
              </TabsContent>
              <TabsContent value="notes" className="h-full">
                <NotesView />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </main>
    </div>
  );
}

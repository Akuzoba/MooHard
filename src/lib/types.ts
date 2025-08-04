import type { GenerateMultipleChoiceQuestionsOutput } from "@/ai/flows/generate-multiple-choice-questions";
import type {
  Flashcard as FlashcardType,
  FlashcardProgress as FlashcardProgressType,
} from "@/lib/flashcard-types";

export type Question = GenerateMultipleChoiceQuestionsOutput["questions"][0];
export type Flashcard = FlashcardType;
export type FlashcardProgress = FlashcardProgressType;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  citations?: string[];
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface StudySession {
  id: string;
  documentTitle: string;
  startTime: Date;
  endTime?: Date;
  quizResults: QuizResult[];
  flashcardsReviewed: number;
  flashcardsMastered: number;
  totalTimeSpent: number;
  score?: number;
}

export interface StudyAnalytics {
  totalStudyTime: number;
  quizAccuracy: number;
  flashcardsMastered: number;
  sessionsCompleted: number;
  weeklyProgress: { date: string; score: number; time: number }[];
  topicStrengths: { topic: string; accuracy: number }[];
}

export type FileType =
  | "pdf"
  | "docx"
  | "doc"
  | "pptx"
  | "ppt"
  | "txt"
  | "md"
  | "image";

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  content: string;
  uploadDate: Date;
}

export type QuestionType =
  | "multiple-choice"
  | "true-false"
  | "fill-blank"
  | "short-answer";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface EnhancedQuestion extends Question {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  explanation: string;
  timeLimit?: number;
  topic: string;
}

export interface QuizConfig {
  questionCount: number;
  difficulty: DifficultyLevel;
  timeLimit: number;
  questionTypes: QuestionType[];
  topics: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  documentId?: string;
  highlights: Highlight[];
}

export interface Highlight {
  id: string;
  text: string;
  page?: number;
  position: { start: number; end: number };
  color: string;
  note?: string;
}

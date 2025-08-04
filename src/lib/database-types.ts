export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  lastLoginAt: Date;
  subscription?: "free" | "pro" | "premium";
  preferences: {
    theme: "light" | "dark";
    language: string;
    studyReminders: boolean;
    emailNotifications: boolean;
  };
}

export interface StudySet {
  id: string;
  userId: string;
  title: string;
  description?: string;
  files: StudyFile[];
  summary?: string;
  flashcards: Flashcard[];
  questions: Question[];
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  analytics: StudySetAnalytics;
}

export interface StudyFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: Date;
  processingStatus: "pending" | "processing" | "completed" | "failed";
}

export interface StudySession {
  id: string;
  userId: string;
  studySetId: string;
  type: "quiz" | "flashcards" | "chat" | "notes";
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  results: {
    quiz?: QuizSession;
    flashcards?: FlashcardSession;
    chat?: ChatSession;
  };
  analytics: SessionAnalytics;
}

export interface QuizSession {
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  results: QuizResult[];
  score: number;
  completedAt: Date;
}

export interface FlashcardSession {
  totalCards: number;
  masteredCards: number;
  timeSpent: number;
  progress: Record<string, FlashcardProgress>;
  completedAt?: Date;
}

export interface ChatSession {
  messageCount: number;
  topics: string[];
  timeSpent: number;
  lastMessageAt: Date;
}

export interface StudySetAnalytics {
  totalSessions: number;
  totalTimeSpent: number; // in seconds
  averageQuizScore: number;
  flashcardMasteryRate: number;
  lastStudied: Date;
  streakDays: number;
  popularTopics: string[];
}

export interface SessionAnalytics {
  accuracy: number;
  timeEfficiency: number;
  conceptsMastered: string[];
  areasForImprovement: string[];
}

export interface UserProgress {
  userId: string;
  studySetId: string;
  totalTimeSpent: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  quizStats: {
    totalQuizzes: number;
    averageScore: number;
    bestScore: number;
    totalCorrectAnswers: number;
    totalQuestions: number;
  };
  flashcardStats: {
    totalFlashcards: number;
    masteredFlashcards: number;
    averageRetentionRate: number;
  };
  achievements: Achievement[];
  lastUpdated: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: "quiz" | "flashcards" | "streak" | "time" | "special";
}

export interface Notification {
  id: string;
  userId: string;
  type: "reminder" | "achievement" | "system" | "social";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  actionUrl?: string;
}

// Existing types from current system
export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
  type: "multiple-choice";
}

export interface QuizResult {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  question: string;
}

export interface FlashcardProgress {
  id: string;
  masteryLevel: "new" | "learning" | "review" | "mastered";
  correctStreak: number;
  lastReviewed: Date;
  nextReview: Date;
  totalReviews: number;
}

// Database collection names
export const COLLECTIONS = {
  USERS: "users",
  STUDY_SETS: "studySets",
  STUDY_SESSIONS: "studySessions",
  USER_PROGRESS: "userProgress",
  NOTIFICATIONS: "notifications",
  ACHIEVEMENTS: "achievements",
} as const;

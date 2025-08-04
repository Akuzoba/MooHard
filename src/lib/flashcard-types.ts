// Types for flashcard functionality

export interface Flashcard {
  front: string;
  back: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

export interface FlashcardProgress {
  id: string;
  masteryLevel: "new" | "learning" | "review" | "mastered";
  correctStreak: number;
  lastReviewed: Date;
  nextReview: Date;
  totalReviews: number;
}

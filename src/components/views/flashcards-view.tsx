"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Shuffle,
  BookOpen,
  TrendingUp,
  Repeat,
} from "lucide-react";
import type { Flashcard, FlashcardProgress } from "@/lib/types";

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  isLoading?: boolean;
  onMasteryUpdate?: (masteredCount: number) => void;
  onRegenerateFlashcards?: () => Promise<void>;
  error?: string | null;
}

type StudyMode = "sequential" | "random" | "spaced" | "difficult";
type DifficultyResponse = "again" | "hard" | "good" | "easy";

const DIFFICULTY_INTERVALS = {
  again: 0, // Review immediately
  hard: 1, // 1 day
  good: 3, // 3 days
  easy: 7, // 7 days
} as const;

export function FlashcardsView({
  flashcards = [],
  isLoading = false,
  onMasteryUpdate,
  onRegenerateFlashcards,
  error,
}: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<Record<string, FlashcardProgress>>(
    {}
  );
  const [studyMode, setStudyMode] = useState<StudyMode>("sequential");
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    startTime: Date.now(),
  });

  const currentCard = flashcards[currentIndex];

  // Initialize progress for new flashcards
  useEffect(() => {
    if (!flashcards.length) return;

    const newProgress: Record<string, FlashcardProgress> = {};
    flashcards.forEach((card, index) => {
      const cardId = `${index}-${card.front.slice(0, 20)}`;
      if (!progress[cardId]) {
        newProgress[cardId] = {
          id: cardId,
          masteryLevel: "new",
          correctStreak: 0,
          lastReviewed: new Date(),
          nextReview: new Date(),
          totalReviews: 0,
        };
      }
    });

    if (Object.keys(newProgress).length > 0) {
      setProgress((prev) => ({ ...prev, ...newProgress }));
    }
  }, [flashcards, progress]);

  // Calculate next review date based on spaced repetition
  const calculateNextReview = useCallback(
    (
      response: DifficultyResponse,
      currentLevel: FlashcardProgress["masteryLevel"],
      streak: number
    ): Date => {
      const now = new Date();
      const baseInterval = DIFFICULTY_INTERVALS[response];

      // Apply spaced repetition multiplier based on streak and mastery
      let multiplier = 1;
      if (streak > 0) multiplier += streak * 0.5;
      if (currentLevel === "learning") multiplier *= 1.5;
      if (currentLevel === "review") multiplier *= 2;
      if (currentLevel === "mastered") multiplier *= 3;

      const daysToAdd = Math.max(baseInterval * multiplier, baseInterval);
      const nextReview = new Date(now);
      nextReview.setDate(nextReview.getDate() + daysToAdd);

      return nextReview;
    },
    []
  );

  // Update mastery level based on performance
  const updateMasteryLevel = useCallback(
    (
      response: DifficultyResponse,
      currentLevel: FlashcardProgress["masteryLevel"],
      streak: number
    ): FlashcardProgress["masteryLevel"] => {
      if (response === "again") return "new"; // Reset on failure

      // Promote based on consistent success
      if (streak >= 2) {
        switch (currentLevel) {
          case "new":
            return "learning";
          case "learning":
            return streak >= 4 ? "review" : "learning";
          case "review":
            return streak >= 6 ? "mastered" : "review";
          default:
            return currentLevel;
        }
      }

      return currentLevel;
    },
    []
  );

  // Handle difficulty response
  const handleResponse = useCallback(
    (response: DifficultyResponse) => {
      if (!currentCard) return;

      const cardId = `${currentIndex}-${currentCard.front.slice(0, 20)}`;
      const currentProgress = progress[cardId];
      if (!currentProgress) return;

      const isCorrect = response !== "again";
      const newStreak = isCorrect ? currentProgress.correctStreak + 1 : 0;
      const newMasteryLevel = updateMasteryLevel(
        response,
        currentProgress.masteryLevel,
        newStreak
      );
      const nextReview = calculateNextReview(
        response,
        currentProgress.masteryLevel,
        newStreak
      );

      const updatedProgress = {
        ...currentProgress,
        correctStreak: newStreak,
        masteryLevel: newMasteryLevel,
        lastReviewed: new Date(),
        nextReview,
        totalReviews: currentProgress.totalReviews + 1,
      };

      setProgress((prev) => ({ ...prev, [cardId]: updatedProgress }));
      setSessionStats((prev) => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
      }));

      // Update parent with mastery count
      if (onMasteryUpdate) {
        const masteredCount = Object.values({
          ...progress,
          [cardId]: updatedProgress,
        }).filter((p) => p.masteryLevel === "mastered").length;
        onMasteryUpdate(masteredCount);
      }

      // Reset flip state after response
      setIsFlipped(false);
      const newFlippedCards = new Set(flippedCards);
      newFlippedCards.delete(currentIndex);
      setFlippedCards(newFlippedCards);
    },
    [
      currentCard,
      currentIndex,
      progress,
      updateMasteryLevel,
      calculateNextReview,
      onMasteryUpdate,
      flippedCards,
    ]
  );

  // Reset all progress
  const resetProgress = useCallback(() => {
    setProgress({});
    setSessionStats({ reviewed: 0, correct: 0, startTime: Date.now() });
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // Cycle through study modes
  const toggleStudyMode = useCallback(() => {
    const modes: StudyMode[] = ["sequential", "random", "spaced", "difficult"];
    const currentIdx = modes.indexOf(studyMode);
    setStudyMode(modes[(currentIdx + 1) % modes.length]);
  }, [studyMode]);

  // Handle flipping individual cards in carousel
  const handleFlip = useCallback(
    (index: number) => {
      const newFlippedCards = new Set(flippedCards);
      if (newFlippedCards.has(index)) {
        newFlippedCards.delete(index);
      } else {
        newFlippedCards.add(index);
      }
      setFlippedCards(newFlippedCards);
    },
    [flippedCards]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const total = flashcards.length;
    const progressValues = Object.values(progress);

    return {
      total,
      new: progressValues.filter((p) => p.masteryLevel === "new").length,
      learning: progressValues.filter((p) => p.masteryLevel === "learning")
        .length,
      review: progressValues.filter((p) => p.masteryLevel === "review").length,
      mastered: progressValues.filter((p) => p.masteryLevel === "mastered")
        .length,
      accuracy:
        sessionStats.reviewed > 0
          ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
          : 0,
      timeMinutes: Math.round((Date.now() - sessionStats.startTime) / 60000),
    };
  }, [flashcards.length, progress, sessionStats]);

  const currentCardProgress = currentCard
    ? progress[`${currentIndex}-${currentCard.front.slice(0, 20)}`]
    : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Brain className="w-16 h-16 mx-auto animate-pulse text-blue-400" />
          <p className="text-lg font-medium text-gray-200">
            Generating flashcards...
          </p>
          <div className="w-64 mx-auto">
            <Progress value={66} className="h-2" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-600 bg-red-900">
        <CardContent className="p-6 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-200 font-medium">
            Error generating flashcards
          </p>
          <p className="text-red-300 text-sm mt-2">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (flashcards.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-200 font-medium">
            No flashcards available
          </p>
          <p className="text-gray-400 mt-2">
            Upload a document to generate flashcards
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-gray-100">
                  Flashcards Study
                </h2>
                <p className="text-sm text-gray-300">Active recall practice</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={toggleStudyMode}
                className="gap-2 text-sm"
              >
                <Shuffle className="w-4 h-4" />
                {studyMode}
              </Button>
              <Button
                variant="outline"
                onClick={resetProgress}
                className="gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-200">
                {stats.new}
              </div>
              <div className="text-xs text-blue-300">New</div>
            </div>
            <div className="text-center p-3 bg-yellow-800 rounded-lg">
              <div className="text-2xl font-bold text-yellow-200">
                {stats.learning}
              </div>
              <div className="text-xs text-yellow-300">Learning</div>
            </div>
            <div className="text-center p-3 bg-orange-800 rounded-lg">
              <div className="text-2xl font-bold text-orange-200">
                {stats.review}
              </div>
              <div className="text-xs text-orange-300">Review</div>
            </div>
            <div className="text-center p-3 bg-green-800 rounded-lg">
              <div className="text-2xl font-bold text-green-200">
                {stats.mastered}
              </div>
              <div className="text-xs text-green-300">Mastered</div>
            </div>
            <div className="text-center p-3 bg-purple-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-200">
                {stats.accuracy}%
              </div>
              <div className="text-xs text-purple-300">Accuracy</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <span>{stats.timeMinutes} min studied</span>
            </div>
            <Progress
              value={((currentIndex + 1) / flashcards.length) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Flashcard */}
      <div className="h-full flex items-center justify-center">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-4xl"
        >
          <CarouselContent>
            {flashcards.map((flashcard, index) => (
              <CarouselItem key={index}>
                <div className="p-1 perspective-1000">
                  <div
                    className={cn(
                      "flashcard w-full h-96 rounded-lg shadow-lg cursor-pointer",
                      (flippedCards.has(index) ||
                        (index === currentIndex && isFlipped)) &&
                        "is-flipped"
                    )}
                    onClick={() => {
                      handleFlip(index);
                      setCurrentIndex(index);
                    }}
                  >
                    {/* Front of card */}
                    <div className="flashcard-face absolute w-full h-full">
                      <Card className="w-full h-full flex flex-col items-center justify-center bg-gray-900 border-blue-500 border-2">
                        <CardContent className="p-6 text-center">
                          <Badge className="mb-4 bg-blue-600 text-blue-100 border-blue-500">
                            Question
                          </Badge>

                          {flashcard?.category && (
                            <Badge
                              variant="outline"
                              className="mb-3 text-xs border-gray-600 text-gray-300"
                            >
                              {flashcard.category}
                            </Badge>
                          )}

                          <p className="text-2xl font-bold text-blue-400 mb-4 leading-relaxed">
                            {flashcard.front}
                          </p>

                          {flashcard?.difficulty && (
                            <Badge
                              variant={
                                flashcard.difficulty === "easy"
                                  ? "default"
                                  : flashcard.difficulty === "medium"
                                  ? "secondary"
                                  : "destructive"
                              }
                              className="mb-4"
                            >
                              {flashcard.difficulty}
                            </Badge>
                          )}

                          <p className="text-sm text-gray-400 font-medium">
                            Click to reveal answer
                          </p>
                        </CardContent>
                        <div className="absolute bottom-4 right-4 text-blue-400">
                          <Repeat size={16} />
                        </div>
                      </Card>
                    </div>

                    {/* Back of card */}
                    <div className="flashcard-face flashcard-back absolute w-full h-full">
                      <Card className="w-full h-full flex flex-col items-center justify-center bg-gray-900 border-green-500 border-2">
                        <CardContent className="p-6 text-center">
                          <Badge className="mb-4 bg-green-600 text-green-100 border-green-500">
                            Answer
                          </Badge>

                          <div className="text-xl font-semibold text-green-400 mb-6 leading-relaxed">
                            {flashcard.back}
                          </div>

                          {progress[
                            `${index}-${flashcard?.front?.slice(0, 20)}`
                          ] && (
                            <div className="flex items-center gap-3 mb-4">
                              <Badge
                                variant={
                                  progress[
                                    `${index}-${flashcard?.front?.slice(0, 20)}`
                                  ]?.masteryLevel === "mastered"
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  progress[
                                    `${index}-${flashcard?.front?.slice(0, 20)}`
                                  ]?.masteryLevel === "new"
                                    ? "border-blue-300 text-blue-700"
                                    : progress[
                                        `${index}-${flashcard?.front?.slice(
                                          0,
                                          20
                                        )}`
                                      ]?.masteryLevel === "learning"
                                    ? "border-yellow-300 text-yellow-700"
                                    : progress[
                                        `${index}-${flashcard?.front?.slice(
                                          0,
                                          20
                                        )}`
                                      ]?.masteryLevel === "review"
                                    ? "border-orange-300 text-orange-700"
                                    : "border-green-300 text-green-700 bg-green-100"
                                }
                              >
                                {
                                  progress[
                                    `${index}-${flashcard?.front?.slice(0, 20)}`
                                  ]?.masteryLevel
                                }
                              </Badge>

                              <div className="flex items-center">
                                {Array.from({
                                  length: Math.min(
                                    progress[
                                      `${index}-${flashcard?.front?.slice(
                                        0,
                                        20
                                      )}`
                                    ]?.correctStreak || 0,
                                    5
                                  ),
                                }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-sm text-gray-500">
                            How well did you know this?
                          </p>
                        </CardContent>
                        <div className="absolute bottom-4 right-4 text-green-400">
                          <Repeat size={16} />
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {(flippedCards.has(currentIndex) || isFlipped) && (
          <div className="flex gap-2 animate-in fade-in-0 zoom-in-95 duration-300">
            <Button
              onClick={() => handleResponse("again")}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 gap-1"
            >
              <XCircle className="w-4 h-4" />
              Again
            </Button>
            <Button
              onClick={() => handleResponse("hard")}
              variant="outline"
              className="text-orange-600 border-orange-200 hover:bg-orange-50 gap-1"
            >
              <Clock className="w-4 h-4" />
              Hard
            </Button>
            <Button
              onClick={() => handleResponse("good")}
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50 gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Good
            </Button>
            <Button
              onClick={() => handleResponse("easy")}
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 gap-1"
            >
              <Target className="w-4 h-4" />
              Easy
            </Button>
          </div>
        )}
      </div>

      {/* Progress Details */}
      {currentCardProgress && (
        <Card className="bg-gray-800 border-gray-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <div className="flex items-center gap-4">
                <span>Reviews: {currentCardProgress.totalReviews}</span>
                <span>Streak: {currentCardProgress.correctStreak}</span>
                <span>
                  Last:{" "}
                  {currentCardProgress.lastReviewed?.toLocaleDateString() ||
                    "Never"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>
                  Next:{" "}
                  {currentCardProgress.nextReview?.toLocaleDateString() ||
                    "Not scheduled"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

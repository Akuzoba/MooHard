"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import type { Flashcard, FlashcardProgress } from "@/lib/types";

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  isLoading?: boolean;
  onMasteryUpdate?: (masteredCount: number) => void;
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
  error,
}: FlashcardsViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
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
  const nextCardData = flashcards[nextIndex];

  // Helper function to render a flashcard
  const renderFlashcard = (card: Flashcard, cardIndex: number, flipped: boolean) => (
    <div
      className="flashcard-inner"
      style={{
        position: "relative",
        width: "100%",
        height: "400px",
        transformStyle: "preserve-3d",
        transition: "transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
      }}
    >
      {/* Front */}
      <Card
        className="flashcard-face flashcard-front bg-gray-900 shadow-lg border-gray-700"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backfaceVisibility: "hidden",
          border: "2px solid #3B82F6",
        }}
      >
        <CardContent className="flex flex-col justify-center items-center h-full p-8 text-center bg-gray-900">
          <Badge className="mb-4 bg-blue-600 text-blue-100 border-blue-500">
            Question
          </Badge>

          {card?.category && (
            <Badge
              variant="outline"
              className="mb-3 text-xs border-gray-600 text-gray-300"
            >
              {card.category}
            </Badge>
          )}

          <h3 className="text-2xl font-bold text-blue-400 mb-4 leading-relaxed">
            {card?.front}
          </h3>

          {card?.difficulty && (
            <Badge
              variant={
                card.difficulty === "easy"
                  ? "default"
                  : card.difficulty === "medium"
                  ? "secondary"
                  : "destructive"
              }
              className="mb-4"
            >
              {card.difficulty}
            </Badge>
          )}

          <p className="text-sm text-gray-400 font-medium">Click to reveal answer</p>
        </CardContent>
      </Card>

      {/* Back */}
      <Card
        className="flashcard-face flashcard-back bg-gray-900 shadow-lg border-gray-700"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          border: "2px solid #10B981",
        }}
      >
        <CardContent className="flex flex-col justify-center items-center h-full p-8 text-center bg-gray-900">
          <Badge className="mb-4 bg-green-600 text-green-100 border-green-500">
            Answer
          </Badge>

          <div className="text-xl font-semibold text-green-400 mb-6 leading-relaxed">
            {card?.back}
          </div>

          {/* Difficulty buttons and progress info would go here during review */}
        </CardContent>
      </Card>
    </div>
  );

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

      // Auto-advance after response
      setTimeout(() => {
        nextCard();
        setIsFlipped(false);
      }, 1000);
    },
    [
      currentCard,
      currentIndex,
      progress,
      updateMasteryLevel,
      calculateNextReview,
      onMasteryUpdate,
    ]
  );

  // Navigation functions
  const nextCard = useCallback(() => {
    if (isTransitioning) return; // Prevent multiple clicks during animation
    
    // Calculate next index
    let newIndex;
    if (studyMode === "random") {
      newIndex = Math.floor(Math.random() * flashcards.length);
    } else {
      newIndex = (currentIndex + 1) % flashcards.length;
    }
    
    setNextIndex(newIndex);
    setSlideDirection('right');
    setIsTransitioning(true);
    setIsFlipped(false);
    
    // Complete transition after animation
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 300);
  }, [studyMode, flashcards.length, currentIndex, isTransitioning]);

  const previousCard = useCallback(() => {
    if (isTransitioning) return; // Prevent multiple clicks during animation
    
    // Calculate previous index
    const newIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    
    setNextIndex(newIndex);
    setSlideDirection('left');
    setIsTransitioning(true);
    setIsFlipped(false);
    
    // Complete transition after animation
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsTransitioning(false);
    }, 300);
  }, [flashcards.length, currentIndex, isTransitioning]);

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

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
          <Brain className="w-16 h-16 mx-auto animate-pulse text-blue-500" />
          <p className="text-lg font-medium">Generating flashcards...</p>
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
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-700 font-medium">
            Error generating flashcards
          </p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (flashcards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 font-medium">
            No flashcards available
          </p>
          <p className="text-gray-500 mt-2">
            Upload a document to generate flashcards
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Flashcards Study
                </h2>
                <p className="text-sm text-gray-600">Active recall practice</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleStudyMode}
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                {studyMode.charAt(0).toUpperCase() + studyMode.slice(1)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetProgress}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {stats.new}
              </div>
              <div className="text-xs text-blue-600">New</div>
            </div>
            <div className="text-center p-3 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {stats.learning}
              </div>
              <div className="text-xs text-yellow-600">Learning</div>
            </div>
            <div className="text-center p-3 bg-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">
                {stats.review}
              </div>
              <div className="text-xs text-orange-600">Review</div>
            </div>
            <div className="text-center p-3 bg-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {stats.mastered}
              </div>
              <div className="text-xs text-green-600">Mastered</div>
            </div>
            <div className="text-center p-3 bg-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {stats.accuracy}%
              </div>
              <div className="text-xs text-purple-600">Accuracy</div>
            </div>
          </div>

          {/* Session info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Reviewed: {sessionStats.reviewed}</span>
              <span>Time: {stats.timeMinutes}m</span>
            </div>
            <span>
              {currentIndex + 1} of {flashcards.length}
            </span>
          </div>

          <Progress
            value={((currentIndex + 1) / flashcards.length) * 100}
            className="mt-3 h-2"
          />
        </CardContent>
      </Card>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl relative overflow-hidden">
          {/* Current Card */}
          <div
            className={`absolute w-full cursor-pointer transition-transform duration-300 ease-in-out ${
              isTransitioning 
                ? slideDirection === 'right' 
                  ? 'translate-x-full opacity-0' 
                  : '-translate-x-full opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
            onClick={flipCard}
            style={{ perspective: "1000px", zIndex: isTransitioning ? 1 : 2 }}
          >
            {currentCard && renderFlashcard(currentCard, currentIndex, isFlipped)}
          </div>

          {/* Next Card (slides in during transition) */}
          {isTransitioning && (
            <div
              className={`absolute w-full cursor-pointer transition-transform duration-300 ease-in-out ${
                slideDirection === 'right' 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-0 opacity-100'
              }`}
              style={{ 
                perspective: "1000px", 
                zIndex: 2,
                transform: slideDirection === 'right' 
                  ? 'translateX(-100%)' 
                  : 'translateX(100%)',
                animation: slideDirection === 'right' 
                  ? 'slideInFromLeft 0.3s ease-in-out forwards' 
                  : 'slideInFromRight 0.3s ease-in-out forwards'
              }}
            >
              {nextCardData && renderFlashcard(nextCardData, nextIndex, false)}
            </div>
          )}

          {/* Fallback for non-transitioning state */}
          {!isTransitioning && (
            <div
              className="w-full cursor-pointer"
              onClick={flipCard}
              style={{ perspective: "1000px" }}
            >
              {currentCard && renderFlashcard(currentCard, currentIndex, isFlipped)}
            </div>
          )}
            <div
              className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}
              style={{
                position: "relative",
                width: "100%",
                height: "400px",
                transformStyle: "preserve-3d",
                transition: "transform 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",
              }}
            >
              {/* Front */}
              <Card
                className="flashcard-face flashcard-front bg-gray-900 shadow-lg border-gray-700"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  border: "2px solid #3B82F6",
                }}
              >
                <CardContent className="flex flex-col justify-center items-center h-full p-8 text-center bg-gray-900">
                  <Badge className="mb-4 bg-blue-600 text-blue-100 border-blue-500">
                    Question
                  </Badge>

                  {currentCard?.category && (
                    <Badge
                      variant="outline"
                      className="mb-3 text-xs border-gray-600 text-gray-300"
                    >
                      {currentCard.category}
                    </Badge>
                  )}

                  <h3 className="text-2xl font-bold text-blue-400 mb-4 leading-relaxed">
                    {currentCard?.front}
                  </h3>

                  {currentCard?.difficulty && (
                    <Badge
                      variant={
                        currentCard.difficulty === "easy"
                          ? "default"
                          : currentCard.difficulty === "medium"
                          ? "secondary"
                          : "destructive"
                      }
                      className="mb-4"
                    >
                      {currentCard.difficulty}
                    </Badge>
                  )}

                  <p className="text-sm text-gray-400 font-medium">
                    Click to reveal answer
                  </p>
                </CardContent>
              </Card>

              {/* Back */}
              <Card
                className="flashcard-face flashcard-back bg-gray-900 shadow-lg border-gray-700"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  border: "2px solid #10B981",
                }}
              >
                <CardContent className="flex flex-col justify-center items-center h-full p-8 text-center bg-gray-900">
                  <Badge className="mb-4 bg-green-600 text-green-100 border-green-500">
                    Answer
                  </Badge>

                  <div className="text-xl font-semibold text-green-400 mb-6 leading-relaxed">
                    {currentCard?.back}
                  </div>

                  {currentCardProgress && (
                    <div className="flex items-center gap-3 mb-4">
                      <Badge
                        variant={
                          currentCardProgress.masteryLevel === "mastered"
                            ? "default"
                            : "outline"
                        }
                        className={
                          currentCardProgress.masteryLevel === "new"
                            ? "border-blue-300 text-blue-700"
                            : currentCardProgress.masteryLevel === "learning"
                            ? "border-yellow-300 text-yellow-700"
                            : currentCardProgress.masteryLevel === "review"
                            ? "border-orange-300 text-orange-700"
                            : "border-green-300 text-green-700 bg-green-100"
                        }
                      >
                        {currentCardProgress.masteryLevel}
                      </Badge>

                      <div className="flex items-center">
                        {Array.from({
                          length: Math.min(
                            currentCardProgress.correctStreak,
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
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={previousCard}
          disabled={flashcards.length <= 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {isFlipped && (
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
              <Target className="w-4 h-4" />
              Good
            </Button>
            <Button
              onClick={() => handleResponse("easy")}
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Easy
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          onClick={nextCard}
          disabled={flashcards.length <= 1}
          className="gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Details */}
      {currentCardProgress && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span>Reviews: {currentCardProgress.totalReviews}</span>
                <span>Streak: {currentCardProgress.correctStreak}</span>
                <span>
                  Last: {currentCardProgress.lastReviewed?.toLocaleDateString() || 'Never'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>
                  Next: {currentCardProgress.nextReview?.toLocaleDateString() || 'Not scheduled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        .flashcard-inner.flipped {
          transform: rotateY(180deg);
        }

        .flashcard-container:hover .flashcard-inner:not(.flipped) {
          transform: translateY(-2px) scale(1.02);
        }

        .flashcard-container:hover .flashcard-inner.flipped {
          transform: rotateY(180deg) translateY(-2px) scale(1.02);
        }

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

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Question } from "@/lib/types";
import {
  FileQuestion,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizViewProps {
  questions: Question[];
  isLoading: boolean;
  onRegenerateQuiz?: () => void;
  error?: string | null;
}

export function QuizView({
  questions,
  isLoading,
  onRegenerateQuiz,
  error,
}: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  );

  // Reset quiz state when questions change
  useEffect(() => {
    resetQuiz();
  }, [questions]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const checkAnswer = () => {
    if (selectedAnswer) {
      setIsAnswered(true);
      setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnsweredQuestions(new Set());
  };

  const handleRegenerateQuestions = () => {
    resetQuiz();
    if (onRegenerateQuiz) {
      onRegenerateQuiz();
    }
  };

  const isQuizCompleted = answeredQuestions.size === questions.length;

  const getOptionClass = (option: string) => {
    if (!isAnswered) return "";
    const currentQuestion = questions[currentQuestionIndex];
    if (option === currentQuestion.correctAnswer)
      return "text-green-600 dark:text-green-500 font-bold";
    if (option === selectedAnswer && option !== currentQuestion.correctAnswer)
      return "text-red-600 dark:text-red-500 line-through";
    return "";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <CardContent className="text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold font-headline">
            No Quiz Questions Generated
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A quiz will appear here once it's generated from your document.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Multiple Choice Quiz</CardTitle>
        <CardDescription>
          Test your knowledge based on the document provided.
        </CardDescription>
      </CardHeader>

      {error && (
        <div className="px-6 pb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <CardContent className="flex-grow">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
            {isQuizCompleted && (
              <span className="ml-2 text-green-600 font-medium">
                • Quiz Complete!
              </span>
            )}
          </p>
          <h3 className="text-lg font-semibold mt-1">
            {currentQuestion.question}
          </h3>
        </div>
        <RadioGroup
          value={selectedAnswer ?? ""}
          onValueChange={(value) => setSelectedAnswer(value)}
          disabled={isAnswered}
        >
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 my-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label
                htmlFor={`option-${index}`}
                className={cn("text-base", getOptionClass(option))}
              >
                {option}
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <Check className="inline ml-2 h-5 w-5 text-green-600" />
                )}
                {isAnswered &&
                  selectedAnswer === option &&
                  option !== currentQuestion.correctAnswer && (
                    <X className="inline ml-2 h-5 w-5 text-red-600" />
                  )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <div className="flex gap-2">
          {isQuizCompleted && onRegenerateQuiz && (
            <Button
              onClick={handleRegenerateQuestions}
              variant="secondary"
              disabled={isLoading}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Set New Questions
            </Button>
          )}

          {!isAnswered ? (
            <Button onClick={checkAnswer} disabled={!selectedAnswer}>
              Check Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { QuizResult } from "@/lib/types";
import {
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  SkipForward,
  Target,
  Award,
  BookOpen,
  AlertCircle,
  Eye,
  Sparkles,
  TrendingUp,
  Zap,
  Star,
  Brain,
  Shield,
} from "lucide-react";
import type { Question as BaseQuestion } from "@/lib/types";

interface Question extends BaseQuestion {
  explanation?: string;
}

interface EnhancedQuizViewProps {
  questions: Question[];
  onRegenerateQuiz?: () => void;
  error?: string | null;
  isLoading?: boolean;
  onQuizComplete?: (results: QuizResult[], score: number) => void;
}

export function EnhancedQuizView({
  questions,
  onRegenerateQuiz,
  error: externalError,
  isLoading = false,
}: EnhancedQuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(
    Date.now()
  );
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0 && !quizCompleted) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, quizCompleted]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !quizCompleted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizCompleted]);

  // Start timer when quiz begins
  useEffect(() => {
    if (questions.length > 0 && !isTimerActive) {
      setIsTimerActive(true);
      setQuestionStartTime(Date.now());
    }
  }, [questions, isTimerActive]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setError(null);
  };

  const handleSubmitCurrentQuestion = () => {
    if (!selectedAnswer) {
      setError("Please select an answer before proceeding.");
      return;
    }

    const timeSpent = Date.now() - questionStartTime;
    const result: QuizResult = {
      questionId: currentQuestionIndex.toString(),
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
      timeSpent,
    };

    setQuizResults((prev) => [...prev, result]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer("");
      setShowResult(false);
      setQuestionStartTime(Date.now());
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = () => {
    setIsTimerActive(false);
    setQuizCompleted(true);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setShowResult(false);
    setQuizResults([]);
    setQuizCompleted(false);
    setReviewMode(false);
    setTimeLeft(300);
    setQuestionStartTime(Date.now());
    setIsTimerActive(true);
    setError(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateScore = () => {
    const correct = quizResults.filter((r) => r.isCorrect).length;
    return Math.round((correct / questions.length) * 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Questions Available
        </h3>
        <p className="text-gray-500 mb-4">
          Please upload a document to generate quiz questions.
        </p>
      </div>
    );
  }

  // Review mode screen
  if (reviewMode) {
    const currentResult = quizResults[reviewQuestionIndex];
    const currentQuestion = questions[reviewQuestionIndex];

    return (
      <div className="min-h-screen bg-[#121212] p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00BFFF] to-[#A8FF60] flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Quiz Review</h1>
                  <p className="text-gray-400">Analyze your performance</p>
                </div>
              </div>
              <Button
                onClick={() => setReviewMode(false)}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back to Results
              </Button>
            </div>

            <div className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-300">
                  Question {reviewQuestionIndex + 1} of {questions.length}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() =>
                      setReviewQuestionIndex(
                        Math.max(0, reviewQuestionIndex - 1)
                      )
                    }
                    disabled={reviewQuestionIndex === 0}
                    size="sm"
                    variant="outline"
                    className="border-gray-600"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() =>
                      setReviewQuestionIndex(
                        Math.min(questions.length - 1, reviewQuestionIndex + 1)
                      )
                    }
                    disabled={reviewQuestionIndex === questions.length - 1}
                    size="sm"
                    variant="outline"
                    className="border-gray-600"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Question Review Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-6"
          >
            <div className="mb-6">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                  currentResult?.isCorrect
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}
              >
                {currentResult?.isCorrect ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {currentResult?.isCorrect ? "Correct" : "Incorrect"}
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">
                {currentQuestion?.question}
              </h3>
            </div>

            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all ${
                    option === currentQuestion.correctAnswer
                      ? "bg-green-500/10 border-green-500/30 text-green-300"
                      : option === currentResult?.selectedAnswer &&
                        !currentResult?.isCorrect
                      ? "bg-red-500/10 border-red-500/30 text-red-300"
                      : "bg-gray-800/50 border-gray-700/50 text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {option === currentQuestion.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {option === currentResult?.selectedAnswer &&
                      !currentResult?.isCorrect && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                  </div>
                </div>
              ))}
            </div>

            {currentQuestion?.explanation && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-300 font-medium mb-2">
                      Explanation
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (quizCompleted) {
    const score = calculateScore();
    const correctAnswers = quizResults.filter((r) => r.isCorrect).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Hero Section */}
            <div className="mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="relative mb-8"
              >
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-full p-1">
                  <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                    <Award className="w-16 h-16 text-yellow-400" />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-slate-900" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-4">
                  Mission Complete!
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-xl text-gray-300 mb-6">
                  You've successfully completed the knowledge challenge
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className={`inline-flex items-center px-8 py-4 rounded-2xl text-2xl font-bold border-2 ${
                  score >= 80
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/50 text-green-300"
                    : score >= 60
                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 text-yellow-300"
                    : "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/50 text-red-300"
                }`}
              >
                <TrendingUp className="w-8 h-8 mr-3" />
                {score}% Score
              </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
            >
              <div className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {correctAnswers}/{questions.length}
                </div>
                <div className="text-gray-400 text-sm">Accuracy</div>
              </div>

              <div className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatTime(300 - timeLeft)}
                </div>
                <div className="text-gray-400 text-sm">Time Taken</div>
              </div>

              <div className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {Math.round((correctAnswers / questions.length) * 100)}%
                </div>
                <div className="text-gray-400 text-sm">Success Rate</div>
              </div>

              <div className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {score >= 80 ? "A+" : score >= 60 ? "B" : "C"}
                </div>
                <div className="text-gray-400 text-sm">Grade</div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => setReviewMode(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl text-lg font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
              >
                <Eye className="w-5 h-5 mr-3" />
                Review Answers
              </Button>

              {onRegenerateQuiz && (
                <Button
                  onClick={onRegenerateQuiz}
                  disabled={isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 rounded-xl text-lg font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  {isLoading ? "Generating..." : "Generate New Questions"}
                </Button>
              )}

              <Button
                onClick={handleRestartQuiz}
                variant="outline"
                className="px-8 py-4 border-2 border-gray-600 hover:border-gray-500 bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white rounded-xl text-lg font-semibold transition-all duration-300"
              >
                <Brain className="w-5 h-5 mr-3" />
                Restart Quiz
              </Button>
            </motion.div>

            {/* Performance Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12"
            >
              <div
                className={`inline-flex items-center px-6 py-3 rounded-full ${
                  score >= 80
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30"
                    : score >= 60
                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30"
                    : "bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-400/30"
                }`}
              >
                <Shield className="w-5 h-5 mr-2 text-gray-300" />
                <span className="text-gray-300 font-medium">
                  {score >= 80
                    ? "Excellent Performance - You're mastering this topic!"
                    : score >= 60
                    ? "Good Work - Keep practicing to improve further!"
                    : "Keep Learning - Every attempt makes you stronger!"}
                </span>
              </div>
            </motion.div>

            {/* New Feature Highlight */}
            {onRegenerateQuiz && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-8"
              >
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 rounded-2xl p-4">
                  <div className="flex items-center justify-center text-emerald-300 text-sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Want more practice? Generate new questions from the same
                    material!
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Modern Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">
                      Live Assessment
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-lg text-cyan-400">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                {isTimerActive ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTimerActive(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Pause className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTimerActive(true)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progress</span>
                <span className="text-sm text-gray-400">
                  {Math.round((currentQuestionIndex / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{
                    width: `${
                      (currentQuestionIndex / questions.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {(error || externalError) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error || externalError}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-2xl font-semibold mb-8 leading-relaxed text-white">
              {currentQuestion.question}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = selectedAnswer === option;
              const isCorrect =
                showResult && option === currentQuestion.correctAnswer;
              const isWrong =
                showResult &&
                isSelected &&
                option !== currentQuestion.correctAnswer;

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: showResult ? 1 : 1.02 }}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                >
                  <button
                    onClick={() => !showResult && handleAnswerSelect(option)}
                    disabled={showResult}
                    className={`
                      w-full p-6 text-left rounded-xl border-2 transition-all duration-300 relative overflow-hidden
                      ${
                        isCorrect
                          ? "bg-green-500/20 border-green-400/50 text-green-300"
                          : isWrong
                          ? "bg-red-500/20 border-red-400/50 text-red-300"
                          : isSelected && !showResult
                          ? "bg-purple-500/20 border-purple-400/50 text-purple-300 shadow-lg shadow-purple-500/25"
                          : "bg-gray-800/30 border-gray-700/50 text-gray-300 hover:bg-gray-700/30 hover:border-gray-600/50"
                      }
                      ${!showResult ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`
                        w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                        ${
                          isCorrect
                            ? "bg-green-500 text-white"
                            : isWrong
                            ? "bg-red-500 text-white"
                            : isSelected && !showResult
                            ? "bg-purple-500 text-white"
                            : "bg-gray-700 text-gray-300"
                        }
                      `}
                        >
                          {showResult && isCorrect ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : showResult && isWrong ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            letter
                          )}
                        </div>
                        <span className="text-lg">{option}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isCorrect && (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        )}
                        {isWrong && (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                        {isSelected && !showResult && (
                          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Animated background for selected option */}
                    {isSelected && !showResult && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-10" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl"
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-6 h-6 mt-0.5 ${
                    selectedAnswer === currentQuestion.correctAnswer
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p
                    className={`font-bold text-lg ${
                      selectedAnswer === currentQuestion.correctAnswer
                        ? "text-green-300"
                        : "text-red-300"
                    }`}
                  >
                    {selectedAnswer === currentQuestion.correctAnswer
                      ? "Perfect! You got it right!"
                      : "Not quite right this time"}
                  </p>
                  {selectedAnswer !== currentQuestion.correctAnswer && (
                    <p className="text-gray-300 mt-2">
                      The correct answer is:{" "}
                      <span className="font-semibold text-green-300">
                        {currentQuestion.correctAnswer}
                      </span>
                    </p>
                  )}
                  {currentQuestion.explanation && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-300 text-sm leading-relaxed">
                        <strong>Explanation:</strong>{" "}
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center bg-black/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-300 font-medium">
              Topic: Advanced Knowledge
            </span>
          </div>

          <div className="space-x-3">
            {!showResult ? (
              <Button
                onClick={handleSubmitCurrentQuestion}
                disabled={!selectedAnswer}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex === questions.length - 1
                  ? "Complete Assessment"
                  : "Submit Answer"}
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
              >
                {currentQuestionIndex === questions.length - 1
                  ? "View Results"
                  : "Continue"}
                <SkipForward className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

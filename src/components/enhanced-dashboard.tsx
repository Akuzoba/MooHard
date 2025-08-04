"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { EnhancedFileUploader } from "@/components/views/enhanced-file-uploader";
import { SummaryView } from "@/components/views/summary-view";
import { EnhancedQuizView } from "@/components/views/enhanced-quiz-view";
import { FlashcardsView } from "@/components/views/flashcards-view";
import { EnhancedChatView } from "@/components/views/enhanced-chat-view";
import { EnhancedNotesView } from "@/components/views/enhanced-notes-view";
import { AnalyticsView } from "@/components/views/analytics-view";
import { summarizePdfContent } from "@/ai/flows/summarize-pdf-content";
import { generateMultipleChoiceQuestions } from "@/ai/flows/generate-multiple-choice-questions";
import { createFlashcards } from "@/ai/flows/generate-flashcards";
import { useAuth } from "@/lib/auth-context";
import { DatabaseService } from "@/lib/database-service";
import {
  StudySet,
  StudySession as DbStudySession,
  StudyFile,
} from "@/lib/database-types";
import type {
  Question,
  Flashcard,
  UploadedFile,
  FileType,
  StudySession,
  QuizResult,
  StudyAnalytics,
  EnhancedQuestion,
} from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  Zap,
  BarChart3,
  ArrowLeft,
  Save,
} from "lucide-react";

type ActiveView =
  | "summary"
  | "quiz"
  | "flashcards"
  | "chat"
  | "notes"
  | "analytics";

interface EnhancedDashboardProps {
  onBack?: () => void;
  onStudySetCreated?: (studySetData: any) => void;
  existingStudySet?: StudySet | null;
  isCreatingNew?: boolean;
}

export function EnhancedDashboard({
  onBack,
  onStudySetCreated,
  existingStudySet,
  isCreatingNew = false,
}: EnhancedDashboardProps) {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [documentContent, setDocumentContent] = useState("");
  const [summary, setSummary] = useState("");
  const [questions, setQuestions] = useState<EnhancedQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>("summary");

  // Study tracking states
  const [currentSession, setCurrentSession] = useState<StudySession | null>(
    null
  );
  const [analytics, setAnalytics] = useState<StudyAnalytics>({
    totalStudyTime: 0,
    quizAccuracy: 0,
    flashcardsMastered: 0,
    sessionsCompleted: 0,
    weeklyProgress: [],
    topicStrengths: [],
  });
  const [studySetTitle, setStudySetTitle] = useState("");
  const [studySetDescription, setStudySetDescription] = useState("");
  const [studySetTags, setStudySetTags] = useState<string[]>([]);

  // Initialize from existing study set
  useEffect(() => {
    if (existingStudySet && !isCreatingNew) {
      setStudySetTitle(existingStudySet.title);
      setStudySetDescription(existingStudySet.description || "");
      setStudySetTags(existingStudySet.tags);
      setSummary(existingStudySet.summary || "");
      setQuestions(
        existingStudySet.questions.map((q, index) => ({
          ...q,
          id: q.id || `q-${index}`,
          type: "multiple-choice" as const,
          difficulty: (q.difficulty as any) || "medium",
          explanation: q.explanation || "No explanation available",
          topic: q.topic || `Topic ${Math.floor(index / 3) + 1}`,
        }))
      );
      setFlashcards(
        existingStudySet.flashcards.map((card) => ({
          ...card,
          category: card.category || "General",
          difficulty: card.difficulty || "medium",
          tags: [], // Add missing tags property
        }))
      );

      // Convert study files back to uploaded files format
      const files: UploadedFile[] = existingStudySet.files.map((file) => ({
        id: file.id,
        name: file.name,
        type: file.type as FileType,
        size: file.size,
        content: file.content,
        file: null, // Original file object not available
        uploadDate: file.uploadedAt || new Date(), // Add missing uploadDate
      }));
      setUploadedFiles(files);

      // Set document content
      const combinedContent = existingStudySet.files
        .map((file) => `[${file.name}]\n${file.content}`)
        .join("\n\n---\n\n");
      setDocumentContent(combinedContent);
    }
  }, [existingStudySet, isCreatingNew]);

  // Load saved data on component mount
  useEffect(() => {
    const savedAnalytics = localStorage.getItem("studyverse-analytics");
    if (savedAnalytics) {
      setAnalytics(JSON.parse(savedAnalytics));
    }
  }, []);

  // Save analytics to localStorage
  useEffect(() => {
    localStorage.setItem("studyverse-analytics", JSON.stringify(analytics));
  }, [analytics]);

  const handleReset = () => {
    setUploadedFiles([]);
    setDocumentContent("");
    setSummary("");
    setQuestions([]);
    setFlashcards([]);
    setError(null);
    if (currentSession) {
      endStudySession();
    }
  };

  const startStudySession = () => {
    const session: StudySession = {
      id: `session-${Date.now()}`,
      documentTitle: uploadedFiles.map((f) => f.name).join(", "),
      startTime: new Date(),
      quizResults: [],
      flashcardsReviewed: 0,
      flashcardsMastered: 0,
      totalTimeSpent: 0,
    };
    setCurrentSession(session);
  };

  const endStudySession = () => {
    if (currentSession) {
      const endTime = new Date();
      const totalTime = endTime.getTime() - currentSession.startTime.getTime();

      const updatedSession = {
        ...currentSession,
        endTime,
        totalTimeSpent: totalTime,
      };

      // Update analytics
      setAnalytics((prev) => ({
        ...prev,
        totalStudyTime: prev.totalStudyTime + totalTime,
        sessionsCompleted: prev.sessionsCompleted + 1,
        weeklyProgress: [
          ...prev.weeklyProgress,
          {
            date: new Date().toISOString().split("T")[0],
            score: updatedSession.score || 0,
            time: totalTime,
          },
        ].slice(-7), // Keep only last 7 days
      }));

      setCurrentSession(null);
    }
  };

  const handleFilesProcessed = async (files: UploadedFile[]) => {
    if (files.length === 0) {
      setError("No files to process.");
      return;
    }

    setIsLoading(true);
    setUploadedFiles(files);
    setError(null);

    // Combine content from all files
    const combinedContent = files
      .map((file) => `[${file.name}]\n${file.content}`)
      .join("\n\n---\n\n");

    setDocumentContent(combinedContent);
    startStudySession();

    try {
      const [summaryResult, questionsResult, flashcardsResult] =
        await Promise.all([
          summarizePdfContent({ pdfText: combinedContent }),
          generateMultipleChoiceQuestions({ textContent: combinedContent }),
          createFlashcards(combinedContent),
        ]);

      setSummary(summaryResult.summary);

      // Enhance questions with additional metadata
      const enhancedQuestions: EnhancedQuestion[] =
        questionsResult.questions.map((q, index) => ({
          ...q,
          id: `q-${index}`,
          type: "multiple-choice" as const,
          difficulty: ["easy", "medium", "hard"][
            Math.floor(Math.random() * 3)
          ] as any,
          explanation: `This question tests your understanding of key concepts from the uploaded materials.`,
          topic: `Topic ${Math.floor(index / 3) + 1}`,
          // Ensure options are properly structured
          options: q.options || [],
          correctAnswer: q.correctAnswer,
        }));

      setQuestions(enhancedQuestions);
      setFlashcards(flashcardsResult);

      // Auto-save study set if creating new
      if (isCreatingNew && onStudySetCreated) {
        const studySetData = {
          title: `Study Set - ${new Date().toLocaleDateString()}`,
          description: `Generated from ${files.length} uploaded file(s)`,
          files: files.map((file) => ({
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size,
            content: file.content,
            uploadedAt: new Date(),
            processingStatus: "completed" as const,
          })),
          summary: summaryResult.summary,
          flashcards: flashcardsResult,
          questions: enhancedQuestions,
          tags: [],
          isPublic: false,
        };

        onStudySetCreated(studySetData);
      }
    } catch (e) {
      console.error(e);
      setError(
        "An error occurred while generating study aids. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Save study set manually
  const handleSaveStudySet = async () => {
    if (!user || !uploadedFiles.length) return;

    try {
      const studySetData = {
        title:
          studySetTitle || `Study Set - ${new Date().toLocaleDateString()}`,
        description: studySetDescription,
        files: uploadedFiles.map((file) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          content: file.content,
          uploadedAt: new Date(),
          processingStatus: "completed" as const,
        })),
        summary,
        flashcards,
        questions,
        tags: studySetTags,
        isPublic: false,
      };

      if (existingStudySet && !isCreatingNew) {
        // Update existing study set
        await DatabaseService.updateStudySet(existingStudySet.id, {
          ...studySetData,
          questions: studySetData.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            topic: q.topic,
            type: "multiple-choice" as const,
          })),
        });
      } else {
        // Create new study set
        const studySetId = await DatabaseService.createStudySet({
          ...studySetData,
          userId: user.id,
          lastAccessedAt: new Date(),
          analytics: {
            totalSessions: 0,
            totalTimeSpent: 0,
            averageQuizScore: 0,
            flashcardMasteryRate: 0,
            lastStudied: new Date(),
            streakDays: 0,
            popularTopics: [],
          },
          questions: studySetData.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            topic: q.topic,
            type: "multiple-choice" as const,
          })),
        });
      }
    } catch (error) {
      console.error("Error saving study set:", error);
      setError("Failed to save study set. Please try again.");
    }
  };

  const handleRegenerateQuiz = async () => {
    if (!documentContent) {
      setError("No document content available to regenerate quiz");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const questionsResult = await generateMultipleChoiceQuestions({
        textContent: documentContent,
      });

      // Enhance questions with additional metadata
      const enhancedQuestions: EnhancedQuestion[] =
        questionsResult.questions.map((q, index) => ({
          ...q,
          id: `q-${Date.now()}-${index}`, // Use timestamp to ensure unique IDs
          type: "multiple-choice" as const,
          difficulty: ["easy", "medium", "hard"][
            Math.floor(Math.random() * 3)
          ] as any,
          explanation: `This question tests your understanding of key concepts from the uploaded materials.`,
          topic: `Topic ${Math.floor(index / 3) + 1}`,
          // Ensure options are properly structured
          options: q.options || [],
          correctAnswer: q.correctAnswer,
        }));

      setQuestions(enhancedQuestions);
    } catch (e) {
      console.error(e);
      setError(
        "An error occurred while regenerating quiz questions. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = (results: QuizResult[], score: number) => {
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        quizResults: [...currentSession.quizResults, ...results],
        score,
      };
      setCurrentSession(updatedSession);

      // Update analytics
      const accuracy =
        (results.filter((r) => r.isCorrect).length / results.length) * 100;
      setAnalytics((prev) => ({
        ...prev,
        quizAccuracy: (prev.quizAccuracy + accuracy) / 2, // Running average
      }));
    }
  };

  const handleFlashcardMastery = (masteredCount: number) => {
    if (currentSession) {
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              flashcardsMastered: masteredCount,
            }
          : null
      );
    }

    setAnalytics((prev) => ({
      ...prev,
      flashcardsMastered: prev.flashcardsMastered + masteredCount,
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#121212] relative overflow-hidden">
      {/* Modern tech background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00BFFF]/10 via-[#121212] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#A8FF60]/5 via-[#121212] to-transparent" />
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:40px_40px]" />
      <AppSidebar onReset={handleReset} />

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 sm:ml-64 relative z-10">
        {/* Header with back button and save */}
        {(onBack || !isCreatingNew) && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 bg-transparent hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              {existingStudySet && (
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {existingStudySet.title}
                  </h1>
                  {existingStudySet.description && (
                    <p className="text-gray-400">
                      {existingStudySet.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {uploadedFiles.length > 0 && !isCreatingNew && (
              <Button
                onClick={handleSaveStudySet}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        )}

        {uploadedFiles.length === 0 ? (
          <EnhancedFileUploader
            onFilesProcessed={handleFilesProcessed}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Session Status */}
            <AnimatePresence>
              {currentSession && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  variants={itemVariants}
                >
                  <Card className="bg-gradient-to-r from-[#00BFFF]/20 via-[#B388FF]/20 to-[#00BFFF]/20 border-[#00BFFF]/50 backdrop-blur-xl shadow-2xl shadow-[#00BFFF]/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gradient-to-r from-[#A8FF60] to-[#00BFFF] rounded-full animate-pulse shadow-lg shadow-[#A8FF60]/50" />
                            <span className="font-semibold text-white font-bold">
                              Study Session Active
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#A8FF60]/90">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-[#00BFFF]" />
                              <span>
                                {Math.floor(
                                  (Date.now() -
                                    currentSession.startTime.getTime()) /
                                    60000
                                )}{" "}
                                min
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4 text-[#B388FF]" />
                              <span>
                                {currentSession.quizResults.length} questions
                                answered
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Brain className="w-4 h-4 text-[#00BFFF]" />
                              <span>
                                {currentSession.flashcardsMastered} cards
                                mastered
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={endStudySession}
                          className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all duration-300"
                        >
                          End Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Study Progress */}
            <motion.div variants={itemVariants}>
              <Card className="bg-[#121212] border-[#00BFFF]/40 backdrop-blur-xl shadow-2xl shadow-[#00BFFF]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white font-bold">
                    <TrendingUp className="w-5 h-5 text-[#00BFFF]" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-[#00BFFF]/20 to-[#B388FF]/10 border border-[#00BFFF]/30">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#00BFFF] to-[#A8FF60] bg-clip-text text-transparent">
                        {Math.round(analytics.quizAccuracy)}%
                      </div>
                      <div className="text-sm text-[#A8FF60]/80 font-semibold">
                        Quiz Accuracy
                      </div>
                    </div>
                    <div className="text-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-[#B388FF]/20 to-[#00BFFF]/10 border border-[#B388FF]/30">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#B388FF] to-[#00BFFF] bg-clip-text text-transparent">
                        {analytics.flashcardsMastered}
                      </div>
                      <div className="text-sm text-[#B388FF]/80 font-semibold">
                        Cards Mastered
                      </div>
                    </div>
                    <div className="text-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-[#A8FF60]/20 to-[#00BFFF]/10 border border-[#A8FF60]/30">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#A8FF60] to-[#B388FF] bg-clip-text text-transparent">
                        {Math.round(analytics.totalStudyTime / 60000)}
                      </div>
                      <div className="text-sm text-[#A8FF60]/80 font-semibold">
                        Minutes Studied
                      </div>
                    </div>
                    <div className="text-center space-y-2 p-4 rounded-xl bg-gradient-to-br from-[#00BFFF]/20 to-[#A8FF60]/10 border border-[#00BFFF]/30">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#00BFFF] to-[#B388FF] bg-clip-text text-transparent">
                        {analytics.sessionsCompleted}
                      </div>
                      <div className="text-sm text-[#00BFFF]/80 font-semibold">
                        Sessions Completed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* File Overview */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-slate-900/50 via-cyan-900/30 to-slate-900/50 border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    Uploaded Materials ({uploadedFiles.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file) => (
                      <Badge
                        key={file.id}
                        variant="secondary"
                        className="text-xs bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-cyan-300 border-purple-500/30 hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300"
                      >
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content Tabs */}
            <motion.div variants={itemVariants}>
              <Tabs
                value={activeView}
                onValueChange={(value) => setActiveView(value as ActiveView)}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between">
                  <TabsList className="grid w-full grid-cols-6 lg:w-fit bg-[#121212] border border-[#00BFFF]/30 backdrop-blur-xl">
                    <TabsTrigger
                      value="summary"
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00BFFF]/30 data-[state=active]:to-[#A8FF60]/20 data-[state=active]:text-white text-[#A8FF60]/70 hover:text-white transition-all duration-300 font-semibold"
                    >
                      <Sparkles className="w-4 h-4" />
                      Summary
                    </TabsTrigger>
                    <TabsTrigger
                      value="quiz"
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#B388FF]/30 data-[state=active]:to-[#00BFFF]/20 data-[state=active]:text-white text-[#A8FF60]/70 hover:text-white transition-all duration-300 font-semibold"
                    >
                      <Target className="w-4 h-4" />
                      Quiz
                    </TabsTrigger>
                    <TabsTrigger
                      value="flashcards"
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A8FF60]/30 data-[state=active]:to-[#B388FF]/20 data-[state=active]:text-white text-[#A8FF60]/70 hover:text-white transition-all duration-300 font-semibold"
                    >
                      <Brain className="w-4 h-4" />
                      Flashcards
                    </TabsTrigger>
                    <TabsTrigger
                      value="chat"
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00BFFF]/30 data-[state=active]:to-[#B388FF]/20 data-[state=active]:text-white text-[#A8FF60]/70 hover:text-white transition-all duration-300 font-semibold"
                    >
                      <Zap className="w-4 h-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger
                      value="notes"
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#A8FF60]/30 data-[state=active]:to-[#00BFFF]/20 data-[state=active]:text-white text-[#A8FF60]/70 hover:text-white transition-all duration-300 font-semibold"
                    >
                      <BookOpen className="w-4 h-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger
                      value="analytics"
                      className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-white text-cyan-300/70 hover:text-white transition-all duration-300"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25"
                    >
                      New Study Set
                    </Button>
                  </div>
                </div>

                <div className="flex-grow mt-6">
                  <AnimatePresence>
                    <motion.div
                      key={activeView}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TabsContent value="summary" className="h-full mt-0">
                        <SummaryView summary={summary} isLoading={isLoading} />
                      </TabsContent>

                      <TabsContent value="quiz" className="h-full mt-0">
                        <EnhancedQuizView
                          questions={questions}
                          isLoading={isLoading}
                          onQuizComplete={handleQuizComplete}
                          onRegenerateQuiz={handleRegenerateQuiz}
                          error={error}
                        />
                      </TabsContent>

                      <TabsContent value="flashcards" className="h-full mt-0">
                        <FlashcardsView
                          flashcards={flashcards}
                          isLoading={isLoading}
                          onMasteryUpdate={handleFlashcardMastery}
                          error={error}
                        />
                      </TabsContent>

                      <TabsContent value="chat" className="h-full mt-0">
                        <EnhancedChatView documentContent={documentContent} />
                      </TabsContent>

                      <TabsContent value="notes" className="h-full mt-0">
                        <EnhancedNotesView uploadedFiles={uploadedFiles} />
                      </TabsContent>

                      <TabsContent value="analytics" className="h-full mt-0">
                        <AnalyticsView analytics={analytics} />
                      </TabsContent>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </Tabs>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

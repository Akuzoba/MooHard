"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AuthPage } from "@/components/auth/auth-page";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { EnhancedDashboard } from "@/components/enhanced-dashboard";
import { DatabaseService } from "@/lib/database-service";
import { StudySet } from "@/lib/database-types";
import { Loader2 } from "lucide-react";

type AppState = "dashboard" | "create-study-set" | "study-set";

export default function Home() {
  const { user, loading } = useAuth();
  const [appState, setAppState] = useState<AppState>("dashboard");
  const [currentStudySet, setCurrentStudySet] = useState<StudySet | null>(null);

  const handleCreateStudySet = () => {
    setAppState("create-study-set");
    setCurrentStudySet(null);
  };

  const handleOpenStudySet = async (studySet: StudySet) => {
    try {
      // Update last accessed time
      await DatabaseService.updateLastAccessed(studySet.id);
      setCurrentStudySet(studySet);
      setAppState("study-set");
    } catch (error) {
      console.error("Error opening study set:", error);
    }
  };

  const handleBackToDashboard = () => {
    setAppState("dashboard");
    setCurrentStudySet(null);
  };

  const handleStudySetCreated = async (studySetData: any) => {
    try {
      // Create the study set in the database
      const studySetId = await DatabaseService.createStudySet({
        ...studySetData,
        userId: user!.id,
        analytics: {
          totalSessions: 0,
          totalTimeSpent: 0,
          averageQuizScore: 0,
          flashcardMasteryRate: 0,
          lastStudied: new Date(),
          streakDays: 0,
          popularTopics: [],
        },
      });

      // Get the created study set
      const createdStudySet = await DatabaseService.getStudySet(studySetId);
      if (createdStudySet) {
        setCurrentStudySet(createdStudySet);
        setAppState("study-set");
      }
    } catch (error) {
      console.error("Error creating study set:", error);
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <span className="text-xl text-gray-300">Loading...</span>
        </div>
      </div>
    );
  }

  // Show auth page if user not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Show appropriate app state
  switch (appState) {
    case "dashboard":
      return (
        <UserDashboard
          onCreateStudySet={handleCreateStudySet}
          onOpenStudySet={handleOpenStudySet}
        />
      );

    case "create-study-set":
      return (
        <EnhancedDashboard
          onBack={handleBackToDashboard}
          onStudySetCreated={handleStudySetCreated}
          isCreatingNew={true}
        />
      );

    case "study-set":
      return (
        <EnhancedDashboard
          onBack={handleBackToDashboard}
          existingStudySet={currentStudySet}
          isCreatingNew={false}
        />
      );

    default:
      return null;
  }
}

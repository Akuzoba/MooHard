"use client";

import { useState } from "react";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import {
  BookOpen,
  Brain,
  Users,
  Zap,
  Shield,
  Star,
  Chrome,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function AuthPage() {
  const { signInWithGoogle, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-4">
            StudyVerse
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your personal AI-powered study companion. Upload documents, create
            flashcards, take quizzes, and track your learning progress.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white mb-8">
              Revolutionize Your Learning
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    AI-Powered Study Tools
                  </h3>
                  <p className="text-gray-300">
                    Automatically generate flashcards, quizzes, and summaries
                    from your documents using advanced AI.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Smart Progress Tracking
                  </h3>
                  <p className="text-gray-300">
                    Track your learning progress with detailed analytics and
                    personalized insights.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Personal Study Space
                  </h3>
                  <p className="text-gray-300">
                    Organize your study materials in your own private workspace
                    with cloud sync.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Secure & Private
                  </h3>
                  <p className="text-gray-300">
                    Your data is encrypted and secure. Only you have access to
                    your study materials.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sign In Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-black/20 backdrop-blur-sm border-gray-700/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">
                  Get Started
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Sign in to access your personal study space
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 rounded-xl text-lg font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 disabled:opacity-50"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Chrome className="w-5 h-5 mr-3" />
                      Continue with Google
                    </>
                  )}
                </Button>

                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-xl p-4">
                  <div className="flex items-center text-blue-300 text-sm mb-2">
                    <Star className="w-4 h-4 mr-2" />
                    Free Account Includes:
                  </div>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Upload up to 10 documents</li>
                    <li>• Generate unlimited flashcards & quizzes</li>
                    <li>• Personal progress tracking</li>
                    <li>• AI-powered study recommendations</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  By signing in, you agree to our Terms of Service and Privacy
                  Policy. Your data is secure and will never be shared.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

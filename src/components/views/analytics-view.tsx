"use client";

import { useState } from "react";
import { motion } from "@/lib/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  Brain,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Star,
  Trophy,
} from "lucide-react";
import type { StudyAnalytics } from "@/lib/types";

interface AnalyticsViewProps {
  analytics: StudyAnalytics;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"];

export function AnalyticsView({ analytics }: AnalyticsViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "all"
  >("week");

  // Mock data for demonstration (in real app, this would come from analytics)
  const performanceData = [
    { date: "2024-01-01", score: 85, time: 45, flashcards: 12 },
    { date: "2024-01-02", score: 78, time: 38, flashcards: 15 },
    { date: "2024-01-03", score: 92, time: 52, flashcards: 18 },
    { date: "2024-01-04", score: 88, time: 41, flashcards: 14 },
    { date: "2024-01-05", score: 94, time: 48, flashcards: 20 },
    { date: "2024-01-06", score: 87, time: 35, flashcards: 16 },
    { date: "2024-01-07", score: 91, time: 44, flashcards: 19 },
  ];

  const subjectDistribution = [
    { name: "Mathematics", value: 30, sessions: 12 },
    { name: "Science", value: 25, sessions: 10 },
    { name: "History", value: 20, sessions: 8 },
    { name: "Literature", value: 15, sessions: 6 },
    { name: "Other", value: 10, sessions: 4 },
  ];

  const weeklyGoals = [
    { goal: "Study 5 hours", progress: 67, current: 3.35, target: 5 },
    { goal: "Complete 50 flashcards", progress: 84, current: 42, target: 50 },
    { goal: "Score 85% average", progress: 95, current: 89, target: 85 },
    { goal: "7 study sessions", progress: 71, current: 5, target: 7 },
  ];

  const achievements = [
    {
      title: "7-Day Streak",
      description: "Studied for 7 consecutive days",
      earned: true,
      icon: "🔥",
    },
    {
      title: "Quiz Master",
      description: "Scored 90%+ on 5 quizzes",
      earned: true,
      icon: "🎯",
    },
    {
      title: "Night Owl",
      description: "Studied after 10 PM",
      earned: false,
      icon: "🦉",
    },
    {
      title: "Early Bird",
      description: "Studied before 7 AM",
      earned: true,
      icon: "🐦",
    },
    {
      title: "Flash Genius",
      description: "Mastered 100 flashcards",
      earned: false,
      icon: "⚡",
    },
    {
      title: "Consistent Learner",
      description: "Studied every day this month",
      earned: false,
      icon: "📚",
    },
  ];

  const getStreakInfo = () => {
    // Mock streak calculation
    return {
      current: 7,
      longest: 12,
      thisWeek: 5,
    };
  };

  const streakInfo = getStreakInfo();

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-white">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
              Study Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">
                  {Math.round(analytics.totalStudyTime / 3600000)}h
                </div>
                <div className="text-sm text-cyan-300/70">Total Study Time</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                  {analytics.sessionsCompleted}
                </div>
                <div className="text-sm text-purple-300/70">
                  Sessions Completed
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">
                  {Math.round(analytics.quizAccuracy)}%
                </div>
                <div className="text-sm text-cyan-300/70">Average Accuracy</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                  {analytics.flashcardsMastered}
                </div>
                <div className="text-sm text-purple-300/70">Cards Mastered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Study Streak */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Study Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">
                      🔥 {streakInfo.current}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current Streak
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-500 mb-2">
                      ⭐ {streakInfo.longest}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Longest Streak
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-500 mb-2">
                      📅 {streakInfo.thisWeek}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This Week
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Progress */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).getDate().toString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="time"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject Distribution */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Study Subject Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={subjectDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {subjectDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {subjectDistribution.map((subject, index) => (
                      <div
                        key={subject.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subject.sessions} sessions
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Trends */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance Trends
                  </div>
                  <div className="flex gap-2">
                    {(["week", "month", "all"] as const).map((period) => (
                      <Button
                        key={period}
                        variant={
                          selectedPeriod === period ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedPeriod(period)}
                      >
                        {period === "week"
                          ? "7d"
                          : period === "month"
                          ? "30d"
                          : "All"}
                      </Button>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).getDate().toString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      strokeWidth={3}
                      name="Quiz Score (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="time"
                      stroke="#82ca9d"
                      strokeWidth={3}
                      name="Study Time (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Stats */}
          <motion.div variants={itemVariants}>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Best Performance Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      94%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      January 5th
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      Personal Best
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Longest Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      52m
                    </div>
                    <div className="text-sm text-muted-foreground">
                      January 3rd
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      Focus Master
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Most Productive Hour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500 mb-2">
                      2 PM
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Afternoon Peak
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      Prime Time
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {/* Weekly Goals */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Weekly Goals Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {weeklyGoals.map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.goal}</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={goal.progress} className="flex-1" />
                      <Badge
                        variant={goal.progress >= 100 ? "default" : "secondary"}
                        className={goal.progress >= 100 ? "bg-green-500" : ""}
                      >
                        {goal.progress}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Goal Insights */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Goal Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="font-medium text-green-800">On Track</span>
                  </div>
                  <p className="text-sm text-green-700">
                    You're exceeding your quiz score goal! Keep up the excellent
                    work.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="font-medium text-yellow-800">
                      Needs Attention
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    You need 2 more study sessions this week to reach your goal.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="font-medium text-blue-800">
                      Suggestion
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Try studying for 30 minutes in the afternoon to improve
                    consistency.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Achievements Grid */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Achievements & Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className={`p-4 rounded-lg border transition-all ${
                        achievement.earned
                          ? "bg-primary/10 border-primary/20 shadow-md"
                          : "bg-muted/50 border-muted grayscale"
                      }`}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                        {achievement.earned && (
                          <Badge className="bg-primary">Earned!</Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress to Next Achievement */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Next Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Flash Genius (Master 100 flashcards)
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {analytics.flashcardsMastered} / 100
                    </span>
                  </div>
                  <Progress
                    value={(analytics.flashcardsMastered / 100) * 100}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Consistent Learner (Study 30 days)
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {analytics.sessionsCompleted} / 30
                    </span>
                  </div>
                  <Progress value={(analytics.sessionsCompleted / 30) * 100} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

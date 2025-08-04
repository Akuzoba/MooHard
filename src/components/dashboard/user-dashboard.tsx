"use client";

import { useState, useEffect } from "react";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { DatabaseService } from "@/lib/database-service";
import { StudySet } from "@/lib/database-types";
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  Target,
  TrendingUp,
  MoreHorizontal,
  FileText,
  Brain,
  Zap,
  Calendar,
  ChevronRight,
  Star,
  Trash2,
  Edit,
  Share,
} from "lucide-react";

interface UserDashboardProps {
  onCreateStudySet: () => void;
  onOpenStudySet: (studySet: StudySet) => void;
}

export function UserDashboard({
  onCreateStudySet,
  onOpenStudySet,
}: UserDashboardProps) {
  const { user, signOut } = useAuth();
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudySets, setFilteredStudySets] = useState<StudySet[]>([]);

  // Load user's study sets
  useEffect(() => {
    if (user) {
      loadStudySets();
    }
  }, [user]);

  // Filter study sets based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudySets(studySets);
    } else {
      const filtered = studySets.filter(
        (set) =>
          set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          set.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          set.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredStudySets(filtered);
    }
  }, [searchTerm, studySets]);

  const loadStudySets = async () => {
    try {
      setLoading(true);
      const sets = await DatabaseService.getUserStudySets(user!.id);
      setStudySets(sets);
    } catch (error) {
      console.error("Error loading study sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudySet = async (studySetId: string) => {
    if (confirm("Are you sure you want to delete this study set?")) {
      try {
        await DatabaseService.deleteStudySet(studySetId);
        setStudySets((prev) => prev.filter((set) => set.id !== studySetId));
      } catch (error) {
        console.error("Error deleting study set:", error);
      }
    }
  };

  const formatDate = (date: Date | any) => {
    if (!date) return "Never";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-gray-300">Continue your learning journey</p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={onCreateStudySet}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Study Set
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-gray-600 bg-transparent"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-700">
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-red-400 hover:text-red-300"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/20 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {studySets.length}
                  </p>
                  <p className="text-gray-400 text-sm">Study Sets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {studySets.reduce(
                      (acc, set) => acc + (set.analytics?.totalSessions || 0),
                      0
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatDuration(
                      studySets.reduce(
                        (acc, set) =>
                          acc + (set.analytics?.totalTimeSpent || 0),
                        0
                      )
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">Time Studied</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Math.round(
                      studySets.reduce(
                        (acc, set) =>
                          acc + (set.analytics?.averageQuizScore || 0),
                        0
                      ) / Math.max(studySets.length, 1)
                    )}
                    %
                  </p>
                  <p className="text-gray-400 text-sm">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search study sets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/20 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Study Sets Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your study sets...</p>
          </div>
        ) : filteredStudySets.length === 0 ? (
          <Card className="bg-black/20 backdrop-blur-sm border-gray-700/50">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? "No study sets found" : "No study sets yet"}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first study set to get started"}
              </p>
              {!searchTerm && (
                <Button
                  onClick={onCreateStudySet}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Study Set
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudySets.map((studySet) => (
              <motion.div
                key={studySet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-black/20 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white group-hover:text-purple-300 transition-colors">
                          {studySet.title}
                        </CardTitle>
                        {studySet.description && (
                          <CardDescription className="text-gray-400 mt-1 line-clamp-2">
                            {studySet.description}
                          </CardDescription>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-gray-700">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDeleteStudySet(studySet.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent
                    className="pt-0"
                    onClick={() => onOpenStudySet(studySet)}
                  >
                    {/* Tags */}
                    {studySet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {studySet.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {studySet.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-500/20 text-gray-400"
                          >
                            +{studySet.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {studySet.files.length}
                        </p>
                        <p className="text-xs text-gray-400">Files</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Brain className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {studySet.flashcards.length}
                        </p>
                        <p className="text-xs text-gray-400">Cards</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {studySet.questions.length}
                        </p>
                        <p className="text-xs text-gray-400">Quiz</p>
                      </div>
                    </div>

                    {/* Last accessed */}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(studySet.lastAccessedAt)}
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

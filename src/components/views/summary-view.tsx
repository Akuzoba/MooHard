"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookText } from "lucide-react";

interface SummaryViewProps {
  summary: string;
  isLoading: boolean;
}

export function SummaryView({ summary, isLoading }: SummaryViewProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
        <CardHeader>
          <Skeleton className="h-8 w-1/3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20" />
          <Skeleton className="h-4 w-1/2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20" />
          <Skeleton className="h-4 w-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20" />
          <Skeleton className="h-4 w-5/6 bg-gradient-to-r from-cyan-500/20 to-purple-500/20" />
          <Skeleton className="h-4 w-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 border-purple-500/30 backdrop-blur-xl shadow-2xl shadow-purple-500/10">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-white">
          <BookText className="text-cyan-400" />
          AI-Powered Summary
        </CardTitle>
        <CardDescription className="text-cyan-300/70">
          Here are the key concepts extracted from your document.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="prose prose-lg dark:prose-invert max-w-none text-base leading-relaxed text-white">
            {summary.split("\n").map((paragraph, index) => (
              <p key={index} className="text-gray-200 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

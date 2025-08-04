"use client";

import Link from "next/link";
import {
  BookText,
  FileQuestion,
  Album,
  MessageCircle,
  Mic,
  Bot,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  onReset: () => void;
}

export function AppSidebar({ onReset }: AppSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-[#00BFFF]/30 bg-[#121212] backdrop-blur-xl sm:flex">
      <div className="flex h-16 items-center border-b border-[#00BFFF]/30 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-headline font-semibold text-lg text-white hover:text-[#A8FF60] transition-colors duration-300"
        >
          <BrainCircuit className="h-6 w-6 text-[#00BFFF] drop-shadow-lg drop-shadow-[#00BFFF]/50" />
          <span className="bg-gradient-to-r from-[#00BFFF] to-[#B388FF] bg-clip-text text-transparent font-bold">
            MooHard
          </span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <div className="grid items-start px-4 text-sm font-medium">
          {/* The navigation is handled by tabs in the main content area, 
                so this sidebar is primarily for branding and global actions. */}
        </div>
      </nav>
      <div className="mt-auto p-4">
        <Button
          onClick={onReset}
          className="w-full bg-gradient-to-r from-[#00BFFF] to-[#B388FF] hover:from-[#00BFFF]/80 hover:to-[#B388FF]/80 text-white border-0 shadow-lg shadow-[#00BFFF]/25 hover:shadow-xl hover:shadow-[#A8FF60]/25 transition-all duration-300 font-semibold"
        >
          New Study Set
        </Button>
      </div>
    </aside>
  );
}

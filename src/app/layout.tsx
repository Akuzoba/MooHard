import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "StudyVerse - AI-Powered Learning Platform",
  description:
    "Transform your documents into interactive study materials with AI-powered tools. Create flashcards, quizzes, and track your progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "font-body antialiased",
          "min-h-screen bg-[#121212] font-sans"
        )}
      >
        <div className="relative min-h-screen">
          {/* Modern Tech Background Pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00BFFF]/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#A8FF60]/5 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#B388FF]/5 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "4s" }}
            />
          </div>

          {/* Main Content */}
          <AuthProvider>
            <div className="relative z-10">{children}</div>
          </AuthProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

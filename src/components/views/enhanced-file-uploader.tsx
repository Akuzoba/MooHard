"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  File,
  Image,
  Presentation,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import type { FileType, UploadedFile } from "@/lib/types";

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EnhancedFileUploaderProps {
  onFilesProcessed: (files: UploadedFile[]) => void;
  isLoading: boolean;
  error: string | null;
}

const fileTypeIcons: Record<FileType, any> = {
  pdf: FileText,
  docx: File,
  doc: File,
  pptx: Presentation,
  ppt: Presentation,
  txt: FileText,
  md: FileText,
  image: Image,
};

const acceptedFileTypes = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
  "application/vnd.ms-powerpoint": [".ppt"],
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
};

export function EnhancedFileUploader({
  onFilesProcessed,
  isLoading,
  error,
}: EnhancedFileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(
    new Set()
  );
  const [processingProgress, setProcessingProgress] = useState<
    Record<string, number>
  >({});

  const getFileType = (file: File): FileType => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (file.type.startsWith("image/")) return "image";
    switch (extension) {
      case "pdf":
        return "pdf";
      case "docx":
        return "docx";
      case "doc":
        return "doc";
      case "pptx":
        return "pptx";
      case "ppt":
        return "ppt";
      case "txt":
        return "txt";
      case "md":
        return "md";
      default:
        return "txt";
    }
  };

  const processPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let content = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      content += textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      setProcessingProgress((prev) => ({
        ...prev,
        [file.name]: (i / pdf.numPages) * 100,
      }));
    }

    return content;
  };

  const processWordDocument = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const processTextFile = async (file: File): Promise<string> => {
    return await file.text();
  };

  const processImage = async (file: File): Promise<string> => {
    const {
      data: { text },
    } = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProcessingProgress((prev) => ({
            ...prev,
            [file.name]: m.progress * 100,
          }));
        }
      },
    });
    return text;
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    const fileType = getFileType(file);
    const fileId = `${file.name}-${Date.now()}`;

    setProcessingFiles((prev) => new Set([...prev, fileId]));
    setProcessingProgress((prev) => ({ ...prev, [file.name]: 0 }));

    try {
      let content = "";

      switch (fileType) {
        case "pdf":
          content = await processPdf(file);
          break;
        case "docx":
        case "doc":
          content = await processWordDocument(file);
          break;
        case "pptx":
        case "ppt":
          // For PowerPoint, we'll treat it as a document for now
          content = await processWordDocument(file);
          break;
        case "txt":
        case "md":
          content = await processTextFile(file);
          break;
        case "image":
          content = await processImage(file);
          break;
        default:
          content = await processTextFile(file);
      }

      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: fileType,
        size: file.size,
        content,
        uploadDate: new Date(),
      };

      return uploadedFile;
    } finally {
      setProcessingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      setProcessingProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const processedFiles: UploadedFile[] = [];

      for (const file of acceptedFiles) {
        try {
          const processedFile = await processFile(file);
          processedFiles.push(processedFile);
          setUploadedFiles((prev) => [...prev, processedFile]);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
        }
      }

      if (processedFiles.length > 0) {
        onFilesProcessed([...uploadedFiles, ...processedFiles]);
      }
    },
    [uploadedFiles, onFilesProcessed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: true,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    const remainingFiles = uploadedFiles.filter((f) => f.id !== fileId);
    onFilesProcessed(remainingFiles);
  };

  const handleGenerate = () => {
    if (uploadedFiles.length > 0) {
      onFilesProcessed(uploadedFiles);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-[#121212] relative overflow-hidden">
      {/* Modern tech background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00BFFF]/10 via-[#121212] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#A8FF60]/5 via-[#121212] to-transparent" />
      <div className="absolute inset-0 bg-grid-white/[0.03] bg-[size:40px_40px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10"
      >
        <Card className="border-2 border-dashed border-[#00BFFF]/50 bg-[#121212] backdrop-blur-xl shadow-2xl shadow-[#00BFFF]/20">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#00BFFF] drop-shadow-lg drop-shadow-[#00BFFF]/50" />
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#00BFFF] via-[#A8FF60] to-[#B388FF] bg-clip-text text-transparent">
              Upload Your Study Materials
            </CardTitle>
            <CardDescription className="text-lg text-[#A8FF60]/80 font-semibold">
              Support for PDFs, Word docs, PowerPoint, images, and text files
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? "border-cyan-400 bg-cyan-500/10 scale-105 shadow-lg shadow-cyan-500/25"
                  : "border-purple-500/40 hover:border-cyan-400/70 hover:bg-gradient-to-br hover:from-purple-500/5 hover:to-cyan-500/5"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input {...getInputProps()} />
              <div className="text-center">
                <motion.div
                  animate={{
                    y: isDragActive ? -10 : 0,
                    scale: isDragActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className="w-16 h-16 mx-auto mb-4 text-cyan-400 drop-shadow-lg drop-shadow-cyan-400/50" />
                </motion.div>
                <p className="text-xl font-semibold mb-2 text-white">
                  {isDragActive
                    ? "Drop your files here!"
                    : "Drag & drop files or click to browse"}
                </p>
                <p className="text-sm text-cyan-300/70">
                  Supports: PDF, Word, PowerPoint, Images, Text, Markdown
                </p>
              </div>
            </motion.div>

            {/* Processing Files */}
            <AnimatePresence>
              {processingFiles.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <h3 className="font-semibold">Processing Files...</h3>
                  {Object.entries(processingProgress).map(
                    ([fileName, progress]) => (
                      <div key={fileName} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{fileName}</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Uploaded Files */}
            <AnimatePresence>
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="grid gap-3">
                    {uploadedFiles.map((file, index) => {
                      const IconComponent = fileTypeIcons[file.type];
                      return (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/50 to-purple-900/30 rounded-lg border border-purple-500/30 backdrop-blur-sm"
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className="w-6 h-6 text-cyan-400" />
                            <div>
                              <p className="font-medium text-white">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30"
                                >
                                  {file.type.toUpperCase()}
                                </Badge>
                                <span className="text-xs text-cyan-300/70">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Button */}
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center pt-4"
              >
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || processingFiles.size > 0}
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 border-0 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 text-white"
                >
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Zap className="w-5 h-5" />
                    Generate Study Aids
                  </motion.div>
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, UploadCloud, FileText, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as pdfjs from "pdfjs-dist";

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


interface FileUploaderProps {
  onGenerate: (text: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function FileUploader({ onGenerate, isLoading, error }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      await parsePdf(selectedFile);
    } else {
        alert("Please select a PDF file.");
    }
  };
  
  const parsePdf = async (file: File) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = e.target?.result;
        if (data) {
            try {
                const pdf = await pdfjs.getDocument({data: data as ArrayBuffer}).promise;
                let content = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    content += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                }
                onGenerate(content);
            } catch (error) {
                console.error("Failed to parse PDF: ", error);
                alert("Sorry, there was an error parsing your PDF file.");
            } finally {
                setIsParsing(false);
            }
        }
    };
    reader.readAsArrayBuffer(file);
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
      setFile(null);
      setFileName("");
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const totalLoading = isLoading || isParsing;

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-center">Upload Your Study Material</CardTitle>
          <CardDescription className="text-center">
            Select a PDF file from your computer to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/pdf"
            disabled={totalLoading}
          />
          
          {!file ? (
             <div 
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors"
                onClick={handleUploadClick}
             >
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click to upload a PDF</p>
             </div>
          ) : (
            <div className="flex items-center justify-between w-full h-24 px-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <span className="font-medium text-sm truncate">{fileName}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={totalLoading}>
                    <X className="w-5 h-5" />
                </Button>
            </div>
          )}

          <Button onClick={() => file && parsePdf(file)} disabled={!file || totalLoading} className="w-full mt-4">
            {isParsing && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing PDF...
              </>
            )}
            {isLoading && !isParsing && (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            )}
            {!totalLoading && (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Study Aids
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

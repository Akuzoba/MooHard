"use client";

import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function NotesView() {
  const { toast } = useToast();
  const {
    text,
    setText,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
  } = useSpeechRecognition();

  const handleCopy = () => {
    if(text) {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "Your notes have been copied.",
      });
    }
  };
  
  // Update textarea when text from hook changes
  useEffect(() => {
    // This effect synchronizes the hook's text with the component's state for the textarea
  }, [text]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Mic /> Speech-to-Text Notes
        </CardTitle>
        <CardDescription>
          Click the microphone to start or stop recording your notes. Your words will be transcribed in the text area below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-4">
        {!hasRecognitionSupport && (
          <p className="text-red-500">Your browser does not support speech recognition.</p>
        )}
        <div className="flex items-center gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={!hasRecognitionSupport}
            size="lg"
            variant={isListening ? 'destructive' : 'default'}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-5 w-5" /> Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" /> Start Listening
              </>
            )}
          </Button>
          <Button onClick={handleCopy} variant="outline" size="lg" disabled={!text}>
            <Copy className="mr-2 h-5 w-5" /> Copy
          </Button>
        </div>
        <Textarea
          placeholder={isListening ? "Listening..." : "Your transcribed notes will appear here..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-grow text-base"
        />
      </CardContent>
    </Card>
  );
}

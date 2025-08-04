"use client";

import { useState, useEffect, useRef } from "react";

// Add reference to our custom types
/// <reference path="../types/speech-recognition.d.ts" />

let recognition: SpeechRecognition | null = null;
if (
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
) {
  const SpeechRecognitionClass =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognitionClass();
  if (recognition) {
    recognition.continuous = true;
    recognition.lang = "en-US";
  }
}

export const useSpeechRecognition = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(recognition);

  useEffect(() => {
    const recog = recognitionRef.current;
    if (!recog) {
      return;
    }

    recog.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Append final transcript to existing text
      setText((prevText) => prevText + finalTranscript);
    };

    recog.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recog.onend = () => {
      if (isListening) {
        recog.start(); // Keep listening if it stops unexpectedly
      }
    };

    return () => {
      recog.stop();
    };
  }, [isListening]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setText(""); // Clear previous text on new start
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    text,
    setText,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport: !!recognitionRef.current,
  };
};

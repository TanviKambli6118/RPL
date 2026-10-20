"use client";

import { useState } from "react";
import { Mic, MicOff } from "lucide-react";

import { LANGUAGES as languages, type Language } from "@/lib/i18n";

type VoiceInputProps = {
  language: Language;
  onResult: (value: string) => void;
};

type SpeechResultEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function VoiceInput({
  language,
  onResult,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const startListening = () => {
    setErrorMessage("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        "Voice input is not supported. Please use Google Chrome or Microsoft Edge.",
      );
      return;
    }

    const recognition = new SpeechRecognition();

    const selectedLanguage = languages.find(
      (item) => item.code === language,
    );

    recognition.lang = selectedLanguage?.speechLang || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;

      onResult(spokenText);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        setErrorMessage(
          "Microphone permission was denied. Please allow microphone access.",
        );
      } else {
        setErrorMessage("Could not understand your voice. Please try again.");
      }
    };

    try {
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      setErrorMessage("Microphone could not be started. Please try again.");
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
          isListening
            ? "bg-red-100 text-red-700 hover:bg-red-200"
            : "bg-[#0f4c5c] text-white hover:bg-[#0b3a46]"
        }`}
      >
        {isListening ? <MicOff size={15} /> : <Mic size={15} />}

        {isListening ? "Stop" : "Speak"}
      </button>

      {isListening && (
        <span className="text-[10px] text-red-600">
          Listening in {language === "en" ? "English" : ""}
          {language === "hi" ? "Hindi" : ""}
          {language === "mr" ? "Marathi" : ""}...
        </span>
      )}

      {errorMessage && (
        <span className="max-w-56 text-right text-[10px] text-red-600">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
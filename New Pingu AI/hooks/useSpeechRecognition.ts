
import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for the Web Speech API to address TypeScript errors.
// These interfaces describe the shape of the non-standard API for TypeScript.

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

// This describes the constructor for SpeechRecognition
interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

// Augment the window object to include non-standard SpeechRecognition properties
interface IWindow extends Window {
  SpeechRecognition?: SpeechRecognitionStatic;
  webkitSpeechRecognition?: SpeechRecognitionStatic;
}

// Polyfill for cross-browser compatibility, casting window to our extended interface
const SpeechRecognition = (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export const useSpeechRecognition = (
  onStop?: (finalTranscript: string) => void,
  lang: string = 'en-US'
): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopTimeoutRef = useRef<number | null>(null);

  // Refs for callbacks and state to avoid stale closures
  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;
  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;
  const onStopRef = useRef(onStop);
  onStopRef.current = onStop;

  const stopListening = useCallback(() => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop(); // This will trigger 'onend' which handles state updates and callbacks.
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListeningRef.current) {
      setTranscript('');
      transcriptRef.current = '';
      isListeningRef.current = true;
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, []);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      let combinedTranscript = '';
      for (let i = 0; i < event.results.length; ++i) {
        combinedTranscript += event.results[i][0].transcript;
      }
      setTranscript(combinedTranscript);
      transcriptRef.current = combinedTranscript;
    };

    recognition.onspeechend = () => {
      if (isListeningRef.current) {
        stopTimeoutRef.current = window.setTimeout(stopListening, 4000);
      }
    };

    recognition.onend = () => {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      if (isListeningRef.current) {
        isListeningRef.current = false;
        setIsListening(false);

        const finalTranscript = transcriptRef.current.trim();
        if (onStopRef.current && finalTranscript) {
          onStopRef.current(finalTranscript);
        }
      }
    };

    return () => {
        if(recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.onresult = null;
            recognitionRef.current.onspeechend = null;
            recognitionRef.current.stop();
        }
        if(stopTimeoutRef.current) {
            clearTimeout(stopTimeoutRef.current);
        }
    };
  }, [lang, startListening, stopListening]);

  return {
    transcript,
    isListening,
    isSupported: !!SpeechRecognition,
    startListening,
    stopListening,
  };
};
import { useEffect, useRef, useState } from 'react';

export type DentalIntent =
  | { type: 'TOOTH'; tooth: number }
  | { type: 'SURFACE'; surface: 'MESIAL' | 'DISTAL' }
  | { type: 'FINDING'; finding: 'CARIE' | 'RESTAURACAO' };

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const parseIntent = (transcript: string): DentalIntent | null => {
  const text = normalize(transcript);

  const toothMatch = text.match(/dente\s+(\d{1,2})/);
  if (toothMatch) {
    return { type: 'TOOTH', tooth: Number(toothMatch[1]) };
  }

  if (text.includes('mesial')) {
    return { type: 'SURFACE', surface: 'MESIAL' };
  }

  if (text.includes('distal')) {
    return { type: 'SURFACE', surface: 'DISTAL' };
  }

  if (text.includes('carie')) {
    return { type: 'FINDING', finding: 'CARIE' };
  }

  if (text.includes('restauracao')) {
    return { type: 'FINDING', finding: 'RESTAURACAO' };
  }

  return null;
};

export const useDentalVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [intent, setIntent] = useState<DentalIntent | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const result = event.results?.[event.results.length - 1]?.[0]?.transcript || '';
      const transcript = String(result).trim();
      if (!transcript) return;

      setLastCommand(transcript);
      setIntent(parseIntent(transcript));
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop?.();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop?.();
    } else {
      try {
        recognitionRef.current?.start?.();
      } catch (e) {
        console.error("Erro ao iniciar reconhecimento:", e);
      }
    }
  };

  return { isListening, lastCommand, intent, toggleListening };
};

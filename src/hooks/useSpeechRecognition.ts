import { useState, useRef, useEffect } from "react";

interface SpeechRecognitionOptions {
  interimResults?: boolean;
  lang?: string;
  continuous?: boolean;
}

const useSpeechToText = (options: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Web Speech API is not supported");
      return;
    }

    let recognition = new window.webkitSpeechRecognition();
          recognitionRef.current = recognition;
          recognition.interimResults = options.interimResults || false;
          recognition.lang = options.lang || "en-US";
          recognition.continuous = options.continuous || false;

    if ("webkitSpeechGrammarList" in window) {
      let grammar = "#JSGF V1.0; grammar punctuation; public <punc> = . | , | ! | ; | : ;";
      let speechRecognitionList = new window.webkitSpeechGrammarList();
          speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(prevTranscript => recognition.interimResults ? prevTranscript + text : text);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [options]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
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
    isListening,
    transcript,
    startListening,
    stopListening,
  };
};

export default useSpeechToText;


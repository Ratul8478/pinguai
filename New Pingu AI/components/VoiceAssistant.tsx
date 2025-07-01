
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { generateText } from '../services/geminiService';
import { MicIcon, SpeakingIndicator, SettingsIcon, PenguinIcon } from './Icons';
import { ActiveView } from '../types';

// Type Definitions
type Status = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
type Language = { name: string; code: string };
type ConversationMessage = { sender: 'user' | 'ai'; text: string };
type Settings = {
  langCode: string;
  voiceURI: string | null;
  rate: number;
  volume: number;
  pitch: number;
};
interface VoiceAssistantProps {
  autoStartTrigger?: number;
  setActiveView: (view: ActiveView) => void;
}

// Constants
const supportedLanguages: Language[] = [
    { name: 'English', code: 'en-US' },
    { name: 'हिन्दी', code: 'hi-IN' },
    { name: 'Hinglish', code: 'en-IN' },
    { name: 'Español', code: 'es-ES' },
    { name: 'বাংলা', code: 'bn-IN' },
    { name: 'मराठी', code: 'mr-IN' },
    { name: 'తెలుగు', code: 'te-IN' },
    { name: '日本語', code: 'ja-JP' },
];

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ autoStartTrigger = 0, setActiveView }) => {
  // State Management
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('pingu-voice-settings');
      return savedSettings ? JSON.parse(savedSettings) : { langCode: 'en-US', voiceURI: null, rate: 1, volume: 1, pitch: 1 };
    } catch {
      return { langCode: 'en-US', voiceURI: null, rate: 1, volume: 1, pitch: 1 };
    }
  });

  const conversationEndRef = useRef<HTMLDivElement>(null);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);

  // --- Speech Synthesis Queue Logic ---
  const processQueue = useCallback(() => {
    if (speechSynthesis.speaking || utteranceQueueRef.current.length === 0) {
      return;
    }
    const utterance = utteranceQueueRef.current.shift();
    if (utterance) {
      utterance.onend = () => {
        processQueue(); // Process next item when current one finishes
      };
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        // The 'interrupted' or 'canceled' error is expected when the user clicks the mic to speak.
        // We can safely ignore it and not show an error state to the user.
        if (event.error === 'interrupted' || event.error === 'canceled') {
          console.warn(`Speech synthesis gracefully stopped: ${event.error}`);
          // We don't set status to 'error' because this is an expected user action.
          // The queue is usually cleared by the action that triggered the interruption.
          return;
        }
        
        // For all other errors, we treat them as actual problems.
        console.error('Speech synthesis error:', event.error);
        setError(`Speech error: ${event.error}`);
        setStatus('error');
        utteranceQueueRef.current = []; // Clear queue on error
      };
      setStatus('speaking');
      speechSynthesis.speak(utterance);
    } else {
      // Queue is empty, transition to idle if not in another active state
      if (status === 'speaking') {
          setStatus('idle');
      }
    }
  }, [status]);

  const speak = useCallback((text: string, currentSettings: Settings, isSystemMessage: boolean = false) => {
    if (!window.speechSynthesis || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.voiceURI === currentSettings.voiceURI);
    
    utterance.voice = selectedVoice || null;
    utterance.lang = selectedVoice?.lang || currentSettings.langCode;
    utterance.rate = currentSettings.rate;
    utterance.volume = currentSettings.volume;
    utterance.pitch = currentSettings.pitch; // Apply pitch

    if (!isSystemMessage) {
        // Add AI responses to conversation history
        setConversation(prev => [...prev, { sender: 'ai', text }]);
    }
    
    utteranceQueueRef.current.push(utterance);
    processQueue();
  }, [voices, processQueue]);
  
  // Load voices and greet user
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        if (!settings.voiceURI) {
            const defaultVoice = availableVoices.find(v => v.lang === settings.langCode && v.default) || availableVoices.find(v => v.lang === settings.langCode);
            if (defaultVoice) {
                updateSettings({ voiceURI: defaultVoice.voiceURI });
            }
        }
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    if (conversation.length === 0) {
        speak("Welcome! I am PinGu. To get started, click the microphone and speak, or say 'help' to learn about my commands.", settings, true);
    }
    
    // Cleanup on unmount
    return () => {
        utteranceQueueRef.current = [];
        window.speechSynthesis.cancel();
    }
  }, []); // Runs once on mount

  // Persist settings
  useEffect(() => {
    localStorage.setItem('pingu-voice-settings', JSON.stringify(settings));
  }, [settings]);
  
  // Command processing logic
  const processCommand = async (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Navigation Commands
    const navCommands = [
        { keyword: 'go to chat', view: ActiveView.Chat, name: "Chatbot" },
        { keyword: 'open image generator', view: ActiveView.ImageGen, name: "Image Generator" },
        { keyword: 'open code helper', view: ActiveView.CodeHelper, name: "Code Helper" },
    ];
    for (const cmd of navCommands) {
        if (lowerText.includes(cmd.keyword)) {
            speak(`Navigating to the ${cmd.name}.`, settings, true);
            setActiveView(cmd.view);
            return;
        }
    }

    // Settings Commands
    if (lowerText.startsWith('change voice to')) {
        const voiceName = text.substring('change voice to'.length).trim().toLowerCase();
        const foundVoice = voices.find(v => v.name.toLowerCase().includes(voiceName));
        if (foundVoice) {
            updateSettings({ voiceURI: foundVoice.voiceURI });
            speak(`Voice changed to ${foundVoice.name}.`, { ...settings, voiceURI: foundVoice.voiceURI }, true);
        } else {
            speak(`Sorry, I could not find a voice named ${voiceName}.`, settings, true);
        }
        return;
    }
     const handleRateChange = (direction: 'faster' | 'slower') => {
        const newRate = direction === 'faster' ? Math.min(settings.rate + 0.25, 2) : Math.max(settings.rate - 0.25, 0.5);
        updateSettings({ rate: newRate });
        speak(`Speaking speed set to ${newRate.toFixed(2)}.`, {...settings, rate: newRate}, true);
     };
     const handlePitchChange = (direction: 'higher' | 'lower') => {
        const newPitch = direction === 'higher' ? Math.min(settings.pitch + 0.2, 2) : Math.max(settings.pitch - 0.2, 0);
        updateSettings({ pitch: newPitch });
        speak(`Pitch set to ${newPitch.toFixed(1)}.`, {...settings, pitch: newPitch}, true);
     };
    if (lowerText.includes('speak faster')) return handleRateChange('faster');
    if (lowerText.includes('speak slower')) return handleRateChange('slower');
    if (lowerText.includes('change pitch higher')) return handlePitchChange('higher');
    if (lowerText.includes('change pitch lower')) return handlePitchChange('lower');


    // Help Command
    if (lowerText.includes('what can you do') || lowerText.includes('help')) {
        const helpText = `I can answer your questions, or you can give me commands like: "go to the image generator", "speak faster", "speak slower", "change pitch higher", or "change voice to [a name from the settings]". What would you like to do?`;
        speak(helpText, settings);
        return;
    }
    
    // Default to generative text
    try {
        const langName = supportedLanguages.find(l => l.code === settings.langCode)?.name || 'English';
        const responseText = await generateText(text, langName);
        speak(responseText, settings);
    } catch (apiError) {
        console.error("Gemini API error:", apiError);
        speak("I'm having trouble connecting to my brain right now. Please check your network connection and try again.", settings, true);
        setStatus('error');
        setError("Network or API error.");
    }
  };

  const onRecognitionStop = (finalTranscript: string) => {
    if (!finalTranscript) {
      setStatus('idle');
      return;
    }
    setConversation(prev => [...prev, { sender: 'user', text: finalTranscript }]);
    setStatus('processing');
    processCommand(finalTranscript);
  };

  const { transcript, isListening, isSupported, startListening, stopListening } = useSpeechRecognition(onRecognitionStop, settings.langCode);

  useEffect(() => {
    if (isListening) {
      setStatus('listening');
    } else if (status === 'listening') {
      // Only set to idle if coming from listening state and not already processing/speaking
      setStatus('idle');
    }
  }, [isListening, status]);

  // Utility Functions
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };
  
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      // Clear any pending speech before listening
      utteranceQueueRef.current = [];
      window.speechSynthesis.cancel();
      setStatus('idle'); // Explicitly set to idle before listening
      startListening();
    }
  };
  
  // Auto-start listening when triggered from header
  useEffect(() => {
    if (autoStartTrigger > 0) {
      const timer = setTimeout(() => {
        if (!isListening && status !== 'speaking') {
          handleMicClick();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoStartTrigger]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  if (!isSupported) {
    return <div className="text-center text-red-400 p-4">Speech recognition is not supported in your browser. Please try Chrome or Edge.</div>;
  }
  
  const statusText = {
      'idle': "Idle. Click the mic to start.",
      'listening': 'Listening...',
      'processing': 'Thinking...',
      'speaking': 'Speaking...',
      'error': `Error: ${error}`
  }[status];

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative">
      <div className="absolute top-4 right-4 z-20">
        <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
            <SettingsIcon className="w-6 h-6" />
        </button>
      </div>

      {isSettingsOpen && (
        <div className="absolute inset-0 bg-gray-800 z-10 p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Voice Settings</h2>
            <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <select value={settings.langCode} onChange={e => updateSettings({ langCode: e.target.value, voiceURI: null })} className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {supportedLanguages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Voice</label>
                    <select value={settings.voiceURI || ''} onChange={e => updateSettings({ voiceURI: e.target.value })} className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={voices.filter(v => v.lang.startsWith(settings.langCode.split('-')[0])).length === 0}>
                        {voices.filter(v => v.lang.startsWith(settings.langCode.split('-')[0])).map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Speech Rate: {settings.rate.toFixed(2)}x</label>
                    <input type="range" min="0.5" max="2" step="0.1" value={settings.rate} onChange={e => updateSettings({ rate: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pitch: {settings.pitch.toFixed(2)}</label>
                    <input type="range" min="0" max="2" step="0.1" value={settings.pitch} onChange={e => updateSettings({ pitch: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Volume: {Math.round(settings.volume * 100)}%</label>
                    <input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={e => updateSettings({ volume: parseFloat(e.target.value) })} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
                <div className="pt-4 text-center">
                    <p className="text-xs text-gray-500">Privacy Notice: The microphone is only active when enabled by you. Your conversations are processed securely and are not stored long-term.</p>
                </div>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-500 transition-colors">
                Close Settings
            </button>
        </div>
      )}

      <div className="flex-grow p-6 overflow-y-auto flex flex-col">
          {conversation.map((msg, index) => (
             <div key={index} className={`flex items-end gap-3 my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
               {msg.sender === 'ai' && <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-600 flex items-center justify-center"><PenguinIcon className="w-5 h-5 text-white" /></div>}
               <div className={`px-4 py-2 rounded-2xl max-w-lg text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                 <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
               </div>
            </div>
          ))}
           <div className="text-gray-400 italic min-h-[1.5rem] text-right px-4">{isListening && transcript}</div>
          <div ref={conversationEndRef} />
      </div>

      <div className="p-6 border-t border-gray-700 flex flex-col items-center justify-center">
            <button
              onClick={handleMicClick}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50
                  ${isListening ? 'bg-red-600 hover:bg-red-500 scale-110' : 'bg-indigo-600 hover:bg-indigo-500'}`}
            >
              <MicIcon className="w-10 h-10 text-white z-10" />
              {isListening && (
                  <div className="absolute w-full h-full">
                      <div className="siri-wave siri-wave1"></div>
                      <div className="siri-wave siri-wave2"></div>
                      <div className="siri-wave siri-wave3"></div>
                      <div className="siri-wave siri-wave4"></div>
                  </div>
              )}
            </button>
            <div className="mt-4 text-center min-h-[40px]">
                {status === 'speaking' ? <SpeakingIndicator /> : <p className={`text-gray-400 transition-opacity duration-300 ${status==='error' && 'text-red-400'}`}>{statusText}</p>}
            </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
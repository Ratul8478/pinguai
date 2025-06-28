
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import ImageGenerator from './components/ImageGenerator';
import VoiceAssistant from './components/VoiceAssistant';
import VideoGenerator from './components/VideoGenerator';
import Stream from './components/Stream';
import CodeHelper from './components/CodeHelper';
import LandingPage from './components/LandingPage';
import { ActiveView } from './types';
import { PenguinIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.Landing);
  const [voiceAssistantTrigger, setVoiceAssistantTrigger] = useState(0);

  // Register Service Worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  const handleSetActiveView = (view: ActiveView) => {
    if (view === ActiveView.VoiceAssistant && activeView !== ActiveView.VoiceAssistant) {
      setVoiceAssistantTrigger(prev => prev + 1);
    }
    setActiveView(view);
  };

  const handleEnterApp = () => {
    setActiveView(ActiveView.Chat);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case ActiveView.Chat:
        return <Chatbot />;
      case ActiveView.Stream:
        return <Stream />;
      case ActiveView.ImageGen:
        return <ImageGenerator />;
      case ActiveView.VoiceAssistant:
        return <VoiceAssistant autoStartTrigger={voiceAssistantTrigger} setActiveView={handleSetActiveView} />;
      case ActiveView.VideoGen:
        return <VideoGenerator />;
      case ActiveView.CodeHelper:
        return <CodeHelper />;
      default:
        // This case will be hit for Landing, so we return null and let the outer conditional handle it.
        return null;
    }
  };
  
  if (activeView === ActiveView.Landing) {
    return <LandingPage onEnter={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <Header activeView={activeView} setActiveView={handleSetActiveView} />
      <main className="flex-grow flex flex-col p-4 md:p-6">
        {renderActiveView()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2">
          <PenguinIcon className="w-5 h-5" />
          <span>PinGu AI</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

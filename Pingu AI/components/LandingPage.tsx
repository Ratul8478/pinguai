
import React from 'react';
import { PenguinIcon } from './Icons';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-8">
            <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <PenguinIcon className="w-full h-full animate-float" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
          PinGu <span className="text-indigo-400">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Your friendly AI-powered companion for development, creativity, and everything in between.
        </p>
        <button
          onClick={onEnter}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-indigo-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
        >
          Enter App
        </button>
      </div>
    </div>
  );
};

export default LandingPage;

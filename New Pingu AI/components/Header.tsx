
import React from 'react';
import { ActiveView } from '../types';
import { PenguinIcon, ChatIcon, ImageIcon, MicIcon, VideoIcon, RobotIcon, ScreenMonitorIcon } from './Icons';

// Inlined to fix module resolution error
const SignOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);


interface HeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out
      ${isActive
        ? 'bg-indigo-600 text-white shadow-md'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    {/* Tooltip */}
    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
      {label}
    </div>
  </button>
);

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onLogout }) => {
  const navItems = [
    { id: ActiveView.Chat, label: 'Chat', icon: <ChatIcon className="w-5 h-5" /> },
    { id: ActiveView.Stream, label: 'Screen Monitor', icon: <ScreenMonitorIcon className="w-5 h-5" /> },
    { id: ActiveView.ImageGen, label: 'Image Gen', icon: <ImageIcon className="w-5 h-5" /> },
    { id: ActiveView.VideoGen, label: 'Video Gen', icon: <VideoIcon className="w-5 h-5" /> },
    { id: ActiveView.VoiceAssistant, label: 'Voice AI', icon: <MicIcon className="w-5 h-5" /> },
    { id: ActiveView.CodeHelper, label: 'Code Helper', icon: <RobotIcon className="w-5 h-5" /> },
  ];

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-10">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-white flex items-center gap-2">
              <PenguinIcon className="h-8 w-8 text-indigo-400" />
              <span className="font-bold text-xl">PinGu AI</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-baseline space-x-1 sm:space-x-2">
              {navItems.map((item) => (
                <NavButton
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={activeView === item.id}
                  onClick={() => setActiveView(item.id)}
                />
              ))}
            </div>
             <div className="border-l border-gray-700 ml-2 sm:ml-4 pl-2 sm:pl-4">
                <NavButton
                    label="Logout"
                    icon={<SignOutIcon className="w-5 h-5" />}
                    isActive={false}
                    onClick={onLogout}
                />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
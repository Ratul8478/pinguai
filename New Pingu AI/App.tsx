import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Chatbot from './components/Chatbot';
import ImageGenerator from './components/ImageGenerator';
import VoiceAssistant from './components/VoiceAssistant';
import VideoGenerator from './components/VideoGenerator';
import Stream from './components/Stream';
import CodeHelper from './components/CodeHelper';
import AuthPage from './components/LandingPage';
import { ActiveView, User, UserRecord } from './types';
import { PenguinIcon, LoadingSpinner } from './components/Icons';

type AuthStatus = 'loading' | 'auth' | 'loggedIn';

const getUsers = (): { [email: string]: UserRecord } => {
  try {
    return JSON.parse(localStorage.getItem('pingu_users') || '{}');
  } catch {
    return {};
  }
};

const saveUsers = (users: { [email: string]: UserRecord }) => {
  localStorage.setItem('pingu_users', JSON.stringify(users));
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.Chat);
  const [voiceAssistantTrigger, setVoiceAssistantTrigger] = useState(0);

  useEffect(() => {
    try {
      const sessionUserJson = sessionStorage.getItem('pingu_session');
      if (sessionUserJson) {
        const sessionUser = JSON.parse(sessionUserJson);
        setUser(sessionUser);
        setAuthStatus('loggedIn');
      } else {
        setAuthStatus('auth');
      }
    } catch (error) {
        console.error("Failed to parse session user:", error);
        sessionStorage.removeItem('pingu_session');
        setAuthStatus('auth');
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered: ', registration))
          .catch(registrationError => console.log('SW registration failed: ', registrationError));
      });
    }
  }, []);

  const handleRegister = async (credentials: any) => {
    setAuthError('');
    setIsAuthLoading(true);
    try {
        await new Promise(res => setTimeout(res, 1000)); // Simulate network
        const users = getUsers();
        if (users[credentials.email]) {
          setAuthError('An account with this email already exists.');
          return;
        }
        
        const newUser: UserRecord = { 
            id: Date.now().toString(), 
            username: credentials.username, 
            email: credentials.email, 
            password: credentials.password,
        };

        users[credentials.email] = newUser;
        saveUsers(users);
        
        // Directly log the user in
        const userToStore: User = { id: newUser.id, username: newUser.username, email: newUser.email };
        sessionStorage.setItem('pingu_session', JSON.stringify(userToStore));
        setUser(userToStore);
        setAuthStatus('loggedIn');

    } finally {
        setIsAuthLoading(false);
    }
  };

  const handleLogin = async (credentials: any) => {
    setAuthError('');
    setIsAuthLoading(true);
    try {
        await new Promise(res => setTimeout(res, 1000)); // Simulate network
        const users = getUsers();
        const existingUser = users[credentials.email];
        
        if (!existingUser || existingUser.password !== credentials.password) {
          setAuthError('Invalid email or password.');
          return;
        }

        const userToStore: User = { id: existingUser.id, username: existingUser.username, email: existingUser.email };
        sessionStorage.setItem('pingu_session', JSON.stringify(userToStore));
        setUser(userToStore);
        setAuthStatus('loggedIn');
    } finally {
        setIsAuthLoading(false);
    }
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('pingu_session');
    setUser(null);
    setActiveView(ActiveView.Chat);
    setAuthStatus('auth');
  };

  const handleSetActiveView = (view: ActiveView) => {
    if (view === ActiveView.VoiceAssistant && activeView !== ActiveView.VoiceAssistant) {
      setVoiceAssistantTrigger(prev => prev + 1);
    }
    setActiveView(view);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case ActiveView.Chat: return <Chatbot />;
      case ActiveView.Stream: return <Stream />;
      case ActiveView.ImageGen: return <ImageGenerator />;
      case ActiveView.VoiceAssistant: return <VoiceAssistant autoStartTrigger={voiceAssistantTrigger} setActiveView={handleSetActiveView} />;
      case ActiveView.VideoGen: return <VideoGenerator />;
      case ActiveView.CodeHelper: return <CodeHelper />;
      default: return <Chatbot />;
    }
  };
  
  const clearAuthError = () => {
      setAuthError('');
  }
  
  const renderContent = () => {
    switch(authStatus){
        case 'loading':
             return (
                <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
                    <LoadingSpinner className="w-12 h-12 text-indigo-400" />
                </div>
            );
        case 'auth':
            return <AuthPage onRegister={handleRegister} onLogin={handleLogin} error={authError} clearError={clearAuthError} isLoading={isAuthLoading} />;
        case 'loggedIn':
            return (
                <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
                  <Header activeView={activeView} setActiveView={handleSetActiveView} onLogout={handleLogout} />
                  <main className="flex-grow flex flex-col p-4 md:p-6">
                    {renderActiveView()}
                  </main>
                  <footer className="text-center p-4 text-gray-500 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <PenguinIcon className="w-5 h-5" />
                      <span>PinGu AI - Logged in as {user?.username}</span>
                    </div>
                  </footer>
                </div>
            );
        default:
             return <AuthPage onRegister={handleRegister} onLogin={handleLogin} error={authError} clearError={clearAuthError} isLoading={isAuthLoading} />;
    }
  }

  return renderContent();
};

export default App;
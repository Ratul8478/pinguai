import React, { useState, useEffect } from 'react';
import { PenguinIcon, UserIcon, MailIcon, LockClosedIcon, LoadingSpinner } from './Icons';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
    onRegister: (credentials: any) => void;
    onLogin: (credentials: any) => void;
    error: string;
    clearError: () => void;
    isLoading: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({ onRegister, onLogin, error, clearError, isLoading }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        clearError();
    }, [mode, clearError]);

    const handleSwitchMode = () => {
        setMode(prev => prev === 'login' ? 'register' : 'login');
        setUsername('');
        setEmail('');
        setPassword('');
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        if (mode === 'register') {
            onRegister({ username, email, password });
        } else {
            onLogin({ email, password });
        }
    };
    
    const isSubmitDisabled = isLoading || !email || !password || (mode === 'register' && !username);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <PenguinIcon className="w-24 h-24 mx-auto mb-4" />
                    <h1 className="text-4xl font-bold text-white">
                        Welcome to PinGu <span className="text-indigo-400">AI</span>
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {mode === 'login' ? 'Sign in to continue' : 'Create an account to get started'}
                    </p>
                </div>

                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {mode === 'register' && (
                            <div className="relative">
                                <UserIcon className="w-5 h-5 text-gray-400 absolute top-3.5 left-4" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full bg-gray-700 text-white p-3 pl-12 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                        <div className="relative">
                            <MailIcon className="w-5 h-5 text-gray-400 absolute top-3.5 left-4" />
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-gray-700 text-white p-3 pl-12 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="relative">
                            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-3.5 left-4" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-gray-700 text-white p-3 pl-12 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="w-full flex justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-indigo-500/50 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <LoadingSpinner className="w-6 h-6"/> : (mode === 'login' ? 'Login' : 'Create Account')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleSwitchMode}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                            {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
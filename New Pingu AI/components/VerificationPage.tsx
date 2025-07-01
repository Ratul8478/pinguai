import React, { useState, useEffect } from 'react';
import { CheckBadgeIcon, LoadingSpinner } from './Icons';

interface VerificationPageProps {
    email: string;
    onVerify: (code: string) => void;
    onResend: () => void;
    error: string;
    clearError: () => void;
    isLoading: boolean;
    infoMessage: string;
}

const VerificationPage: React.FC<VerificationPageProps> = ({ email, onVerify, onResend, error, clearError, isLoading, infoMessage }) => {
    const [code, setCode] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        let timer: number;
        if (resendCooldown > 0) {
            timer = window.setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);
    
    useEffect(() => {
        // Clear previous error when the page loads
        clearError();
    }, [clearError]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || code.length !== 6 || isLoading) {
            return;
        }
        clearError();
        onVerify(code);
    };

    const handleResendClick = () => {
        if(resendCooldown > 0 || isLoading) return;
        onResend();
        setResendCooldown(30); // 30 second cooldown
    }

    const isSubmitDisabled = isLoading || code.length !== 6;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <CheckBadgeIcon className="w-24 h-24 mx-auto mb-4 text-indigo-400" />
                    <h1 className="text-4xl font-bold text-white">Verify Your Account</h1>
                    <p className="text-gray-400 mt-2">
                        A 6-digit verification code has been "sent" to <br/>
                        <span className="font-semibold text-indigo-300">{email}</span>.
                    </p>
                </div>

                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
                    {infoMessage && (
                      <div className="bg-blue-900/50 border border-blue-500 text-blue-200 text-sm rounded-md p-3 mb-6 text-center">
                        <p>{infoMessage}</p>
                        <p className="text-xs text-blue-400 mt-1">(This is a simulation. In a real app, this code would be in your email inbox.)</p>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div className="relative">
                            <input
                                type="text"
                                placeholder="######"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                required
                                className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-2xl tracking-[.5em]"
                                maxLength={6}
                            />
                        </div>
                        
                        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="w-full flex justify-center bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-indigo-500/50 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isLoading ? <LoadingSpinner className="w-6 h-6"/> : 'Verify Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={handleResendClick}
                            disabled={resendCooldown > 0 || isLoading}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                           {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive a code? Resend"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
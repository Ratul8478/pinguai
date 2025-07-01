
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScreenMonitorIcon, LoadingSpinner } from './Icons';
import { analyzeScreenFrame } from '../services/geminiService';
import { ScreenSuggestion } from '../types';

const FRAME_ANALYSIS_INTERVAL = 7000; // 7 seconds

// Helper to detect mobile devices
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const Stream: React.FC = () => {
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [suggestions, setSuggestions] = useState<ScreenSuggestion[]>([]);
    const [error, setError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<number | null>(null);
    
    useEffect(() => {
        setIsMobile(isMobileDevice());
    }, []);

    const stopMonitoring = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsMonitoring(false);
        setIsProcessing(false);
    }, []);

    const captureAndAnalyzeFrame = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        setIsProcessing(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        if (!context) {
            console.error("Could not get canvas context");
            setIsProcessing(false);
            return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
        const suggestionText = await analyzeScreenFrame(base64Data);

        if (suggestionText) {
            const newSuggestion: ScreenSuggestion = {
                id: Date.now().toString(),
                suggestion: suggestionText,
                timestamp: new Date().toLocaleTimeString(),
            };
            setSuggestions(prev => [newSuggestion, ...prev]);
        }
        setIsProcessing(false);
    }, [isProcessing]);

    const startMonitoring = async () => {
        if (isMonitoring) return;
        setError('');
        setSuggestions([]);

        try {
            let stream: MediaStream;
            if (isMobile) {
                // Mobile: use the back camera
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
            } else {
                // Desktop: use screen capture
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: { mediaSource: "screen" } as any,
                });
            }

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().catch(console.error);
                    setIsMonitoring(true);
                    // Initial analysis after a short delay
                    setTimeout(captureAndAnalyzeFrame, 1000);
                    // Start analysis loop
                    intervalRef.current = window.setInterval(captureAndAnalyzeFrame, FRAME_ANALYSIS_INTERVAL);
                };
            }
            
            stream.getVideoTracks()[0].onended = () => {
                stopMonitoring();
            };

        } catch (err: any) {
            console.error("Error starting media capture:", err);
            const featureName = isMobile ? 'camera access' : 'screen sharing';
            if(err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                 setError(`Permission Denied. You need to allow ${featureName} in the browser prompt to use this feature. Please click 'Start Monitoring' again and select 'Allow'.`);
            } else {
                 setError(`An error occurred while trying to start ${featureName}.`);
            }
            setIsMonitoring(false);
        }
    };
    
    useEffect(() => {
        return () => {
            stopMonitoring();
        };
    }, [stopMonitoring]);

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ScreenMonitorIcon className="w-6 h-6 text-indigo-400"/>
                    Live Visual Assistant
                </h2>
                <p className="text-sm text-gray-400">The AI will analyze your screen (desktop) or camera feed (mobile) for errors and suggest improvements.</p>
            </div>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 overflow-hidden">
                <div className="lg:col-span-3 bg-gray-900 rounded-md border border-gray-700 flex items-center justify-center overflow-hidden relative">
                    <video ref={videoRef} className={`w-full h-full object-contain transition-opacity duration-300 ${isMonitoring ? 'opacity-100' : 'opacity-0'}`} playsInline muted />
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    {!isMonitoring && (
                        <div className="text-center p-4">
                            <ScreenMonitorIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h3 className="text-lg font-semibold text-white mb-2">Ready to Assist</h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">Click "Start Monitoring" to share your {isMobile ? "camera" : "screen"} and get real-time AI suggestions.</p>
                            <button onClick={startMonitoring} className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-md hover:bg-indigo-500 transition-colors">
                                Start Monitoring
                            </button>
                             {error && <p className="text-red-400 mt-4 text-sm max-w-md mx-auto">{error}</p>}
                        </div>
                    )}
                    {isMonitoring && (
                         <div className="absolute top-2 right-2">
                             <button onClick={stopMonitoring} className="bg-red-600 text-white font-bold py-1 px-3 rounded-md hover:bg-red-500 transition-colors text-sm">
                                 Stop Monitoring
                             </button>
                         </div>
                    )}
                </div>
                <div className="bg-gray-900 rounded-md border border-gray-700 flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-gray-700 flex-shrink-0 flex justify-between items-center">
                         <h3 className="text-lg font-semibold text-white">Suggestions</h3>
                         {isProcessing && <div className="flex items-center gap-2 text-sm text-indigo-400"><LoadingSpinner className="w-4 h-4" /><span>Analyzing...</span></div>}
                    </div>
                    <div className="overflow-y-auto p-3 flex-grow">
                       {suggestions.length === 0 ? (
                           <div className="flex items-center justify-center h-full text-gray-500 text-center text-sm p-4">
                               <p>{isMonitoring ? 'AI is watching... Suggestions will appear here.' : 'Start monitoring to see suggestions.'}</p>
                           </div>
                       ) : (
                           <div className="space-y-3">
                               {suggestions.map(s => (
                                   <div key={s.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 animate-fade-in">
                                       <p className="text-gray-300 text-sm">{s.suggestion}</p>
                                       <p className="text-xs text-gray-500 text-right mt-1">{s.timestamp}</p>
                                   </div>
                               ))}
                           </div>
                       )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stream;
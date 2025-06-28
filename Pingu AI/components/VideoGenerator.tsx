
import React, { useState, useEffect, useMemo } from 'react';
import { generatePreciseVideo } from '../services/geminiService';
import { VideoQuality, PreciseVideoResult } from '../types';
import { VideoIcon, LoadingSpinner, ClockIcon, QualityIcon, SparklesIcon, DocumentTextIcon, CheckCircleIcon, DownloadIcon } from './Icons';

// Constants
const MIN_DURATION = 10;
const MAX_DURATION = 2.5 * 60 * 60; // 2.5 hours in seconds
const PROMPT_MIN_LENGTH = 10;
const PROMPT_MAX_LENGTH = 500;

const VideoGenerator: React.FC = () => {
    // Component State
    const [prompt, setPrompt] = useState<string>('');
    const [duration, setDuration] = useState<number>(30);
    const [quality, setQuality] = useState<VideoQuality>(VideoQuality.FullHD);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [result, setResult] = useState<PreciseVideoResult | null>(null);
    const [promptError, setPromptError] = useState<string>('');

    // --- User Input Handling ---
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };

    // --- Prompt Validation ---
    useEffect(() => {
        if (!prompt) {
            setPromptError('');
            return;
        }
        if (prompt.length < PROMPT_MIN_LENGTH) {
            setPromptError(`Prompt is too short. Minimum ${PROMPT_MIN_LENGTH} characters.`);
        } else if (prompt.length > PROMPT_MAX_LENGTH) {
            setPromptError(`Prompt is too long. Maximum ${PROMPT_MAX_LENGTH} characters.`);
        } else {
            setPromptError('');
        }
    }, [prompt]);

    // --- Video Generation ---
    const handleGenerate = async () => {
        if (promptError || !prompt || isLoading) return;

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const videoResult = await generatePreciseVideo({ prompt, duration, quality });
            if (videoResult && videoResult.videoUrl) {
                setResult(videoResult);
            } else {
                setError('Failed to generate video. The AI returned an unexpected result.');
            }
        } catch (e) {
            console.error(e);
            setError('An unexpected error occurred while generating the video.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- UI Helpers ---
    // Logarithmic slider for better control over smaller values
    const sliderValue = useMemo(() => {
        const min = Math.log(MIN_DURATION);
        const max = Math.log(MAX_DURATION);
        const scale = (max - min) / 100;
        return (Math.log(duration) - min) / scale;
    }, [duration]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const min = Math.log(MIN_DURATION);
        const max = Math.log(MAX_DURATION);
        const scale = (max - min) / 100;
        const value = Math.exp(min + scale * parseFloat(e.target.value));
        setDuration(Math.round(value));
    };

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const isGenerateDisabled = isLoading || !!promptError || !prompt;

    const renderResult = () => (
        <div className="flex flex-col h-full gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0">
                <div className="w-full h-full bg-black rounded-lg flex items-center justify-center overflow-hidden">
                    <video key={result!.videoUrl} controls autoPlay loop className="max-w-full max-h-full">
                        <source src={result!.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-y-auto space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-indigo-400 flex items-center gap-2 mb-2">
                            <SparklesIcon className="w-5 h-5" /> AI Analysis
                        </h3>
                        <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-wrap">{result!.analysis}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2 mb-2">
                            <DocumentTextIcon className="w-5 h-5" /> Generated Voice-over Script
                        </h3>
                        <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded-md whitespace-pre-wrap">{result!.voiceOverScript}</p>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0">
                <a
                    href={result!.rawVideoUrl}
                    download
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-md hover:bg-green-500 transition-colors"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Download Video
                </a>
            </div>
        </div>
    );

    const renderInitialState = () => (
        <div className="flex items-center justify-center h-full text-center text-gray-500">
            <div>
                <VideoIcon className="w-24 h-24 mx-auto mb-4" />
                <p>Describe your video, set the duration, and let the AI bring it to life.</p>
            </div>
        </div>
    );

    const renderLoadingState = () => (
        <div className="flex items-center justify-center h-full text-center text-gray-400">
            <div>
                <LoadingSpinner className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                <p>Generating your video... This may take a moment.</p>
                <p className="text-sm text-gray-500">The AI is selecting scenes, timing the content, and generating the script.</p>
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col h-full gap-4">
            {/* Controls Section */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-4 flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Prompt */}
                    <div className="lg:col-span-2">
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">Creative Prompt</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={handlePromptChange}
                            placeholder="e.g., A cinematic documentary about ocean life, calm and majestic"
                            className="w-full h-24 bg-gray-700 text-white placeholder-gray-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                        />
                        {promptError ? (
                            <p className="text-red-400 text-xs mt-1">{promptError}</p>
                        ) : (
                           prompt.length > 0 && <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/>Prompt looks good!</p>
                        )}
                    </div>
                    {/* Settings */}
                    <div className="space-y-3">
                        <div>
                            <label htmlFor="duration" className="flex justify-between text-sm font-medium text-gray-300 mb-1">
                                <span><ClockIcon className="w-4 h-4 inline mr-1"/>Duration</span>
                                <span className="font-mono text-indigo-300">{formatDuration(duration)}</span>
                            </label>
                            <input id="duration" type="range" min="0" max="100" value={sliderValue} onChange={handleSliderChange} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        </div>
                         <div>
                            <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-1"><QualityIcon className="w-4 h-4 inline mr-1"/>Quality</label>
                            <select id="quality" value={quality} onChange={e => setQuality(e.target.value as VideoQuality)} className="w-full bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                                {Object.values(VideoQuality).map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>
                    </div>
                    {/* Action */}
                    <div>
                         <label className="block text-sm font-medium text-transparent mb-1">_</label>
                         <button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className="w-full h-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <VideoIcon className="w-5 h-5" />
                            {isLoading ? 'Generating...' : 'Generate Video'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Viewport Section */}
            <div className="bg-gray-800 rounded-lg shadow-xl p-4 flex-grow relative overflow-hidden">
                {isLoading ? renderLoadingState() : result ? renderResult() : renderInitialState()}
                {error && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-800/90 text-white px-4 py-2 rounded-md text-sm">{error}</div>}
            </div>
        </div>
    );
};

export default VideoGenerator;
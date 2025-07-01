
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generatePreciseVideo } from '../services/geminiService';
import { VideoQuality, VideoGenerationSettings, VideoStory } from '../types';
import { VideoIcon, LoadingSpinner, DownloadIcon, ClockIcon, QualityIcon, SparklesIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './Icons';

type Status = 'idle' | 'generating_frames' | 'rendering_video' | 'error' | 'success';

const createVideoFromFrames = (imageUrls: string[], totalDuration: number, quality: VideoQuality): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        if (imageUrls.length === 0) return reject('No images to create a video from.');

        const canvas = document.createElement('canvas');
        const firstImage = new Image();
        firstImage.crossOrigin = "anonymous";
        firstImage.src = imageUrls[0];
        try {
            await firstImage.decode();
        } catch(e) {
            return reject('Could not decode the first image frame.');
        }

        const qualityMap = { [VideoQuality.SD]: 480, [VideoQuality.HD]: 720, [VideoQuality.FullHD]: 1080, [VideoQuality.FourK]: 1920 };
        const targetHeight = qualityMap[quality] || 720;
        const aspectRatio = firstImage.width / firstImage.height;
        canvas.width = Math.round(targetHeight * aspectRatio);
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Could not get canvas context');

        const stream = canvas.captureStream(30); // 30 fps
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];

        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            resolve(url);
        };
        recorder.onerror = (e) => reject(`MediaRecorder error: ${e}`);

        recorder.start();

        const loadedImages = await Promise.all(imageUrls.map(url => {
            return new Promise<HTMLImageElement>((res, rej) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => res(img);
                img.onerror = rej;
                img.src = url;
            });
        }));

        const frameDurationMs = (totalDuration * 1000) / loadedImages.length;
        for (const img of loadedImages) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            await new Promise(r => setTimeout(r, frameDurationMs));
        }

        await new Promise(r => setTimeout(r, 200));

        recorder.stop();
    });
};

const formatDuration = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('A majestic penguin giving a tech talk to an audience of developers.');
    const [duration, setDuration] = useState<number>(15);
    const [quality, setQuality] = useState<VideoQuality>(VideoQuality.HD);
    
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [script, setScript] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);

    const videoElementRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Cleanup speech synthesis on component unmount
        return () => {
            speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        const video = videoElementRef.current;
        if (!video || !script) return;

        const handlePlay = () => {
            if (isMuted) return;
            // If speech was paused, resume it. Otherwise, start new.
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
            } else {
                speechSynthesis.cancel(); // Cancel any lingering speech
                const utterance = new SpeechSynthesisUtterance(script);
                utterance.onend = () => {
                    if (video.loop) { // restart speech if video loops
                        video.currentTime = 0;
                        video.play();
                    }
                };
                speechSynthesis.speak(utterance);
            }
        };

        const handlePause = () => {
            speechSynthesis.pause();
        };
        
        const handleSeeking = () => {
             speechSynthesis.cancel();
        }

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('seeking', handleSeeking);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('seeking', handleSeeking);
            speechSynthesis.cancel(); // Cleanup on effect change
        };
    }, [videoUrl, script, isMuted]);


    const handleGenerate = async () => {
        if (!prompt.trim() || status === 'generating_frames' || status === 'rendering_video') return;

        setStatus('generating_frames');
        setError('');
        setVideoUrl(null);
        setScript(null);
        speechSynthesis.cancel();

        try {
            const settings: VideoGenerationSettings = { prompt, duration, quality };
            const story: VideoStory = await generatePreciseVideo(settings);
            
            if (story.imageUrls && story.imageUrls.length > 0) {
                setStatus('rendering_video');
                const createdVideoUrl = await createVideoFromFrames(story.imageUrls, duration, quality);
                setVideoUrl(createdVideoUrl);
                setScript(story.script);
                setStatus('success');
            } else {
                setError('The AI failed to return any image frames for the video.');
                setStatus('error');
            }
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'An unexpected error occurred during video creation.');
            setStatus('error');
        }
    };
    
     const handleDownload = () => {
        if (!videoUrl) return;
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `pingu-video-${Date.now()}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const toggleMute = () => {
        if (!isMuted) {
            speechSynthesis.cancel();
        }
        setIsMuted(!isMuted);
    };

    const getStatusMessage = () => {
        switch(status) {
            case 'generating_frames': return 'Phase 1/2: AI is generating frames sequentially...';
            case 'rendering_video': return 'Phase 2/2: Encoding frames into a video...';
            default: return 'Describe a scene and the AI will create a video for you.';
        }
    }

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                  <SparklesIcon className="w-6 h-6 text-indigo-400" />
                  Advanced AI Video Synthesis
                </h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A cinematic fly-through of a futuristic cyberpunk city..."
                        className="flex-grow w-full bg-gray-700 text-white placeholder-gray-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                        rows={3}
                        disabled={status === 'generating_frames' || status === 'rendering_video'}
                    />
                     <div className="w-full md:w-72 flex flex-col gap-3">
                        <div className="bg-gray-700 p-2 rounded-md">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                                <ClockIcon className="w-4 h-4" /> Duration: {formatDuration(duration)}
                            </label>
                            <input type="range" min="10" max="1800" step="1" value={duration} onChange={e => setDuration(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            disabled={status === 'generating_frames' || status === 'rendering_video'} />
                            {duration > 60 && (
                                <p className="text-xs text-yellow-400 mt-2">
                                    Note: Long durations take significant time and will result in a lower FPS video due to API limits.
                                </p>
                            )}
                        </div>
                        <div className="bg-gray-700 p-2 rounded-md">
                             <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-1">
                                <QualityIcon className="w-4 h-4" /> Quality
                            </label>
                            <select value={quality} onChange={e => setQuality(e.target.value as VideoQuality)}
                            className="w-full bg-gray-600 text-white p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                            disabled={status === 'generating_frames' || status === 'rendering_video'}>
                                {Object.entries(VideoQuality).map(([key, value]) => <option key={key} value={value}>{key} ({value})</option>)}
                            </select>
                        </div>
                     </div>
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || status === 'generating_frames' || status === 'rendering_video'}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {(status === 'generating_frames' || status === 'rendering_video') ? <LoadingSpinner className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
                    {(status === 'generating_frames' || status === 'rendering_video') ? 'Generating...' : 'Generate Video'}
                </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-xl p-4 flex-grow relative overflow-hidden flex items-center justify-center">
                {status === 'generating_frames' || status === 'rendering_video' ? (
                    <div className="text-center text-gray-400">
                        <LoadingSpinner className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                        <p className="text-lg font-semibold">{getStatusMessage()}</p>
                        <p className="text-sm text-gray-500">This can take several minutes due to API rate limits. Please be patient.</p>
                    </div>
                ) : videoUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                        <video ref={videoElementRef} src={videoUrl} controls autoPlay loop className="max-w-full max-h-[75%] bg-black rounded-lg" />
                         <div className="flex items-center justify-center gap-4">
                            <button onClick={toggleMute} className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-2 px-5 rounded-md hover:bg-gray-600 transition-colors">
                                {isMuted ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
                                <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
                            </button>
                            <button onClick={handleDownload} className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-5 rounded-md hover:bg-green-500 transition-colors">
                                <DownloadIcon className="w-5 h-5" />
                                <span className="text-sm">Download</span>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">Note: AI narration is for playback only. The downloaded video will be silent.</p>
                    </div>
                ) : (
                     <div className="text-center text-gray-500">
                        <VideoIcon className="w-24 h-24 mx-auto mb-4" />
                        <p className="text-lg">{getStatusMessage()}</p>
                        {status === 'error' && <p className="text-red-400 mt-2 max-w-md">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;
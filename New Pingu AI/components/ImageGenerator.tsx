
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageIcon, LoadingSpinner } from './Icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (prompt.trim() === '' || isLoading) return;

    setIsLoading(true);
    setImageUrl('');
    setError('');

    try {
        const result = await generateImage(prompt);
        setImageUrl(result);
    } catch (e: any) {
        console.error("Final error after retries:", e);
        if (e.message && (e.message.includes('rate limit') || e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED'))) {
             setError('High demand! The AI is a bit busy. Please wait a moment and try again.');
        } else {
            setError('Failed to generate image. Please try a different prompt or check the console for details.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 rounded-lg shadow-xl p-6 overflow-hidden">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-white mb-4">AI Image Generator</h2>
        <p className="text-gray-400 mb-6">Describe the image you want to create. Be as specific as you can!</p>
        
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., A futuristic city skyline at sunset, cyberpunk style"
            className="flex-grow bg-gray-700 text-white placeholder-gray-500 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || prompt.trim() === ''}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-700">
          {isLoading ? (
            <div className="text-center text-gray-400">
              <LoadingSpinner className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
              <p>Conjuring up your image...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt={prompt} className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4" />
              <p>{error || 'Your generated image will appear here.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
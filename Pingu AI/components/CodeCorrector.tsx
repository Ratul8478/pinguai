
import React, { useState } from 'react';
import { analyzeCode } from '../services/geminiService';
import { CodeAnalysisResult } from '../types';
import { CodeIcon, LoadingSpinner } from './Icons';

const CodeCorrector: React.FC = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<CodeAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (code.trim() === '' || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const analysisResult = await analyzeCode(code);
      if (analysisResult) {
        setResult(analysisResult);
      } else {
        setError('Could not analyze the code. The response might be malformed. Please try again.');
      }
    } catch (e) {
      setError('An unexpected error occurred during analysis.');
      console.error(e);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CodeIcon className="w-6 h-6 text-indigo-400" />
          AI Code Fixer & Analyzer
        </h2>
        <p className="text-sm text-gray-400 mt-1">Paste your code below to detect errors, get explanations, and receive corrected code.</p>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-auto">
        {/* Input Area */}
        <div className="flex flex-col">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code snippet here..."
            className="flex-grow w-full bg-gray-900 text-gray-200 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none border border-gray-700"
            disabled={isLoading}
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || code.trim() === ''}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner className="w-5 h-5" /> : <CodeIcon className="w-5 h-5" />}
            {isLoading ? 'Analyzing...' : 'Analyze & Fix'}
          </button>
        </div>

        {/* Output Area */}
        <div className="flex flex-col bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <LoadingSpinner className="w-10 h-10 mx-auto mb-4 text-indigo-400" />
                <p>Analyzing your code...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-400 p-4 text-center">
              <p>{error}</p>
            </div>
          ) : result ? (
            <div className="overflow-y-auto p-4 flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-indigo-400 mb-2">Analysis & Explanation</h3>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.analysis}</p>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Corrected Code</h3>
                <pre className="bg-gray-800 p-3 rounded-md overflow-x-auto">
                  <code className="text-sm text-green-300 font-mono">{result.correctedCode}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center">
              <p>Analysis results will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeCorrector;
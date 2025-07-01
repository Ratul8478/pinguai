import React, { useState, useEffect, useRef } from 'react';
import { generateCodeStream } from '../services/geminiService';
import { RobotIcon, LoadingSpinner, ClipboardIcon } from './Icons';

// hljs will be on the window object from the script tag in index.html
declare const hljs: any;

const LANGUAGES = [
  "JavaScript", "Python", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "HTML", "CSS", "SQL"
];

const CodeAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  
  // State for streaming content
  const [explanation, setExplanation] = useState('');
  const [code, setCode] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const codeBlockRef = useRef<HTMLElement | null>(null);

  // Effect to apply syntax highlighting when code changes
  useEffect(() => {
    if (codeBlockRef.current && code) {
      // This ensures that highlight.js processes the element again
      // after React has updated the DOM with the new code content.
      hljs.highlightElement(codeBlockRef.current);
    }
  }, [code]); // Rerun whenever the code content changes

  const handleGenerate = async () => {
    if (prompt.trim() === '' || isLoading) return;

    setIsLoading(true);
    setExplanation('');
    setCode('');
    setError('');
    setCopySuccess('');

    try {
      let currentExplanation = '';
      let currentCode = '';
      let isParsingCode = false;

      const stream = generateCodeStream(prompt, language);
      for await (const chunk of stream) {
        if (chunk.includes('## Code')) {
          isParsingCode = true;
          // handle case where '## Code' is in the middle of a chunk
          const parts = chunk.split('## Code');
          currentExplanation += parts[0];
          currentCode += parts[1] || '';
        } else if (chunk.includes('## Explanation')) {
            // Ignore this header, we start in explanation mode by default
            const parts = chunk.split('## Explanation');
            currentExplanation += parts[1] || '';
        } else {
          if (isParsingCode) {
            currentCode += chunk;
          } else {
            currentExplanation += chunk;
          }
        }
        // Use functional updates to ensure we're not dealing with stale state
        setExplanation(prev => prev.length < currentExplanation.length ? currentExplanation : prev);
        setCode(prev => prev.length < currentCode.length ? currentCode : prev);
      }

    } catch (e) {
      setError('An unexpected error occurred during code generation.');
      console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    }, (err) => {
        setCopySuccess('Failed to copy');
        console.error('Could not copy text: ', err);
    });
  };

  const hasResult = explanation || code;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Input Section */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-4 flex-shrink-0">
         <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <RobotIcon className="w-6 h-6 text-indigo-400" />
          AI Code Assistant
        </h2>
        <p className="text-sm text-gray-400 mt-1 mb-4">Describe the code you need, select a language, and the AI will generate it for you in real-time.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a React hook for fetching data from an API with loading and error states"
            className="md:col-span-2 w-full h-24 bg-gray-700 text-gray-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm resize-none"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={isLoading}
            >
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
            <button
              onClick={handleGenerate}
              disabled={isLoading || prompt.trim() === ''}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner className="w-5 h-5" /> : <RobotIcon className="w-5 h-5" />}
              {isLoading ? 'Generating...' : 'Generate Code'}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="bg-gray-800 rounded-lg shadow-xl flex-grow relative overflow-hidden">
        {isLoading && !hasResult ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <LoadingSpinner className="w-10 h-10 mx-auto mb-4 text-indigo-400" />
              <p>The AI is crafting your code...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400 p-4 text-center">{error}</div>
        ) : hasResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px h-full bg-gray-700">
            <div className="bg-gray-800 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold text-indigo-400 mb-2">Explanation</h3>
              <div className="text-gray-300 text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                {explanation}
              </div>
            </div>
            <div className="bg-gray-900 flex flex-col">
              <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-gray-700">
                <h3 className="text-lg font-semibold text-green-400">Generated Code</h3>
                <button onClick={handleCopy} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold py-1 px-3 rounded-md transition-colors">
                  <ClipboardIcon className="w-4 h-4" />
                  {copySuccess || 'Copy'}
                </button>
              </div>
              <div className="overflow-auto flex-grow">
                <pre className="p-0 m-0 h-full"><code ref={codeBlockRef} className={`language-${language.toLowerCase()} text-sm font-mono !p-4 !m-0 block`}>{code}</code></pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center">
            <p>Your generated code and explanation will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAssistant;
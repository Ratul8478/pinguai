
import React, { useState, useEffect, useRef } from 'react';
import { generateCodeStream, analyzeCode } from '../services/geminiService';
import { CodeAnalysisResult } from '../types';
import { RobotIcon, CodeIcon, LoadingSpinner, ClipboardIcon } from './Icons';

// hljs will be on the window object from the script tag in index.html
declare const hljs: any;

const LANGUAGES = [
  "JavaScript", "Python", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "HTML", "CSS", "SQL"
];

type ActiveTab = 'generate' | 'analyze';

const CodeHelper: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('generate');

    // --- State for GENERATE tab ---
    const [generatePrompt, setGeneratePrompt] = useState('');
    const [language, setLanguage] = useState('JavaScript');
    const [explanation, setExplanation] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateError, setGenerateError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const codeBlockRef = useRef<HTMLElement | null>(null);

    // --- State for ANALYZE tab ---
    const [analyzeCodeInput, setAnalyzeCodeInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState('');

    // --- Effect for Syntax Highlighting ---
    useEffect(() => {
        if (activeTab === 'generate' && codeBlockRef.current && generatedCode) {
            hljs.highlightElement(codeBlockRef.current);
        }
    }, [generatedCode, activeTab]);

    // --- Logic for GENERATE tab ---
    const handleGenerate = async () => {
        if (generatePrompt.trim() === '' || isGenerating) return;

        setIsGenerating(true);
        setExplanation('');
        setGeneratedCode('');
        setGenerateError('');
        setCopySuccess('');

        try {
            let currentExplanation = '';
            let currentCode = '';
            let isParsingCode = false;

            const stream = generateCodeStream(generatePrompt, language);
            for await (const chunk of stream) {
                if (chunk.includes('## Code')) {
                    isParsingCode = true;
                    const parts = chunk.split('## Code');
                    currentExplanation += parts[0];
                    currentCode += parts[1] || '';
                } else if (chunk.includes('## Explanation')) {
                    const parts = chunk.split('## Explanation');
                    currentExplanation += parts[1] || '';
                } else {
                    if (isParsingCode) {
                        currentCode += chunk;
                    } else {
                        currentExplanation += chunk;
                    }
                }
                setExplanation(currentExplanation);
                setGeneratedCode(currentCode);
            }
        } catch (e) {
            setGenerateError('An unexpected error occurred during code generation.');
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('Failed to copy');
            console.error('Could not copy text: ', err);
        });
    };

    // --- Logic for ANALYZE tab ---
    const handleAnalyze = async () => {
        if (analyzeCodeInput.trim() === '' || isAnalyzing) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);
        setAnalyzeError('');

        try {
            const result = await analyzeCode(analyzeCodeInput);
            if (result) {
                setAnalysisResult(result);
            } else {
                setAnalyzeError('Could not analyze the code. The response might be malformed. Please try again.');
            }
        } catch (e) {
            setAnalyzeError('An unexpected error occurred during analysis.');
            console.error(e);
        }

        setIsAnalyzing(false);
    };

    const renderGenerateTab = () => (
        <div className="flex flex-col h-full gap-4 p-4">
            <div className="flex-shrink-0">
                <p className="text-sm text-gray-400 mb-4">Describe the code you need, select a language, and the AI will generate it for you in real-time.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <textarea
                        value={generatePrompt}
                        onChange={(e) => setGeneratePrompt(e.target.value)}
                        placeholder="e.g., Create a React hook for fetching data from an API with loading and error states"
                        className="md:col-span-2 w-full h-24 bg-gray-700 text-gray-200 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm resize-none"
                        disabled={isGenerating}
                    />
                    <div className="flex flex-col gap-4">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-gray-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            disabled={isGenerating}
                        >
                            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || generatePrompt.trim() === ''}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <LoadingSpinner className="w-5 h-5" /> : <RobotIcon className="w-5 h-5" />}
                            {isGenerating ? 'Generating...' : 'Generate Code'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-grow relative overflow-hidden bg-gray-900 rounded-lg border border-gray-700">
                {(isGenerating && !explanation && !generatedCode) ? (
                    <div className="flex items-center justify-center h-full text-gray-400"><div className="text-center"><LoadingSpinner className="w-10 h-10 mx-auto mb-4 text-indigo-400" /><p>The AI is crafting your code...</p></div></div>
                ) : generateError ? (
                    <div className="flex items-center justify-center h-full text-red-400 p-4 text-center">{generateError}</div>
                ) : (explanation || generatedCode) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-px h-full bg-gray-700">
                        <div className="bg-gray-800 p-4 overflow-y-auto"><h3 className="text-lg font-semibold text-indigo-400 mb-2">Explanation</h3><div className="text-gray-300 text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none">{explanation}</div></div>
                        <div className="bg-gray-900 flex flex-col"><div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-gray-700"><h3 className="text-lg font-semibold text-green-400">Generated Code</h3><button onClick={handleCopy} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold py-1 px-3 rounded-md transition-colors"><ClipboardIcon className="w-4 h-4" />{copySuccess || 'Copy'}</button></div><div className="overflow-auto flex-grow"><pre className="p-0 m-0 h-full"><code ref={codeBlockRef} className={`language-${language.toLowerCase()} text-sm font-mono !p-4 !m-0 block`}>{generatedCode}</code></pre></div></div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center"><p>Your generated code and explanation will appear here.</p></div>
                )}
            </div>
        </div>
    );

    const renderAnalyzeTab = () => (
        <div className="flex flex-col lg:flex-row h-full gap-4 p-4">
            <div className="flex flex-col lg:w-1/2">
                <p className="text-sm text-gray-400 mb-4 flex-shrink-0">Paste your code below to detect errors, get explanations, and receive corrected code.</p>
                <textarea
                    value={analyzeCodeInput}
                    onChange={(e) => setAnalyzeCodeInput(e.target.value)}
                    placeholder="Paste your code snippet here..."
                    className="flex-grow w-full bg-gray-900 text-gray-200 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-none border border-gray-700"
                    disabled={isAnalyzing}
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || analyzeCodeInput.trim() === ''}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-md hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? <LoadingSpinner className="w-5 h-5" /> : <CodeIcon className="w-5 h-5" />}
                    {isAnalyzing ? 'Analyzing...' : 'Analyze & Fix'}
                </button>
            </div>
            <div className="flex flex-col bg-gray-900 rounded-md border border-gray-700 overflow-hidden lg:w-1/2">
                {isAnalyzing ? (
                    <div className="flex items-center justify-center h-full text-gray-400"><div className="text-center"><LoadingSpinner className="w-10 h-10 mx-auto mb-4 text-indigo-400" /><p>Analyzing your code...</p></div></div>
                ) : analyzeError ? (
                    <div className="flex items-center justify-center h-full text-red-400 p-4 text-center"><p>{analyzeError}</p></div>
                ) : analysisResult ? (
                    <div className="overflow-y-auto p-4 flex flex-col gap-4"><div><h3 className="text-lg font-semibold text-indigo-400 mb-2">Analysis & Explanation</h3><p className="text-gray-300 text-sm whitespace-pre-wrap">{analysisResult.analysis}</p></div><div className="border-t border-gray-700 pt-4"><h3 className="text-lg font-semibold text-green-400 mb-2">Corrected Code</h3><pre className="bg-gray-800 p-3 rounded-md overflow-x-auto"><code className="text-sm text-green-300 font-mono">{analysisResult.correctedCode}</code></pre></div></div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 p-4 text-center"><p>Analysis results will appear here.</p></div>
                )}
            </div>
        </div>
    );

    const TabButton: React.FC<{ tabName: ActiveTab, label: string }> = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`px-3 py-2 font-medium text-sm rounded-t-md transition-colors ${activeTab === tabName ? 'bg-gray-800 text-indigo-400 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <RobotIcon className="w-6 h-6 text-indigo-400" />
                    AI Code Helper
                </h2>
            </div>
            <div className="px-4 border-b border-gray-700 flex-shrink-0">
                <nav className="flex space-x-2">
                    <TabButton tabName="generate" label="Generate Code" />
                    <TabButton tabName="analyze" label="Analyze & Fix Code" />
                </nav>
            </div>
            <div className="flex-grow overflow-hidden">
                {activeTab === 'generate' ? renderGenerateTab() : renderAnalyzeTab()}
            </div>
        </div>
    );
};

export default CodeHelper;

import React, { useState, useRef, useEffect } from 'react';
import { generateTextStream } from '../services/geminiService';
import { Message } from '../types';
import { SendIcon, LoadingSpinner, PenguinIcon } from './Icons';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);
    
    try {
        const stream = generateTextStream(currentInput);
        for await (const chunk of stream) {
            setMessages(prev => 
                prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, text: msg.text + chunk } : msg
                )
            );
        }
    } catch (error) {
        setMessages(prev => 
            prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: "Sorry, an error occurred." } : msg
            )
        );
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Basic Chat</h2>
          <p className="text-sm text-gray-400">A simple, text-only streaming chat interface.</p>
      </div>
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
               {message.sender === 'ai' && <div className="w-8 h-8 flex-shrink-0 rounded-full bg-indigo-600 flex items-center justify-center"><PenguinIcon className="w-5 h-5 text-white" /></div>}
              <div
                className={`px-4 py-3 rounded-2xl max-w-lg ${message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-200 rounded-bl-none'
                  }`}
              >
                {message.sender === 'ai' && message.text.length === 0 && <LoadingSpinner className="w-5 h-5 text-indigo-400" />}
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-gray-900 p-4 border-t border-gray-700">
        <div className="flex items-center bg-gray-700 rounded-lg pr-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="w-full bg-transparent p-3 text-gray-200 placeholder-gray-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="p-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <LoadingSpinner className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
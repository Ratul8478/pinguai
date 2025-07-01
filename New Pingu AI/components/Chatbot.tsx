
import React, { useState, useRef, useEffect } from 'react';
import { generateTextStream } from '../services/geminiService';
import { Message } from '../types';
import { SendIcon, LoadingSpinner, PenguinIcon, PaperclipIcon, ImageIcon, CameraIcon, XCircleIcon } from './Icons';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
            setShowAttachMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          setAttachment(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setPreviewUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
      setShowAttachMenu(false);
      event.target.value = '';
  };

  const removeAttachment = () => {
      setAttachment(null);
      setPreviewUrl(null);
  };

  const handleSend = async () => {
    if ((input.trim() === '' && !attachment) || isLoading) return;

    const userMessage: Message = { 
        id: Date.now().toString(), 
        text: input, 
        sender: 'user',
        imageUrl: previewUrl || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const currentInput = input;
    const currentAttachment = attachment;
    
    setInput('');
    setAttachment(null);
    setPreviewUrl(null);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);
    
    try {
        const stream = generateTextStream(currentInput, currentAttachment || undefined);
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
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

      <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Multimodal Chat</h2>
          <p className="text-sm text-gray-400">Chat with text and images.</p>
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
                {message.imageUrl && (
                    <img src={message.imageUrl} alt="User upload" className="mb-2 rounded-lg max-w-full h-auto" />
                )}
                {message.text && (
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                )}
                {message.sender === 'ai' && message.text.length === 0 && !message.imageUrl && <LoadingSpinner className="w-5 h-5 text-indigo-400" />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="bg-gray-900 p-4 border-t border-gray-700">
        {previewUrl && (
            <div className="p-2 w-fit relative">
                <div className="bg-gray-700/50 p-1 rounded-lg">
                    <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                    <button onClick={removeAttachment} className="absolute -top-1 -right-1 bg-gray-800 rounded-full text-white hover:bg-gray-600 transition-colors">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        )}
        <div className="flex items-center bg-gray-700 rounded-lg pr-2">
            <div ref={attachMenuRef} className="relative">
                <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="p-3 text-gray-400 hover:text-white transition-colors">
                    <PaperclipIcon className="w-5 h-5"/>
                </button>
                {showAttachMenu && (
                    <div className="absolute bottom-full mb-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700">
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-t-md">
                            <ImageIcon className="w-5 h-5"/> Upload Image
                        </button>
                        <button onClick={() => cameraInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 rounded-b-md">
                            <CameraIcon className="w-5 h-5"/> Take Photo
                        </button>
                    </div>
                )}
            </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask with text or an image..."
            className="w-full bg-transparent p-3 text-gray-200 placeholder-gray-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (input.trim() === '' && !attachment)}
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
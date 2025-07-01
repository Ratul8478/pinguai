export interface User {
  id: string;
  username: string;
  email: string;
}

// Represents the full user data stored in localStorage
export interface UserRecord extends User {
    password: string; // In a real app, this should be a hash
}

export enum ActiveView {
  Chat = 'Chat',
  ImageGen = 'ImageGen',
  VoiceAssistant = 'VoiceAssistant',
  VideoGen = 'VideoGen',
  CodeHelper = 'CodeHelper',
  Stream = 'Stream',
}

export interface Message {
  id:string;
  text: string;
  sender: 'user' | 'ai';
  imageUrl?: string;
}

export interface ScreenSuggestion {
    id: string;
    suggestion: string;
    timestamp: string;
}

export interface CodeAnalysisResult {
  analysis: string;
  correctedCode: string;
}

export interface CodeGenerationResult {
  explanation: string;
  code: string;
}

export enum VideoQuality {
    SD = "480p",
    HD = "720p",
    FullHD = "1080p",
    FourK = "4K",
}

export interface VideoGenerationSettings {
    prompt: string;
    duration: number;
    quality: VideoQuality;
}

export interface VideoStory {
    imageUrls: string[];
    script: string;
}
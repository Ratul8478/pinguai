
export enum ActiveView {
  Landing = 'Landing',
  Chat = 'Chat',
  ImageGen = 'ImageGen',
  VoiceAssistant = 'VoiceAssistant',
  VideoGen = 'VideoGen',
  CodeHelper = 'CodeHelper',
  Stream = 'Stream',
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
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

export interface PreciseVideoResult {
    videoUrl: string; // URL with time fragments for playback
    rawVideoUrl: string; // Clean URL for downloading
    analysis: string;
    voiceOverScript: string;
}
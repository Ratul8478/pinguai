import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CodeAnalysisResult, CodeGenerationResult, VideoGenerationSettings, PreciseVideoResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Categorized video library for more accurate prompt matching
const categorizedVideos: { [key: string]: string[] } = {
    'Nature & Wildlife': [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    ],
    'Urban & Action': [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4'
    ],
    'Sci-Fi & Animation': [
        'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ],
    'People & Lifestyle': [
         'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
         'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    ]
};
const defaultVideo = 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';


export const generateText = async (prompt: string, language: string = 'English'): Promise<string> => {
  try {
    const fullPrompt = `Respond in ${language}. The user's query is: "${prompt}"`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: fullPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    return "Sorry, I encountered an error while generating a response.";
  }
};

export async function* generateTextStream(
  prompt: string
): AsyncGenerator<string> {
  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
    });

    for await (const chunk of response) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating text stream:", error);
    yield "Sorry, I encountered an error while generating a response.";
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
   try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
        return "";
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return "";
  }
};

export const analyzeCode = async (code: string): Promise<CodeAnalysisResult | null> => {
    const systemInstruction = `You are an expert AI programming assistant specializing in error detection and correction. Analyze the user-submitted code.
    Respond ONLY with a single, raw JSON object (no markdown fences like \`\`\`json) with two keys:
    1. "analysis": A string containing a clear, step-by-step explanation of any errors, potential issues, and suggested improvements.
    2. "correctedCode": A string containing the complete, corrected version of the code snippet.`;

    const prompt = `Please analyze this code:\n\n${code}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
            },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr);
        if (parsedData.analysis && parsedData.correctedCode) {
            return parsedData as CodeAnalysisResult;
        }
        return null;
    } catch (error) {
        console.error("Failed to parse or analyze code:", error);
        return null;
    }
};

export async function* generateCodeStream(prompt: string, language:string): AsyncGenerator<string> {
    const systemInstruction = `You are a senior staff software engineer and an expert in ${language}.
Your task is to generate high-quality, production-ready code based on the user's request.
Structure your response in markdown format. It MUST have two sections:
1. A level-two heading '## Explanation'
2. A level-two heading '## Code'

Under '## Explanation', provide a detailed breakdown of the code's functionality, how it works, and how to use it.
Under '## Code', provide ONLY the raw code block itself, without any markdown fences like \`\`\`${language.toLowerCase()}. Do not add any text outside the code block in this section.`;

    const fullPrompt = `Generate code for the following request: ${prompt}`;

    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash-preview-04-17",
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        for await (const chunk of response) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error generating code stream:", error);
        yield "Sorry, an error occurred while generating the code.";
    }
}


export const generatePreciseVideo = async (settings: VideoGenerationSettings): Promise<PreciseVideoResult> => {
    // 1. Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    let selectedVideoUrl = defaultVideo;

    // 2. Use AI to classify the prompt into a category for better matching
    const categories = Object.keys(categorizedVideos);
    const classificationPrompt = `Classify the following user prompt into ONE of these categories: ${categories.join(', ')}. Respond with ONLY the category name. Prompt: "${settings.prompt}"`;
    
    let bestCategory = 'Sci-Fi & Animation'; // Default category
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: classificationPrompt,
        });
        const categoryText = response.text.trim();
        if (categories.includes(categoryText)) {
            bestCategory = categoryText;
        }
    } catch (e) {
        console.error("Failed to classify prompt, using default category:", e);
    }
    
    // Select a random video from the chosen category
    const videosInCategory = categorizedVideos[bestCategory];
    if (videosInCategory && videosInCategory.length > 0) {
        selectedVideoUrl = videosInCategory[Math.floor(Math.random() * videosInCategory.length)];
    }

    // 3. Generate Analysis and Script using Gemini
    const systemInstruction = `You are an AI video production assistant. Based on the user's prompt, generate a JSON object with two keys: "analysis" and "voiceOverScript".
    - "analysis": Explain how you interpreted the prompt. Mention that you classified the theme as "${bestCategory}" and selected a suitable video. Also mention the quality and duration settings.
    - "voiceOverScript": Write a short voice-over script that fits the video's theme and duration.
    The user's video settings are: Quality ${settings.quality}, Duration: ${settings.duration} seconds.`;

    let analysisText = `Analysis for prompt: "${settings.prompt}"\n- Classified theme as: ${bestCategory}\n- Duration: ${settings.duration}s\n- Quality: ${settings.quality}\n- Selected a representative video for the theme.`;
    let scriptText = 'A short, AI-generated script based on your prompt would appear here.';
    
    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: settings.prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            },
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsed = JSON.parse(jsonStr);
        analysisText = parsed.analysis || analysisText;
        scriptText = parsed.voiceOverScript || scriptText;

    } catch(e) {
        console.error("Failed to generate video script/analysis from Gemini:", e);
        // Fallback to default text if API fails
    }

    // 4. Construct result with media fragments for exact duration and raw URL for download
    const videoUrlWithFragment = `${selectedVideoUrl}#t=0,${settings.duration}`;

    return {
        videoUrl: videoUrlWithFragment,
        rawVideoUrl: selectedVideoUrl,
        analysis: analysisText,
        voiceOverScript: scriptText,
    };
};

export const analyzeScreenFrame = async (base64Data: string): Promise<string | null> => {
    const systemInstruction = `You are a helpful and concise AI assistant for software developers. Your task is to analyze the provided screenshot of a developer's screen.
Look specifically for:
- Obvious code errors (syntax, logic).
- Errors in a terminal or browser console.
- Typos in code or documentation.
- Potential workflow improvements or best practice violations.

If you identify a clear, actionable issue, provide a single, concise suggestion (20-30 words max).
If you DO NOT see any notable issue or error worth mentioning, you MUST respond with ONLY the exact string: NULL`;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
        },
    };
    
    const textPart = { text: "Analyze this screen for developer errors or improvements." }; 

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        const suggestion = response.text.trim();

        if (suggestion === 'NULL' || suggestion.length < 5) {
            return null;
        }
        return suggestion;
    } catch (error) {
        console.error("Error analyzing screen frame:", error);
        return null;
    }
};
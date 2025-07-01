
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CodeAnalysisResult, CodeGenerationResult, VideoGenerationSettings, VideoStory } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  prompt: string,
  imageFile?: File
): AsyncGenerator<string> {
  try {
    let contents: any = prompt;

    if (imageFile) {
        if (!imageFile.type.startsWith('image/')) {
            throw new Error('Only image files are supported.');
        }

        const base64EncodedData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });

        const imagePart = {
            inlineData: {
                mimeType: imageFile.type,
                data: base64EncodedData,
            },
        };
        const textPart = { text: prompt };
        contents = { parts: [textPart, imagePart] };
    }

    const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: contents,
    });

    for await (const chunk of response) {
        yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating text stream:", error);
    yield "Sorry, I encountered an error. Make sure the file is a supported image type.";
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    const MAX_RETRIES = 5;
    let baseDelay = 5000; // Increased base delay for more patient rate limit handling

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            } else {
                throw new Error("API returned a successful response but with no images.");
            }
        } catch (error: any) {
            console.error(`Error generating image (attempt ${i + 1}/${MAX_RETRIES}):`, error);

            const errorMessage = (typeof error === 'object' && error !== null && 'message' in error) ? error.message : String(error);
            const isRateLimitError = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');

            if (isRateLimitError && i < MAX_RETRIES - 1) {
                const waitTime = baseDelay * Math.pow(2, i) + Math.random() * 1000; // exponential backoff with jitter
                console.log(`Rate limit hit. Retrying in ${waitTime.toFixed(0)}ms...`);
                await delay(waitTime);
            } else {
                throw new Error(`Failed to generate image after ${i + 1} attempts. Last error: ${errorMessage}`);
            }
        }
    }
    // This line should be unreachable, but it satisfies TypeScript's need for a return path.
    throw new Error("Failed to generate image after all retries.");
};

export const analyzeCode = async (code: string): Promise<CodeAnalysisResult | null> => {
    const systemInstruction = `You are an expert AI programming assistant specializing in error detection and correction. Respond ONLY with a single, raw JSON object (no markdown fences like \`\`\`json) with two keys:
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

export const generatePreciseVideo = async (settings: VideoGenerationSettings): Promise<VideoStory> => {
    // 1. Determine number of frames based on duration
    const MAX_FRAMES_TO_GENERATE = 100;
    const TARGET_FPS = 4;
    const NUM_FRAMES = Math.min(MAX_FRAMES_TO_GENERATE, Math.floor(settings.duration * TARGET_FPS));

    // 2. Ask Gemini to generate a sequence of image prompts and a narration script
    const systemInstructionForPromptsAndScript = `You are an AI assistant for a text-to-video generator. Your task is to do two things:
    1. Create a sequence of ${NUM_FRAMES} detailed, cinematic image generation prompts. When viewed in order, these images should create a smooth, continuous video animation based on the user's request. Each prompt should describe a single frame and logically progress to create the illusion of movement.
    2. Write a short, engaging narration script (3-5 sentences) that describes the scene and action. The script should match the mood and content of the visual story.

    Respond ONLY with a single, raw JSON object with two keys:
    - "prompts": An array of ${NUM_FRAMES} strings for the image prompts.
    - "script": A single string for the narration.`;

    let imagePrompts: string[] = [];
    let script: string = '';

    try {
        const promptGenResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: `User's video request: "${settings.prompt}"`,
            config: {
                systemInstruction: systemInstructionForPromptsAndScript,
                responseMimeType: "application/json",
            },
        });

        let jsonStr = promptGenResponse.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        const parsed = JSON.parse(jsonStr);
        if (parsed.prompts && Array.isArray(parsed.prompts) && parsed.prompts.length > 0 && parsed.script) {
            imagePrompts = parsed.prompts;
            script = parsed.script;
        } else {
            throw new Error("AI failed to generate a valid story package.");
        }
    } catch (e) {
        console.error("Failed to generate video story from Gemini:", e);
        // Fallback to simpler generation if complex JSON fails
        imagePrompts = Array.from({ length: NUM_FRAMES }, (_, i) => `${settings.prompt}, cinematic, frame ${i + 1} of ${NUM_FRAMES}, ${settings.quality}`);
        script = `A video about: ${settings.prompt}.`;
    }

    // 3. Generate all images sequentially.
    const imageUrls: string[] = [];
    for (const p of imagePrompts) {
        try {
            // generateImage now has built-in retry logic. We add a proactive delay here to be even safer.
            const imageUrl = await generateImage(p);
            imageUrls.push(imageUrl);
            await delay(5000); // Increased proactive delay to 5 seconds to better respect API rate limits.
        } catch(e) {
            console.warn(`Could not generate a frame for video. Error: ${e}. Skipping.`);
            // Continue to try and generate the remaining frames.
        }
    }


    const successfulImageUrls = imageUrls.filter(url => url && url.startsWith('data:image'));
    if (successfulImageUrls.length < NUM_FRAMES * 0.5) { // Require at least 50% of frames
        throw new Error(`Failed to generate enough frames. Only got ${successfulImageUrls.length}/${NUM_FRAMES}. This can happen due to API rate limits or content policy violations.`);
    }

    return { imageUrls: successfulImageUrls, script };
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
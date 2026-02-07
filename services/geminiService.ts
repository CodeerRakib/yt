
import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getTranscriptFromLink = async (url: string): Promise<TranscriptData> => {
  const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Since actual transcript fetching via browser fetch() is blocked by YouTube's CORS,
  // we use Gemini's Google Search capabilities to find the content or simulated reasoning.
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this YouTube video URL: ${url}. Provide the video title, author, and a comprehensive transcript or detailed summary of its contents based on your knowledge or search. Respond in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          transcript: { type: Type.STRING, description: "The full transcript text or a very detailed point-by-point summary." }
        },
        required: ["title", "author", "transcript"]
      },
      tools: [{ googleSearch: {} }]
    }
  });

  const data = JSON.parse(response.text);
  return {
    ...data,
    videoId
  };
};

export const translateToBangla = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following YouTube video transcript summary into natural, fluent Bangla. Maintain the original meaning and technical terms if appropriate, but ensure it reads well in Bangla script.\n\nText: ${text}`,
    config: {
      systemInstruction: "You are an expert translator specializing in English to Bangla translation for technical and educational content.",
      temperature: 0.7,
    }
  });

  return response.text || "Translation failed.";
};

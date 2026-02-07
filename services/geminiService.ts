
import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptData } from "../types.ts";

const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const getTranscriptFromLink = async (url: string): Promise<TranscriptData> => {
  const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a full link (e.g., https://www.youtube.com/watch?v=...)");
  }

  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this YouTube video link: ${url}. 
    Please retrieve or reconstruct a highly detailed transcript/summary of the video content. 
    Return the response strictly as a JSON object with 'title', 'author', and 'transcript' keys.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          author: { type: Type.STRING },
          transcript: { type: Type.STRING, description: "A comprehensive and detailed transcript of the video." }
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Translate the following YouTube video transcript into natural, fluent, and professional Bangla. Ensure the language is easy to read for native speakers.\n\nText:\n${text}`,
    config: {
      systemInstruction: "You are a professional English-to-Bangla translator specializing in digital media content.",
      temperature: 0.7,
    }
  });

  return response.text || "অনুবাদ ব্যর্থ হয়েছে।";
};

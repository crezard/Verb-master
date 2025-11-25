import { GoogleGenAI, Type } from "@google/genai";
import { Verb } from "../types";

// Initialize Gemini Client
// Prioritize VITE_VAIT_API_KEY (Vite standard) then fallback to process.env.API_KEY
const getApiKey = (): string => {
  let apiKey = "";

  // 1. Try Vite Environment Variable (Priority)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_VAIT_API_KEY) {
      // @ts-ignore
      apiKey = import.meta.env.VITE_VAIT_API_KEY;
    }
  } catch (e) {
    // Ignore errors if import.meta is not available
  }

  // 2. Fallback to Standard Environment Variable (Node/Process)
  if (!apiKey) {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        apiKey = process.env.API_KEY;
      }
    } catch (e) {
      // Ignore process access errors
    }
  }

  return apiKey || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const modelName = 'gemini-2.5-flash';

// Simple ID generator to avoid 'uuid' package dependency and ensure compatibility
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

export const generateVerbsByTopic = async (topic: string, count: number = 5): Promise<Verb[]> => {
  try {
    const prompt = `Generate ${count} English verbs related to the topic: "${topic}". 
    Focus on a mix of regular and irregular verbs useful for daily conversation.
    Provide the Base form, Past Simple, Past Participle, Korean meaning, and a short example sentence.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              base: { type: Type.STRING },
              past: { type: Type.STRING },
              participle: { type: Type.STRING },
              meaning: { type: Type.STRING, description: "Korean translation of the verb" },
              example: { type: Type.STRING, description: "A simple example sentence using one of the forms" },
              isIrregular: { type: Type.BOOLEAN },
            },
            required: ["base", "past", "participle", "meaning", "example", "isIrregular"],
          },
        },
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    // Map to internal Verb type with IDs
    return data.map((item: any) => ({
      ...item,
      id: generateId(),
    }));

  } catch (error) {
    console.error("Error generating verbs:", error);
    throw error;
  }
};

export const explainVerbContext = async (verb: Verb): Promise<string> => {
  try {
    const prompt = `Explain the nuances of the verb "${verb.base}" (Past: ${verb.past}, PP: ${verb.participle}) for a Korean English learner. 
    Explain when to use the past simple vs past participle in 2 sentences max.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Error explaining verb:", error);
    return "Could not generate explanation at this time.";
  }
};
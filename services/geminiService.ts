import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = (): string => {
  let key = "";
  // 1. Try Vite environment variables (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      key = import.meta.env.VITE_VAIT_API_KEY || import.meta.env.API_KEY || "";
    }
  } catch (e) {
    // Ignore import.meta access errors
  }

  // 2. Fallback to process.env
  if (!key) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        key = process.env.VITE_VAIT_API_KEY || process.env.API_KEY || "";
      }
    } catch (e) {
      // Ignore process.env access errors
    }
  }
  return key;
};

export const generateVerbsByTopic = async (topic: string, count: number = 5) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_VAIT_API_KEY in your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Generate ${count} English verbs for topic "${topic}". Mix regular/irregular. JSON schema: [{base, past, participle, meaning(Korean), example(English), isIrregular(boolean)}]`;
  
  const res = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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
            meaning: { type: Type.STRING },
            example: { type: Type.STRING },
            isIrregular: { type: Type.BOOLEAN },
          },
          required: ["base", "past", "participle", "meaning", "example", "isIrregular"],
        },
      },
    },
  });
  
  const data = JSON.parse(res.text || "[]");
  return data.map((item: any) => ({ ...item, id: Date.now().toString(36) + Math.random().toString(36).slice(2) }));
};
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
    console.warn("Failed to access import.meta.env", e);
  }

  // 2. Fallback to process.env
  if (!key || key.trim() === "") {
    try {
      if (typeof process !== 'undefined' && process.env) {
        key = process.env.VITE_VAIT_API_KEY || process.env.API_KEY || "";
      }
    } catch (e) {
      console.warn("Failed to access process.env", e);
    }
  }
  
  return key ? key.trim() : "";
};

// Utility to generate a simple unique ID without external dependencies
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export const generateVerbsByTopic = async (topic: string, count: number = 5) => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_VAIT_API_KEY or API_KEY in your environment.");
  }

  let ai;
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error: any) {
    throw new Error(`Failed to initialize Gemini Client: ${error.message}`);
  }

  const prompt = `Generate ${count} English verbs for topic "${topic}". Mix regular/irregular. JSON schema: [{base, past, participle, meaning(Korean), example(English), isIrregular(boolean)}]`;
  
  try {
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
    
    // Fixed: .text is a property, not a function
    const text = res.text;
    if (!text) throw new Error("Empty response from AI");

    const data = JSON.parse(text);
    return data.map((item: any) => ({ ...item, id: generateId() }));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate verbs.");
  }
};
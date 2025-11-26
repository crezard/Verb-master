import { GoogleGenAI, Type } from "@google/genai";

export const generateVerbsByTopic = async (topic: string, count: number = 5) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
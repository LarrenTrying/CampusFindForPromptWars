import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateDeterministicEmbedding } from "../utils";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const isGeminiConfigured = (): boolean => {
  return Boolean(apiKey && apiKey.length > 5 && !apiKey.includes("your-gemini-key"));
};

let genAIInstance: GoogleGenerativeAI | null = null;

export const getGeminiAI = (): GoogleGenerativeAI | null => {
  if (!isGeminiConfigured()) return null;
  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
};

/**
 * Generate a 768-dimension vector embedding for text
 * Uses Google text-embedding-004 if API key is present, otherwise falls back to deterministic vectorizer
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const genAI = getGeminiAI();
  if (!genAI || !text.trim()) {
    return generateDeterministicEmbedding(text, 768);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    if (result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
    return generateDeterministicEmbedding(text, 768);
  } catch (error) {
    console.warn("Gemini embedding API call failed, falling back to local vectorizer:", error);
    return generateDeterministicEmbedding(text, 768);
  }
}

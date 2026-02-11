import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
// Use models from env or fallback to stable ones
const MODELS_TO_TRY = (process.env.GEMINI_MODELS || "gemini-2.0-flash,gemini-1.5-flash,gemini-pro").split(',');
export async function analyzeNewsRelevance(newsItems, keywords) {
    if (newsItems.length === 0 || keywords.length === 0)
        return [];
    const prompt = `
    Analyze the following ${newsItems.length} news items and determine their relevance to the keywords: [${keywords.join(", ")}].
    For each news item, provide a relevance score from 0 to 100 and a brief reason.
    
    Return the result strictly in JSON format as an array of objects:
    [
      { "index": 0, "relevanceScore": 85, "reason": "Mentions LLM advancements in detail" },
      ...
    ]

    News Items:
    ${newsItems.map((item, idx) => `[ID: ${idx}] Title: ${item.title}\nContent: ${item.content}`).join("\n\n")}
    `;
    for (const modelName of MODELS_TO_TRY) {
        try {
            console.log(`🤖 Testing AI Analysis with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName.trim() });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Extract JSON from response (sometimes AI wraps it in code blocks)
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(text);
        }
        catch (error) {
            console.error(`❌ Model ${modelName} failed:`, error instanceof Error ? error.message : String(error));
            // Continue to next model in the list
        }
    }
    console.warn("⚠️ All AI models failed. Returning empty relevance mapping.");
    return [];
}

import gemini from "../config/gemini.js";

export async function generateAnswer(question) {
  const response = await gemini.models.generateContent({
    model: process.env.GEMINI_CHAT_MODEL,
    contents: question,
  });

  return response.text;
}

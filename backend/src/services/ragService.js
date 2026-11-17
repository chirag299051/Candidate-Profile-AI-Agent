import gemini from "../config/gemini.js";
import { retrieveRelevantChunks } from "./retrievalService.js";
import { withGeminiRetry } from "./geminiRetry.js";
export async function answerCandidateQuestion(question, history = []) {
  const recentHistory = history.slice(-8);
  const previousQuestions = recentHistory
    .filter((message) => message.role === "user")
    .map((message) => message.content);
  const retrievalQuery = [...previousQuestions, question].join("\n");
  const relevantChunks = await retrieveRelevantChunks(retrievalQuery, 5);
  if (relevantChunks.length === 0) {
    return {
      answer:
        "I don't have enough information in the candidate profile to answer that question.",
      sources: [],
    };
  }
  const context = relevantChunks
    .map((chunk, index) => {
      return `Source ${index + 1} (${chunk.section}):\n${chunk.content}`;
    })
    .join("\n\n");
  const conversation = recentHistory
    .map((message) => {
      return `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`;
    })
    .join("\n");
  const prompt = `
You are an AI Candidate Profile Assistant.
Answer the latest user question using ONLY the candidate profile context provided below.
Use conversation history only to understand references and follow-up questions.
Do not treat previous assistant responses as verified candidate facts.
Rules:
1. Do not invent or assume candidate details.
2. Do not add skills, experience, achievements, or qualifications that are not explicitly supported by the candidate profile context.
3. If the context does not contain enough information, clearly say that the information is not available in the candidate profile.
4. Answer naturally and professionally, as if helping the candidate respond to a recruiter.
5. Do not mention embeddings, vector search, or internal retrieval processes.
6. Keep answers relevant and concise.
Conversation History:
${conversation || "No previous conversation."}
Candidate Profile Context:
${context}
Latest User Question:
${question}
Answer:
`;
  const response = await withGeminiRetry(() =>
    gemini.models.generateContent({
      model: process.env.GEMINI_CHAT_MODEL,
      contents: prompt,
    }),
  );
  return {
    answer: response.text,
    sources: relevantChunks.map((chunk) => ({
      section: chunk.section,
      content: chunk.content,
      score: chunk.score,
    })),
  };
}

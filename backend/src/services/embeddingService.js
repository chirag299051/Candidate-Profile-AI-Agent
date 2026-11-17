import gemini from "../config/gemini.js";

export async function generateEmbedding(text) {
  const response = await gemini.models.embedContent({
    model: process.env.GEMINI_EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

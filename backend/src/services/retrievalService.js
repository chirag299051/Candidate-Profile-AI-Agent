import { getDatabase } from "../config/database.js";
import { generateEmbedding } from "./embeddingService.js";
export async function retrieveRelevantChunks(question, limit = 5) {
  const db = getDatabase();
  const collection = db.collection("profile_chunks");
  const queryEmbedding = await generateEmbedding(question);
  const results = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: "candidate_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit,
          filter: {
            candidateId: "candidate-1",
          },
        },
      },
      {
        $project: {
          _id: 0,
          section: 1,
          content: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ])
    .toArray();
  return results;
}

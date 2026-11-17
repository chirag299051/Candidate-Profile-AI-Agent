import { getDatabase } from "../config/database.js";
import { createProfileDocuments } from "./profileService.js";
import { createChunks } from "./chunkService.js";
import { generateEmbedding } from "./embeddingService.js";
export async function ingestCandidateProfile() {
  const db = getDatabase();
  const collection = db.collection("profile_chunks");
  const documents = createProfileDocuments();
  const chunks = createChunks(documents);
  const candidateId = "candidate-1";
  console.log(`Preparing ${chunks.length} chunks for ingestion...`);
  await collection.deleteMany({ candidateId });
  const records = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`Generating embedding ${i + 1}/${chunks.length}...`);
    const embedding = await generateEmbedding(chunk.content);
    records.push({
      candidateId,
      section: chunk.section,
      documentIndex: chunk.documentIndex,
      content: chunk.content,
      embedding,
      createdAt: new Date(),
    });
  }
  if (records.length > 0) {
    await collection.insertMany(records);
  }
  console.log(`Successfully stored ${records.length} chunks in MongoDB.`);
  return records.length;
}

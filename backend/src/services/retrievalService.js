import { getDatabase } from "../config/database.js";
import { generateEmbedding } from "./embeddingService.js";

function getRelevantSections(question) {
  const q = question.toLowerCase();

  if (/tell me about yourself|introduce yourself|about the candidate/.test(q)) {
    return [
      "personal",
      "experience",
      "education",
      "certification",
      "skills",
      "project",
    ];
  }

  if (/project|application|built|developed|worked on/.test(q)) {
    return ["project"];
  }

  if (/skill|technology|tech stack|programming/.test(q)) {
    return ["skills"];
  }

  if (/education|degree|qualification|university|college/.test(q)) {
    return ["education"];
  }

  if (/certification|certified/.test(q)) {
    return ["certification"];
  }

  if (/experience|work history|job|role/.test(q)) {
    return ["experience"];
  }

  if (/hobby|hobbies|interest|interests/.test(q)) {
    return ["hobbies", "interests"];
  }

  return [];
}

export async function retrieveRelevantChunks(question, limit = 5) {
  const db = getDatabase();
  const collection = db.collection("profile_chunks");

  const queryEmbedding = await generateEmbedding(question);

  // Retrieve semantically relevant chunks.
  const vectorResults = await collection
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
          documentIndex: 1,
          content: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ])
    .toArray();

  // Retrieve documents from sections relevant to the question.
  const sections = getRelevantSections(question);

  let sectionResults = [];

  if (sections.length > 0) {
    sectionResults = await collection
      .find(
        {
          candidateId: "candidate-1",
          section: { $in: sections },
        },
        {
          projection: {
            _id: 0,
            section: 1,
            documentIndex: 1,
            content: 1,
          },
        },
      )
      .sort({ documentIndex: 1 })
      .toArray();

    sectionResults = sectionResults.map((chunk) => ({
      ...chunk,
      score: null,
    }));
  }

  // Combine results and remove duplicate chunks.
  const combinedResults = [...vectorResults, ...sectionResults];

  const uniqueResults = [];
  const seen = new Set();

  for (const chunk of combinedResults) {
    const key = `${chunk.section}-${chunk.documentIndex}-${chunk.content}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueResults.push(chunk);
    }
  }

  return uniqueResults;
}

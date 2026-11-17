export function createChunks(documents, maxChunkLength = 1000) {
  const chunks = [];
  documents.forEach((document, documentIndex) => {
    const words = document.content.split(/\s+/).filter(Boolean);
    let currentChunk = "";
    words.forEach((word) => {
      const nextChunk = currentChunk ? `${currentChunk} ${word}` : word;
      if (nextChunk.length > maxChunkLength && currentChunk) {
        chunks.push({
          section: document.section,
          documentIndex,
          content: currentChunk,
        });
        currentChunk = word;
      } else {
        currentChunk = nextChunk;
      }
    });
    if (currentChunk) {
      chunks.push({
        section: document.section,
        documentIndex,
        content: currentChunk,
      });
    }
  });
  return chunks;
}

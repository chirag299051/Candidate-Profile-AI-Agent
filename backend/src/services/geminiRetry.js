export async function withGeminiRetry(operation, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Gemini request attempt ${attempt + 1}/${maxRetries + 1}`);
      return await operation();
    } catch (error) {
      const status = Number(error.status || error.code);
      const retryable = [429, 500, 502, 503, 504].includes(status);
      if (!retryable || attempt === maxRetries) {
        throw error;
      }
      const delay = 2000 * Math.pow(2, attempt);
      console.log(`Gemini error ${status}: ${error.message}`);
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

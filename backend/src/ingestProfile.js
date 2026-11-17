import "dotenv/config";
import { connectDatabase, closeDatabase } from "./config/database.js";
import { ingestCandidateProfile } from "./services/ingestionService.js";
async function main() {
  try {
    await connectDatabase();
    await ingestCandidateProfile();
  } catch (error) {
    console.error("Profile ingestion failed:", error);
  } finally {
    await closeDatabase();
  }
}
main();

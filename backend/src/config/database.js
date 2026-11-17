import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export async function connectDatabase() {
  try {
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME);
    await db.command({ ping: 1 });
    console.log("MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error("Database is not connected");
  }
  return db;
}

export async function closeDatabase() {
  await client.close();
}

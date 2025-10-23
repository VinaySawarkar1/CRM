import { MongoClient, Db } from 'mongodb';
import { config } from './config';

// MongoDB connection configuration
const MONGODB_URI = config.MONGODB_URI;
const DB_NAME = config.DB_NAME;

let client: MongoClient;
let db: Db;

export async function connectToMongoDB(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    // Replace the password placeholder with actual password
    const uri = MONGODB_URI.replace('<db_password>', config.MONGODB_PASSWORD);
    
    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
    
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

export function getDatabase(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToMongoDB() first.');
  }
  return db;
}

export function getClient(): MongoClient {
  if (!client) {
    throw new Error('MongoDB client not connected. Call connectToMongoDB() first.');
  }
  return client;
}

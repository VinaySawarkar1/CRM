import { JSONFileStorage, IStorage } from './storage';
import { MongoDBStorage } from './mongodb-storage';
import { config } from './config';

// Environment variable to switch between storage types
const USE_MONGODB = config.USE_MONGODB;

let storage: IStorage;

export async function initializeStorage(): Promise<IStorage> {
  if (USE_MONGODB) {
    console.log('🔗 Initializing MongoDB storage...');
    const mongoStorage = new MongoDBStorage();
    await mongoStorage.initialize();
    storage = mongoStorage;
    console.log('✅ MongoDB storage initialized');
  } else {
    console.log('📁 Initializing JSON file storage...');
    storage = new JSONFileStorage();
    console.log('✅ JSON file storage initialized');
  }
  
  return storage;
}

export function getStorage(): IStorage {
  if (!storage) {
    throw new Error('Storage not initialized. Call initializeStorage() first.');
  }
  return storage;
}

// MongoDB Configuration
export const config = {
  // Set to true to use MongoDB, false to use JSON file storage
  USE_MONGODB: process.env.USE_MONGODB === 'true' || false,
  
  // MongoDB connection settings
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://vinay:<db_password>@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD || 'FBKAbt5g5DhxFK3',
  DB_NAME: 'business_ai',
  
  // Server settings
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '127.0.0.1',
  
  // Session settings
  SESSION_SECRET: process.env.SESSION_SECRET || 'business-ai-app-secret',
};

// Instructions for MongoDB setup:
// 1. Replace 'your_actual_password_here' with your actual MongoDB password
// 2. Set USE_MONGODB=true to enable MongoDB storage
// 3. Set USE_MONGODB=false to use JSON file storage (default)

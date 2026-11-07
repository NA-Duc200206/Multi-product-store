import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/nova_commerce';
    
    try {
      console.log(`⏳ Connecting to local MongoDB: ${connStr}`);
      // Use short timeout so fallback triggers quickly
      await mongoose.connect(connStr, { serverSelectionTimeoutMS: 2000 });
      console.log('✔ MongoDB connected successfully.');
    } catch (localErr: any) {
      console.warn('⚠️ Local MongoDB not available. Starting MongoMemoryServer fallback...');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      console.log(`⏳ Connecting to in-memory MongoDB: ${uri}`);
      await mongoose.connect(uri);
      console.log('✔ In-memory MongoDB connected successfully.');
    }
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

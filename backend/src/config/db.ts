import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/nova_commerce';
    const isRemote = connStr.startsWith('mongodb+srv://') || Boolean(process.env.MONGODB_URI);
    const timeoutMs = isRemote ? 10000 : 2000;

    try {
      console.log(`⏳ Connecting to MongoDB...`);
      await mongoose.connect(connStr, { serverSelectionTimeoutMS: timeoutMs });
      console.log('✔ MongoDB connected successfully.');
    } catch (localErr: any) {
      console.warn(`⚠️ Primary MongoDB connection failed (${localErr?.message || 'unknown error'}). Starting MongoMemoryServer fallback (data will NOT persist across restarts)...`);
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

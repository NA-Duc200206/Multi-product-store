import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 2000,
    reconnectStrategy: (retries) => {
      // Limit retries to 3 so it doesn't hang the startup sequence
      if (retries > 2) return false;
      return 500;
    }
  }
});

redisClient.on('error', (err) => {
  // Silence warnings to avoid spamming the console
});

export const connectRedis = async (): Promise<void> => {
  try {
    console.log('⏳ Connecting to Redis...');
    await redisClient.connect();
    console.log('✔ Connected to Redis.');
  } catch (err: any) {
    console.warn('⚠️ Redis connection failed. Caching will be disabled/mocked.');
  }
};

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'socket.io';

import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { seedDatabase } from './config/seed';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routing
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler
app.use(errorHandler);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to GlowStore Enterprise TS API Server', status: 'Running' });
});

// Setup HTTP Server & Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('⚡ Socket disconnected:', socket.id);
  });
});

// Expose Socket.io instance for other services
export { io };

// Boot Server
const bootServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    await seedDatabase();
    
    server.listen(PORT, () => {
      console.log(`✔ Server is running on http://localhost:${PORT}`);
    });
  } catch (err: any) {
    console.error('❌ Failed to boot server:', err.message);
  }
};

bootServer();
export default app;

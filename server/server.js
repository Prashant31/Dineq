import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import 'dotenv/config';

import { Server } from 'socket.io';
import restaurantRoutes from './routes/restaurant.js';
import queueRoutes from './routes/queue.js';
import menuRoutes from './routes/menu.js';
import ordersRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Customer joins their personal room using queue token
  socket.on('join-customer-room', (queueToken) => {
    if (queueToken) {
      socket.join(queueToken);
      console.log(`Client joined room: ${queueToken}`);
    }
  });

  // Admin joins admin room
  socket.on('join-admin-room', () => {
    socket.join('admin');
    console.log('Admin joined admin room');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

export { io };

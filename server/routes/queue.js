import express from 'express';
import {
  joinQueue,
  getQueueStatus,
  getFullQueue,
  seatCustomer,
  removeCustomer,
} from '../controllers/queueController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/join', joinQueue);
router.get('/status/:token', getQueueStatus);

// Admin routes (protected)
router.get('/admin/all', authenticateToken, getFullQueue);
router.patch('/admin/:id/seat', authenticateToken, seatCustomer);
router.delete('/admin/:id', authenticateToken, removeCustomer);

export default router;

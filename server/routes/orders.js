import express from 'express';
import {
  placeOrder,
  getOrders,
  updateOrderStatus,
} from '../controllers/ordersController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public route (customer places pre-order)
router.post('/', placeOrder);

// Admin routes (protected)
router.get('/admin', authenticateToken, getOrders);
router.patch('/:id/status', authenticateToken, updateOrderStatus);

export default router;

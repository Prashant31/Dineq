import express from 'express';
import {
  getMenu,
  getAllMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getMenu);

// Admin routes (protected)
router.get('/admin/all', authenticateToken, getAllMenuItems);
router.post('/', authenticateToken, addMenuItem);
router.patch('/:id', authenticateToken, updateMenuItem);
router.delete('/:id', authenticateToken, deleteMenuItem);

export default router;

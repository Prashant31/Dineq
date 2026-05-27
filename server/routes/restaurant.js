import express from 'express';
import { getRestaurantInfo } from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/', getRestaurantInfo);

export default router;

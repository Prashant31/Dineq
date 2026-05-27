import { PrismaClient } from '@prisma/client';
import { predictWaitTime } from '../services/aiService.js';

const prisma = new PrismaClient();

export const getRestaurantInfo = async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findFirst();
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const queueLength = await prisma.customer.count({ where: { status: 'WAITING' } });
    const prediction = await predictWaitTime();

    res.json({
      success: true,
      data: {
        ...restaurant,
        is_open: restaurant.isOpen,
        open_time: restaurant.openTime,
        close_time: restaurant.closeTime,
        total_tables: restaurant.totalTables,
        queueLength,
        prediction,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
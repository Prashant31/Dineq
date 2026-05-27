import { PrismaClient } from '@prisma/client';
import { invalidateCache } from '../services/aiService.js';

const prisma = new PrismaClient();

export const placeOrder = async (req, res) => {
  try {
    const { queueToken, items } = req.body;
    if (!queueToken || !items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: 'Queue token and items are required' });

    const customer = await prisma.customer.findUnique({ where: { queueToken } });
    if (!customer) return res.status(404).json({ success: false, message: 'Invalid queue token' });

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(i => parseInt(i.menuItemId)) } },
    });

    let totalAmount = 0;
    const orderItemsData = items.map(item => {
      const menuItem = menuItems.find(m => m.id === parseInt(item.menuItemId));
      totalAmount += menuItem.price * item.quantity;
      return { menuItemId: menuItem.id, quantity: item.quantity, price: menuItem.price };
    });

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        totalAmount,
        status: 'PENDING',
        items: { create: orderItemsData },
      },
      include: { items: { include: { menuItem: true } } },
    });

    invalidateCache();
    res.status(201).json({ success: true, data: { order }, message: 'Order placed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: { include: { menuItem: true } },
      },
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['PENDING', 'PREPARING', 'READY'].includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { customer: true },
    });

    if (req.io && status === 'READY') {
      req.io.to(order.customer.queueToken).emit('order-ready', { message: 'Your pre-order is ready!', orderId: id });
    }

    res.json({ success: true, data: order, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
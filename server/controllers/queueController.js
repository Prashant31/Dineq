import { PrismaClient } from '@prisma/client';
import { predictWaitTime, invalidateCache } from '../services/aiService.js';

const prisma = new PrismaClient();

const generateQueueToken = () => 'SG-' + Math.floor(Math.random() * 900 + 100).toString().padStart(3, '0');

export const joinQueue = async (req, res) => {
  try {
    const { name, phone, partySize } = req.body;
    if (!name || !phone || !partySize)
      return res.status(400).json({ success: false, message: 'Name, phone, and party size are required' });

    const last = await prisma.customer.findFirst({
      where: { status: 'WAITING' },
      orderBy: { position: 'desc' },
    });
    const nextPosition = (last?.position || 0) + 1;

    let queueToken = generateQueueToken();
    for (let i = 0; i < 10; i++) {
      const existing = await prisma.customer.findUnique({ where: { queueToken } });
      if (!existing) break;
      queueToken = generateQueueToken();
    }

    const customer = await prisma.customer.create({
      data: { name, phone, partySize: parseInt(partySize), queueToken, position: nextPosition, status: 'WAITING' },
    });

    invalidateCache();
    const prediction = await predictWaitTime();
    if (req.io) req.io.emit('queue-updated', { type: 'join', customer, prediction });

    res.status(201).json({ success: true, data: { customer, prediction }, message: 'Joined queue successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getQueueStatus = async (req, res) => {
  try {
    const { token } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { queueToken: token },
      include: { orders: true },
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Invalid queue token' });

    const prediction = await predictWaitTime();
    res.json({ success: true, data: { customer, prediction } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFullQueue = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { status: 'WAITING' },
      orderBy: { position: 'asc' },
      include: { orders: true },
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const seatCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    if (customer.status !== 'WAITING') return res.status(400).json({ success: false, message: 'Customer is not in queue' });

    await prisma.customer.update({ where: { id: parseInt(id) }, data: { status: 'SEATED' } });

    const behind = await prisma.customer.findMany({
      where: { status: 'WAITING', position: { gt: customer.position } },
    });
    await Promise.all(behind.map(c =>
      prisma.customer.update({ where: { id: c.id }, data: { position: c.position - 1 } })
    ));

    invalidateCache();
    const prediction = await predictWaitTime();

    if (req.io) {
      req.io.to(customer.queueToken).emit('table-ready', { message: 'Your table is ready! Please proceed to the host.' });
      req.io.emit('queue-updated', { type: 'seat', customerId: id, prediction });
    }

    res.json({ success: true, data: { prediction }, message: 'Customer seated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const removeCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    await prisma.customer.update({ where: { id: parseInt(id) }, data: { status: 'CANCELLED' } });

    const behind = await prisma.customer.findMany({
      where: { status: 'WAITING', position: { gt: customer.position } },
    });
    await Promise.all(behind.map(c =>
      prisma.customer.update({ where: { id: c.id }, data: { position: c.position - 1 } })
    ));

    invalidateCache();
    const prediction = await predictWaitTime();

    if (req.io) {
      req.io.to(customer.queueToken).emit('queue-cancelled', { message: 'Your queue entry has been cancelled.' });
      req.io.emit('queue-updated', { type: 'remove', customerId: id, prediction });
    }

    res.json({ success: true, data: { prediction }, message: 'Customer removed from queue' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
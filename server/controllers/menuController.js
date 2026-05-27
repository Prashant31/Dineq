import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMenu = async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllMenuItems = async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const addMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    if (!name || !description || !price || !category)
      return res.status(400).json({ success: false, message: 'Name, description, price, and category are required' });

    const item = await prisma.menuItem.create({
      data: { name, description, price: parseFloat(price), category, isAvailable: isAvailable ?? true },
    });
    res.status(201).json({ success: true, data: item, message: 'Menu item added' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, isAvailable } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (category !== undefined) data.category = category;
    if (isAvailable !== undefined) data.isAvailable = isAvailable;

    const item = await prisma.menuItem.update({ where: { id: parseInt(id) }, data });
    res.json({ success: true, data: item, message: 'Menu item updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
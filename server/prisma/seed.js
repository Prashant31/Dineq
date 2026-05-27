import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve('../.env') });
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('Starting seed process...\n');

  try {
    // Create restaurant
    const existingRestaurant = await prisma.restaurant.findFirst();
    if (!existingRestaurant) {
      await prisma.restaurant.create({
        data: {
          name: 'Spice Garden',
          description: 'Authentic Indian cuisine with rich flavors and aromatic spices.',
          openTime: '11:00 AM',
          closeTime: '11:00 PM',
          totalTables: 10,
          isOpen: true,
        },
      });
      console.log('Restaurant created successfully');
    } else {
      console.log('Restaurant already exists');
    }

    // Create admin
    const existingAdmin = await prisma.admin.findFirst({
      where: { email: 'admin@spicegarden.com' },
    });
    if (!existingAdmin) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      await prisma.admin.create({
        data: {
          email: 'admin@spicegarden.com',
          passwordHash,
        },
      });
      console.log('Admin created successfully');
    } else {
      console.log('Admin already exists');
    }

    // Create menu items
    const existingMenu = await prisma.menuItem.findFirst();
    if (!existingMenu) {
      await prisma.menuItem.createMany({
        data: [
          { name: 'Samosa', description: 'Crispy pastry filled with spiced potatoes and peas', price: 120, category: 'Starters', isAvailable: true },
          { name: 'Paneer Tikka', description: 'Cottage cheese marinated in spices and grilled', price: 280, category: 'Starters', isAvailable: true },
          { name: 'Chicken Tikka', description: 'Tender chicken marinated in yogurt and spices', price: 320, category: 'Starters', isAvailable: true },
          { name: 'Veg Spring Roll', description: 'Crispy rolls filled with fresh vegetables', price: 150, category: 'Starters', isAvailable: true },
          { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 380, category: 'Mains', isAvailable: true },
          { name: 'Paneer Butter Masala', description: 'Cottage cheese in rich creamy tomato gravy', price: 320, category: 'Mains', isAvailable: true },
          { name: 'Dal Makhani', description: 'Black lentils slow-cooked with butter and cream', price: 260, category: 'Mains', isAvailable: true },
          { name: 'Biryani', description: 'Fragrant basmati rice with spiced meat and vegetables', price: 350, category: 'Mains', isAvailable: true },
          { name: 'Gulab Jamun', description: 'Soft milk dumplings in rose-flavored sugar syrup', price: 120, category: 'Desserts', isAvailable: true },
          { name: 'Kulfi', description: 'Traditional Indian ice cream with pistachios', price: 150, category: 'Desserts', isAvailable: true },
        ],
      });
      console.log('10 menu items created successfully');
    } else {
      console.log('Menu items already exist');
    }

    console.log('\nSeed completed successfully!');
    console.log('Login: admin@spicegarden.com / admin123');

  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
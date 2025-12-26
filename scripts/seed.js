/**
 * Database Seeder
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../src/models/User');
const Company = require('../src/models/Company');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erp_db');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (optional - be careful in production)
    // await User.deleteMany({});
    // await Company.deleteMany({});

    console.log('Seeding data...');

    // Create default company
    const company = await Company.create({
      name: 'Demo Company Ltd.',
      email: 'info@democompany.com',
      phone: '+8801712345678',
      address: {
        street: '123 Main Street',
        city: 'Dhaka',
        state: 'Dhaka',
        zipCode: '1200',
        country: 'Bangladesh',
      },
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
    });

    console.log('Company created:', company.name);

    // Create super admin user
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@erp.com',
      password: 'Admin@123',
      role: 'super_admin',
      companyId: company._id,
      phone: '+8801712345678',
      isActive: true,
    });

    console.log('Super Admin created:', superAdmin.email);
    console.log('Password: Admin@123');

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeder
seedData();


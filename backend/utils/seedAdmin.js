require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const existingAdmin = await User.findOne({ email: 'admin@examguard.com' });
    if (existingAdmin) {
      console.log('Admin account already exists');
      process.exit(0);
    }

    const admin = new User({
      name: 'Admin',
      email: 'admin@examguard.com',
      passwordHash: 'Admin@1234',
      role: 'admin',
    });

    await admin.save();
    console.log('Admin account created: admin@examguard.com / Admin@1234');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();

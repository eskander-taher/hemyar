// seed-admin.js — Simple script to create a default admin user
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@library.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@library.com',
      password: 'admin123', // Will be hashed automatically
      role: 'super_admin',
      permissions: ['manage_authors', 'manage_books', 'manage_borrows', 'manage_admins', 'view_reports'],
      isActive: true
    });

    await admin.save();
    console.log('✅ Default admin created successfully!');
    console.log('📧 Email: admin@library.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();

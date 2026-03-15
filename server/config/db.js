// config/db.js — MongoDB connection using Mongoose ORM
const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas using the connection string from .env
 * Mongoose acts as our ORM (Object-Relational Mapping) layer,
 * mapping MongoDB documents to JavaScript objects (Models).
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

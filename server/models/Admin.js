// models/Admin.js — Admin entity (Table 4)
// Represents an administrator user in the library system.
// Independent entity with no dependencies on other schemas.
const mongoose = require('mongoose');

/**
 * Admin Schema
 * Fields: username (string, required, unique), email (string, required, unique),
 *         role (enum), permissions (array), isActive (boolean)
 * Timestamps are auto-generated (createdAt, updatedAt)
 */
const adminSchema = new mongoose.Schema({
  // Username — required field, must be unique
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  // Email address — required field, must be unique
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  // Role of the admin in the system
  role: {
    type: String,
    enum: ['super_admin', 'librarian', 'assistant'],
    default: 'assistant',
  },
  // Array of permissions for the admin
  permissions: {
    type: [String],
    enum: ['manage_authors', 'manage_books', 'manage_borrows', 'manage_admins', 'view_reports'],
    default: ['manage_books'],
  },
  // Whether the admin account is currently active
  isActive: {
    type: Boolean,
    default: true,
  },
  // Last login timestamp
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Admin', adminSchema);

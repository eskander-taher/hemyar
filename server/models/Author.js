// models/Author.js — Author entity (Table 1)
// Represents a book author in the library system.
// Has a one-to-many relationship with Book (one author can write many books).
const mongoose = require('mongoose');

/**
 * Author Schema
 * Fields: name (string, required), country (string), birthYear (number)
 * Timestamps are auto-generated (createdAt, updatedAt)
 */
const authorSchema = new mongoose.Schema({
  // Full name of the author — required field, must be unique
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    unique: true,
  },
  // Country of origin
  country: {
    type: String,
    trim: true,
    default: 'Unknown',
  },
  // Year of birth
  birthYear: {
    type: Number,
    min: 0,
    max: new Date().getFullYear(),
  },
}, {
  timestamps: true, // adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Author', authorSchema);

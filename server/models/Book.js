// models/Book.js — Book entity (Table 2)
// Represents a book in the library. Has a Foreign Key relationship
// to Author (many-to-one) and is referenced by BorrowRecord (one-to-many).
const mongoose = require('mongoose');

/**
 * Book Schema
 * Fields: title, isbn, genre, year, pages, available, author (FK -> Author)
 * The 'author' field is a Foreign Key (ObjectId reference) to the Author collection.
 */
const bookSchema = new mongoose.Schema({
  // Book title — required
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
  },
  // ISBN number — unique identifier for the book
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
  },
  // Genre/category of the book
  genre: {
    type: String,
    enum: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Technology', 'Art', 'Other'],
    default: 'Other',
  },
  // Publication year
  year: {
    type: Number,
    required: true,
  },
  // Number of pages
  pages: {
    type: Number,
    min: 1,
  },
  // Whether the book is currently available for borrowing
  available: {
    type: Boolean,
    default: true,
  },
  // Foreign Key — reference to the Author who wrote this book
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author', // references the Author model
    required: [true, 'Author reference is required'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Book', bookSchema);

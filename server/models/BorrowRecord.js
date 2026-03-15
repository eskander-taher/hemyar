// models/BorrowRecord.js — Borrow Record entity (Table 3)
// Tracks which books have been borrowed and by whom.
// Has Foreign Key relationships to Book (many-to-one).
// This entity demonstrates a real-world business operation:
// when a book is borrowed, its 'available' status changes.
const mongoose = require('mongoose');

/**
 * BorrowRecord Schema
 * Fields: borrowerName, borrowerEmail, book (FK -> Book),
 *         borrowDate, returnDate, status
 * Business logic: borrowing a book sets book.available = false,
 *                 returning sets it back to true.
 */
const borrowRecordSchema = new mongoose.Schema({
  // Name of the person borrowing the book
  borrowerName: {
    type: String,
    required: [true, 'Borrower name is required'],
    trim: true,
  },
  // Email of the borrower
  borrowerEmail: {
    type: String,
    required: [true, 'Borrower email is required'],
    trim: true,
    lowercase: true,
  },
  // Foreign Key — reference to the borrowed Book
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', // references the Book model
    required: [true, 'Book reference is required'],
  },
  // Date the book was borrowed
  borrowDate: {
    type: Date,
    default: Date.now,
  },
  // Date the book was returned (null if still borrowed)
  returnDate: {
    type: Date,
    default: null,
  },
  // Current status of the borrow record
  status: {
    type: String,
    enum: ['active', 'returned'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);

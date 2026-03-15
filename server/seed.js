// seed.js — Populates the database with test records (Lab 2 requirement)
// Run with: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Author = require('./models/Author');
const Book = require('./models/Book');
const BorrowRecord = require('./models/BorrowRecord');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Author.deleteMany({});
    await Book.deleteMany({});
    await BorrowRecord.deleteMany({});
    console.log('Cleared existing data');

    // Create authors
    const authors = await Author.insertMany([
      { name: 'George Orwell', country: 'United Kingdom', birthYear: 1903 },
      { name: 'Isaac Asimov', country: 'Russia', birthYear: 1920 },
      { name: 'Agatha Christie', country: 'United Kingdom', birthYear: 1890 },
      { name: 'Haruki Murakami', country: 'Japan', birthYear: 1949 },
    ]);
    console.log(`Created ${authors.length} authors`);

    // Create books (with FK references to authors)
    const books = await Book.insertMany([
      { title: '1984', isbn: '978-0451524935', genre: 'Fiction', year: 1949, pages: 328, author: authors[0]._id },
      { title: 'Animal Farm', isbn: '978-0451526342', genre: 'Fiction', year: 1945, pages: 112, author: authors[0]._id },
      { title: 'Foundation', isbn: '978-0553293357', genre: 'Science', year: 1951, pages: 244, author: authors[1]._id },
      { title: 'I, Robot', isbn: '978-0553294385', genre: 'Science', year: 1950, pages: 224, author: authors[1]._id },
      { title: 'Murder on the Orient Express', isbn: '978-0062693662', genre: 'Fiction', year: 1934, pages: 274, author: authors[2]._id },
      { title: 'Norwegian Wood', isbn: '978-0375704024', genre: 'Fiction', year: 1987, pages: 296, author: authors[3]._id },
    ]);
    console.log(`Created ${books.length} books`);

    // Create some borrow records (business logic: mark books as unavailable)
    const borrows = await BorrowRecord.insertMany([
      { borrowerName: 'Alice Johnson', borrowerEmail: 'alice@example.com', book: books[0]._id, status: 'active' },
      { borrowerName: 'Bob Smith', borrowerEmail: 'bob@example.com', book: books[2]._id, status: 'active' },
    ]);

    // Mark borrowed books as unavailable
    await Book.findByIdAndUpdate(books[0]._id, { available: false });
    await Book.findByIdAndUpdate(books[2]._id, { available: false });
    console.log(`Created ${borrows.length} borrow records`);

    console.log('\nSeed completed successfully!');
    console.log('Database summary:');
    console.log(`  Authors: ${await Author.countDocuments()}`);
    console.log(`  Books: ${await Book.countDocuments()}`);
    console.log(`  Borrow Records: ${await BorrowRecord.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();

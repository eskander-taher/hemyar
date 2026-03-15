// tests/api.test.js — Tests for CRUD operations (Lab 2 & Lab 3 requirement)
// Verifies all REST endpoints work correctly using supertest
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Author = require('../models/Author');
const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');

// Connect to test database before running tests
beforeAll(async () => {
  const testUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/book-library-test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testUri);
  }
});

// Clean up after all tests
afterAll(async () => {
  await Author.deleteMany({});
  await Book.deleteMany({});
  await BorrowRecord.deleteMany({});
  await mongoose.connection.close();
});

// Store IDs for use across tests
let authorId, bookId, borrowId;

// ========== AUTHOR CRUD TESTS ==========
describe('Author CRUD Operations', () => {
  test('CREATE - POST /api/authors should create a new author', async () => {
    const res = await request(app)
      .post('/api/authors')
      .send({ name: 'Test Author', country: 'Test Country', birthYear: 1990 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Author');
    expect(res.body.country).toBe('Test Country');
    authorId = res.body._id;
  });

  test('READ - GET /api/authors should return all authors', async () => {
    const res = await request(app).get('/api/authors');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('READ - GET /api/authors/:id should return one author', async () => {
    const res = await request(app).get(`/api/authors/${authorId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Author');
  });

  test('UPDATE - PUT /api/authors/:id should update an author', async () => {
    const res = await request(app)
      .put(`/api/authors/${authorId}`)
      .send({ name: 'Updated Author' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Author');
  });

  test('READ - GET /api/authors/invalid should return 500', async () => {
    const res = await request(app).get('/api/authors/invalidid');
    expect(res.status).toBe(500);
  });
});

// ========== BOOK CRUD TESTS ==========
describe('Book CRUD Operations', () => {
  test('CREATE - POST /api/books should create a new book', async () => {
    const res = await request(app)
      .post('/api/books')
      .send({
        title: 'Test Book',
        isbn: '978-0000000001',
        genre: 'Fiction',
        year: 2023,
        pages: 200,
        author: authorId,
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Book');
    bookId = res.body._id;
  });

  test('READ - GET /api/books should return all books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('READ - GET /api/books/:id should return one book with author populated', async () => {
    const res = await request(app).get(`/api/books/${bookId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Book');
    expect(res.body.author).toHaveProperty('name');
  });

  test('UPDATE - PUT /api/books/:id should update a book', async () => {
    const res = await request(app)
      .put(`/api/books/${bookId}`)
      .send({ title: 'Updated Book' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Book');
  });
});

// ========== BORROW RECORD CRUD TESTS ==========
describe('BorrowRecord CRUD Operations', () => {
  test('CREATE - POST /api/borrows should borrow a book', async () => {
    const res = await request(app)
      .post('/api/borrows')
      .send({
        borrowerName: 'Test Borrower',
        borrowerEmail: 'test@example.com',
        book: bookId,
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('active');
    borrowId = res.body._id;

    // Verify book is now unavailable (business logic)
    const bookRes = await request(app).get(`/api/books/${bookId}`);
    expect(bookRes.body.available).toBe(false);
  });

  test('CREATE - POST /api/borrows should fail if book is unavailable', async () => {
    const res = await request(app)
      .post('/api/borrows')
      .send({
        borrowerName: 'Another Person',
        borrowerEmail: 'another@example.com',
        book: bookId,
      });
    expect(res.status).toBe(400);
  });

  test('READ - GET /api/borrows should return all records', async () => {
    const res = await request(app).get('/api/borrows');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('RETURN - PATCH /api/borrows/:id/return should return a book', async () => {
    const res = await request(app).patch(`/api/borrows/${borrowId}/return`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('returned');

    // Verify book is available again (business logic)
    const bookRes = await request(app).get(`/api/books/${bookId}`);
    expect(bookRes.body.available).toBe(true);
  });
});

// ========== CLEANUP TESTS ==========
describe('Delete Operations', () => {
  test('DELETE - DELETE /api/borrows/:id should delete a record', async () => {
    const res = await request(app).delete(`/api/borrows/${borrowId}`);
    expect(res.status).toBe(200);
  });

  test('DELETE - DELETE /api/books/:id should delete a book', async () => {
    const res = await request(app).delete(`/api/books/${bookId}`);
    expect(res.status).toBe(200);
  });

  test('DELETE - DELETE /api/authors/:id should delete an author', async () => {
    const res = await request(app).delete(`/api/authors/${authorId}`);
    expect(res.status).toBe(200);
  });
});

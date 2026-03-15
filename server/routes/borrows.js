// routes/borrows.js — RESTful CRUD routes for BorrowRecord entity
// Implements business logic: borrowing sets book.available = false,
// returning sets it back to true. This demonstrates real-world data manipulation.
const express = require('express');
const router = express.Router();
const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');

/**
 * @swagger
 * components:
 *   schemas:
 *     BorrowRecord:
 *       type: object
 *       required:
 *         - borrowerName
 *         - borrowerEmail
 *         - book
 *       properties:
 *         _id:
 *           type: string
 *         borrowerName:
 *           type: string
 *         borrowerEmail:
 *           type: string
 *         book:
 *           type: string
 *           description: Book ObjectId (Foreign Key)
 *         borrowDate:
 *           type: string
 *           format: date-time
 *         returnDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [active, returned]
 */

/**
 * @swagger
 * /api/borrows:
 *   get:
 *     summary: Get all borrow records
 *     tags: [Borrow Records]
 *     responses:
 *       200:
 *         description: List of all borrow records with book details
 */
// READ — Get all borrow records
router.get('/', async (req, res) => {
  try {
    const records = await BorrowRecord.find()
      .populate({ path: 'book', populate: { path: 'author', select: 'name' } })
      .sort({ borrowDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/borrows/{id}:
 *   get:
 *     summary: Get borrow record by ID
 *     tags: [Borrow Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Borrow record found
 *       404:
 *         description: Record not found
 */
// READ — Get single record
router.get('/:id', async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id)
      .populate({ path: 'book', populate: { path: 'author', select: 'name' } });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/borrows:
 *   post:
 *     summary: Borrow a book (creates record and sets book as unavailable)
 *     tags: [Borrow Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - borrowerName
 *               - borrowerEmail
 *               - book
 *             properties:
 *               borrowerName:
 *                 type: string
 *               borrowerEmail:
 *                 type: string
 *               book:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book borrowed successfully
 *       400:
 *         description: Book not available or validation error
 */
// CREATE — Borrow a book (business logic: mark book as unavailable)
router.post('/', async (req, res) => {
  try {
    // Check if the book exists and is available
    const book = await Book.findById(req.body.book);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!book.available) return res.status(400).json({ message: 'Book is not available for borrowing' });

    // Create the borrow record
    const record = new BorrowRecord(req.body);
    const saved = await record.save();

    // Business logic: set the book as unavailable
    book.available = false;
    await book.save();

    const populated = await saved.populate({
      path: 'book', populate: { path: 'author', select: 'name' }
    });
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/borrows/{id}:
 *   put:
 *     summary: Update a borrow record
 *     tags: [Borrow Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record updated
 */
// UPDATE — Modify a borrow record
router.put('/:id', async (req, res) => {
  try {
    const record = await BorrowRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate({ path: 'book', populate: { path: 'author', select: 'name' } });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/borrows/{id}/return:
 *   patch:
 *     summary: Return a borrowed book
 *     tags: [Borrow Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book returned successfully
 */
// SPECIAL — Return a book (business logic: mark book available again)
router.patch('/:id/return', async (req, res) => {
  try {
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    if (record.status === 'returned') return res.status(400).json({ message: 'Book already returned' });

    // Update the borrow record
    record.status = 'returned';
    record.returnDate = new Date();
    await record.save();

    // Business logic: set the book as available again
    await Book.findByIdAndUpdate(record.book, { available: true });

    const populated = await record.populate({
      path: 'book', populate: { path: 'author', select: 'name' }
    });
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/borrows/{id}:
 *   delete:
 *     summary: Delete a borrow record
 *     tags: [Borrow Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted
 */
// DELETE — Remove a borrow record
router.delete('/:id', async (req, res) => {
  try {
    const record = await BorrowRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    // If the record was active, make the book available again
    if (record.status === 'active') {
      await Book.findByIdAndUpdate(record.book, { available: true });
    }
    res.json({ message: 'Borrow record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

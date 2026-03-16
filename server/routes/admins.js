// routes/admins.js — RESTful CRUD routes for Admin entity
// Implements: GET (list/detail), POST (create), PUT (update), DELETE (delete)
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - username
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         username:
 *           type: string
 *           description: Unique username for the admin
 *         email:
 *           type: string
 *           description: Unique email address
 *         role:
 *           type: string
 *           enum: [super_admin, librarian, assistant]
 *           description: Role of the admin in the system
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of permissions assigned to the admin
 *         isActive:
 *           type: boolean
 *           description: Whether the admin account is active
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 */

/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admins]
 *     responses:
 *       200:
 *         description: List of all admins
 */
// READ — Get all admins
router.get('/', async (req, res) => {
  try {
    const admins = await Admin.find().sort({ username: 1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin found
 *       404:
 *         description: Admin not found
 */
// READ — Get single admin by ID
router.get('/:id', async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/admins:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Validation error
 */
// CREATE — Add a new admin
router.post('/', async (req, res) => {
  try {
    const admin = new Admin(req.body);
    const saved = await admin.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/admins/{id}:
 *   put:
 *     summary: Update an admin
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       200:
 *         description: Admin updated
 *       404:
 *         description: Admin not found
 */
// UPDATE — Modify an existing admin
router.put('/:id', async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/admins/{id}:
 *   delete:
 *     summary: Delete an admin
 *     tags: [Admins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin deleted
 *       404:
 *         description: Admin not found
 */
// DELETE — Remove an admin
router.delete('/:id', async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

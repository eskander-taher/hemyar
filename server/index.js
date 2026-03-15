// index.js — Main entry point for the Book Library RESTful API
// This server implements a REST API following the OpenAPI specification.
// It uses Express.js as the web framework and Mongoose as the ORM for MongoDB.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');

// Import route modules
const authorRoutes = require('./routes/authors');
const bookRoutes = require('./routes/books');
const borrowRoutes = require('./routes/borrows');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());                    // Enable CORS for client-server communication
app.use(express.json());            // Parse JSON request bodies

// --- Swagger/OpenAPI Documentation (Lab 3 requirement) ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Library API',
      version: '1.0.0',
      description: 'RESTful API for the Book Library Management System. ' +
        'Supports full CRUD operations on Authors, Books, and Borrow Records.',
      contact: { name: 'Student', email: 'student@university.edu' },
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Development server' }],
  },
  apis: ['./routes/*.js'], // scan route files for JSDoc annotations
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- API Routes ---
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrows', borrowRoutes);

// --- Health check endpoint ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Root route ---
app.get('/', (req, res) => {
  res.json({
    message: 'Book Library API',
    docs: '/api-docs',
    endpoints: {
      authors: '/api/authors',
      books: '/api/books',
      borrows: '/api/borrows',
    },
  });
});

// --- Start server ---
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Docs: http://localhost:${PORT}/api-docs`);
  });
};

// Only start if not in test mode (tests manage their own server)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export for testing
module.exports = app;

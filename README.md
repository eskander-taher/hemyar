# Book Library Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing a library of books, authors, and borrowing records.

## Project Structure

```
book-library/
├── server/                  # Backend (Express + Mongoose)
│   ├── config/db.js         # Database connection
│   ├── models/              # Mongoose models (ORM entities)
│   │   ├── Author.js        # Entity 1: Authors
│   │   ├── Book.js          # Entity 2: Books (FK -> Author)
│   │   └── BorrowRecord.js  # Entity 3: Borrow Records (FK -> Book)
│   ├── routes/              # REST API routes (CRUD)
│   │   ├── authors.js       # /api/authors
│   │   ├── books.js         # /api/books
│   │   └── borrows.js       # /api/borrows
│   ├── tests/api.test.js    # Jest + Supertest unit tests
│   ├── seed.js              # Database seeder script
│   ├── index.js             # Main server entry point + Swagger
│   └── package.json
├── client/                  # Frontend (React)
│   ├── src/
│   │   ├── App.js           # Main UI component (CRUD interface)
│   │   ├── App.css          # Styles
│   │   └── services/api.js  # Axios API service layer
│   └── package.json
├── loadtest/
│   └── locustfile.py        # Locust load testing script
└── README.md
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Database | MongoDB Atlas (cloud) |
| ORM | Mongoose 7.x |
| Backend | Node.js + Express.js 4.x |
| Frontend | React 18 |
| API Docs | Swagger UI (OpenAPI 3.0) |
| Testing | Jest + Supertest |
| Load Testing | Locust (Python) |

## Database Design

### Entities (3 tables):

1. **Author** — stores author information (name, country, birthYear)
2. **Book** — stores book data with a **Foreign Key** to Author
3. **BorrowRecord** — tracks borrowing with a **Foreign Key** to Book

### ER Diagram:

```
┌──────────────┐       ┌──────────────────┐       ┌───────────────────┐
│   Author     │       │     Book         │       │  BorrowRecord     │
├──────────────┤       ├──────────────────┤       ├───────────────────┤
│ _id (PK)     │◄──┐   │ _id (PK)         │◄──┐   │ _id (PK)          │
│ name         │   └───│ author (FK)      │   └───│ book (FK)         │
│ country      │       │ title            │       │ borrowerName      │
│ birthYear    │       │ isbn             │       │ borrowerEmail     │
│ createdAt    │       │ genre            │       │ borrowDate        │
│ updatedAt    │       │ year             │       │ returnDate        │
└──────────────┘       │ pages            │       │ status            │
                       │ available        │       │ createdAt         │
                       │ createdAt        │       │ updatedAt         │
                       │ updatedAt        │       └───────────────────┘
                       └──────────────────┘
```

**Relationships:**
- Author (1) ──► (N) Book — One author can write many books
- Book (1) ──► (N) BorrowRecord — One book can have many borrow records

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/authors | List all authors |
| GET | /api/authors/:id | Get author by ID |
| POST | /api/authors | Create new author |
| PUT | /api/authors/:id | Update author |
| DELETE | /api/authors/:id | Delete author |
| GET | /api/books | List all books (with author) |
| GET | /api/books/:id | Get book by ID |
| POST | /api/books | Create new book |
| PUT | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book |
| GET | /api/borrows | List all borrow records |
| GET | /api/borrows/:id | Get borrow record by ID |
| POST | /api/borrows | Borrow a book |
| PUT | /api/borrows/:id | Update borrow record |
| PATCH | /api/borrows/:id/return | Return a borrowed book |
| DELETE | /api/borrows/:id | Delete borrow record |
| GET | /api/health | Health check |
| GET | /api-docs | Swagger API documentation |

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Python 3.8+ (for load testing)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/book-library.git
cd book-library

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env and add your MongoDB Atlas connection string
```

### 3. Seed the database

```bash
cd server
node seed.js
```

### 4. Run the application

```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm start
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- API Docs: http://localhost:5000/api-docs

### 5. Run tests

```bash
cd server
npm test
```

### 6. Load testing

```bash
cd loadtest
pip install locust
locust -f locustfile.py --host=http://localhost:5000
# Open http://localhost:8089 for Locust UI
```

**Test scenarios:**
- **Load test:** 10 users, spawn rate 2/s, duration 60s
- **Volume test:** 50 users, spawn rate 5/s, duration 120s
- **Stress test:** 200 users, spawn rate 20/s, duration 120s

## Deployment on VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone the project
git clone https://github.com/YOUR_USERNAME/book-library.git
cd book-library

# Setup server
cd server
npm install --production
cp .env.example .env
# Edit .env with your MongoDB Atlas URI

# Build client
cd ../client
npm install
npm run build

# Serve client build from Express (optional: add static file serving)
# Or use nginx to serve the client build folder

# Start with PM2 (process manager)
sudo npm install -g pm2
cd ../server
pm2 start index.js --name book-library
pm2 save
pm2 startup
```

## GUI Design Principles (Lab 4-5)

1. **Consistency** — Uniform button styles, colors, and layouts across all tabs
2. **Visibility** — Tab navigation clearly shows current section; status badges show book availability
3. **Feedback** — Toast notifications confirm every CRUD operation (green = success, red = error)
4. **Affordance** — Buttons look clickable; form inputs have clear labels and focus states
5. **Constraint** — Modal dialogs focus user attention; required fields marked with asterisks
6. **Mapping** — Tabs map to entities; table columns map to entity fields logically

## License

MIT — University Project

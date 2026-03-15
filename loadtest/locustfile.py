# locustfile.py — Load testing for Book Library REST API
# Lab 4 requirement: load, volume, and stress testing
# Install: pip install locust
# Run: locust -f locustfile.py --host=http://localhost:5000
#
# Test scenarios:
# 1. LOAD TEST: 10 users, spawn rate 2/s, run 60s
# 2. VOLUME TEST: 50 users, spawn rate 5/s, run 120s
# 3. STRESS TEST: 200 users, spawn rate 20/s, run 120s

from locust import HttpUser, task, between
import json
import random

class BookLibraryUser(HttpUser):
    """
    Simulates a user interacting with the Book Library REST API.
    Tests all CRUD endpoints: Authors, Books, and BorrowRecords.
    """
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks

    def on_start(self):
        """Called when a simulated user starts. Creates test data."""
        # Create a test author
        res = self.client.post("/api/authors", json={
            "name": f"LoadTest Author {random.randint(1, 999999)}",
            "country": "Test Country",
            "birthYear": 1990
        })
        if res.status_code == 201:
            self.author_id = res.json().get("_id")
        else:
            self.author_id = None

        # Create a test book
        if self.author_id:
            res = self.client.post("/api/books", json={
                "title": f"LoadTest Book {random.randint(1, 999999)}",
                "isbn": f"978-{random.randint(1000000000, 9999999999)}",
                "genre": "Technology",
                "year": 2023,
                "pages": 200,
                "author": self.author_id
            })
            if res.status_code == 201:
                self.book_id = res.json().get("_id")
            else:
                self.book_id = None
        else:
            self.book_id = None

    # ========== READ operations (most frequent) ==========
    @task(5)
    def get_all_books(self):
        """GET /api/books — List all books"""
        self.client.get("/api/books")

    @task(3)
    def get_all_authors(self):
        """GET /api/authors — List all authors"""
        self.client.get("/api/authors")

    @task(3)
    def get_all_borrows(self):
        """GET /api/borrows — List all borrow records"""
        self.client.get("/api/borrows")

    @task(2)
    def get_single_book(self):
        """GET /api/books/:id — Get single book"""
        if self.book_id:
            self.client.get(f"/api/books/{self.book_id}")

    @task(2)
    def get_single_author(self):
        """GET /api/authors/:id — Get single author"""
        if self.author_id:
            self.client.get(f"/api/authors/{self.author_id}")

    # ========== WRITE operations ==========
    @task(1)
    def create_and_delete_author(self):
        """POST + DELETE /api/authors — Create then delete an author"""
        res = self.client.post("/api/authors", json={
            "name": f"Temp Author {random.randint(1, 999999)}",
            "country": "Temp",
            "birthYear": 2000
        })
        if res.status_code == 201:
            aid = res.json().get("_id")
            self.client.delete(f"/api/authors/{aid}")

    @task(1)
    def update_author(self):
        """PUT /api/authors/:id — Update an author"""
        if self.author_id:
            self.client.put(f"/api/authors/{self.author_id}", json={
                "country": f"Country-{random.randint(1, 100)}"
            })

    @task(1)
    def borrow_and_return_book(self):
        """POST /api/borrows + PATCH return — Full borrow cycle"""
        if self.book_id:
            res = self.client.post("/api/borrows", json={
                "borrowerName": f"User {random.randint(1, 9999)}",
                "borrowerEmail": f"user{random.randint(1, 9999)}@test.com",
                "book": self.book_id
            })
            if res.status_code == 201:
                borrow_id = res.json().get("_id")
                self.client.patch(f"/api/borrows/{borrow_id}/return")

    # ========== Health check ==========
    @task(1)
    def health_check(self):
        """GET /api/health — Health check endpoint"""
        self.client.get("/api/health")

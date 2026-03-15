// services/api.js — Axios-based API service for communicating with the REST backend
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// ========== Author API ==========
export const authorAPI = {
  getAll:    ()           => api.get('/authors'),
  getById:   (id)         => api.get(`/authors/${id}`),
  create:    (data)       => api.post('/authors', data),
  update:    (id, data)   => api.put(`/authors/${id}`, data),
  delete:    (id)         => api.delete(`/authors/${id}`),
};

// ========== Book API ==========
export const bookAPI = {
  getAll:    ()           => api.get('/books'),
  getById:   (id)         => api.get(`/books/${id}`),
  create:    (data)       => api.post('/books', data),
  update:    (id, data)   => api.put(`/books/${id}`, data),
  delete:    (id)         => api.delete(`/books/${id}`),
};

// ========== Borrow API ==========
export const borrowAPI = {
  getAll:    ()           => api.get('/borrows'),
  getById:   (id)         => api.get(`/borrows/${id}`),
  create:    (data)       => api.post('/borrows', data),
  update:    (id, data)   => api.put(`/borrows/${id}`, data),
  returnBook:(id)         => api.patch(`/borrows/${id}/return`),
  delete:    (id)         => api.delete(`/borrows/${id}`),
};

export default api;

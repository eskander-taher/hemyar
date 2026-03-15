// App.js — Main application component for Book Library client
// Implements the GUI for the client application (Lab 4-5 requirement)
// Follows interface design principles: consistency, visibility, feedback,
// affordance, constraint, and mapping.
import React, { useState, useEffect, useCallback } from 'react';
import { authorAPI, bookAPI, borrowAPI } from './services/api';
import './App.css';

// ========== REUSABLE MODAL COMPONENT ==========
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ========== AUTHOR FORM ==========
function AuthorForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', country: '', birthYear: '' });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit}>
      <label>Name *<input name="name" value={form.name} onChange={handleChange} required /></label>
      <label>Country<input name="country" value={form.country} onChange={handleChange} /></label>
      <label>Birth Year<input name="birthYear" type="number" value={form.birthYear} onChange={handleChange} /></label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ========== BOOK FORM ==========
function BookForm({ initial, authors, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { title: '', isbn: '', genre: 'Other', year: '', pages: '', author: '' });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit}>
      <label>Title *<input name="title" value={form.title} onChange={handleChange} required /></label>
      <label>ISBN *<input name="isbn" value={form.isbn} onChange={handleChange} required /></label>
      <label>Genre
        <select name="genre" value={form.genre} onChange={handleChange}>
          {['Fiction','Non-Fiction','Science','History','Technology','Art','Other'].map(g =>
            <option key={g} value={g}>{g}</option>
          )}
        </select>
      </label>
      <label>Year *<input name="year" type="number" value={form.year} onChange={handleChange} required /></label>
      <label>Pages<input name="pages" type="number" value={form.pages} onChange={handleChange} /></label>
      <label>Author *
        <select name="author" value={form.author} onChange={handleChange} required>
          <option value="">Select author...</option>
          {authors.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ========== BORROW FORM ==========
function BorrowForm({ books, onSubmit, onCancel }) {
  const [form, setForm] = useState({ borrowerName: '', borrowerEmail: '', book: '' });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => { e.preventDefault(); onSubmit(form); };
  const availableBooks = books.filter(b => b.available);

  return (
    <form onSubmit={handleSubmit}>
      <label>Borrower Name *<input name="borrowerName" value={form.borrowerName} onChange={handleChange} required /></label>
      <label>Email *<input name="borrowerEmail" type="email" value={form.borrowerEmail} onChange={handleChange} required /></label>
      <label>Book *
        <select name="book" value={form.book} onChange={handleChange} required>
          <option value="">Select available book...</option>
          {availableBooks.map(b => <option key={b._id} value={b._id}>{b.title}</option>)}
        </select>
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Borrow</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ========== MAIN APP ==========
function App() {
  const [tab, setTab] = useState('books');
  const [authors, setAuthors] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [modal, setModal] = useState(null); // { type, data }
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Show feedback messages
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, bRes, brRes] = await Promise.all([
        authorAPI.getAll(), bookAPI.getAll(), borrowAPI.getAll()
      ]);
      setAuthors(aRes.data);
      setBooks(bRes.data);
      setBorrows(brRes.data);
    } catch (err) {
      showMessage('Failed to load data: ' + err.message, 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ---- CRUD handlers ----
  const handleCreateAuthor = async (data) => {
    try { await authorAPI.create(data); showMessage('Author created!'); setModal(null); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleUpdateAuthor = async (data) => {
    try { await authorAPI.update(data._id, data); showMessage('Author updated!'); setModal(null); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleDeleteAuthor = async (id) => {
    if (!window.confirm('Delete this author?')) return;
    try { await authorAPI.delete(id); showMessage('Author deleted!'); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleCreateBook = async (data) => {
    try { await bookAPI.create(data); showMessage('Book created!'); setModal(null); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleUpdateBook = async (data) => {
    try { await bookAPI.update(data._id, data); showMessage('Book updated!'); setModal(null); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book?')) return;
    try { await bookAPI.delete(id); showMessage('Book deleted!'); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleBorrow = async (data) => {
    try { await borrowAPI.create(data); showMessage('Book borrowed!'); setModal(null); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleReturn = async (id) => {
    try { await borrowAPI.returnBook(id); showMessage('Book returned!'); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleDeleteBorrow = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await borrowAPI.delete(id); showMessage('Record deleted!'); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>Book Library</h1>
        <p>Management System</p>
      </header>

      {/* Feedback message */}
      {message && <div className={`toast toast-${message.type}`}>{message.text}</div>}

      {/* Navigation tabs — GUI design principle: Consistency */}
      <nav className="tabs">
        {['books', 'authors', 'borrows'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {/* Main content area */}
      <main className="content">
        {loading && <div className="loading">Loading...</div>}

        {/* ===== BOOKS TAB ===== */}
        {tab === 'books' && (
          <>
            <div className="toolbar">
              <h2>Books ({books.length})</h2>
              <button className="btn btn-primary" onClick={() => setModal({ type: 'createBook' })}>+ Add Book</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Title</th><th>Author</th><th>Genre</th><th>Year</th><th>Available</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b._id}>
                    <td>{b.title}</td>
                    <td>{b.author?.name || 'Unknown'}</td>
                    <td><span className="badge">{b.genre}</span></td>
                    <td>{b.year}</td>
                    <td><span className={`status ${b.available ? 'available' : 'borrowed'}`}>{b.available ? 'Yes' : 'No'}</span></td>
                    <td className="actions">
                      <button className="btn btn-sm" onClick={() => setModal({ type: 'editBook', data: { ...b, author: b.author?._id } })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBook(b._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ===== AUTHORS TAB ===== */}
        {tab === 'authors' && (
          <>
            <div className="toolbar">
              <h2>Authors ({authors.length})</h2>
              <button className="btn btn-primary" onClick={() => setModal({ type: 'createAuthor' })}>+ Add Author</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Country</th><th>Birth Year</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {authors.map(a => (
                  <tr key={a._id}>
                    <td>{a.name}</td>
                    <td>{a.country}</td>
                    <td>{a.birthYear || '—'}</td>
                    <td className="actions">
                      <button className="btn btn-sm" onClick={() => setModal({ type: 'editAuthor', data: a })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAuthor(a._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* ===== BORROWS TAB ===== */}
        {tab === 'borrows' && (
          <>
            <div className="toolbar">
              <h2>Borrow Records ({borrows.length})</h2>
              <button className="btn btn-primary" onClick={() => setModal({ type: 'createBorrow' })}>+ Borrow Book</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Borrower</th><th>Email</th><th>Book</th><th>Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {borrows.map(br => (
                  <tr key={br._id}>
                    <td>{br.borrowerName}</td>
                    <td>{br.borrowerEmail}</td>
                    <td>{br.book?.title || 'Unknown'}</td>
                    <td>{new Date(br.borrowDate).toLocaleDateString()}</td>
                    <td><span className={`status ${br.status}`}>{br.status}</span></td>
                    <td className="actions">
                      {br.status === 'active' && (
                        <button className="btn btn-sm btn-success" onClick={() => handleReturn(br._id)}>Return</button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBorrow(br._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>

      {/* ===== MODALS ===== */}
      {modal?.type === 'createAuthor' && (
        <Modal title="Add Author" onClose={() => setModal(null)}>
          <AuthorForm onSubmit={handleCreateAuthor} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'editAuthor' && (
        <Modal title="Edit Author" onClose={() => setModal(null)}>
          <AuthorForm initial={modal.data} onSubmit={handleUpdateAuthor} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'createBook' && (
        <Modal title="Add Book" onClose={() => setModal(null)}>
          <BookForm authors={authors} onSubmit={handleCreateBook} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'editBook' && (
        <Modal title="Edit Book" onClose={() => setModal(null)}>
          <BookForm initial={modal.data} authors={authors} onSubmit={handleUpdateBook} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'createBorrow' && (
        <Modal title="Borrow a Book" onClose={() => setModal(null)}>
          <BorrowForm books={books} onSubmit={handleBorrow} onCancel={() => setModal(null)} />
        </Modal>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <p>Book Library Management System &copy; 2024 | <a href="/api-docs" target="_blank" rel="noreferrer">API Docs</a></p>
      </footer>
    </div>
  );
}

export default App;

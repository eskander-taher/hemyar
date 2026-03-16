// App.js — Main application component for Book Library client
// Implements the GUI for the client application (Lab 4-5 requirement)
// Follows interface design principles: consistency, visibility, feedback,
// affordance, constraint, and mapping.
import React, { useState, useEffect, useCallback } from 'react';
import { authorAPI, bookAPI, borrowAPI, adminAPI } from './services/api';
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

// ========== ADMIN FORM ==========
function AdminForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || { 
    username: '', 
    email: '', 
    role: 'assistant', 
    permissions: ['manage_books'], 
    isActive: true 
  });
  const handleChange = e => {
    if (e.target.name === 'permissions') {
      const selectedPermissions = Array.from(e.target.selectedOptions, option => option.value);
      setForm({ ...form, [e.target.name]: selectedPermissions });
    } else if (e.target.type === 'checkbox') {
      setForm({ ...form, [e.target.name]: e.target.checked });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };
  const handleSubmit = e => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit}>
      <label>Username *
        <input name="username" value={form.username} onChange={handleChange} required minLength="3" maxLength="30" />
      </label>
      <label>Email *
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </label>
      <label>Role
        <select name="role" value={form.role} onChange={handleChange}>
          {['assistant', 'librarian', 'super_admin'].map(r =>
            <option key={r} value={r}>{r.replace('_', ' ').charAt(0).toUpperCase() + r.replace('_', ' ').slice(1)}</option>
          )}
        </select>
      </label>
      <label>Permissions
        <select name="permissions" value={form.permissions} onChange={handleChange} multiple size="5">
          {['manage_authors', 'manage_books', 'manage_borrows', 'manage_admins', 'view_reports'].map(p =>
            <option key={p} value={p}>{p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
          )}
        </select>
        <small>Hold Ctrl/Cmd to select multiple</small>
      </label>
      <label className="checkbox-label">
        <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
        Active Account
      </label>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Save</button>
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
  const [admins, setAdmins] = useState([]);
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
      const [aRes, bRes, brRes, adRes] = await Promise.all([
        authorAPI.getAll(), bookAPI.getAll(), borrowAPI.getAll(), adminAPI.getAll()
      ]);
      setAuthors(aRes.data);
      setBooks(bRes.data);
      setBorrows(brRes.data);
      setAdmins(adRes.data);
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
  const handleCreateAdmin = async (data) => {
    try { await adminAPI.create(data); showMessage('Admin created!'); setModal(null); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleUpdateAdmin = async (data) => {
    try { await adminAPI.update(data._id, data); showMessage('Admin updated!'); setModal(null); fetchData(); }
    catch (e) { showMessage(e.response?.data?.message || 'Error', 'error'); }
  };
  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Delete this admin?')) return;
    try { await adminAPI.delete(id); showMessage('Admin deleted!'); fetchData(); }
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
        {['books', 'authors', 'borrows', 'admins'].map(t => (
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

        {/* ===== ADMINS TAB ===== */}
        {tab === 'admins' && (
          <>
            <div className="toolbar">
              <h2>Admins ({admins.length})</h2>
              <button className="btn btn-primary" onClick={() => setModal({ type: 'createAdmin' })}>+ Add Admin</button>
            </div>
            <table className="data-table">
              <thead>
                <tr><th>Username</th><th>Email</th><th>Role</th><th>Permissions</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {admins.map(ad => (
                  <tr key={ad._id}>
                    <td>{ad.username}</td>
                    <td>{ad.email}</td>
                    <td><span className="badge">{ad.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></td>
                    <td>{ad.permissions.join(', ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                    <td><span className={`status ${ad.isActive ? 'available' : 'borrowed'}`}>{ad.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="actions">
                      <button className="btn btn-sm" onClick={() => setModal({ type: 'editAdmin', data: ad })}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteAdmin(ad._id)}>Delete</button>
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
      {modal?.type === 'createAdmin' && (
        <Modal title="Add Admin" onClose={() => setModal(null)}>
          <AdminForm onSubmit={handleCreateAdmin} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'editAdmin' && (
        <Modal title="Edit Admin" onClose={() => setModal(null)}>
          <AdminForm initial={modal.data} onSubmit={handleUpdateAdmin} onCancel={() => setModal(null)} />
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

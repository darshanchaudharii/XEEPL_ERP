// src/pages/Users/UsersPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { fetchUsers, fetchUserById, addUser, editUser, deleteUser, uploadUserPhoto } from '../../../api/users';
import LoadingSpinner from '../../LoadingSpinner';
import ConfirmModal from '../../modals/ConfirmModal';
import ErrorModal from '../../modals/ErrorModal';
import UserProfileUpload from './UserProfileUpload';
import Icon from '../../Icons';
import './UsersPage.css';

const ROLES = ['Admin', 'Customer', 'Staff', 'Supplier', 'Manager']; // from your enum

export default function UsersPage() {
  // list & search
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // form state
  const [form, setForm] = useState({
    id: null,
    name: '',
    username: '',
    password: '',
    mobile: '',
    role: '',
  });
  const fileRef = useRef(null); // hold selected file
  const [previewFile, setPreviewFile] = useState(null);

  // modals
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [errorOpen, setErrorOpen] = useState(false);

  // load users
  const load = async (q = '') => { 
    try {
      setLoading(true);
      const data = await fetchUsers(q);
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || 'Failed to load users');
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // handle search (debounce)
  useEffect(() => {
    const t = setTimeout(() => load(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // form helpers
  const resetForm = () => {
    setForm({ id: null, name: '', username: '', password: '', mobile: '', role: '' });
    fileRef.current = null;
    setPreviewFile(null);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileSelected = (file, preview) => {
    fileRef.current = file;
    setPreviewFile(preview || null);
  };

  const handleEditClick = async (userId) => {
    try {
      setLoading(true);
      const data = await fetchUserById(userId);
      setForm({
        id: data.id,
        name: data.name || '',
        username: data.username || '',
        password: '',
        mobile: data.mobile || '',
        role: data.role || '',
      });
      // optionally set user photo preview if backend returns photo url
      if (data.photo) setPreviewFile(data.photo);
    } catch (e) {
      setErr(e.message || 'Failed to load user');
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = (user) => {
    setToDelete(user);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteUser(toDelete.id);
      setConfirmOpen(false);
      setToDelete(null);
      await load(query);
    } catch (e) {
      setErr(e.message || 'Delete failed');
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic client validation
    if (!form.name.trim() || !form.username.trim()) {
      setErr('Name and Username are required.');
      setErrorOpen(true);
      return;
    }
    try {
      setLoading(true);
      if (form.id) {
        // Edit
        await editUser(form.id, {
          name: form.name,
          username: form.username,
          password: form.password || undefined, // if empty, backend may ignore
          mobile: form.mobile,
          role: form.role,
        });
        // upload photo if chosen
        if (fileRef.current) {
          await uploadUserPhoto(form.id, fileRef.current);
        }
      } else {
        // Add new
        const created = await addUser({
          name: form.name,
          username: form.username,
          password: form.password,
          mobile: form.mobile,
          role: form.role,
        });
        if (fileRef.current && created && created.id) {
          await uploadUserPhoto(created.id, fileRef.current);
        }
      }
      resetForm();
      await load(query);
    } catch (e) {
      setErr(e.message || 'Save failed');
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-page-wrap">
      {loading && <LoadingSpinner />}
      <div className="users-left">
        <div className="panel form-card">
          <h3>{form.id ? 'Edit User' : 'Add User'}</h3>
          <form className="xe-form" onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />

            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />

            <label>Password {form.id ? '(leave blank to keep current)' : ''}</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={form.id ? 'Leave blank to keep current password' : 'Set password'}
            />

            <label>Mobile</label>
            <input
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />

            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange} aria-label="Role">
              <option value="">-- Select role --</option>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <div className="form-actions">
              <button className="btn primary" type="submit">{form.id ? 'Update' : 'Save'}</button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="users-right">
        <div className="panel list-card">
          <div className="list-header">
            <h3>Users</h3>
            <div className="search-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in table..."
                aria-label="Search users"
              />
            </div>
          </div>

          <table className="xe-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Username</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td className="avatar-cell">
                    <img src={u.photo || '/assets/placeholder-avatar.png'} alt={u.name} className="avatar-img" />
                  </td>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>{u.mobile}</td>
                  <td>{u.role}</td>
                  <td>
                    <button className="btn small" onClick={() => handleEditClick(u.id)}>
                      <Icon name="pencil" /> Edit
                    </button>
                  </td>
                  <td>
                    <button className="btn danger small" onClick={() => handleDeleteConfirm(u)}>
                      <Icon name="trash" /> Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="text-center muted">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Photo uploader is displayed next to form in a small card (optional) */}
        <div className="panel photo-card">
          <h4>Profile Photo</h4>
          <UserProfileUpload onFileSelected={(f, preview) => handleFileSelected(f, preview)} />
          <p className="muted">Choose a file and it will be attached when you save.</p>
        </div>
      </div>

      <ConfirmModal
        visible={confirmOpen}
        title="Delete user"
        message={`Delete ${toDelete?.name}? This action cannot be undone.`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

      <ErrorModal visible={errorOpen} message={err} onClose={() => setErrorOpen(false)} />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { userService } from '../../services/userService';
import { USER_ROLES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/usermaster.css';
import '../../styles/modern-table.css';


const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    password: '',
    mobile: '',
    role: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
  const [imageErrors, setImageErrors] = useState(new Set());
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Reset form when component mounts
    setForm({
      fullName: '',
      username: '',
      password: '',
      mobile: '',
      role: ''
    });
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      setImageErrors(new Set()); // Clear image errors when users are fetched
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!search.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = users.filter(user => 
      String(user.id).includes(searchLower) ||
      (user.fullName || '').toLowerCase().includes(searchLower) ||
      (user.username || '').toLowerCase().includes(searchLower) ||
      (user.mobile || '').toLowerCase().includes(searchLower) ||
      (user.role || '').toLowerCase().includes(searchLower)
    );
    setFilteredUsers(filtered);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      username: '',
      password: '',
      mobile: '',
      role: ''
    });
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.username) {
      setError('Please fill in required fields (Name and Username)');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        fullName: form.fullName,
        username: form.username,
        password: form.password,
        mobile: form.mobile,
        role: form.role
      };

      if (editingId) {
        await userService.updateUser(editingId, userData, photoFile);
      } else {
        await userService.createUser(userData, photoFile);
      }

      await fetchUsers();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      fullName: user.fullName,
      username: user.username,
      password: '',
      mobile: user.mobile || '',
      role: user.role || ''
    });
    setPhotoPreview(user.profilePhoto ? `/uploads/${user.profilePhoto}` : null);
    setPhotoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (userId) => {
    setDeleteModal({ isOpen: true, userId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.userId) return;

    setLoading(true);
    setError('');
    try {
      await userService.deleteUser(deleteModal.userId);
      await fetchUsers();
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">User Master</h1>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="master-content">
        <section className="form-card">
          <div className="card-header">
            <i className="fas fa-user-plus"></i>
            {editingId ? 'Edit User' : 'Add User'}
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Username <span className="required">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
                disabled={editingId !== null}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={editingId ? "Leave blank to keep current" : "Set password"}
              />
            </div>

            <div className="form-group">
              <label>Profile Photo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
              />
              {photoPreview && (
                <img src={photoPreview} alt="Preview" className="photo-preview" />
              )}
            </div>

            <div className="form-group">
              <label>Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">-- Select Role --</option>
                {USER_ROLES.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-save" disabled={loading}>
                <i className="fas fa-save"></i>
                {editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" className="btn btn-cancel" onClick={resetForm}>
                <i className="fas fa-times"></i>
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="table-card">
          <div className="table-header">
            <h3>
              <i className="fas fa-users"></i>
              Users
            </h3>
          </div>

          <div className="table-section">
            {/* Search Bar - Flush above table */}
            <div className="table-controls-bar">
              <div className="search-input-wrapper">
                <input
                  className="table-search-input"
                  placeholder="Search in table..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <table className="data-table modern-table">
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
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">No users found</td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          {user.profilePhoto && !imageErrors.has(user.id) ? (
                            <img 
                              src={`/uploads/${user.profilePhoto}`} 
                              alt={user.fullName}
                              className="table-avatar"
                              onError={() => {
                                setImageErrors(prev => new Set(prev).add(user.id));
                              }}
                            />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.fullName?.charAt(0) || '?'}
                            </div>
                          )}
                        </td>
                        <td>{user.fullName}</td>
                        <td>{user.username}</td>
                        <td>{user.mobile}</td>
                        <td><span className="badge">{user.role}</span></td>
                        <td>
                          <div className="row-actions">
                            <button 
                              className="btn btn-xs btn-edit" 
                              onClick={() => handleEdit(user)}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button 
                              className="btn btn-xs btn-delete" 
                              onClick={() => openDeleteModal(user.id)}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </section>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        size="small"
      >
        <p>Are you sure you want to delete this user?</p>
        <div className="modal-actions">
          <button className="btn btn-delete" onClick={handleDelete}>
            <i className="fas fa-trash"></i>
            Delete
          </button>
          <button className="btn btn-cancel" onClick={closeDeleteModal}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default UserMaster;
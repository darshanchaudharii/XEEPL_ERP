import React, { useState, useEffect } from 'react';
import { sectionService } from '../../services/sectionService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/sectionmaster.css';

const SectionMaster = () => {
  const [sections, setSections] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [form, setForm] = useState({ sectionName: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, sectionId: null });

  const filterSections = React.useCallback(() => {
    if (!search.trim()) {
      setFilteredSections(sections);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = sections.filter(section =>
      String(section.id).includes(searchLower) ||
      (section.sectionName || '').toLowerCase().includes(searchLower)
    );
    setFilteredSections(filtered);
  }, [search, sections]);

  const fetchSections = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await sectionService.getAllSections();
      setSections(data);
    } catch (err) {
      setError('Failed to fetch sections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    filterSections();
  }, [filterSections]);

  const handleChange = (e) => {
    setForm({ sectionName: e.target.value });
  };

  const resetForm = () => {
    setForm({ sectionName: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.sectionName.trim()) {
      setError('Section name is required');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await sectionService.updateSection(editingId, form);
      } else {
        await sectionService.createSection(form);
      }
      await fetchSections();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setEditingId(section.id);
    setForm({ sectionName: section.sectionName });
  };

  const openDeleteModal = (sectionId) => {
    setDeleteModal({ isOpen: true, sectionId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, sectionId: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.sectionId) return;

    setLoading(true);
    setError('');
    try {
      await sectionService.deleteSection(deleteModal.sectionId);
      await fetchSections();
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Section Master</h1>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="master-content">
        <section className="form-card">
          <div className="card-header">
            <i className="fas fa-layer-group"></i>
            {editingId ? 'Edit Section' : 'Add Section'}
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Section Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="sectionName"
                value={form.sectionName}
                onChange={handleChange}
                placeholder="Enter Section Name"
                required
              />
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
              <i className="fas fa-list"></i>
              Sections List
            </h3>
            <input
              className="search-input"
              placeholder="Search in table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="table-wrapper">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Section Name</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSections.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="no-data">No sections found</td>
                    </tr>
                  ) : (
                    filteredSections.map(section => (
                      <tr key={section.id}>
                        <td>{section.id}</td>
                        <td>{section.sectionName}</td>
                        <td>
                          <button 
                            className="btn btn-edit" 
                            onClick={() => handleEdit(section)}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                        </td>
                        <td>
                          <button 
                            className="btn btn-delete" 
                            onClick={() => openDeleteModal(section.id)}
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        size="small"
      >
        <p>Are you sure you want to delete this section?</p>
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

export default SectionMaster;
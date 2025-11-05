import React, { useState, useEffect, useRef, useCallback } from 'react';
import { catalogService } from '../../services/catalogService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/catalogmaster.css';

const CatalogMaster = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [filteredCatalogs, setFilteredCatalogs] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, catalogId: null });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  const fetchCatalogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await catalogService.getAllCatalogs();
      setCatalogs(data || []);
    } catch (err) {
      setError('Failed to fetch catalogs: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const filterCatalogs = useCallback(() => {
    if (!search.trim()) {
      setFilteredCatalogs(catalogs);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = catalogs.filter(catalog =>
      String(catalog.id).includes(searchLower) ||
      (catalog.title || '').toLowerCase().includes(searchLower) ||
      (catalog.description || '').toLowerCase().includes(searchLower)
    );
    setFilteredCatalogs(filtered);
  }, [search, catalogs]);

  useEffect(() => {
    filterCatalogs();
  }, [filterCatalogs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: ''
    });
    setFile(null);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description) {
      setError('Title and Description are required');
      return;
    }

    if (!editingId && !file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    try {
      const catalogData = {
        title: form.title,
        description: form.description
      };

      if (editingId) {
        await catalogService.updateCatalog(editingId, catalogData, file);
      } else {
        await catalogService.createCatalog(catalogData, file);
      }

      await fetchCatalogs();
      resetForm();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (catalog) => {
    setEditingId(catalog.id);
    setForm({
      title: catalog.title,
      description: catalog.description
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (catalogId) => {
    setDeleteModal({ isOpen: true, catalogId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, catalogId: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.catalogId) return;

    setLoading(true);
    setError('');
    try {
      await catalogService.deleteCatalog(deleteModal.catalogId);
      await fetchCatalogs();
      closeDeleteModal();
    } catch (err) {
      setError(err.message || 'Failed to delete catalog');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page-container">
      <h1 className="page-title">Catalog Master</h1>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="master-content">
        <section className="form-card catalog-form">
          <div className="card-header">
            <i className="fas fa-book"></i>
            {editingId ? 'Edit Catalog' : 'Add Catalog'}
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter catalog title"
                required
              />
            </div>

            <div className="form-group">
              <label>File</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.zip,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
              <small>Allowed: pdf, docx, zip, xlsx, images. Max 10MB. Leave blank to keep current file.</small>
            </div>

            <div className="form-group">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter description"
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
              Catalogs List
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
                    <th>Title</th>
                    <th>File</th>
                    <th>Description</th>
                    <th>Created On</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCatalogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">No catalogs found</td>
                    </tr>
                  ) : (
                    filteredCatalogs.map(catalog => (
                      <tr key={catalog.id}>
                        <td>{catalog.id}</td>
                        <td>{catalog.title}</td>
                        <td>
                          {/* Prefer direct backend URL if you want browser-native open (works without auth).
                              Use programmatic download (below) if you need to attach auth header or force save. */}
                          <a
                            href={`/api/catalogs/download/files/${catalog.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-download"
                          >
                            <i className="fas fa-download"></i> Download
                          </a>

                          {/* Example for programmatic download (uncomment if you prefer):
                          <button
                            className="btn btn-download"
                            onClick={() => downloadCatalogFile(catalog.id, catalog.fileName)}
                          >
                            <i className="fas fa-download"></i> Download
                          </button>
                          */}
                        </td>
                        <td>{catalog.description}</td>
                        <td>
                          {catalog.createdOn
                            ? new Date(catalog.createdOn).toLocaleDateString()
                            : '—'
                          }
                        </td>
                        <td>
                          <button
                            className="btn btn-edit"
                            onClick={() => handleEdit(catalog)}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-delete"
                            onClick={() => openDeleteModal(catalog.id)}
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
        <p>Are you sure you want to delete this catalog?</p>
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

export default CatalogMaster;

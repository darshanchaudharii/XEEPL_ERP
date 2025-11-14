import React, { useState, useEffect, useRef, useCallback } from 'react';
import { catalogService } from '../../services/catalogService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import { formatDateToYYYYMMDD } from '../../utils/dateFormatter';
import '../../styles/catalogmaster.css';
import '../../styles/modern-table.css';

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
      // Sort catalogs by ID descending (newest first)
      const sortedData = (data || []).sort((a, b) => {
        // Handle both numeric and string IDs
        const idA = typeof a.id === 'number' ? a.id : parseInt(a.id) || 0;
        const idB = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
        return idB - idA;
      });
      setCatalogs(sortedData);
    } catch (err) {
      setError('Failed to fetch catalogs: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const filterCatalogs = useCallback(() => {
    let result = catalogs;
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = catalogs.filter(catalog =>
        String(catalog.id).includes(searchLower) ||
        (catalog.title || '').toLowerCase().includes(searchLower) ||
        (catalog.description || '').toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredCatalogs(result);
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

      // Clear search to show all catalogs including the newly added one
      setSearch('');
      await fetchCatalogs();
      resetForm();
      
      // Scroll to top to see the newly added catalog (which will be first due to sorting)
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                          <button
                            className="btn btn-download"
                            onClick={async () => {
                              try {
                                await catalogService.downloadCatalogFile(catalog);
                              } catch (err) {
                                setError('Failed to download catalog: ' + err.message);
                              }
                            }}
                          >
                            <i className="fas fa-download"></i> Download
                          </button>
                        </td>
                        <td>{catalog.description}</td>
                        <td>
                          {formatDateToYYYYMMDD(catalog.createdOn)}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn btn-xs btn-edit"
                              onClick={() => handleEdit(catalog)}
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
                              onClick={() => openDeleteModal(catalog.id)}
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

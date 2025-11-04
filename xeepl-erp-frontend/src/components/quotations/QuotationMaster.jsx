import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { QUOTATION_STATUS } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/quotationmaster.css';

const QuotationMaster = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [form, setForm] = useState({
    name: '',
    date: '',
    expiryDate: '',
    status: 'DRAFT'
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, quotationId: null });

  const filterQuotations = React.useCallback(() => {
    let filtered = quotations;

    // Text search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(q =>
        String(q.id).includes(searchLower) ||
        (q.name || '').toLowerCase().includes(searchLower) ||
        (q.status || '').toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(q => q.status === statusFilter);
    }

    // Date range filter
    if (dateFromFilter) {
      filtered = filtered.filter(q => q.date >= dateFromFilter);
    }
    if (dateToFilter) {
      filtered = filtered.filter(q => q.date <= dateToFilter);
    }

    setFilteredQuotations(filtered);
  }, [search, statusFilter, dateFromFilter, dateToFilter, quotations]);

  const fetchQuotations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await quotationService.getAllQuotations();
      setQuotations(data);
    } catch (err) {
      setError('Failed to fetch quotations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [filterQuotations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      date: '',
      expiryDate: '',
      status: 'DRAFT'
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.date || !form.expiryDate) {
      setError('Name, Date, and Expiry Date are required');
      return;
    }

    setLoading(true);
    try {
      const quotationData = {
        name: form.name,
        date: form.date,
        expiryDate: form.expiryDate,
        status: form.status,
        items: []
      };

      if (editingId) {
        await quotationService.updateQuotation(editingId, quotationData);
      } else {
        await quotationService.createQuotation(quotationData);
      }

      await fetchQuotations();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quotation) => {
    setEditingId(quotation.id);
    setForm({
      name: quotation.name,
      date: quotation.date,
      expiryDate: quotation.expiryDate,
      status: quotation.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (quotationId) => {
    navigate(`/quotations/${quotationId}`);
  };

  const openDeleteModal = (quotationId) => {
    setDeleteModal({ isOpen: true, quotationId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, quotationId: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.quotationId) return;

    setLoading(true);
    setError('');
    try {
      await quotationService.deleteQuotation(deleteModal.quotationId);
      await fetchQuotations();
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Quotation Master</h1>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="master-content">
        <section className="form-card">
          <div className="card-header">
            <i className="fas fa-file-invoice"></i>
            {editingId ? 'Edit Quotation' : 'Add Quotation'}
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Quotation Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Quotation Name"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Quotation Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Quotation Expiry Date <span className="required">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {QUOTATION_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
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
              <i className="fas fa-list"></i>
              Quotations List
            </h3>
            <div className="header-actions">
              <input
                className="search-input"
                placeholder="Search by name / id / status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="filters-row">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {QUOTATION_STATUS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <input
              type="date"
              placeholder="mm/dd/yyyy"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />

            <input
              type="date"
              placeholder="mm/dd/yyyy"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />

            <button className="btn btn-clear" onClick={clearFilters}>
              <i className="fas fa-times"></i>
              Clear
            </button>
          </div>

          <div className="table-tip">
            <small>
              <i className="fas fa-info-circle"></i>
              Tip: search matches anywhere in the row. Date filters expect YYYY-MM-DD.
            </small>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>View</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">No quotations found</td>
                    </tr>
                  ) : (
                    filteredQuotations.map(quotation => (
                      <tr key={quotation.id}>
                        <td>{quotation.id}</td>
                        <td>{quotation.name}</td>
                        <td>{quotation.date}</td>
                        <td>{quotation.expiryDate}</td>
                        <td>
                          <span className={`badge badge-status-${quotation.status.toLowerCase()}`}>
                            {quotation.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-view" 
                            onClick={() => handleView(quotation.id)}
                          >
                            <i className="fas fa-eye"></i>
                            View
                          </button>
                        </td>
                        <td>
                          <button 
                            className="btn btn-edit" 
                            onClick={() => handleEdit(quotation)}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                        </td>
                        <td>
                          <button 
                            className="btn btn-delete" 
                            onClick={() => openDeleteModal(quotation.id)}
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
        <p>Are you sure you want to delete this quotation?</p>
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

export default QuotationMaster;
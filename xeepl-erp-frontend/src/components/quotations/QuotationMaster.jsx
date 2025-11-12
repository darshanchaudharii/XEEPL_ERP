import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { quotationService } from '../../services/quotationService';
import { QUOTATION_STATUS } from '../../utils/constants';
import { formatDateString } from '../../utils/dateFormatter';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/quotationmaster.css';
import '../../styles/modern-table.css';
import '../../styles/datepicker-custom.css';

const QuotationMaster = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [form, setForm] = useState({
    name: '',
    date: null,
    expiryDate: null,
    status: 'DRAFT'
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState(null);
  const [dateToFilter, setDateToFilter] = useState(null);
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
      const fromDateStr = dateFromFilter.toISOString().split('T')[0];
      filtered = filtered.filter(q => q.date >= fromDateStr);
    }
    if (dateToFilter) {
      const toDateStr = dateToFilter.toISOString().split('T')[0];
      filtered = filtered.filter(q => q.date <= toDateStr);
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

  const handleDateChange = (name, date) => {
    setForm(prev => ({ ...prev, [name]: date }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      date: null,
      expiryDate: null,
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
      // Convert Date objects to YYYY-MM-DD strings for backend
      const quotationData = {
        name: form.name,
        date: form.date.toISOString().split('T')[0],
        expiryDate: form.expiryDate.toISOString().split('T')[0],
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
    // Convert date strings to Date objects for DatePicker
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      // Handle YYYY-MM-DD format from backend
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? null : date;
    };
    setForm({
      name: quotation.name,
      date: parseDate(quotation.date),
      expiryDate: parseDate(quotation.expiryDate),
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
    setDateFromFilter(null);
    setDateToFilter(null);
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
              <DatePicker
                selected={form.date}
                onChange={(date) => handleDateChange('date', date)}
                dateFormat="yyyy/MM/dd"
                placeholderText="YYYY/MM/DD"
                className="modern-date-input"
                wrapperClassName="date-picker-wrapper"
                popperPlacement="bottom-start"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Quotation Expiry Date <span className="required">*</span>
              </label>
              <DatePicker
                selected={form.expiryDate}
                onChange={(date) => handleDateChange('expiryDate', date)}
                dateFormat="yyyy/MM/dd"
                placeholderText="YYYY/MM/DD"
                className="modern-date-input"
                wrapperClassName="date-picker-wrapper"
                minDate={form.date}
                popperPlacement="bottom-start"
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
          </div>

          <div className="table-section">
            {/* Search and Filter Bar - Flush above table */}
            <div className="table-controls-bar">
              <div className="search-input-wrapper">
                <input
                  className="table-search-input"
                  placeholder="Search by name / id / status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="filter-controls-row">
              <select 
                className="modern-select"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {QUOTATION_STATUS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <DatePicker
                selected={dateFromFilter}
                onChange={(date) => setDateFromFilter(date)}
                dateFormat="yyyy/MM/dd"
                placeholderText="YYYY/MM/DD"
                className="modern-date-input"
                wrapperClassName="date-picker-wrapper"
                selectsStart
                startDate={dateFromFilter}
                endDate={dateToFilter}
                popperPlacement="bottom-start"
              />

              <DatePicker
                selected={dateToFilter}
                onChange={(date) => setDateToFilter(date)}
                dateFormat="yyyy/MM/dd"
                placeholderText="YYYY/MM/DD"
                className="modern-date-input"
                wrapperClassName="date-picker-wrapper"
                selectsEnd
                startDate={dateFromFilter}
                endDate={dateToFilter}
                minDate={dateFromFilter}
                popperPlacement="bottom-start"
              />

              <button className="btn btn-xs btn-cancel" onClick={clearFilters}>
                <i className="fas fa-times"></i>
                Clear Filters
              </button>
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
                        <td>{formatDateString(quotation.date)}</td>
                        <td>{formatDateString(quotation.expiryDate)}</td>
                        <td>
                          <span className={`badge badge-status-${quotation.status.toLowerCase()}`}>
                            {quotation.status}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button 
                              className="btn btn-xs btn-view" 
                              onClick={() => handleView(quotation.id)}
                              title="View"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button 
                              className="btn btn-xs btn-edit" 
                              onClick={() => handleEdit(quotation)}
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
                              onClick={() => openDeleteModal(quotation.id)}
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
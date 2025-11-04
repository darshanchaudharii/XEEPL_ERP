import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/quotationview.css';

const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQuotation = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await quotationService.getQuotationById(id);
      setQuotation(data);
    } catch (err) {
      setError('Failed to fetch quotation: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuotation();
  }, [fetchQuotation]);

  const handleDownloadPDF = async () => {
    // TODO: implement PDF generation/download; simple fallback to print for now
    window.print();
  };

  const handleBack = () => {
    navigate('/quotations');
  };

  const calculateGrandTotal = () => {
    if (!quotation || !quotation.items) return 0;
    return quotation.items.reduce((sum, item) => sum + Number(item.total), 0);
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner message="Loading quotation..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
        <button className="btn btn-back" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Quotations
        </button>
      </div>
    );
  }

  if (!quotation) {
    return null;
  }

  return (
    <div className="page-container quotation-view">
      <div className="view-header">
        <h1 className="page-title">Quotation #{quotation.id}</h1>
        <div className="view-actions">
          <button className="btn btn-back" onClick={handleBack}>
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
          <button className="btn btn-download-csv">
            <i className="fas fa-file-csv"></i>
            Download CSV
          </button>
          <button className="btn btn-download-pdf" onClick={handleDownloadPDF}>
            <i className="fas fa-file-pdf"></i>
            Download PDF (Print)
          </button>
        </div>
      </div>

      <div className="quotation-details-card">
        <div className="details-header">
          <h2>Quotation Details</h2>
        </div>
        <div className="details-body">
          <div className="detail-row">
            <span className="detail-label">Quotation ID:</span>
            <span className="detail-value">{quotation.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{quotation.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date:</span>
            <span className="detail-value">{quotation.date}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Expiry Date:</span>
            <span className="detail-value">{quotation.expiryDate}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`badge badge-status-${quotation.status.toLowerCase()}`}>
              {quotation.status}
            </span>
          </div>
        </div>
      </div>

      {quotation.customer && (
        <div className="customer-card">
          <div className="card-header-section">
            <h3>Assigned Customer</h3>
            <p className="linked-on">Linked on: {new Date().toLocaleString()}</p>
          </div>
          <div className="customer-info">
            <div className="customer-avatar">
              {quotation.customer.fullName?.charAt(0) || '?'}
            </div>
            <div className="customer-details">
              <h4>{quotation.customer.fullName}</h4>
              <p><strong>Username:</strong> {quotation.customer.email}</p>
              <p><strong>Mobile:</strong> {quotation.customer.mobile}</p>
            </div>
            <div className="customer-actions">
              <button className="btn btn-link">
                <i className="fas fa-user"></i>
                Open Profile
              </button>
              <button className="btn btn-link">
                <i className="fas fa-envelope"></i>
                Email
              </button>
            </div>
          </div>
        </div>
      )}

      {quotation.linkedCatalogs && quotation.linkedCatalogs.length > 0 && (
        <div className="catalogs-section">
          <div className="section-header">
            <h3>Linked Catalogs (ZIP)</h3>
          </div>
          <div className="catalog-actions">
            <button className="btn btn-download">
              <i className="fas fa-download"></i>
              Download Linked Catalogs (ZIP)
            </button>
            <button className="btn btn-download-csv">
              <i className="fas fa-file-csv"></i>
              Download CSV
            </button>
          </div>
          <div className="catalogs-grid">
            {quotation.linkedCatalogs.map(catalog => (
              <div key={catalog.id} className="catalog-item">
                <div className="catalog-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="catalog-info">
                  <h4>{catalog.title}</h4>
                  <p>{catalog.description}</p>
                  <small>Catalog ID: {catalog.id} | Linked on: {new Date().toLocaleDateString()}</small>
                </div>
                <button className="btn btn-view-catalog">
                  <i className="fas fa-eye"></i>
                  Open
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="items-section">
        <h3>Quotation Lines</h3>
        <div className="table-wrapper">
          <table className="quotation-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate / Unit in ₹</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items && quotation.items.length > 0 ? (
                quotation.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.itemDescription}</td>
                    <td>{item.quantity}</td>
                    <td>₹{Number(item.unitPrice).toFixed(2)}</td>
                    <td>₹{Number(item.total).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No items in this quotation</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="grand-total-row">
                <td colSpan="4" className="text-right"><strong>Grand Total</strong></td>
                <td><strong>₹{calculateGrandTotal().toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="table-note">
          <small>Note: Serial No applies to ITEM rows. RAW rows are shown as a), b), ...</small>
        </div>
      </div>
    </div>
  );
};

export default QuotationView;
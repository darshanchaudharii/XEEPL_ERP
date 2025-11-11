import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import '../../styles/quotationview.css';
import { downloadQuotationPDF } from '../../utils/pdfGenerator';
const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRawPrices, setShowRawPrices] = useState(true);
  const [showRemovedRaws, setShowRemovedRaws] = useState(false);
  const [editingLineId, setEditingLineId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editRate, setEditRate] = useState('');
  const handleDownloadCatalogsZip = async () => {
  try {
    await quotationService.downloadLinkedCatalogsZip(quotation.id);
  } catch (err) {
    setError('Failed to download catalogs: ' + err.message);
  }
};

  const fetchQuotation = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await quotationService.getQuotationByIdWithRemoved(id, showRemovedRaws);
      setQuotation(data);
    } catch (err) {
      setError('Failed to fetch quotation: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [id, showRemovedRaws]);

  useEffect(() => {
    fetchQuotation();
  }, [fetchQuotation]);

  const handleDownloadPDF = async () => {
  try {
    setLoading(true);
    // Build ordered lines for PDF: items then their raws (a,b,...), exclude removed by default
    const items = (quotation.items || []).filter(l => !l.isRawMaterial);
    const raws = (quotation.items || []).filter(l => l.isRawMaterial);
    const orderedLines = [];
    items.forEach(item => {
      orderedLines.push(item);
      const children = raws
        .filter(r => r.parentItemId === item.id && (!r.removed || showRemovedRaws))
        .sort((a, b) => a.id - b.id);
      children.forEach(r => orderedLines.push(r));
    });
    await downloadQuotationPDF(quotation, orderedLines, { showRawPrices });
  } catch (err) {
    setError('Failed to generate PDF: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  const handleBack = () => {
    navigate('/quotations');
  };

  const calculateGrandTotal = () => {
    if (!quotation || !quotation.items) return 0;
    return quotation.items
      .filter(l => !l.isRawMaterial && !l.removed)
      .reduce((sum, item) => sum + Number(item.total), 0);
  };

  const startEdit = (line) => {
    setEditingLineId(line.id);
    setEditQty(String(line.quantity));
    setEditRate(String(line.unitPrice));
  };

  const cancelEdit = () => {
    setEditingLineId(null);
    setEditQty('');
    setEditRate('');
  };

  const saveEdit = async (lineId) => {
    try {
      setLoading(true);
      setError('');
      await quotationService.editLine(lineId, {
        quantity: Number(editQty),
        unitPrice: Number(editRate)
      });
      await fetchQuotation();
      cancelEdit();
    } catch (err) {
      setError('Failed to save line: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (lineId) => {
    try {
      setLoading(true);
      setError('');
      await quotationService.removeLine(lineId);
      await fetchQuotation();
    } catch (err) {
      setError('Failed to remove line: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (lineId) => {
    try {
      setLoading(true);
      setError('');
      await quotationService.undoRemoveLine(lineId);
      await fetchQuotation();
    } catch (err) {
      setError('Failed to undo: ' + err.message);
    } finally {
      setLoading(false);
    }
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
            <button 
        className="btn btn-download"
        onClick={handleDownloadCatalogsZip}
      >
        <i className="fas fa-download"></i>
        Download All Catalogs (ZIP)
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
                <th className="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items && quotation.items.length > 0 ? (
                // Render items with nested raws
                (() => {
                  const items = quotation.items.filter(l => !l.isRawMaterial && !l.removed);
                  const raws = quotation.items.filter(l => l.isRawMaterial);
                  return items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr>
                        <td>{index + 1}</td>
                        <td><strong>{item.itemDescription}</strong></td>
                        <td>
                          {editingLineId === item.id ? (
                            <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} min="1" />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td>
                          {editingLineId === item.id ? (
                            <input type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)} step="0.01" />
                          ) : (
                            `₹${Number(item.unitPrice).toFixed(2)}`
                          )}
                        </td>
                        <td>₹{Number(item.total).toFixed(2)}</td>
                        <td>
                          {editingLineId === item.id ? (
                            <div className="row-actions">
                              <button className="btn btn-xs btn-save" onClick={() => saveEdit(item.id)}><i className="fas fa-check"></i></button>
                              <button className="btn btn-xs btn-cancel" onClick={cancelEdit}><i className="fas fa-times"></i></button>
                            </div>
                          ) : (
                            <div className="row-actions">
                              <button className="btn btn-xs btn-edit" onClick={() => startEdit(item)} title="Edit"><i className="fas fa-pen"></i></button>
                              <button className="btn btn-xs btn-delete" onClick={() => handleRemove(item.id)} title="Delete"><i className="fas fa-trash"></i></button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {/* RAW children */}
                      {raws
                        .filter(r => r.parentItemId === item.id && (!r.removed || showRemovedRaws))
                        .sort((a, b) => a.id - b.id)
                        .map((raw, rawIndex) => (
                          <tr key={raw.id} className={raw.removed ? 'row-removed' : ''}>
                            <td></td>
                            <td style={{ paddingLeft: 24 }}>
                              {String.fromCharCode(97 + rawIndex)}) {raw.itemDescription} {raw.removed ? <em>(Removed)</em> : ''}
                            </td>
                            <td>
                              {editingLineId === raw.id ? (
                                <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} min="1" />
                              ) : (
                                raw.removed ? <s>{raw.quantity}</s> : raw.quantity
                              )}
                            </td>
                            <td>
                              {editingLineId === raw.id ? (
                                <input type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)} step="0.01" />
                              ) : (
                                showRawPrices ? (raw.removed ? <s>₹{Number(raw.unitPrice).toFixed(2)}</s> : `₹${Number(raw.unitPrice).toFixed(2)}`) : '—'
                              )}
                            </td>
                            <td>—</td>
                            <td>
                              {raw.removed ? (
                                <div className="row-actions">
                                  <button className="btn btn-xs btn-undo" onClick={() => handleUndo(raw.id)} title="Undo"><i className="fas fa-undo"></i></button>
                                </div>
                              ) : editingLineId === raw.id ? (
                                <div className="row-actions">
                                  <button className="btn btn-xs btn-save" onClick={() => saveEdit(raw.id)}><i className="fas fa-check"></i></button>
                                  <button className="btn btn-xs btn-cancel" onClick={cancelEdit}><i className="fas fa-times"></i></button>
                                </div>
                              ) : (
                                <div className="row-actions">
                                  <button className="btn btn-xs btn-edit" onClick={() => startEdit(raw)} title="Edit"><i className="fas fa-pen"></i></button>
                                  <button className="btn btn-xs btn-delete" onClick={() => handleRemove(raw.id)} title="Delete"><i className="fas fa-trash"></i></button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ));
                })()
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No items in this quotation</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="grand-total-row">
                <td colSpan="4" className="text-right"><strong>Grand Total</strong></td>
                <td><strong>₹{calculateGrandTotal().toFixed(2)}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
          <label className="toggle-label">
            <input type="checkbox" checked={showRawPrices} onChange={(e) => setShowRawPrices(e.target.checked)} />
            Show raw prices
          </label>
          <label className="toggle-label">
            <input type="checkbox" checked={showRemovedRaws} onChange={(e) => setShowRemovedRaws(e.target.checked)} />
            Show removed raws
          </label>
        </div>
        <div className="table-note">
          <small>Note: Serial No applies to ITEM rows. RAW rows are shown as a), b), ...</small>
        </div>
      </div>
    </div>
  );
};

export default QuotationView;
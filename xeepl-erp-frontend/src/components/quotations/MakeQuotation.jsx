import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { userService } from '../../services/userService';
import { itemService } from '../../services/itemService';
import { rawMaterialService } from '../../services/rawMaterialService';
import { catalogService } from '../../services/catalogService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/makequotation.css';
import { downloadQuotationPDF } from '../../utils/pdfGenerator'; 

const MakeQuotation = () => {
  const navigate = useNavigate();
  const [quotationId, setQuotationId] = useState('');
  const [quotations, setQuotations] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [items, setItems] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedRawMaterial, setSelectedRawMaterial] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemRate, setItemRate] = useState('');
  const [rawQty, setRawQty] = useState(1);
  const [rawRate, setRawRate] = useState('');
  const [quotationLines, setQuotationLines] = useState([]);
  const [selectedCatalogs, setSelectedCatalogs] = useState([]);
  const [showRawPrices, setShowRawPrices] = useState(true);
  const [showRemovedRaws, setShowRemovedRaws] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('items');
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('');
const [removedLines, setRemovedLines] = useState([]);
const handleRemoveLine = (lineId) => {
  const lineToRemove = quotationLines.find(line => line.id === lineId);
  if (lineToRemove) {
    setRemovedLines(prev => [...prev, { ...lineToRemove, removedAt: Date.now() }]);
    setQuotationLines(prev => prev.filter(line => line.id !== lineId));
  }
};
const handleUndoRemove = (lineId) => {
  const lineToRestore = removedLines.find(line => line.id === lineId);
  if (lineToRestore) {
    const restoredLine = { ...lineToRestore };
    setQuotationLines(prev => [...prev, restoredLine]);
    setRemovedLines(prev => prev.filter(line => line.id !== lineId));
  }
};
// Add this handler function near other handlers
const handleDecrementQuantity = (lineId) => {
  setQuotationLines(prev => {
    const updated = prev.map(line => {
      if (line.id === lineId && line.quantity > 1) {
        const newQuantity = line.quantity - 1;
        return {
          ...line,
          quantity: newQuantity,
          total: newQuantity * line.unitPrice
        };
      }
      return line;
    });
    return updated;
  });
};

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customerSearch, customers]);

  const filterCustomers = () => {
    if (!customerSearch.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    const searchLower = customerSearch.toLowerCase();
    const filtered = customers.filter(c => 
      c.fullName.toLowerCase().includes(searchLower) ||
      (c.username || '').toLowerCase().includes(searchLower) ||
      (c.mobile || '').includes(searchLower)
    );
    setFilteredCustomers(filtered);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [quotationsData, allUsersData, itemsData, rawMaterialsData, catalogsData] = await Promise.all([
        quotationService.getAllQuotations(),
        userService.getAllUsers(), // Fetch all users, filter on frontend
        itemService.getAllItems(),
        rawMaterialService.getAllRawMaterials(),
        catalogService.getAllCatalogs()
      ]);
      
      // Filter customers from all users on frontend
      const customersData = Array.isArray(allUsersData) 
        ? allUsersData.filter(user => user.role === 'Customer' || user.role === 'CUSTOMER')
        : [];
      
      setQuotations(quotationsData);
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      setItems(itemsData);
      setRawMaterials(rawMaterialsData);
      setCatalogs(catalogsData);
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuotation = async (qId) => {
    setQuotationId(qId);
    if (!qId) {
      setQuotationLines([]);
      setCustomerId('');
      setSelectedCatalogs([]);
      return;
    }

    setLoading(true);
    try {
      const quotation = await quotationService.getQuotationById(qId);
      setQuotationLines(quotation.items || []);
      setCustomerId(quotation.customer?.id || '');
      setSelectedCatalogs(quotation.linkedCatalogs?.map(c => c.id) || []);
    } catch (err) {
      setError('Failed to load quotation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuotation = async () => {
    if (!quotationId) {
      setError('Please select a quotation first');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this quotation?')) {
      return;
    }

    setLoading(true);
    try {
      await quotationService.deleteQuotation(quotationId);
      await fetchInitialData();
      setQuotationId('');
      setQuotationLines([]);
      setCustomerId('');
      setSelectedCatalogs([]);
    } catch (err) {
      setError('Failed to delete quotation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCustomer = () => {
    if (!quotationId) {
      setError('Please select a quotation first');
      return;
    }
    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    // Customer is assigned - will be saved when finalizing
  };

  const handleUnlinkCustomer = () => {
    setCustomerId('');
  };

  const handleAddItem = () => {
    if (!selectedItem) {
      setError('Please select an item');
      return;
    }

    const item = items.find(i => i.id === Number(selectedItem));
    if (!item) return;

    // Check if item already exists (by stable itemId)
    const existingLineIndex = quotationLines.findIndex(
      line => !line.isRawMaterial && line.itemId === item.id
    );

    if (existingLineIndex !== -1) {
      // Increment quantity
      setQuotationLines(prev => {
        const updated = [...prev];
        updated[existingLineIndex].quantity += Number(itemQty);
        updated[existingLineIndex].total = 
          updated[existingLineIndex].quantity * updated[existingLineIndex].unitPrice;
        return updated;
      });
    } else {
      // Add new line
      const newLine = {
        id: Date.now(),
        itemId: item.id,
        itemDescription: item.itemName,
        itemLongDescription: item.itemDescription || item.description || '',
        quantity: Number(itemQty),
        unitPrice: Number(itemRate) || Number(item.itemPrice) || 0,
        total: 0,
        isRawMaterial: false
      };
      newLine.total = newLine.quantity * newLine.unitPrice;
      setQuotationLines(prev => [...prev, newLine]);
    }

    setSelectedItem('');
    setItemQty(1);
    setItemRate('');
  };

  const handleAddRawMaterial = () => {
    if (!selectedRawMaterial) {
      setError('Please select a raw material');
      return;
    }

    const raw = rawMaterials.find(r => r.id === Number(selectedRawMaterial));
    if (!raw) return;

    // Attach to the most recently added ITEM row (parent)
    const lastItem = [...quotationLines].reverse().find(l => !l.isRawMaterial);
    const parentItemId = lastItem ? lastItem.id : null;

    const description = `${raw.name} (Raw Material)`;
    const existingLineIndex = quotationLines.findIndex(
      line => line.isRawMaterial && line.rawId === raw.id && line.parentItemId === parentItemId
    );

    if (existingLineIndex !== -1) {
      setQuotationLines(prev => {
        const updated = [...prev];
        updated[existingLineIndex].quantity += Number(rawQty);
        updated[existingLineIndex].total = 
          updated[existingLineIndex].quantity * updated[existingLineIndex].unitPrice;
        return updated;
      });
    } else {
      const newLine = {
        id: Date.now(),
        rawId: raw.id,
        itemDescription: description,
        quantity: Number(rawQty),
        unitPrice: Number(rawRate) || Number(raw.price) || 0,
        total: 0,
        isRawMaterial: true,
        parentItemId
      };
      newLine.total = newLine.quantity * newLine.unitPrice;
      setQuotationLines(prev => [...prev, newLine]);
    }

    setSelectedRawMaterial('');
    setRawQty(1);
    setRawRate('');
  };

  const handleCatalogToggle = (catalogId) => {
    setSelectedCatalogs(prev => {
      if (prev.includes(catalogId)) {
        return prev.filter(id => id !== catalogId);
      } else {
        return [...prev, catalogId];
      }
    });
  };

  const handleFinalizeAndSave = async () => {
    if (!quotationId) {
      setError('Please select a quotation');
      return;
    }

    setLoading(true);
    try {
      const quotation = await quotationService.getQuotationById(quotationId);
      
      const updateData = {
        name: quotation.name,
        date: quotation.date,
        expiryDate: quotation.expiryDate,
        status: 'FINALIZED',
        customerId: customerId ? Number(customerId) : null,
        catalogIds: selectedCatalogs,
        items: quotationLines.map(line => ({
          itemDescription: line.itemDescription,
          quantity: line.quantity,
          unitPrice: line.unitPrice
        }))
      };

      await quotationService.updateQuotation(quotationId, updateData);
      navigate('/quotations');
    } catch (err) {
      setError('Failed to save quotation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

const handleDownloadPDF = async () => {
  if (!quotationId) {
    setError('Please select a quotation');
    return;
  }

  try {
    setLoading(true);
    const quotation = await quotationService.getQuotationById(quotationId);
    await downloadQuotationPDF(quotation, quotationLines, { showRawPrices });
  } catch (err) {
    setError('Failed to generate PDF: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  const handleRefresh = () => {
    fetchInitialData();
  };

  const calculateGrandTotal = () => {
    return quotationLines
      .filter(line => !line.isRawMaterial)
      .reduce((sum, line) => sum + Number(line.total), 0);
  };

  const selectedCustomer = customers.find(c => c.id === Number(customerId));

  return (
    <div className="page-container make-quotation">
      <h1 className="page-title">Make Quotation</h1>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="make-quotation-layout">
        <aside className="quotation-sidebar">
          <div className="sidebar-card">
            <div className="card-header">
              <i className="fas fa-file-invoice"></i>
              Quotation
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Select Quotation</label>
                <select 
                  value={quotationId} 
                  onChange={(e) => handleSelectQuotation(e.target.value)}
                >
                  <option value="">-- Select Quotation --</option>
                  {quotations.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.name} (ID: {q.id})
                    </option>
                  ))}
                </select>
                <button 
                  className="btn btn-delete btn-block"
                  onClick={handleDeleteQuotation}
                  disabled={!quotationId}
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>

              <div className="form-group">
                <label>Customer (assign to quotation)</label>
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="search-input-small"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                <select 
                  value={customerId} 
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- Select Customer --</option>
                  {filteredCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
                {!customerId && (
                  <p className="no-customer">No customer assigned</p>
                )}
                {customerId && (
                  <p className="customer-assigned">
                    <i className="fas fa-check"></i>
                    {selectedCustomer?.fullName}
                  </p>
                )}
                <div className="customer-actions">
                  <button 
                    className="btn btn-assign"
                    onClick={handleAssignCustomer}
                    disabled={!customerId}
                  >
                    <i className="fas fa-link"></i>
                    Assign
                  </button>
                  <button 
                    className="btn btn-unlink"
                    onClick={handleUnlinkCustomer}
                    disabled={!customerId}
                  >
                    <i className="fas fa-unlink"></i>
                    Unlink
                  </button>
                </div>
              </div>

              <div className="form-group">
                <div className="action-buttons">
                  <button 
                    className="btn btn-finalize"
                    onClick={handleFinalizeAndSave}
                    disabled={!quotationId || loading}
                  >
                    <i className="fas fa-check-circle"></i>
                    Finalize & Save
                  </button>
                  <button 
                    className="btn btn-download"
                    onClick={handleDownloadPDF}
                    disabled={!quotationId}
                  >
                    <i className="fas fa-file-pdf"></i>
                    Download PDF
                  </button>
                  <button 
                    className="btn btn-manage"
                    onClick={() => setCatalogModalOpen(true)}
                    disabled={!quotationId}
                  >
                    <i className="fas fa-book"></i>
                    Manage Linked Catalogs
                  </button>
                  <button 
                    className="btn btn-refresh"
                    onClick={handleRefresh}
                  >
                    <i className="fas fa-sync-alt"></i>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={showRemovedRaws}
                    onChange={(e) => setShowRemovedRaws(e.target.checked)}
                  />
                  Show removed raws
                </label>
              </div>

              <p className="info-text">
                Select a quotation to work with. Toggle shows hidden RAWs for Undo.
              </p>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="card-header">
              <i className="fas fa-plus-circle"></i>
              Add Lines
            </div>
            <div className="card-body">
              <div className="tabs">
                <button 
                  className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
                  onClick={() => setActiveTab('items')}
                >
                  Items
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
                  onClick={() => setActiveTab('raw')}
                >
                  Raw Materials
                </button>
              </div>

              {activeTab === 'items' ? (
                <div className="add-item-form">
                  <div className="form-group">
                    <label>Choose Item</label>
                    <select 
                      value={selectedItem} 
                      onChange={(e) => {
                        setSelectedItem(e.target.value);
                        const item = items.find(i => i.id === Number(e.target.value));
                        if (item && item.itemPrice) {
                          setItemRate(item.itemPrice);
                        }
                      }}
                    >
                      <option value="">-- Select Item --</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.itemName} (ID:{item.id} / {item.itemCode}) — {item.itemPrice || 0}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Qty</label>
                      <input
                        type="number"
                        value={itemQty}
                        onChange={(e) => setItemQty(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Rate</label>
                      <input
                        type="number"
                        value={itemRate}
                        onChange={(e) => setItemRate(e.target.value)}
                        step="0.01"
                      />
                    </div>
                    <button 
                      className="btn btn-add"
                      onClick={handleAddItem}
                      disabled={!selectedItem}
                    >
                      <i className="fas fa-plus"></i>
                      Add Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="add-item-form">
                  <div className="form-group">
                    <label>Choose Raw Material</label>
                    <select 
                      value={selectedRawMaterial} 
                      onChange={(e) => {
                        setSelectedRawMaterial(e.target.value);
                        const raw = rawMaterials.find(r => r.id === Number(e.target.value));
                        if (raw && raw.price) {
                          setRawRate(raw.price);
                        }
                      }}
                    >
                      <option value="">-- Select Raw Material --</option>
                      {rawMaterials.map(raw => (
                        <option key={raw.id} value={raw.id}>
                          {raw.name} (ID:{raw.id}) — {raw.price || 0}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Qty</label>
                      <input
                        type="number"
                        value={rawQty}
                        onChange={(e) => setRawQty(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Rate</label>
                      <input
                        type="number"
                        value={rawRate}
                        onChange={(e) => setRawRate(e.target.value)}
                        step="0.01"
                      />
                    </div>
                    <button 
                      className="btn btn-add"
                      onClick={handleAddRawMaterial}
                      disabled={!selectedRawMaterial}
                    >
                      <i className="fas fa-plus"></i>
                      Add Raw
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="quotation-content">
          <div className="content-header">
            <h2>
              <i className="fas fa-list"></i>
              Quotation Lines
            </h2>
            <div className="header-actions">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showRawPrices}
                  onChange={(e) => setShowRawPrices(e.target.checked)}
                />
                Show raw prices
              </label>
              <input
                type="text"
                placeholder="Search in table..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading quotation..." />
          ) : (
            <div className="quotation-table-container">
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate / Unit in ₹</th>
                    <th>Total Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationLines.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">
                        {quotationId ? 'No items in quotation' : 'Select a quotation'}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {quotationLines
                        .filter(l => !l.isRawMaterial) // only items for main rows
                        .filter(line => {
                          if (!searchQuery.trim()) return true;
                          const query = searchQuery.toLowerCase();
                          return line.itemDescription.toLowerCase().includes(query);
                        })
                        .map((line, index) => (
                          <React.Fragment key={line.id}>
                            <tr>
                              <td>{index + 1}</td>
                              <td>
                                <div>
                                  <strong>{line.itemDescription}</strong>
                                  <div style={{ fontSize: '12px', color: '#555', marginTop: 4 }}>
                                    {line.itemLongDescription || (items.find(i => i.id === line.itemId || i.itemName === line.itemDescription)?.itemDescription) || ''}
                                  </div>
                                </div>
                              </td>
                              <td>{line.quantity}</td>
                              <td>₹{Number(line.unitPrice).toFixed(2)}</td>
                              <td>₹{Number(line.total || (line.quantity * line.unitPrice)).toFixed(2)}</td>
                              <td>
                                {line.quantity > 1 ? (
                                  <div style={{ display: 'flex', gap: '5px' }}>
                                    <button 
                                      className="btn btn-remove"
                                      onClick={() => handleDecrementQuantity(line.id)}
                                      title="Remove one item"
                                    >
                                      <i className="fas fa-minus"></i>
                                    </button>
                                    <button 
                                      className="btn btn-delete"
                                      onClick={() => handleRemoveLine(line.id)}
                                      title="Remove all"
                                    >
                                      <i className="fas fa-trash"></i>
                                      All
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    className="btn btn-remove"
                                    onClick={() => handleRemoveLine(line.id)}
                                    title="Remove item"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                )}
                              </td>
                            </tr>
                            {
                              quotationLines
                                .filter(raw => raw.isRawMaterial && raw.parentItemId === line.id)
                                .map((raw, rawIndex) => (
                                  <tr key={raw.id}>
                                    <td></td>
                                    <td style={{ paddingLeft: 24 }}>
                                      {String.fromCharCode(97 + rawIndex)}) {raw.itemDescription}
                                    </td>
                                    <td>{raw.quantity}</td>
                                    <td>
                                      {showRawPrices ? `₹${Number(raw.unitPrice).toFixed(2)}` : '—'}
                                    </td>
                                    <td>—</td>
                                    <td>
                                      {raw.quantity > 1 ? (
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                          <button
                                            className="btn btn-remove"
                                            onClick={() => handleDecrementQuantity(raw.id)}
                                            title="Remove one raw"
                                          >
                                            <i className="fas fa-minus"></i>
                                          </button>
                                          <button
                                            className="btn btn-delete"
                                            onClick={() => handleRemoveLine(raw.id)}
                                            title="Remove all"
                                          >
                                            <i className="fas fa-trash"></i>
                                            All
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          className="btn btn-remove"
                                          onClick={() => handleRemoveLine(raw.id)}
                                          title="Remove raw"
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))
                            }
                          </React.Fragment>
                        ))}

                      {showRemovedRaws && removedLines.length > 0 && removedLines.map((line, idx) => (
                        <tr key={`removed-${line.id}`} style={{ backgroundColor: '#ffe5e5', opacity: 0.9 }}>
                          <td>{quotationLines.length + idx + 1}</td>
                          <td>
                            <s>{line.itemDescription}</s>
                            <span style={{ color: '#e74c3c', marginLeft: 10 }}>(Removed)</span>
                          </td>
                          <td><s>{line.quantity}</s></td>
                          <td><s>₹{Number(line.unitPrice).toFixed(2)}</s></td>
                          <td><s>₹{Number(line.total || (line.quantity * line.unitPrice)).toFixed(2)}</s></td>
                          <td>
                            <button 
                              className="btn btn-undo"
                              onClick={() => handleUndoRemove(line.id)}
                              title="Undo remove"
                              style={{ backgroundColor: '#f39c12', color: 'white' }}
                            >
                              <i className="fas fa-undo"></i>
                              Undo
                            </button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  <tr className="grand-total-row">
                    <td colSpan="4" className="grand-total-label">
                      <strong>Grand Total</strong>
                    </td>
                    <td className="grand-total-value">
                      <strong>₹{calculateGrandTotal().toFixed(2)}</strong>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <p className="note-text">
            <i className="fas fa-info-circle"></i>
            Note: Serial No applies to ITEM rows. RAW rows are shown as a), b), ...
          </p>
        </main>
      </div>

      {/* Catalog Modal */}
      <Modal
        isOpen={catalogModalOpen}
        onClose={() => {
          setCatalogModalOpen(false);
          setCatalogFilter('');
        }}
        title="Link Quotation to Catalog(s)"
        size="large"
      >
        <div className="catalog-modal-content">
          <p className="modal-instruction">
            Select one or more catalogs to link with this quotation.
          </p>
          <div className="catalog-filter-section">
            <input
              type="text"
              placeholder="-- Filter by catalog --"
              className="catalog-filter-input"
              value={catalogFilter}
              onChange={(e) => setCatalogFilter(e.target.value)}
            />
            <button
              className="btn btn-clear"
              onClick={() => setCatalogFilter('')}
            >
              Clear
            </button>
          </div>
          <div className="catalog-list">
            {catalogs
              .filter(catalog => {
                if (!catalogFilter.trim()) return true;
                const query = catalogFilter.toLowerCase();
                const catalogName = (catalog.name || catalog.title || '').toLowerCase();
                const catalogDesc = (catalog.description || '').toLowerCase();
                return catalogName.includes(query) || catalogDesc.includes(query);
              })
              .map(catalog => (
                <div key={catalog.id} className="catalog-item">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={selectedCatalogs.includes(catalog.id)}
                      onChange={() => handleCatalogToggle(catalog.id)}
                    />
                    <div className="catalog-info">
                      <strong>{catalog.name || catalog.title}</strong>
                      {catalog.description && (
                        <p className="catalog-description">{catalog.description}</p>
                      )}
                      <span className="catalog-meta">
                        Catalog ID: {catalog.id}
                      </span>
                    </div>
                  </label>
                </div>
              ))}
            {catalogs.filter(catalog => {
              if (!catalogFilter.trim()) return false;
              const query = catalogFilter.toLowerCase();
              const catalogName = (catalog.name || catalog.title || '').toLowerCase();
              const catalogDesc = (catalog.description || '').toLowerCase();
              return catalogName.includes(query) || catalogDesc.includes(query);
            }).length === 0 && catalogs.length > 0 && (
              <p className="no-catalogs">No catalogs match the filter</p>
            )}
            {catalogs.length === 0 && (
              <p className="no-catalogs">No catalogs available</p>
            )}
          </div>
          <p className="modal-help-text">
            You can also use the filter above to quickly find a catalog. Checked items will be linked.
          </p>
          <div className="modal-actions">
            <button 
              className="btn btn-cancel"
              onClick={() => {
                setCatalogModalOpen(false);
                setCatalogFilter('');
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-save"
              onClick={async () => {
                if (!quotationId) {
                  setError('Please select a quotation first');
                  return;
                }
                try {
                  setLoading(true);
                  setError('');
                  await quotationService.linkCatalogs(quotationId, selectedCatalogs);
                  // Refresh quotation data to get updated linked catalogs
                  const quotation = await quotationService.getQuotationById(quotationId);
                  setSelectedCatalogs(quotation.linkedCatalogs?.map(c => c.id) || []);
                  setCatalogModalOpen(false);
                  setCatalogFilter('');
                  // Refresh catalogs list
                  const catalogsData = await catalogService.getAllCatalogs();
                  setCatalogs(catalogsData);
                } catch (err) {
                  setError('Failed to link catalogs: ' + err.message);
                  console.error('Catalog linking error:', err);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
            >
              <i className="fas fa-save"></i>
              Save & Finalize
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MakeQuotation;
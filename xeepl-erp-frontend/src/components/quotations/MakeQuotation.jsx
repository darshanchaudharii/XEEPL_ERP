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
import QuotationLinesTable from './QuotationLinesTable';
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
  const [showRemovedRaws, setShowRemovedRaws] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('items');
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [assignedCustomerId, setAssignedCustomerId] = useState('');
  const [catalogFilter, setCatalogFilter] = useState('');
  const [removedLines, setRemovedLines] = useState([]);
  const [editingLineId, setEditingLineId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [editRate, setEditRate] = useState('');

  const isTemporaryId = (id) => {
    return id > 1e12;
  };

  const handleRemoveLine = async (lineId) => {
    if (!quotationId) {
      setError('Please select a quotation first');
      return;
    }

    if (isTemporaryId(lineId)) {
      const lineToRemove = quotationLines.find(line => line.id === lineId);
      if (lineToRemove) {
        setRemovedLines(prev => [...prev, { ...lineToRemove, removed: true }]);
        setQuotationLines(prev => prev.filter(line => line.id !== lineId));
      }
      return;
    }

    try {
      setLoading(true);
      setError('');
      await quotationService.removeLine(lineId);
      await handleSelectQuotation(quotationId);
    } catch (err) {
      setError('Failed to remove line: ' + err.message);
      console.error('Remove line error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoRemove = async (lineId) => {
    if (!quotationId) {
      setError('Please select a quotation first');
      return;
    }

    if (isTemporaryId(lineId)) {
      const lineToRestore = removedLines.find(line => line.id === lineId);
      if (lineToRestore) {
        const restoredLine = { ...lineToRestore };
        delete restoredLine.removed;
        setQuotationLines(prev => [...prev, restoredLine]);
        setRemovedLines(prev => prev.filter(line => line.id !== lineId));
      }
      return;
    }

    try {
      setLoading(true);
      setError('');
      await quotationService.undoRemoveLine(lineId);
      await handleSelectQuotation(quotationId);
    } catch (err) {
      setError('Failed to restore line: ' + err.message);
      console.error('Undo remove error:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const saveEdit = (lineId) => {
    const qty = Math.max(1, Number(editQty) || 1);
    const rate = Number(editRate) || 0;
    setQuotationLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          quantity: qty,
          unitPrice: rate,
          total: qty * rate
        };
      }
      return line;
    }));
    cancelEdit();
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
        userService.getAllUsers(),
        itemService.getAllItems(),
        rawMaterialService.getAllRawMaterials(),
        catalogService.getAllCatalogs()
      ]);
      
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
      setRemovedLines([]);
      setCustomerId('');
      setSelectedCatalogs([]);
      return;
    }

    setLoading(true);
    try {
      const quotation = await quotationService.getQuotationByIdWithRemoved(qId, true);
      const allLines = (quotation.items || []);
      const sortedLines = [...allLines].sort((a, b) => {
        const seqA = a.sequence != null ? a.sequence : (a.id || 0);
        const seqB = b.sequence != null ? b.sequence : (b.id || 0);
        return seqA - seqB;
      });
      const enrichedLines = sortedLines.filter(l => !l.removed).map(line => {
        if (!line.itemId && line.itemDescription) {
          const matchedItem = items.find(i => 
            i.itemName === line.itemDescription || 
            i.itemName === line.itemDescription.replace(' (Raw Material)', '')
          );
          if (matchedItem) {
            return {
              ...line,
              itemId: matchedItem.id,
              itemLongDescription: matchedItem.itemDescription || matchedItem.description || line.itemLongDescription || ''
            };
          }
        }
        if (line.isRawMaterial && !line.rawId && line.itemDescription) {
          const rawName = line.itemDescription.replace(' (Raw Material)', '');
          const matchedRaw = rawMaterials.find(r => r.name === rawName);
          if (matchedRaw) {
            return { ...line, rawId: matchedRaw.id };
          }
        }
        return line;
      });

      const removed = allLines.filter(l => l.removed).map(l => ({ ...l, removed: true }));
      setQuotationLines(enrichedLines);
      setRemovedLines(removed);
      setCustomerId(quotation.customer?.id || '');
      setAssignedCustomerId(quotation.customer?.id || '');
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
      setRemovedLines([]);
      setCustomerId('');
      setSelectedCatalogs([]);
    } catch (err) {
      setError('Failed to delete quotation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCustomer = async () => {
    if (!quotationId) {
      setError('Please select a quotation first');
      return;
    }
    if (!customerId) {
      setError('Please select a customer');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await quotationService.assignCustomer(quotationId, customerId);
      setAssignSuccess(true);
      const quotation = await quotationService.getQuotationById(quotationId);
      setCustomerId(quotation.customer?.id || '');
      setAssignedCustomerId(quotation.customer?.id || '');
      setTimeout(() => setAssignSuccess(false), 1200);
    } catch (err) {
      setError('Failed to assign customer: ' + err.message);
    } finally {
      setLoading(false);
    }
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

    const qtyToAdd = Number(itemQty) || 1;
    const rate = Number(itemRate) || Number(item.itemPrice) || 0;

    const existingLineIndex = quotationLines.findIndex(
      line => !line.isRawMaterial && (
        line.itemId === item.id || 
        (line.itemId === undefined && line.itemDescription === item.itemName)
      )
    );

    if (existingLineIndex !== -1) {
      setQuotationLines(prev => {
        const updated = prev.map((line, idx) => {
            if (idx === existingLineIndex) {
              const newQty = Number(line.quantity) + qtyToAdd;
              return {
                ...line,
                itemId: item.id,
                quantity: newQty,
              total: newQty * Number(line.unitPrice || rate),
              itemLongDescription: item.itemDescription || item.description || line.itemLongDescription || ''
            };
          }
          return line;
        });
        return updated;
      });
    } else {
      const newLine = {
        id: Date.now(),
        itemId: item.id,
        itemDescription: item.itemName,
        itemLongDescription: item.itemDescription || item.description || '',
        quantity: qtyToAdd,
        unitPrice: rate,
        total: qtyToAdd * rate,
        isRawMaterial: false,
        sequence: quotationLines.length
      };
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

    const qtyToAdd = Number(rawQty) || 1;
    const rate = Number(rawRate) || Number(raw.price) || 0;

    const lastItem = [...quotationLines].reverse().find(l => !l.isRawMaterial);
    const parentItemId = lastItem ? lastItem.id : null;
    const description = `${raw.name} (Raw Material)`;
    
    const existingLineIndex = quotationLines.findIndex(
      line => line.isRawMaterial && (
        (line.rawId === raw.id && line.parentItemId === parentItemId) ||
        (line.rawId === undefined && line.itemDescription === description && line.parentItemId === parentItemId)
      )
    );

    if (existingLineIndex !== -1) {
      setQuotationLines(prev => {
        const updated = prev.map((line, idx) => {
            if (idx === existingLineIndex) {
              const newQty = Number(line.quantity) + qtyToAdd;
              return {
                ...line,
                rawId: raw.id,
                quantity: newQty,
              total: newQty * Number(line.unitPrice || rate)
            };
          }
          return line;
        });
        return updated;
      });
    } else {
      const newLine = {
        id: Date.now(),
        rawId: raw.id,
        itemDescription: description,
        quantity: qtyToAdd,
        unitPrice: rate,
        total: qtyToAdd * rate,
        isRawMaterial: true,
        parentItemId,
        sequence: quotationLines.length
      };
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
      const quotation = await quotationService.getQuotationByIdWithRemoved(quotationId, true);
      
      const allDbLines = quotation.items || [];
      
      const dbLinesMap = new Map(allDbLines.map(line => [line.id, { ...line }]));
      
      removedLines.forEach(removedLine => {
        if (!isTemporaryId(removedLine.id)) {
          if (dbLinesMap.has(removedLine.id)) {
            const dbLine = dbLinesMap.get(removedLine.id);
            dbLine.removed = true;
            dbLine.itemDescription = removedLine.itemDescription;
            dbLine.quantity = removedLine.quantity;
            dbLine.unitPrice = removedLine.unitPrice;
          } else {
            dbLinesMap.set(removedLine.id, {
              id: removedLine.id,
              itemDescription: removedLine.itemDescription,
              quantity: removedLine.quantity,
              unitPrice: removedLine.unitPrice,
              isRawMaterial: removedLine.isRawMaterial || false,
              parentItemId: removedLine.parentItemId,
              rawId: removedLine.rawId,
              removed: true
            });
          }
        }
      });
      
      const removedLineIds = new Set(removedLines.map(rl => rl.id).filter(id => !isTemporaryId(id)));
      
      quotationLines.forEach(localLine => {
        if (!isTemporaryId(localLine.id) && removedLineIds.has(localLine.id)) {
          return;
        }
        
        if (isTemporaryId(localLine.id)) {
          dbLinesMap.set(localLine.id, {
            id: null,
            itemDescription: localLine.itemDescription,
            quantity: localLine.quantity,
            unitPrice: localLine.unitPrice,
            isRawMaterial: localLine.isRawMaterial || false,
            parentItemId: localLine.parentItemId,
            rawId: localLine.rawId,
            removed: false
          });
        } else if (dbLinesMap.has(localLine.id)) {
          const dbLine = dbLinesMap.get(localLine.id);
          if (!dbLine.removed) {
            dbLine.itemDescription = localLine.itemDescription;
            dbLine.quantity = localLine.quantity;
            dbLine.unitPrice = localLine.unitPrice;
            dbLine.removed = false;
          }
        } else {
          dbLinesMap.set(localLine.id, {
            id: localLine.id,
            itemDescription: localLine.itemDescription,
            quantity: localLine.quantity,
            unitPrice: localLine.unitPrice,
            isRawMaterial: localLine.isRawMaterial || false,
            parentItemId: localLine.parentItemId,
            rawId: localLine.rawId,
            removed: false
          });
        }
      });
      
      const orderedLines = [];
      
      quotationLines.forEach((localLine, index) => {
        if (!isTemporaryId(localLine.id) && removedLineIds.has(localLine.id)) {
          return;
        }
        
        const dbLine = dbLinesMap.get(localLine.id);
        const sequence = localLine.sequence != null ? localLine.sequence : (dbLine?.sequence != null ? dbLine.sequence : index);
        orderedLines.push({
          id: isTemporaryId(localLine.id) ? null : (dbLine?.id || localLine.id),
          itemDescription: localLine.itemDescription,
          quantity: localLine.quantity,
          unitPrice: localLine.unitPrice,
          isRawMaterial: localLine.isRawMaterial || false,
          parentItemId: localLine.parentItemId,
          rawId: localLine.rawId,
          removed: false,
          sequence: sequence
        });
      });
      
      removedLines.forEach(removedLine => {
        if (!isTemporaryId(removedLine.id)) {
          const existingIndex = orderedLines.findIndex(line => line.id === removedLine.id);
          if (existingIndex === -1) {
            const dbLine = dbLinesMap.get(removedLine.id);
            const sequence = removedLine.sequence != null ? removedLine.sequence : (dbLine?.sequence != null ? dbLine.sequence : orderedLines.length);
            orderedLines.push({
              id: removedLine.id,
              itemDescription: removedLine.itemDescription,
              quantity: removedLine.quantity,
              unitPrice: removedLine.unitPrice,
              isRawMaterial: removedLine.isRawMaterial || false,
              parentItemId: removedLine.parentItemId,
              rawId: removedLine.rawId,
              removed: true,
              sequence: sequence
            });
          } else {
            orderedLines[existingIndex].removed = true;
          }
        }
      });
      
      orderedLines.sort((a, b) => {
        const seqA = a.sequence != null ? a.sequence : 999999;
        const seqB = b.sequence != null ? b.sequence : 999999;
        return seqA - seqB;
      });
      
      orderedLines.forEach((line, index) => {
        line.sequence = index;
      });
      
      const allLines = orderedLines.map((line) => ({
        id: line.id,
        itemDescription: line.itemDescription,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        isRawMaterial: line.isRawMaterial || false,
        parentItemId: line.parentItemId,
        rawId: line.rawId,
        removed: Boolean(line.removed),
        sequence: line.sequence
      }));
      
      const updateData = {
        name: quotation.name,
        date: quotation.date,
        expiryDate: quotation.expiryDate,
        status: 'FINALIZED',
        customerId: customerId ? Number(customerId) : null,
        catalogIds: selectedCatalogs,
        items: allLines
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
      const quotation = await quotationService.getQuotationByIdWithRemoved(quotationId, showRemovedRaws);
      const allLines = [
        ...quotationLines,
        ...(showRemovedRaws ? removedLines : [])
      ];
      await downloadQuotationPDF(quotation, allLines, { showRawPrices, items, rawMaterials });
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
                {!assignedCustomerId && (
                  <p className="no-customer">No customer assigned</p>
                )}
                {assignedCustomerId && (
                  <p className="customer-assigned">
                    <i className="fas fa-check"></i>
                    {customers.find(c => c.id === Number(assignedCustomerId))?.fullName}
                  </p>
                )}
                <div className="customer-actions">
                  <button 
                    className={`btn btn-assign${assignSuccess ? ' success' : ''}`}
                    onClick={handleAssignCustomer}
                    disabled={!customerId || loading}
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
                  <p>Show removed raws</p>
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
          </div>

          {loading ? (
            <LoadingSpinner message="Loading quotation..." />
          ) : (
              <div className="table-section">
              <div className="table-controls-bar">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search in table..."
                    className="table-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <label className="modern-toggle">
                  <input
                    type="checkbox"
                    checked={showRawPrices}
                    onChange={(e) => setShowRawPrices(e.target.checked)}
                  />
                  <span>Show raw prices</span>
                </label>
                <label className="modern-toggle">
                  <input
                    type="checkbox"
                    checked={showRemovedRaws}
                    onChange={(e) => setShowRemovedRaws(e.target.checked)}
                  />
                  <span>Show removed raws</span>
                </label>
              </div>

              <QuotationLinesTable
                quotationLines={quotationLines}
                removedLines={removedLines}
                showRawPrices={showRawPrices}
                showRemovedRaws={showRemovedRaws}
                searchQuery={searchQuery}
                editingLineId={editingLineId}
                editQty={editQty}
                editRate={editRate}
                items={items}
                rawMaterials={rawMaterials}
                quotationId={quotationId}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
                onSaveEdit={saveEdit}
                onRemoveLine={handleRemoveLine}
                onUndoRemove={handleUndoRemove}
                onDecrementQuantity={handleDecrementQuantity}
                onEditQtyChange={setEditQty}
                onEditRateChange={setEditRate}
                calculateGrandTotal={calculateGrandTotal}
              />
            </div>
          )}

          <p className="note-text">
            <i className="fas fa-info-circle"></i>
            Note: Serial No applies to ITEM rows. RAW rows are shown as a), b), ...
          </p>
        </main>
      </div>

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
                  const quotation = await quotationService.getQuotationById(quotationId);
                  setSelectedCatalogs(quotation.linkedCatalogs?.map(c => c.id) || []);
                  setCatalogModalOpen(false);
                  setCatalogFilter('');
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
              Save & Assign
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MakeQuotation;

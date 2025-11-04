import React, { useState, useEffect } from 'react';
import { rawMaterialService } from '../../services/rawMaterialService';
import { itemService } from '../../services/itemService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/rawmaterialmaster.css';

const RawMaterialMaster = () => {
  const [rawMaterials, setRawMaterials] = useState([]);
  const [filteredRawMaterials, setFilteredRawMaterials] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    price: '',
    code: '',
    linkedItemId: '',
    supplierId: '',
    addInQuotation: true,
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, rawMaterialId: null });

  useEffect(() => {
    fetchRawMaterials();
    fetchItems();
    fetchSuppliers();
  }, []);

  const filterRawMaterials = React.useCallback(() => {
    let filtered = rawMaterials;

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(rm =>
        String(rm.id).includes(searchLower) ||
        (rm.name || '').toLowerCase().includes(searchLower) ||
        (rm.code || '').toLowerCase().includes(searchLower) ||
        (rm.linkedItemName || '').toLowerCase().includes(searchLower)
      );
    }

    setFilteredRawMaterials(filtered);
  }, [search, rawMaterials]);

  useEffect(() => {
    filterRawMaterials();
  }, [search, rawMaterials, filterRawMaterials]);

  const fetchRawMaterials = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await rawMaterialService.getAllRawMaterials();
      setRawMaterials(data);
    } catch (err) {
      setError('Failed to fetch raw materials: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await itemService.getAllItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const data = await userService.getAllUsers('Supplier');
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setForm({
      name: '',
      quantity: '',
      price: '',
      code: '',
      linkedItemId: '',
      supplierId: '',
      addInQuotation: true,
      description: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.code) {
      setError('Name and Code are required');
      return;
    }

    setLoading(true);
    try {
      const rawMaterialData = {
        ...form,
        quantity: form.quantity ? Number(form.quantity) : null,
        price: form.price ? Number(form.price) : null,
        linkedItemId: form.linkedItemId ? Number(form.linkedItemId) : null,
        supplierId: form.supplierId ? Number(form.supplierId) : null
      };

      if (editingId) {
        await rawMaterialService.updateRawMaterial(editingId, rawMaterialData);
      } else {
        await rawMaterialService.createRawMaterial(rawMaterialData);
      }

      await fetchRawMaterials();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rawMaterial) => {
    setEditingId(rawMaterial.id);
    setForm({
      name: rawMaterial.name,
      quantity: rawMaterial.quantity || '',
      price: rawMaterial.price || '',
      code: rawMaterial.code,
      linkedItemId: rawMaterial.linkedItemId || '',
      supplierId: rawMaterial.supplierId || '',
      addInQuotation: rawMaterial.addInQuotation,
      description: rawMaterial.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (rawMaterialId) => {
    setDeleteModal({ isOpen: true, rawMaterialId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, rawMaterialId: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.rawMaterialId) return;

    setLoading(true);
    setError('');
    try {
      await rawMaterialService.deleteRawMaterial(deleteModal.rawMaterialId);
      await fetchRawMaterials();
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByItem = async () => {
    if (!filterItem) {
      await fetchRawMaterials();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await rawMaterialService.getAllRawMaterials(filterItem);
      setRawMaterials(data);
    } catch (err) {
      setError('Failed to filter: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Raw Material Master</h1>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="master-content">
        <section className="form-card">
          <div className="card-header">
            <i className="fas fa-cubes"></i>
            {editingId ? 'Edit Raw Material' : 'Add Raw Material'}
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Raw Material Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Raw Material Name"
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>
                Item Code <span className="required">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="Item Code"
                required
              />
            </div>

            <div className="form-group">
              <label>Linked Item</label>
              <select
                name="linkedItemId"
                value={form.linkedItemId}
                onChange={handleChange}
              >
                <option value="">-- Select Item --</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.itemName} (ID: {item.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <select
                name="supplierId"
                value={form.supplierId}
                onChange={handleChange}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.fullName} (ID: {sup.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Add in Quotation?</label>
              <select
                name="addInQuotation"
                value={form.addInQuotation}
                onChange={handleChange}
              >
                <option value={true}>Yes</option>
                <option value={false}>No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Description"
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
              Raw Materials List
            </h3>
            <div className="header-actions">
              <div className="filter-group">
                <label>Filter by Item:</label>
                <select
                  value={filterItem}
                  onChange={(e) => setFilterItem(e.target.value)}
                >
                  <option value="">-- All Items --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.itemName}
                    </option>
                  ))}
                </select>
                <button className="btn btn-filter" onClick={handleFilterByItem}>
                  <i className="fas fa-filter"></i>
                  Filter
                </button>
              </div>
              <input
                className="search-input"
                placeholder="Search in table..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Code</th>
                    <th>Linked Item</th>
                    <th>Supplier</th>
                    <th>Add in Quotation</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRawMaterials.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="no-data">No raw materials found</td>
                    </tr>
                  ) : (
                    filteredRawMaterials.map(rm => (
                      <tr key={rm.id}>
                        <td>{rm.id}</td>
                        <td>{rm.name}</td>
                        <td>{rm.quantity || 0}</td>
                        <td>{rm.price || 0}</td>
                        <td>{rm.code}</td>
                        <td>{rm.linkedItemName ? `${rm.linkedItemName} (ID: ${rm.linkedItemId})` : '—'}</td>
                        <td>{rm.supplierName ? `${rm.supplierName} (ID: ${rm.supplierId})` : '—'}</td>
                        <td>
                          <span className={`badge ${rm.addInQuotation ? 'badge-yes' : 'badge-no'}`}>
                            {rm.addInQuotation ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-edit" 
                            onClick={() => handleEdit(rm)}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                        </td>
                        <td>
                          <button 
                            className="btn btn-delete" 
                            onClick={() => openDeleteModal(rm.id)}
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
        <p>Are you sure you want to delete this raw material?</p>
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

export default RawMaterialMaster;
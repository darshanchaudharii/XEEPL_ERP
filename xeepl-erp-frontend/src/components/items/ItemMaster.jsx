import React, { useState, useEffect } from 'react';
import { itemService } from '../../services/itemService';
import { contentService } from '../../services/contentService';
import { userService } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/itemmaster.css';

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    itemName: '',
    itemCategoryId: '',
    itemSubcategoryId: '',
    supplierId: '',
    itemQty: '',
    itemPrice: '',
    itemCode: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, itemId: null });

  const filterItems = React.useCallback(() => {
    if (!search.trim()) {
      setFilteredItems(items);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = items.filter(item =>
      String(item.id).includes(searchLower) ||
      (item.itemName || '').toLowerCase().includes(searchLower) ||
      (item.itemCode || '').toLowerCase().includes(searchLower) ||
      (item.itemCategoryName || '').toLowerCase().includes(searchLower)
    );
    setFilteredItems(filtered);
  }, [search, items]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await itemService.getAllItems();
      setItems(data);
    } catch (err) {
      setError('Failed to fetch items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await contentService.getAllContents();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterItems();
  }, [filterItems]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      itemName: '',
      itemCategoryId: '',
      itemSubcategoryId: '',
      supplierId: '',
      itemQty: '',
      itemPrice: '',
      itemCode: '',
      description: ''
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.itemName) {
      setError('Item name is required');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        ...form,
        itemCategoryId: form.itemCategoryId ? Number(form.itemCategoryId) : null,
        itemSubcategoryId: form.itemSubcategoryId ? Number(form.itemSubcategoryId) : null,
        supplierId: form.supplierId ? Number(form.supplierId) : null,
        itemQty: form.itemQty ? Number(form.itemQty) : null,
        itemPrice: form.itemPrice ? Number(form.itemPrice) : null
      };

      if (editingId) {
        await itemService.updateItem(editingId, itemData);
      } else {
        await itemService.createItem(itemData);
      }

      await fetchItems();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      itemName: item.itemName,
      itemCategoryId: item.itemCategoryId || '',
      itemSubcategoryId: item.itemSubcategoryId || '',
      supplierId: item.supplierId || '',
      itemQty: item.itemQty || '',
      itemPrice: item.itemPrice || '',
      itemCode: item.itemCode || '',
      description: item.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openDeleteModal = (itemId) => {
    setDeleteModal({ isOpen: true, itemId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, itemId: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.itemId) return;

    setLoading(true);
    setError('');
    try {
      await itemService.deleteItem(deleteModal.itemId);
      await fetchItems();
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Item Master</h1>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="master-content">
        <section className="form-card">
          <div className="card-header">
            <i className="fas fa-box"></i>
            {editingId ? 'Edit Item' : 'Add Item'}
          </div>
          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Item Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                value={form.itemName}
                onChange={handleChange}
                placeholder="Item Name"
                required
              />
            </div>

            <div className="form-group">
              <label>Item Category</label>
              <select
                name="itemCategoryId"
                value={form.itemCategoryId}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <small>Type to search categories. (Source: contentmaster → "Item Categories")</small>
            </div>

            <div className="form-group">
              <label>Sub-Category</label>
              <select
                name="itemSubcategoryId"
                value={form.itemSubcategoryId}
                onChange={handleChange}
              >
                <option value="">Select sub-category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
              <small>Source: contentmaster → "Item Sub-Categories"</small>
            </div>

            <div className="form-group">
              <label>Supplier</label>
              <select
                name="supplierId"
                value={form.supplierId}
                onChange={handleChange}
              >
                <option value="">Select supplier</option>
                {suppliers.map(sup => (
                  <option key={sup.id} value={sup.id}>
                    {sup.fullName}
                  </option>
                ))}
              </select>
              <small>Suppliers are pulled from usermaster where role = "Supplier".</small>
            </div>

            <div className="form-group">
              <label>Item Qty</label>
              <input
                type="number"
                name="itemQty"
                value={form.itemQty}
                onChange={handleChange}
                placeholder="Item Qty"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Item Price</label>
              <input
                type="number"
                name="itemPrice"
                value={form.itemPrice}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Item Code</label>
              <input
                type="text"
                name="itemCode"
                value={form.itemCode}
                onChange={handleChange}
                placeholder="Item Code"
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
              Items List
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
                    <th>Name</th>
                    <th>Category</th>
                    <th>Sub-Category</th>
                    <th>Supplier</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Code</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="no-data">No items found</td>
                    </tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.itemName}</td>
                        <td>{item.itemCategoryName || '—'}</td>
                        <td>{item.itemSubcategoryName || '—'}</td>
                        <td>{item.supplierName || '—'}</td>
                        <td>{item.itemQty || 0}</td>
                        <td>{item.itemPrice || 0}</td>
                        <td>{item.itemCode || '—'}</td>
                        <td>
                          <button 
                            className="btn btn-edit" 
                            onClick={() => handleEdit(item)}
                          >
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                        </td>
                        <td>
                          <button 
                            className="btn btn-delete" 
                            onClick={() => openDeleteModal(item.id)}
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
          <div className="table-tip">
            <small>Tip: type in the search box to filter rows instantly.</small>
          </div>
        </section>
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title="Confirm Delete"
        size="small"
      >
        <p>Are you sure you want to delete this item?</p>
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

export default ItemMaster;
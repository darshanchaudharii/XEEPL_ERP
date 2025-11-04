import React, { useState, useEffect, useRef } from 'react';
import { contentService } from '../../services/contentService';
import { sectionService } from '../../services/sectionService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import Modal from '../common/Modal';
import '../../styles/contentmaster.css';

const ContentMaster = () => {
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [sections, setSections] = useState([]);
  const [form, setForm] = useState({
    sectionId: '',
    title: '',
    sequence: 0,
    description: '',
    altTag: '',
    link: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, contentId: null });
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContents();
    fetchSections();
  }, []);

  const filterContents = React.useCallback(() => {
    if (!search.trim()) {
      setFilteredContents(contents);
      return;
    }

    const searchLower = search.toLowerCase();
    const filtered = contents.filter(content =>
      String(content.id).includes(searchLower) ||
      (content.sectionName || '').toLowerCase().includes(searchLower) ||
      (content.title || '').toLowerCase().includes(searchLower)
    );
    setFilteredContents(filtered);
  }, [search, contents]);

  useEffect(() => {
    filterContents();
  }, [filterContents]);

  const fetchContents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await contentService.getAllContents();
      // normalize created date into a single field _createdRaw
      const normalized = (data || []).map(item => {
        const created =
          item.createdAt ??
          item.createdOn ??
          item.createdDate ??
          item.created ??
          item.audit?.createdAt ??
          item.audit?.createdOn ??
          item.createdTimestamp ??
          item.createdAtEpoch ??
          null;
        return { ...item, _createdRaw: created };
      });
      setContents(normalized);
    } catch (err) {
      setError('Failed to fetch contents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const data = await sectionService.getAllSections();
      setSections(data);
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setForm({
      sectionId: '',
      title: '',
      sequence: 0,
      description: '',
      altTag: '',
      link: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null); // Important: reset editing state
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!form.sectionId || !form.title) {
    setError('Section and Title are required');
    return;
  }

  setLoading(true);
  try {
    const contentData = {
      sectionId: form.sectionId,
      title: form.title.trim(),
      sequence: parseInt(form.sequence) || 0,
      description: form.description?.trim() || '',
      altTag: form.altTag?.trim() || '',
      link: form.link?.trim() || ''
    };

    if (editingId) {
      console.log('Updating content:', {
        id: editingId,
        data: contentData,
        hasFile: !!imageFile
      });
      await contentService.updateContent(editingId, contentData, imageFile);
    } else {
      await contentService.createContent(contentData, imageFile);
    }
    
    await fetchContents();
    resetForm();
  } catch (err) {
    console.error('Submit Error:', err);
    setError(err.message || 'Failed to process content. Please check the console for details.');
  } finally {
    setLoading(false);
  }
};
const handleEdit = (content) => {
  setEditingId(content.id);
  setForm({
    sectionId: content.sectionId,
    title: content.title,
    sequence: content.sequence || 0,
    description: content.description || '',
    altTag: content.altTag || '',
    link: content.link || ''
  });

  setImagePreview(content.imagePath ? `http://localhost:8080/uploads/${content.imagePath}` : null);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const openDeleteModal = (contentId) => {
  setDeleteModal({ isOpen: true, contentId });
};

const closeDeleteModal = () => {
  setDeleteModal({ isOpen: false, contentId: null });
};

  const handleDelete = async () => {
    if (!deleteModal.contentId) return;

    setLoading(true);
    setError('');
    try {
      await contentService.deleteContent(deleteModal.contentId);
      await fetchContents();
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = (typeof value === 'number' || /^\d+$/.test(String(value)))
      ? new Date(Number(value))
      : new Date(value);
    if (isNaN(date.getTime())) return '—';
 
    return date.toLocaleDateString();
  };

  return (
    <div className="container">
      <h1 className="page-title">Content Master</h1>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      <div className="master-content">
        <section className="form-card">
         <div className="card-header">
      <i className="fas fa-file-alt"></i>
     {editingId ? 'Edit Content' : 'Add Content'}
          </div>

          <form className="card-body" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Section <span className="required">*</span>
              </label>
              <select 
                name="sectionId" 
                value={form.sectionId} 
                onChange={handleChange}
                required
              >
                <option value="">Search section...</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.sectionName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="form-group">
              <label>Sequence</label>
              <input
                type="number"
                name="sequence"
                value={form.sequence}
                onChange={handleChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter description"
              />
            </div>

            <div className="form-group">
              <label>Alt Tag</label>
              <input
                type="text"
                name="altTag"
                value={form.altTag}
                onChange={handleChange}
                placeholder="Image alt tag"
              />
            </div>

            <div className="form-group">
              <label>Link</label>
              <input
                type="text"
                name="link"
                value={form.link}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label>Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
              />
              <small>On create: file is optional; if uploaded we store type, size & createdon.</small>
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              )}
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-save" disabled={loading}>
                <i className="fas fa-save"></i>
                {editingId ? 'Update' : 'Save'}
              </button>
              
              {/* Only show clear button when not editing */}
              {!editingId && (
                <button 
                  type="button" 
                  className="btn btn-clear" 
                  onClick={resetForm}
                  disabled={loading}
                >
                  <i className="fas fa-undo"></i>
                  Clear
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="table-card">
          <div className="table-header">
            <h3>
              <i className="fas fa-list"></i>
              Content List
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
                    <th>Section</th>
                    <th>Title</th>
                    <th>Seq</th>
                    <th>Image</th>
                    <th>Type / Size</th>
                    <th>Created</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContents.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">No contents found</td>
                    </tr>
                  ) : (
                    filteredContents.map(content => (
                      <tr key={content.id}>
                        <td>{content.id}</td>
                        <td>{content.sectionName}</td>
                        <td>{content.title}</td>
                        <td>{content.sequence}</td>
                        <td>
                          {content.imagePath ? (
                            <img 
                              src={`http://localhost:8080/uploads/${content.imagePath}`}
                              alt={content.altTag || content.title}
                              className="table-image"
                            />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {content.imageType && content.imageSize 
                            ? `${content.imageType.split('/')[1]} / ${(content.imageSize / 1024).toFixed(0)}KB`
                            : '—'
                          }
                        </td>
                        <td>
                          {formatDate(content._createdRaw)}
                        </td>
                        <td>
                          <button className="btn btn-edit"
                          onClick={() => handleEdit(content) }>
                            <i className="fas fa-edit"></i>
                            Edit
                          </button>
                        </td>
                        <td>
                          <button 
                            className="btn btn-delete" 
                            onClick={() => openDeleteModal(content.id)}
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>
                        </td>
                      </tr>
                    )))
                  }
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
        <p>Are you sure you want to delete this content?</p>
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

export default ContentMaster;
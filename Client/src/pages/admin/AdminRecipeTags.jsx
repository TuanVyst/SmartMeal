import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';

export default function AdminRecipeTags() {
  const dialog = useDialog();
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: '' });
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await adminService.getAllRecipeTags();
      setTags(data);
    } catch (error) {
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await adminService.updateRecipeTag(editingTag.id, formData);
      } else {
        await adminService.createRecipeTag(formData);
      }
      fetchTags();
      closeModal();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, type: tag.type || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const ok = await dialog.confirm({ title: 'Delete tag?', message: 'Are you sure you want to delete this tag?', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await adminService.deleteRecipeTag(id);
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setEditingTag(null);
    setFormData({ name: '', type: '' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormData({ name: '', type: '' });
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()) ||
    (tag.type || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading recipe tags...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Manage Recipe Tags</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Recipe Tags</h2>
          <input
            className="admin-table-search"
            placeholder="Search by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="action-btn create" onClick={openModal}>
            <FiPlus size={16} /> Add New Tag
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-state">
                  <p>No recipe tags found</p>
                </td>
              </tr>
            )}
            {filteredTags.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.name}</td>
                <td>{tag.type || '-'}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEdit(tag)} title="Edit">
                    <FiEdit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(tag.id)} title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTag ? 'Edit Recipe Tag' : 'Add New Recipe Tag'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTag ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

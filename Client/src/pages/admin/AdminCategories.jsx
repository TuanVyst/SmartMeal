import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { adminService } from '../../services/adminService';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ labelName: '' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminService.getAllCategories();
      setCategories(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ labelName: '' });
    setModal('create');
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ labelName: cat.labelName });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.labelName.trim()) return;
    try {
      if (editing) {
        await adminService.updateCategory(editing.label_id || editing.id, form);
      } else {
        await adminService.createCategory(form);
      }
      fetchCategories();
      setModal(null);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu danh mục');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) return <div className="admin-loading">Đang tải danh mục...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Manage Categories</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Categories</h2>
          <button className="btn-admin-primary" onClick={openCreate}>
            <FiPlus size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Add Category
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan={3} className="empty-state"><p>No categories found</p></td></tr>
            )}
            {categories.map((cat, i) => (
              <tr key={cat.label_id || cat.id}>
                <td>{i + 1}</td>
                <td>{cat.labelName}</td>
                <td>
                  <button className="action-btn edit" onClick={() => openEdit(cat)}>
                    <FiEdit2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(cat.label_id || cat.id)}>
                    <FiTrash2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>&times;</button>
            <h2>{editing ? 'Edit Category' : 'Create Category'}</h2>
            <div className="admin-form-group">
              <label>Name</label>
              <input
                value={form.labelName}
                onChange={(e) => setForm({ ...form, labelName: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-admin-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-admin-primary" onClick={handleSave}>
                {editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

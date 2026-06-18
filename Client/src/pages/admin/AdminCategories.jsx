import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function AdminCategories() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Vegetarian', category: 'Diet' },
    { id: 2, name: 'Gluten-Free', category: 'Diet' },
    { id: 3, name: 'High Protein', category: 'Nutrition' },
    { id: 4, name: 'Low Carb', category: 'Nutrition' },
    { id: 5, name: 'Quick Meals', category: 'Time' },
  ]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', category: '' });
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: '' });
    setModal('create');
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, category: cat.category });
    setModal('edit');
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setCategories(categories.map((c) => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      setCategories([...categories, { id: Date.now(), ...form }]);
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

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
              <th>Group</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan={4} className="empty-state"><p>No categories found</p></td></tr>
            )}
            {categories.map((cat, i) => (
              <tr key={cat.id}>
                <td>{i + 1}</td>
                <td>{cat.name}</td>
                <td><span className="status-badge active">{cat.category}</span></td>
                <td>
                  <button className="action-btn edit" onClick={() => openEdit(cat)}>
                    <FiEdit2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(cat.id)}>
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="admin-form-group">
              <label>Group</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Diet, Nutrition, Time"
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

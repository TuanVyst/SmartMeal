import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function AdminCategories() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Chay', category: 'Chế độ ăn' },
    { id: 2, name: 'Không Gluten', category: 'Chế độ ăn' },
    { id: 3, name: 'Nhiều đạm', category: 'Dinh dưỡng' },
    { id: 4, name: 'Ít Carb', category: 'Dinh dưỡng' },
    { id: 5, name: 'Món nhanh', category: 'Thời gian' },
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
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản lý danh mục</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>Tất cả danh mục</h2>
          <button className="btn-admin-primary" onClick={openCreate}>
            <FiPlus size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Thêm danh mục
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên</th>
              <th>Nhóm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan={4} className="empty-state"><p>Không tìm thấy danh mục</p></td></tr>
            )}
            {categories.map((cat, i) => (
              <tr key={cat.id}>
                <td>{i + 1}</td>
                <td>{cat.name}</td>
                <td><span className="status-badge active">{cat.category}</span></td>
                <td>
                  <button className="action-btn edit" onClick={() => openEdit(cat)}>
                    <FiEdit2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Sửa
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(cat.id)}>
                    <FiTrash2 size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Xóa
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
            <h2>{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
            <div className="admin-form-group">
              <label>Tên</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tên danh mục"
              />
            </div>
            <div className="admin-form-group">
              <label>Nhóm</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="VD: Chế độ ăn, Dinh dưỡng, Thời gian"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-admin-secondary" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn-admin-primary" onClick={handleSave}>
                {editing ? 'Cập nhật' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';

export default function AdminIngredientTags() {
  const dialog = useDialog();
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: '' });
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const data = await adminService.getAllIngredientTags();
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
        await adminService.updateIngredientTag(editingTag.id, formData);
      } else {
        await adminService.createIngredientTag(formData);
      }
      fetchTags();
      closeModal();
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, category: tag.category || '' });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const ok = await dialog.confirm({ title: 'Xóa thẻ nguyên liệu?', message: 'Bạn có chắc chắn muốn xóa thẻ này không?', confirmLabel: 'Xóa', danger: true });
    if (!ok) return;
    try {
      await adminService.deleteIngredientTag(id);
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setEditingTag(null);
    setFormData({ name: '', category: '' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
    setFormData({ name: '', category: '' });
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()) ||
    (tag.category || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Đang tải thẻ nguyên liệu...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản lý Thẻ Nguyên liệu</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>Tất cả thẻ nguyên liệu</h2>
          <input
            className="admin-table-search"
            placeholder="Tìm theo tên hoặc danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="action-btn create" onClick={openModal}>
            <FiPlus size={16} /> Thêm thẻ mới
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên thẻ</th>
              <th>Danh mục</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-state">
                  <p>Không tìm thấy thẻ nguyên liệu nào</p>
                </td>
              </tr>
            )}
            {filteredTags.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.name}</td>
                <td>{tag.category || '-'}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEdit(tag)} title="Chỉnh sửa">
                    <FiEdit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(tag.id)} title="Xóa">
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
              <h3>{editingTag ? 'Chỉnh sửa Thẻ Nguyên liệu' : 'Thêm mới Thẻ Nguyên liệu'}</h3>
              <button className="modal-close" onClick={closeModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Tên thẻ</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Rau xanh, Thịt đỏ..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="VD: Nhóm đạm, Rau củ..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingTag ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

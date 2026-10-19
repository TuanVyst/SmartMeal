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
    const ok = await dialog.confirm({ title: 'Xóa thẻ công thức?', message: 'Bạn có chắc chắn muốn xóa thẻ công thức này không?', confirmLabel: 'Xóa', danger: true });
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

  if (loading) return <div className="admin-loading">Đang tải thẻ công thức...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản lý Thẻ Công thức</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>Tất cả thẻ công thức</h2>
          <input
            className="admin-table-search"
            placeholder="Tìm theo tên hoặc loại..."
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
              <th>Phân loại</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-state">
                  <p>Không tìm thấy thẻ công thức nào</p>
                </td>
              </tr>
            )}
            {filteredTags.map((tag) => {
              const typeLabels = {
                meal: 'Bữa ăn',
                cook: 'Phương pháp nấu',
                diet: 'Chế độ ăn',
                taste: 'Khẩu vị',
              };
              const displayType = typeLabels[tag.type] || tag.type || 'Khác';
              return (
                <tr key={tag.id}>
                  <td><strong>{tag.name}</strong></td>
                  <td>
                    <span className="status-badge" style={{
                      background: tag.type === 'meal' ? '#ecfdf5' : tag.type === 'cook' ? '#eff6ff' : '#f8fafc',
                      color: tag.type === 'meal' ? '#059669' : tag.type === 'cook' ? '#2563eb' : '#64748b',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600
                    }}>
                      {displayType}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => handleEdit(tag)} title="Chỉnh sửa">
                      <FiEdit size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(tag.id)} title="Xóa">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingTag ? 'Chỉnh sửa Thẻ Công thức' : 'Thêm mới Thẻ Công thức'}</h3>
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
                  placeholder="VD: Bữa sáng, Xào, Chiên..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phân loại thẻ</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="">-- Chọn phân loại thẻ --</option>
                  <option value="meal">Bữa ăn (Sáng, Trưa, Tối, Phụ)</option>
                  <option value="cook">Phương pháp nấu ăn (Canh&Súp, Nướng, Chiên, Đồ uống, Tráng miệng...)</option>
                  <option value="diet">Chế độ ăn (Ăn chay, Eat clean...)</option>
                  <option value="taste">Khẩu vị / Hương vị (Cay, Ngọt...)</option>
                  <option value="other">Khác</option>
                </select>
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

import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';

export default function AdminPlans() {
  const dialog = useDialog();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = () => {
    setLoading(true);
    adminService.getAllPlans()
      .then((res) => {
        // Lọc bỏ gói cơ bản (giá = 0) khỏi giao diện admin
        const filtered = (res || []).filter(p => p.price > 0);
        setPlans(filtered);
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  };

  const handleEditClick = (plan) => {
    setEditingPlan({ ...plan });
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingPlan({
      name: '',
      price: 0,
      duration: 30,
      description: 'Mô tả gói cước',
      features: '["ai_advanced", "meal_plan", "calorie_tracking", "no_ads", "priority_support"]', // Tính năng mặc định
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    const ok = await dialog.confirm({
      title: 'Xoá gói cước',
      message: 'Bạn có chắc chắn muốn xoá gói này không? Những người dùng đã đăng ký trước đó vẫn có thể sử dụng bình thường.',
      confirmLabel: 'Xoá',
      danger: true
    });
    
    if (!ok) return;

    try {
      await adminService.deletePlan(id);
      dialog.success('Thành công', 'Đã xoá gói cước');
      fetchPlans();
    } catch (error) {
      console.error(error);
      dialog.error('Lỗi', 'Không thể xoá gói cước');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan.plan_id) {
        await adminService.updatePlan(editingPlan.plan_id, editingPlan);
        dialog.success('Thành công', 'Cập nhật gói thành công');
      } else {
        await adminService.createPlan(editingPlan);
        dialog.success('Thành công', 'Đã thêm gói mới');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error(error);
      dialog.error('Lỗi', 'Không thể lưu gói cước');
    }
  };

  if (loading) return <div className="admin-loading">Đang tải bảng giá...</div>;

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Quản lý Bảng Giá (Plans)</h1>
        <button className="btn btn-primary" onClick={handleCreateClick}>+ Thêm Gói Mới</button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên Gói</th>
              <th>Giá (VNĐ)</th>
              <th>Thời lượng (Ngày)</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.plan_id}>
                <td style={{ fontWeight: '500' }}>{plan.name}</td>
                <td style={{ fontWeight: 'bold', color: '#059669' }}>
                  {plan.price.toLocaleString('vi-VN')} đ
                </td>
                <td>{plan.duration === 0 ? 'Vĩnh viễn' : `${plan.duration} ngày`}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEditClick(plan)}>Sửa</button>
                  <button className="action-btn delete" onClick={() => handleDeleteClick(plan.plan_id)} style={{ marginLeft: '8px' }}>Xoá</button>
                </td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr><td colSpan={4} className="empty-state"><p>Chưa có gói cước nào</p></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ width: '400px' }}>
            <div className="admin-modal-header">
              <h3>{editingPlan.plan_id ? 'Sửa Gói Cước' : 'Thêm Gói Mới'}</h3>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body">
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tên Gói</label>
                  <input
                    type="text"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Giá (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Thời lượng (Ngày)</label>
                  <input
                    type="number"
                    value={editingPlan.duration}
                    onChange={(e) => setEditingPlan({ ...editingPlan, duration: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';
import './AdminPlans.css';

const STATUS_LABELS = {
  scheduled: 'Sắp diễn ra',
  active: 'Đang chạy',
  expired: 'Đã kết thúc',
  disabled: 'Đã tắt',
};

const pad = (value) => String(value).padStart(2, '0');

const toLocalInput = (isoValue) => {
  if (!isoValue) return '';
  const d = new Date(isoValue);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDateTime = (isoValue) => {
  if (!isoValue) return '—';
  const d = new Date(isoValue);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value) || 0);

// Mirrors PlanPricingHelper.ComputeDiscountedPrice so the preview matches the charge.
const computeSalePrice = (price, percent) => {
  const base = Number(price) || 0;
  const pct = Number(percent) || 0;
  if (base <= 0 || pct <= 0) return base;
  const discounted = Math.round((base * (100 - pct)) / 100);
  return discounted < 1000 ? base : discounted;
};

const emptyPromoForm = () => {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    promo_id: null,
    name: '',
    discountPercent: 20,
    startAt: toLocalInput(now.toISOString()),
    endAt: toLocalInput(end.toISOString()),
    planIds: [],
  };
};

export default function AdminPlans() {
  const dialog = useDialog();
  const [plans, setPlans] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Plan modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Promotion modal state
  const [promoModal, setPromoModal] = useState(null);
  const [savingPromo, setSavingPromo] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, promosRes] = await Promise.allSettled([
        adminService.getAllPlans(),
        adminService.getPromotions(),
      ]);

      const planList = plansRes.status === 'fulfilled' ? plansRes.value || [] : [];
      setPlans(planList.filter((p) => p.price > 0));

      if (promosRes.status === 'fulfilled') {
        setPromotions(promosRes.value || []);
      } else {
        console.error('Không tải được khuyến mãi:', promosRes.reason);
        setPromotions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ----- Plan CRUD (unchanged behaviour, base price only) -----

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
      features: '["ai_advanced", "meal_plan", "calorie_tracking", "no_ads", "priority_support"]',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    const ok = await dialog.confirm({
      title: 'Xoá gói cước',
      message:
        'Bạn có chắc chắn muốn xoá gói này không? Những người dùng đã đăng ký trước đó vẫn có thể sử dụng bình thường.',
      confirmLabel: 'Xoá',
      danger: true,
    });

    if (!ok) return;

    try {
      await adminService.deletePlan(id);
      dialog.success('Thành công', 'Đã xoá gói cước');
      fetchData();
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
      fetchData();
    } catch (error) {
      console.error(error);
      dialog.error('Lỗi', error.response?.data?.message || 'Không thể lưu gói cước');
    }
  };

  // ----- Promotion CRUD -----

  const openCreatePromo = () => {
    setPromoModal({ ...emptyPromoForm(), planIds: plans.map((p) => p.plan_id) });
  };

  const openEditPromo = (promo) => {
    setPromoModal({
      promo_id: promo.promo_id,
      name: promo.name,
      discountPercent: promo.discountPercent,
      startAt: toLocalInput(promo.startAt),
      endAt: toLocalInput(promo.endAt),
      planIds: (promo.plans || []).map((p) => p.plan_id),
    });
  };

  const togglePromoPlan = (planId) => {
    setPromoModal((prev) => {
      if (!prev) return prev;
      const selected = prev.planIds.includes(planId);
      return {
        ...prev,
        planIds: selected ? prev.planIds.filter((id) => id !== planId) : [...prev.planIds, planId],
      };
    });
  };

  const toggleAllPromoPlans = () => {
    setPromoModal((prev) => {
      if (!prev) return prev;
      const allSelected = plans.length > 0 && prev.planIds.length === plans.length;
      return { ...prev, planIds: allSelected ? [] : plans.map((p) => p.plan_id) };
    });
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    if (!promoModal) return;

    const name = promoModal.name.trim();
    const percent = Number(promoModal.discountPercent);

    if (!name) return dialog.error('Lỗi', 'Tên khuyến mãi không được để trống');
    if (!(percent >= 1 && percent <= 99)) return dialog.error('Lỗi', 'Phần trăm giảm phải từ 1 đến 99');
    if (!promoModal.startAt || !promoModal.endAt) return dialog.error('Lỗi', 'Vui lòng chọn thời gian áp dụng');

    const startAt = new Date(promoModal.startAt);
    const endAt = new Date(promoModal.endAt);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()))
      return dialog.error('Lỗi', 'Thời gian không hợp lệ');
    if (endAt <= startAt) return dialog.error('Lỗi', 'Thời gian kết thúc phải sau thời gian bắt đầu');
    if (endAt <= new Date()) return dialog.error('Lỗi', 'Thời gian kết thúc phải ở tương lai');
    if (promoModal.planIds.length === 0) return dialog.error('Lỗi', 'Vui lòng chọn ít nhất một gói dịch vụ');

    setSavingPromo(true);
    try {
      const payload = {
        name,
        discountPercent: percent,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        planIds: promoModal.planIds,
      };

      if (promoModal.promo_id) {
        await adminService.updatePromotion(promoModal.promo_id, payload);
        dialog.success('Thành công', 'Đã cập nhật khuyến mãi');
      } else {
        await adminService.createPromotion(payload);
        dialog.success('Thành công', 'Đã tạo khuyến mãi');
      }

      setPromoModal(null);
      fetchData();
    } catch (error) {
      console.error(error);
      dialog.error('Lỗi', error.response?.data?.message || 'Không thể lưu khuyến mãi');
    } finally {
      setSavingPromo(false);
    }
  };

  const handleEndPromo = async (promo) => {
    const ok = await dialog.confirm({
      title: 'Kết thúc khuyến mãi',
      message: `Kết thúc ngay "${promo.name}"? Giá các gói sẽ trở về giá gốc.`,
      confirmLabel: 'Kết thúc',
      danger: true,
    });
    if (!ok) return;

    try {
      await adminService.endPromotion(promo.promo_id);
      dialog.success('Thành công', 'Đã kết thúc khuyến mãi');
      fetchData();
    } catch (error) {
      console.error(error);
      dialog.error('Lỗi', error.response?.data?.message || 'Không thể kết thúc khuyến mãi');
    }
  };

  const handleDeletePromo = async (promo) => {
    const ok = await dialog.confirm({
      title: 'Xoá khuyến mãi',
      message: `Xoá "${promo.name}"? Lịch sử giao dịch đã áp dụng khuyến mãi vẫn được giữ nguyên.`,
      confirmLabel: 'Xoá',
      danger: true,
    });
    if (!ok) return;

    try {
      await adminService.deletePromotion(promo.promo_id);
      dialog.success('Thành công', 'Đã xoá khuyến mãi');
      fetchData();
    } catch (error) {
      console.error(error);
      dialog.error('Lỗi', error.response?.data?.message || 'Không thể xoá khuyến mãi');
    }
  };

  if (loading) return <div className="admin-loading">Đang tải bảng giá...</div>;

  const selectedPlans = promoModal
    ? plans.filter((p) => promoModal.planIds.includes(p.plan_id))
    : [];
  const allPlansSelected = plans.length > 0 && selectedPlans.length === plans.length;

  return (
    <div>
      <div
        className="admin-page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h1>Quản lý Bảng Giá (Plans)</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={openCreatePromo}>
            + Tạo Khuyến Mãi
          </button>
          <button className="btn btn-primary" onClick={handleCreateClick}>
            + Thêm Gói Mới
          </button>
        </div>
      </div>

      {/* ---- Promotions ---- */}
      <div className="admin-section">
        <h2 className="admin-section-title">Khuyến mãi</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên khuyến mãi</th>
                <th>Giảm</th>
                <th>Thời gian áp dụng</th>
                <th>Gói áp dụng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.promo_id}>
                  <td style={{ fontWeight: '500' }}>{promo.name}</td>
                  <td>
                    <span className="promo-chip">-{promo.discountPercent}%</span>
                  </td>
                  <td>
                    <div>{formatDateTime(promo.startAt)}</div>
                    <div className="promo-cell-sub">đến {formatDateTime(promo.endAt)}</div>
                  </td>
                  <td>
                    {(promo.plans || []).map((p) => p.name).join(', ') || '—'}
                  </td>
                  <td>
                    <span className={`promo-status promo-status--${promo.status}`}>
                      {STATUS_LABELS[promo.status] || promo.status}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => openEditPromo(promo)}>
                      Sửa
                    </button>
                    {promo.status !== 'expired' && (
                      <button
                        className="action-btn end"
                        onClick={() => handleEndPromo(promo)}
                        style={{ marginLeft: '8px' }}
                      >
                        Kết thúc
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeletePromo(promo)}
                      style={{ marginLeft: '8px' }}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    <p>Chưa có khuyến mãi nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Plans ---- */}
      <div className="admin-section">
        <h2 className="admin-section-title">Gói dịch vụ</h2>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên Gói</th>
                <th>Giá (VNĐ)</th>
                <th>Khuyến mãi</th>
                <th>Thời lượng (Ngày)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.plan_id}>
                  <td style={{ fontWeight: '500' }}>{plan.name}</td>
                  <td>
                    {plan.isOnSale ? (
                      <div className="plan-price-cell">
                        <span className="plan-price-original">{formatVnd(plan.price)}</span>
                        <span className="plan-price-sale">{formatVnd(plan.effectivePrice)}</span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 'bold', color: '#059669' }}>
                        {formatVnd(plan.price)}
                      </span>
                    )}
                  </td>
                  <td>
                    {plan.isOnSale ? (
                      <div className="promo-cell">
                        <span className="promo-chip">-{plan.salePercent}%</span>
                        <span className="promo-cell-sub">đến {formatDateTime(plan.saleEndAt)}</span>
                      </div>
                    ) : (
                      <span className="promo-cell-sub">—</span>
                    )}
                  </td>
                  <td>{plan.duration === 0 ? 'Vĩnh viễn' : `${plan.duration} ngày`}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => handleEditClick(plan)}>
                      Sửa
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteClick(plan.plan_id)}
                      style={{ marginLeft: '8px' }}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">
                    <p>Chưa có gói cước nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Plan modal ---- */}
      {isModalOpen && editingPlan && (
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
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- Promotion modal ---- */}
      {promoModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal promo-modal" style={{ width: '640px' }}>
            <div className="admin-modal-header">
              <h3>{promoModal.promo_id ? 'Sửa Khuyến Mãi' : 'Tạo Khuyến Mãi'}</h3>
            </div>
            <form onSubmit={handleSavePromo}>
              <div className="admin-modal-body">
                <div className="promo-form-grid">
                  <div className="form-group">
                    <label>Tên khuyến mãi</label>
                    <input
                      type="text"
                      value={promoModal.name}
                      maxLength={100}
                      onChange={(e) => setPromoModal({ ...promoModal, name: e.target.value })}
                      placeholder="VD: Sale cuối năm"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Giảm giá (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      step={1}
                      value={promoModal.discountPercent}
                      onChange={(e) =>
                        setPromoModal({ ...promoModal, discountPercent: Number(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Bắt đầu</label>
                    <input
                      type="datetime-local"
                      value={promoModal.startAt}
                      onChange={(e) => setPromoModal({ ...promoModal, startAt: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Kết thúc</label>
                    <input
                      type="datetime-local"
                      value={promoModal.endAt}
                      onChange={(e) => setPromoModal({ ...promoModal, endAt: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="promo-plans-header">
                  <span>Gói áp dụng ({selectedPlans.length}/{plans.length})</span>
                  <button type="button" className="promo-link-btn" onClick={toggleAllPromoPlans}>
                    {allPlansSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>

                <div className="promo-plan-list">
                  {plans.map((plan) => (
                    <label key={plan.plan_id} className="promo-plan-option">
                      <input
                        type="checkbox"
                        checked={promoModal.planIds.includes(plan.plan_id)}
                        onChange={() => togglePromoPlan(plan.plan_id)}
                      />
                      <span className="promo-plan-name">{plan.name}</span>
                      <span className="promo-plan-price">{formatVnd(plan.price)}</span>
                    </label>
                  ))}
                  {plans.length === 0 && <p className="promo-cell-sub">Chưa có gói trả phí nào.</p>}
                </div>

                {selectedPlans.length > 0 && (
                  <div className="promo-preview">
                    <div className="promo-preview-title">Xem trước giá sau giảm</div>
                    <table>
                      <thead>
                        <tr>
                          <th>Gói</th>
                          <th>Giá gốc</th>
                          <th>Giá sau giảm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPlans.map((plan) => (
                          <tr key={plan.plan_id}>
                            <td>{plan.name}</td>
                            <td>{formatVnd(plan.price)}</td>
                            <td className="promo-preview-sale">
                              {formatVnd(computeSalePrice(plan.price, promoModal.discountPercent))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setPromoModal(null)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingPromo}>
                  {savingPromo ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

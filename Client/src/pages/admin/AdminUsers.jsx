import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';
import { useAuth } from '../../context/AuthContext';
import {
  FiEdit2,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiCheck,
  FiX,
  FiAward,
} from 'react-icons/fi';
export default function AdminUsers() {
  const dialog = useDialog();
  const { user: currentUser } = useAuth();
  const currentAccountId = currentUser?.accountId || currentUser?.account_id;

  const [users, setUsers] = useState([]);
  const [proPlans, setProPlans] = useState([]);
  const [subscriptionsByUser, setSubscriptionsByUser] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  // Edit Modal State
  const [editModal, setEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'User',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isProcessingSub, setIsProcessingSub] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersList, plansList, allSubs] = await Promise.all([
        adminService.getAllUsers().catch(() => []),
        adminService.getAllPlans().catch(() => []),
        adminService.getAllSubscriptionsAdmin().catch(() => []),
      ]);

      setUsers(usersList || []);

      const paidPlans = (plansList || [])
        .filter((p) => (p.price || p.Price || 0) > 0)
        .sort((a, b) => (a.price || 0) - (b.price || 0));
      setProPlans(paidPlans);
      if (paidPlans.length > 0 && !selectedPlanId) {
        setSelectedPlanId(paidPlans[0].plan_id || paidPlans[0].Plan_id);
      }

      const now = new Date();
      const activeMap = {};
      (allSubs || []).forEach((s) => {
        const status = (s.status || s.Status || '').toLowerCase();
        const endVal = s.endDate || s.EndDate;
        if (status === 'active' && (!endVal || new Date(endVal) > now)) {
          const accId = String(s.account_id || s.Account_id);
          const existing = activeMap[accId];
          if (!existing || new Date(endVal || 0) > new Date(existing.endDate || existing.EndDate || 0)) {
            activeMap[accId] = s;
          }
        }
      });
      setSubscriptionsByUser(activeMap);
    } finally {
      setLoading(false);
    }
  };
  const getUserId = (u) => u.accountId || u.account_id || u.id;
  const isCurrentAccount = (u) => String(getUserId(u)) === String(currentAccountId);
  const isAdminRole = (u) => (u.role || '').toLowerCase() === 'admin';

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'User',
      isActive: user.isActive !== false,
    });
    setEditModal(true);
  };
  const handleCloseEdit = () => {
    if (isSaving || isProcessingSub) return;
    setEditModal(false);
    setEditingUser(null);
  };

  const handleGrantProForUser = async () => {
    if (!editingUser || !selectedPlanId) return;
    const targetId = getUserId(editingUser);
    const chosenPlan = proPlans.find((p) => String(p.plan_id || p.Plan_id) === String(selectedPlanId));
    const planName = chosenPlan?.name || chosenPlan?.Name || 'Pro';

    const ok = await dialog.confirm({
      title: 'Cấp / Gia hạn gói Pro',
      message: `Xác nhận cấp gói "${planName}" cho người dùng "${editingUser.name || editingUser.email}"?`,
      confirmLabel: 'Cấp gói Pro',
    });
    if (!ok) return;

    setIsProcessingSub(true);
    try {
      const res = await adminService.grantUserSubscription({
        account_id: targetId,
        plan_id: selectedPlanId,
      });
      dialog.success('Thành công', res?.message || `Đã cấp gói ${planName} cho người dùng.`);
      await fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Không thể cấp gói Pro cho người dùng.';
      dialog.error('Lỗi', msg);
    } finally {
      setIsProcessingSub(false);
    }
  };

  const handleRevokeProForUser = async () => {
    if (!editingUser) return;
    const targetId = getUserId(editingUser);
    const ok = await dialog.confirm({
      title: 'Thu hồi gói Pro',
      message: `Bạn có chắc chắn muốn hủy gói Pro đang hoạt động của "${editingUser.name || editingUser.email}" không?`,
      confirmLabel: 'Thu hồi',
      danger: true,
    });
    if (!ok) return;

    setIsProcessingSub(true);
    try {
      const res = await adminService.revokeUserSubscription(targetId);
      dialog.success('Thành công', res?.message || 'Đã thu hồi gói Pro của người dùng.');
      await fetchUsers();
    } catch (error) {
      const msg = error.response?.data?.message || 'Không thể thu hồi gói Pro.';
      dialog.error('Lỗi', msg);
    } finally {
      setIsProcessingSub(false);
    }
  };
  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const trimmedName = editForm.name.trim();
    const trimmedEmail = editForm.email.trim();
    const trimmedPhone = editForm.phone.trim();

    if (!trimmedName) {
      dialog.error('Lỗi', 'Họ và tên không được để trống.');
      return;
    }

    if (!trimmedEmail) {
      dialog.error('Lỗi', 'Email không được để trống.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      dialog.error('Lỗi', 'Định dạng email không hợp lệ.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        role: editForm.role,
        isActive: editForm.role === 'Admin' ? true : Boolean(editForm.isActive),
      };

      await adminService.updateUser(getUserId(editingUser), payload);
      dialog.success('Thành công', 'Đã cập nhật thông tin người dùng thành công.');
      setEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng.';
      dialog.error('Lỗi', msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id, isActive, userName) => {
    const action = isActive ? 'vô hiệu hóa' : 'kích hoạt';
    const ok = await dialog.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản?`,
      message: `Bạn có chắc chắn muốn ${action} tài khoản "${userName || 'người dùng này'}" không?`,
      confirmLabel: isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
      danger: isActive,
    });
    if (!ok) return;

    try {
      await adminService.toggleUserStatus(id, !isActive);
      dialog.success('Thành công', `Đã ${action} người dùng thành công.`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi trạng thái người dùng.';
      dialog.error('Lỗi', msg);
    }
  };

  const filtered = users.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Đang tải người dùng...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản lý người dùng</h1>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>Tất cả người dùng ({filtered.length})</h2>
          <input
            className="admin-table-search"
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Gói dịch vụ</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  <p>Không tìm thấy người dùng phù hợp</p>
                </td>
              </tr>
            )}
            {filtered.map((user) => {
              const userId = getUserId(user);
              const isSelf = isCurrentAccount(user);
              const isAdmin = isAdminRole(user);
              const activeSub = subscriptionsByUser[String(userId)];
              const activePlanObj = activeSub
                ? proPlans.find((p) => String(p.plan_id || p.Plan_id) === String(activeSub.plan_id || activeSub.Plan_id))
                : null;
              return (
                <tr key={userId}>
                  <td>
                    <span style={{ fontWeight: 600 }}>{user.name || '-'}</span>
                    {isSelf && <span className="current-user-tag">Bạn</span>}
                  </td>
                  <td>{user.email || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`status-badge ${isAdmin ? 'admin' : 'user'}`}>
                      {isAdmin && <FiShield size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />}
                      {isAdmin ? 'Quản trị viên' : 'Người dùng'}
                    </span>
                  </td>
                  <td>
                    {activeSub ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content',
                            background: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fcd34d',
                            borderRadius: '999px',
                            padding: '2px 10px',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          <FiAward size={12} /> {activePlanObj?.name || 'PRO'}
                        </span>
                        {(activeSub.endDate || activeSub.EndDate) && (
                          <small style={{ color: '#64748b', fontSize: '11.5px' }}>
                            Hạn: {new Date(activeSub.endDate || activeSub.EndDate).toLocaleDateString('vi-VN')}
                          </small>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>Cơ bản</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                      {user.isActive !== false ? (
                        <>
                          <FiCheck size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} /> Hoạt động
                        </>
                      ) : (
                        <>
                          <FiX size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} /> Không hoạt động
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    {/* Nút Sửa: Luôn có thể bấm để chỉnh sửa thông tin */}
                    <button
                      className="action-btn edit"
                      onClick={() => handleOpenEdit(user)}
                      title="Chỉnh sửa thông tin người dùng"
                    >
                      <FiEdit2 size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Sửa
                    </button>

                    {/* Nút Vô hiệu hóa: KHÔNG hiển thị cho tài khoản Quản trị viên */}
                    {isAdmin ? (
                      <span
                        className="admin-protected-tag"
                        title="Tài khoản Quản trị viên được bảo vệ an toàn, không thể vô hiệu hóa"
                      >
                        <FiShield size={12} style={{ marginRight: 4 }} /> Bảo vệ
                      </span>
                    ) : (
                      <button
                        className={`action-btn ${user.isActive !== false ? 'delete' : 'view'}`}
                        onClick={() => handleToggleStatus(userId, user.isActive !== false, user.name)}
                        title={user.isActive !== false ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng'}
                      >
                        {user.isActive !== false ? (
                          <>
                            <FiUserX size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Vô hiệu
                          </>
                        ) : (
                          <>
                            <FiUserCheck size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Kích hoạt
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal chỉnh sửa thông tin người dùng */}
      {editModal && editingUser && (
        <div className="modal-overlay" onClick={handleCloseEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseEdit} disabled={isSaving}>
              &times;
            </button>
            <h2>Chỉnh sửa người dùng</h2>
            <form onSubmit={handleSaveUser}>
              <div className="admin-form-group">
                <label>
                  Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="admin-form-group">
                <label>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="example@email.com"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="admin-form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="0912345678"
                  disabled={isSaving}
                />
              </div>

              <div className="admin-form-group">
                <label>Vai trò</label>
                <select
                  value={editForm.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setEditForm({
                      ...editForm,
                      role: newRole,
                      isActive: newRole === 'Admin' ? true : editForm.isActive,
                    });
                  }}
                  disabled={isSaving || isCurrentAccount(editingUser)}
                >
                  <option value="User">Người dùng</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                </select>
                {isCurrentAccount(editingUser) && (
                  <span className="form-hint">Bạn không thể tự thay đổi vai trò của chính mình.</span>
                )}
              </div>

              <div className="admin-form-group">
                <label>Trạng thái tài khoản</label>
                <select
                  value={editForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                  disabled={isSaving || editForm.role === 'Admin'}
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Vô hiệu hóa</option>
                </select>
                {editForm.role === 'Admin' && (
                  <span className="form-hint">Tài khoản Quản trị viên luôn ở trạng thái hoạt động để đảm bảo an toàn.</span>
                )}
              </div>

              <div
                className="admin-form-group"
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fcd34d',
                  borderRadius: '10px',
                  padding: '14px',
                  marginTop: '12px',
                }}
              >
                <label style={{ color: '#92400e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiAward size={16} /> Quản lý Gói Pro (Hỗ trợ sự cố thanh toán)
                </label>
                {(() => {
                  const currentSub = subscriptionsByUser[String(getUserId(editingUser))];
                  const currentPlan = currentSub
                    ? proPlans.find((p) => String(p.plan_id || p.Plan_id) === String(currentSub.plan_id || currentSub.Plan_id))
                    : null;
                  return (
                    <div style={{ fontSize: '13px', marginBottom: '10px', color: '#475569' }}>
                      {currentSub ? (
                        <span style={{ color: '#065f46', fontWeight: 600 }}>
                          👑 Đang kích hoạt: <strong>{currentPlan?.name || 'Gói Pro'}</strong> (Hết hạn:{' '}
                          {currentSub.endDate || currentSub.EndDate
                            ? new Date(currentSub.endDate || currentSub.EndDate).toLocaleDateString('vi-VN')
                            : 'Vĩnh viễn'}
                          )
                        </span>
                      ) : (
                        <span>Hiện tại: Tài khoản thường (Chưa có gói Pro)</span>
                      )}
                    </div>
                  );
                })()}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    disabled={isProcessingSub || proPlans.length === 0}
                    style={{ flex: 1, minWidth: '180px' }}
                  >
                    {proPlans.map((plan) => {
                      const pId = plan.plan_id || plan.Plan_id;
                      const pName = plan.name || plan.Name;
                      const pPrice = Number(plan.price ?? plan.Price ?? 0).toLocaleString('vi-VN');
                      const pDur = plan.duration ?? plan.Duration ?? 30;
                      return (
                        <option key={pId} value={pId}>
                          {pName} — {pPrice}đ ({pDur === 0 ? 'Vĩnh viễn' : `${pDur} ngày`})
                        </option>
                      );
                    })}
                  </select>
                  <button
                    type="button"
                    onClick={handleGrantProForUser}
                    disabled={isProcessingSub || !selectedPlanId}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#d97706',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isProcessingSub ? 'Đang xử lý...' : subscriptionsByUser[String(getUserId(editingUser))] ? '⚡ Gia hạn thêm' : '⚡ Cấp gói Pro'}
                  </button>
                  {subscriptionsByUser[String(getUserId(editingUser))] && (
                    <button
                      type="button"
                      onClick={handleRevokeProForUser}
                      disabled={isProcessingSub}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #ef4444',
                        background: '#fff',
                        color: '#dc2626',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Thu hồi Pro
                    </button>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={handleCloseEdit}
                  disabled={isSaving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

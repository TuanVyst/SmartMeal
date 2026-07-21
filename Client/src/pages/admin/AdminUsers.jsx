import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';

export default function AdminUsers() {
  const dialog = useDialog();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    adminService.getAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  const handleToggleStatus = async (id, isActive) => {
    const action = isActive ? 'vô hiệu hóa' : 'kích hoạt';
    const ok = await dialog.confirm({ title: `${action} người dùng?`, message: `Bạn có chắc chắn muốn ${action} người dùng này không?`, confirmLabel: action === 'vô hiệu hóa' ? 'Vô hiệu' : 'Kích hoạt', danger: isActive });
    if (!ok) return;
    try {
      await adminService.toggleUserStatus(id, !isActive);
      fetchUsers();
    } catch (error) {
      console.error(error);
      dialog.error('Lỗi', 'Có lỗi xảy ra');
    }
  };

  const filtered = users.filter((u) =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Đang tải người dùng...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản lý người dùng</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>Tất cả người dùng</h2>
          <input
            className="admin-table-search"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="empty-state"><p>Không tìm thấy người dùng</p></td></tr>
            )}
            {filtered.map((user) => (
              <tr key={user.account_id || user.id}>
                <td>{user.name || '-'}</td>
                <td>{user.email || '-'}</td>
                <td><span className="status-badge active">{user.role === 'Admin' ? 'Quản trị viên' : 'Người dùng'}</span></td>
                <td>
                  <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                    {user.isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit">Sửa</button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleToggleStatus(user.account_id || user.id, user.isActive !== false)}
                  >
                    {user.isActive !== false ? 'Vô hiệu' : 'Kích hoạt'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

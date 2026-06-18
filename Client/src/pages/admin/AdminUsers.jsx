import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

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
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-state"><p>Không tìm thấy người dùng</p></td></tr>
            )}
            {filtered.map((user) => (
              <tr key={user.account_id || user.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                  {(user.account_id || user.id || '').slice(0, 8)}...
                </td>
                <td>{user.name || '-'}</td>
                <td>{user.email || '-'}</td>
                <td><span className="status-badge active">{user.role || 'User'}</span></td>
                <td>
                  <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                    {user.isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit">Sửa</button>
                  <button className="action-btn delete">
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

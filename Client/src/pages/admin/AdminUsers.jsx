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

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Manage Users</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Users</h2>
          <input
            className="admin-table-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-state"><p>No users found</p></td></tr>
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
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn delete">
                    {user.isActive !== false ? 'Disable' : 'Enable'}
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

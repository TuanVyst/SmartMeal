import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDateVi, formatDateTimeVi } from '../../utils/dateTime';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusClass = (status) => {
  switch (status) {
    case 'active': return 'status-badge active';
    case 'expired': return 'status-badge expired';
    case 'cancelled': return 'status-badge cancelled';
    default: return 'status-badge';
  }
};

export default function AdminTransactions() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getTransactionHistory()
      .then(data => setTransactions(data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    const matchSearch = (t.accountName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.accountEmail || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.paymentRef || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (t.status || '').toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="admin-loading">Loading transactions...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Transaction History</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Transactions</h2>
          <div className="toolbar-controls">
            <select
              className="admin-table-search"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              className="admin-table-search"
              placeholder="Search by name, email, payment ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No transactions found</p></div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Transaction Date</th>
                <th>Start Date</th>
                <th>Payment Ref</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.subId || t.Sub_id}>
                  <td>
                    <div className="cell-strong">{t.accountName || 'N/A'}</div>
                    <div className="cell-sub">{t.accountEmail || ''}</div>
                  </td>
                  <td>
                    <div className="cell-strong">{t.planName || 'N/A'}</div>
                    <div className="cell-sub">{t.planPrice ? `${t.planPrice.toLocaleString('vi-VN')} ₫` : ''}</div>
                  </td>
                  <td>{t.transactionDate ? formatDateTimeVi(t.transactionDate) : (t.startDate ? formatDateTimeVi(t.startDate) : '—')}</td>
                  <td>{t.startDate ? formatDateVi(t.startDate) : '—'}</td>
                  <td><code className="payment-ref">{t.paymentRef || 'N/A'}</code></td>
                  <td><span className={statusClass(t.status)}>{(t.status || '').toUpperCase()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

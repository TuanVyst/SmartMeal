import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';

export default function AdminStatistics() {
  const dialog = useDialog();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setLoading(true);
    // Convert YYYY-MM-DD to ISO if needed, or backend can parse YYYY-MM-DD
    const start = startDate ? new Date(startDate).toISOString() : '';
    let end = '';
    if (endDate) {
       const endDateObj = new Date(endDate);
       endDateObj.setHours(23, 59, 59, 999);
       end = endDateObj.toISOString();
    }

    adminService.getSubscriptionStatistics(start, end)
      .then(setStats)
      .catch((err) => {
        console.error(err);
        dialog.error('Lỗi', 'Không thể lấy thống kê');
        setStats(null);
      })
      .finally(() => setLoading(false));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchStats();
  };

  const handleQuickFilter = (type) => {
    const now = new Date();
    let start = new Date();
    if (type === 'week') {
      const day = now.getDay() || 7; 
      if (day !== 1) start.setHours(-24 * (day - 1)); 
    } else if (type === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (type === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
    }
    
    // Format YYYY-MM-DD for input fields
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
    
    // Defer fetch to next tick or just call with specific dates
    setTimeout(() => {
       const startStr = start.toISOString();
       const endStr = now.toISOString();
       setLoading(true);
       adminService.getSubscriptionStatistics(startStr, endStr)
        .then(setStats)
        .catch(() => setStats(null))
        .finally(() => setLoading(false));
    }, 50);
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1>Thống Kê Doanh Thu</h1>
      </div>

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Từ ngày</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Đến ngày</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>Lọc</button>
          
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
             <button type="button" className="btn btn-outline" onClick={() => handleQuickFilter('week')}>Tuần này</button>
             <button type="button" className="btn btn-outline" onClick={() => handleQuickFilter('month')}>Tháng này</button>
             <button type="button" className="btn btn-outline" onClick={() => handleQuickFilter('year')}>Năm nay</button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="admin-loading">Đang tải số liệu...</div>
      ) : stats ? (
        <>
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="stat-info">
                <p>Tổng người đăng ký</p>
                <h3 style={{ fontSize: '2rem', color: '#10b981' }}>{stats.totalSubscribers}</h3>
              </div>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="stat-info">
                <p>Tổng doanh thu</p>
                <h3 style={{ fontSize: '2rem', color: '#3b82f6' }}>{stats.totalRevenue?.toLocaleString('vi-VN')} đ</h3>
              </div>
            </div>
          </div>

          <div className="admin-table-container">
            <div className="admin-table-toolbar">
              <h2>Doanh thu theo gói (Plans)</h2>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên Gói</th>
                  <th>Số người đăng ký</th>
                  <th>Doanh thu (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {stats.planStatistics?.map((plan) => (
                  <tr key={plan.planId}>
                    <td style={{ fontWeight: 'bold' }}>{plan.planName}</td>
                    <td>{plan.subscriberCount}</td>
                    <td style={{ color: '#059669', fontWeight: 'bold' }}>
                      {plan.revenue.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
                {(!stats.planStatistics || stats.planStatistics.length === 0) && (
                  <tr><td colSpan={3} className="empty-state">Không có dữ liệu trong khoảng thời gian này</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="empty-state">Không có dữ liệu</div>
      )}
    </div>
  );
}

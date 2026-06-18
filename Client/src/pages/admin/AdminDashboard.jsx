import { useState, useEffect } from 'react';
import { FiUsers, FiCoffee, FiTag, FiMessageSquare } from 'react-icons/fi';
import { adminService } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats)
      .catch(() => setStats({ totalUsers: 0, totalMeals: 0, totalCategories: 0, totalFeedback: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, color: 'green' },
    { label: 'Total Meals', value: stats.totalMeals, icon: <FiCoffee />, color: 'blue' },
    { label: 'Categories', value: stats.totalCategories, icon: <FiTag />, color: 'orange' },
    { label: 'Feedback', value: stats.totalFeedback, icon: <FiMessageSquare />, color: 'purple' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

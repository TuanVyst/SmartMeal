import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiTag, FiShoppingBag, FiAward, FiHeart } from 'react-icons/fi';
import { adminService } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(setStats)
      .catch(() => setStats({ totalUsers: 0, totalRecipes: 0, totalCategories: 0, totalIngredients: 0, totalTags: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Đang tải bảng điều khiển...</div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, color: 'green', to: '/admin/users' },
    { label: 'Total Recipes', value: stats.totalRecipes, icon: <FiHeart />, color: 'blue', to: '/admin/recipes' },
    { label: 'Categories', value: stats.totalCategories, icon: <FiTag />, color: 'orange', to: '/admin/categories' },
    { label: 'Total Ingredients', value: stats.totalIngredients, icon: <FiShoppingBag />, color: 'teal', to: '/admin/ingredients' },
    { label: 'Total Tags', value: stats.totalTags, icon: <FiAward />, color: 'red', to: '/admin/recipe-tags' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1>Bảng điều khiển</h1>
      </div>
      <div className="stats-grid">
        {cards.map((card) => (
          <Link className="stat-card" key={card.label} to={card.to}>
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

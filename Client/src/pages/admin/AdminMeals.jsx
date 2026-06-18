import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminMeals() {
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAllMeals()
      .then(setMeals)
      .catch(() => setMeals([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = meals.filter((m) => {
    const q = search.toLowerCase();
    return (m.recipe_name || '').toLowerCase().includes(q);
  });

  if (loading) return <div className="admin-loading">Loading meals...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Manage Meals</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Meals</h2>
          <input
            className="admin-table-search"
            placeholder="Search by meal name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Meal ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-state"><p>No meals found</p></td></tr>
            )}
            {filtered.map((meal) => (
              <tr key={meal.recipe_id || meal.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>
                  {(meal.recipe_id || meal.id || '').slice(0, 8)}...
                </td>
                <td>{meal.recipe_name || '-'}</td>
                <td>{meal.category || '-'}</td>
                <td>
                  <span className={`status-badge ${(meal.difficulty || 'easy').toLowerCase()}`}>
                    {meal.difficulty || 'Easy'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${meal.isActive !== false ? 'active' : 'inactive'}`}>
                    {meal.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit">Edit</button>
                  <button className="action-btn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

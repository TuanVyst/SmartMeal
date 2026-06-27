import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

export default function AdminMeals() {
  const [meals, setMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = () => {
    setLoading(true);
    adminService.getAllMeals()
      .then(setMeals)
      .catch(() => setMeals([]))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này không?')) {
      try {
        await adminService.deleteMeal(id);
        fetchMeals();
      } catch (error) {
        console.error(error);
        alert('Có lỗi xảy ra khi xóa');
      }
    }
  };

  const filtered = meals.filter((m) => {
    const q = search.toLowerCase();
    return (m.recipe_name || '').toLowerCase().includes(q);
  });

  if (loading) return <div className="admin-loading">Đang tải món ăn...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản lý món ăn</h1>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>Tất cả món ăn</h2>
          <input
            className="admin-table-search"
            placeholder="Tìm theo tên món ăn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã món</th>
              <th>Tên</th>
              <th>Danh mục</th>
              <th>Độ khó</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="empty-state"><p>Không tìm thấy món ăn</p></td></tr>
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
                    {meal.difficulty || 'Dễ'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${meal.isActive !== false ? 'active' : 'inactive'}`}>
                    {meal.isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit" onClick={() => alert('Vui lòng qua trang Manage Recipes (AdminRecipes) để chỉnh sửa đầy đủ chi tiết.')}>Sửa</button>
                  <button className="action-btn delete" onClick={() => handleDelete(meal.recipe_id || meal.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

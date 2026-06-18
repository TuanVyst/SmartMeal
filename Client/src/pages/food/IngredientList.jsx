import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getIngredients, deleteIngredient } from '../../services/foodService';

export default function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const res = await getIngredients();
      setIngredients(res.data.data);
    } catch {
      console.error('Không thể tải nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa nguyên liệu này?')) return;
    try {
      await deleteIngredient(id);
      setIngredients((prev) => prev.filter((i) => i.ingredient_id !== id));
    } catch {
      console.error('Không thể xóa nguyên liệu');
    }
  };

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Nguyên liệu</h2>
        <Link to="/ingredients/new" className="btn btn-primary">+ Thêm nguyên liệu</Link>
      </div>
      <input
        className="search-input"
        placeholder="Tìm nguyên liệu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá trung bình</th>
              <th>Năng lượng</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.ingredient_id}>
                <td>{i.name}</td>
                <td>${i.averagePrice?.toFixed(2)}</td>
                <td>{i.nutritional_value?.calories ?? '—'}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => navigate(`/ingredients/${i.ingredient_id}`)}>Xem</button>
                  <button className="btn btn-sm btn-edit" onClick={() => navigate(`/ingredients/${i.ingredient_id}/edit`)}>Sửa</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(i.ingredient_id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="empty">Không tìm thấy nguyên liệu</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

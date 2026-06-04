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
      console.error('Failed to fetch ingredients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this ingredient?')) return;
    try {
      await deleteIngredient(id);
      setIngredients((prev) => prev.filter((i) => i.ingredient_id !== id));
    } catch {
      console.error('Failed to delete ingredient');
    }
  };

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Ingredients</h2>
        <Link to="/ingredients/new" className="btn btn-primary">+ Add Ingredient</Link>
      </div>
      <input
        className="search-input"
        placeholder="Search ingredients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Avg Price</th>
              <th>Calories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.ingredient_id}>
                <td>{i.name}</td>
                <td>${i.averagePrice?.toFixed(2)}</td>
                <td>{i.nutritional_value?.calories ?? '—'}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => navigate(`/ingredients/${i.ingredient_id}`)}>View</button>
                  <button className="btn btn-sm btn-edit" onClick={() => navigate(`/ingredients/${i.ingredient_id}/edit`)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(i.ingredient_id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="empty">No ingredients found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

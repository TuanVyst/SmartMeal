import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getIngredientById } from '../../services/foodService';

export default function IngredientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getIngredientById(id);
        setIngredient(res.data.data);
      } catch {
        console.error('Không thể tải nguyên liệu');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!ingredient) return <div className="loading">Không tìm thấy nguyên liệu</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>{ingredient.name}</h2>
        <div className="header-actions">
          <Link to={`/ingredients/${id}/edit`} className="btn btn-edit">Sửa</Link>
          <button className="btn btn-secondary" onClick={() => navigate('/ingredients')}>Quay lại</button>
        </div>
      </div>
      <div className="detail-card">
        <div className="detail-row">
          <span className="label">ID</span>
          <span>{ingredient.ingredient_id}</span>
        </div>
        <div className="detail-row">
          <span className="label">Tên</span>
          <span>{ingredient.name}</span>
        </div>
        <div className="detail-row">
          <span className="label">Giá trung bình</span>
          <span>${ingredient.averagePrice?.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">URL hình ảnh</span>
          <span>{ingredient.imageUrl || '—'}</span>
        </div>
        {ingredient.nutritional_value && (
          <>
            <h3 className="section-title">Thông tin dinh dưỡng</h3>
            <div className="detail-row"><span className="label">Calories</span><span>{ingredient.nutritional_value.calories}</span></div>
            <div className="detail-row"><span className="label">Đạm</span><span>{ingredient.nutritional_value.protein}g</span></div>
            <div className="detail-row"><span className="label">Carb</span><span>{ingredient.nutritional_value.carbohydrates}g</span></div>
            <div className="detail-row"><span className="label">Chất béo</span><span>{ingredient.nutritional_value.fat}g</span></div>
          </>
        )}
        {ingredient.ingredientLabels?.length > 0 && (
          <>
            <h3 className="section-title">Nhãn</h3>
            <div className="labels">
              {ingredient.ingredientLabels.map((l) => (
                <span key={l.label_id} className="label-tag">{l.labelName}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

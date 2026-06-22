import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIngredientById, createIngredient, updateIngredient, getIngredientTags } from '../../services/foodService';

export default function IngredientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    averagePrice: '',
    imageUrl: '',
  });
  const [nutrition, setNutrition] = useState({
    calories: '',
    protein: '',
    carbohydrates: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
    cholesterol: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getIngredientTags();
        setTags(res.data.data || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await getIngredientById(id);
        const i = res.data.data;
        setForm({ name: i.name, averagePrice: i.averagePrice, imageUrl: i.imageUrl || '' });
        if (i.ingredientLabels) {
          setSelectedTagIds(i.ingredientLabels.map(l => l.tagId || l.it_id || l.It_id).filter(Boolean));
        }
        if (i.nutritional_value) {
          setNutrition({
            calories: i.nutritional_value.calories || '',
            protein: i.nutritional_value.protein || '',
            carbohydrates: i.nutritional_value.carbohydrates || '',
            fat: i.nutritional_value.fat || '',
            fiber: i.nutritional_value.fiber || '',
            sugar: i.nutritional_value.sugar || '',
            sodium: i.nutritional_value.sodium || '',
            cholesterol: i.nutritional_value.cholesterol || '',
          });
        }
      } catch {
        setError('Không thể tải nguyên liệu');
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNutritionChange = (e) => {
    setNutrition((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        averagePrice: parseFloat(form.averagePrice) || 0,
        imageUrl: form.imageUrl,
        ingredientTagIds: selectedTagIds,
        nutritionalValue: {
          calories: parseFloat(nutrition.calories) || 0,
          protein: parseFloat(nutrition.protein) || 0,
          carbohydrates: parseFloat(nutrition.carbohydrates) || 0,
          fat: parseFloat(nutrition.fat) || 0,
          fiber: parseFloat(nutrition.fiber) || 0,
          sugar: parseFloat(nutrition.sugar) || 0,
          sodium: parseFloat(nutrition.sodium) || 0,
          cholesterol: parseFloat(nutrition.cholesterol) || 0,
        },
      };
      if (isEdit) {
        await updateIngredient(id, payload);
      } else {
        await createIngredient(payload);
      }
      navigate('/ingredients');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>{isEdit ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}</h2>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>Tên</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Giá trung bình</label>
          <input name="averagePrice" type="number" step="0.01" value={form.averagePrice} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>URL hình ảnh</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
        </div>

        <h3 style={{ marginTop: '20px', marginBottom: '12px', color: '#333' }}>Ingredient Tags</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          {tags.map((tag) => (
            <label key={tag.tag_id || tag.It_id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedTagIds.includes(tag.tag_id || tag.It_id)}
                onChange={(e) => {
                  const tagId = tag.tag_id || tag.It_id;
                  if (e.target.checked) {
                    setSelectedTagIds((prev) => [...prev, tagId]);
                  } else {
                    setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
                  }
                }}
              />
              {tag.name}
            </label>
          ))}
          {tags.length === 0 && <span style={{ color: '#999' }}>No tags available</span>}
        </div>

        <h3 style={{ marginTop: '20px', marginBottom: '12px', color: '#333' }}>Nutritional Value</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label>Calories (kcal)</label>
            <input name="calories" type="number" step="0.1" min="0" value={nutrition.calories} onChange={handleNutritionChange} />
          </div>
          <div className="form-group">
            <label>Protein (g)</label>
            <input name="protein" type="number" step="0.1" min="0" value={nutrition.protein} onChange={handleNutritionChange} />
          </div>
          <div className="form-group">
            <label>Carbohydrates (g)</label>
            <input name="carbohydrates" type="number" step="0.1" min="0" value={nutrition.carbohydrates} onChange={handleNutritionChange} />
          </div>
          <div className="form-group">
            <label>Fat (g)</label>
            <input name="fat" type="number" step="0.1" min="0" value={nutrition.fat} onChange={handleNutritionChange} />
          </div>
          <div className="form-group">
            <label>Fiber (g)</label>
            <input name="fiber" type="number" step="0.1" min="0" value={nutrition.fiber} onChange={handleNutritionChange} />
          </div>
          <div className="form-group">
            <label>Sugar (g)</label>
            <input name="sugar" type="number" step="0.1" min="0" value={nutrition.sugar} onChange={handleNutritionChange} />
          </div>
          <div className="form-group">
            <label>Sodium (mg)</label>
            <input name="sodium" type="number" step="0.1" min="0" value={nutrition.sodium} onChange={handleNutritionChange} />
          </div>
          <div className="form-group">
            <label>Cholesterol (mg)</label>
            <input name="cholesterol" type="number" step="0.1" min="0" value={nutrition.cholesterol} onChange={handleNutritionChange} />
          </div>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/ingredients')}>Hủy</button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recipeService } from '../../services/recipeService';
import './RecipeForm.css';

export default function RecipeForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    recipe_name: '',
    description: '',
    instruction: '',
    cookTime: '',
    prepTime: '',
    servings: '',
    difficulty: 'Easy',
    isPublic: true,
  });
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    recipeService.getTags()
      .then(res => setTags(res.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    recipeService.getById(id)
      .then(res => {
        const r = res.data.data;
        setForm({
          recipe_name: r.recipe_name || r.Recipe_name || '',
          description: r.description || r.Description || '',
          instruction: r.instruction || r.Instruction || '',
          cookTime: r.cookTime || 0,
          prepTime: r.prepTime || 0,
          servings: r.servings || 1,
          difficulty: r.difficulty || 'Easy',
          isPublic: r.isPublic ?? true,
        });
        if (r.recipeTags) {
          setSelectedTagIds(r.recipeTags.map(t => t.tag_id || t.Tag_id || t.rt_Id).filter(Boolean));
        }
      })
      .catch(() => setError('Không thể tải recipe'));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(tid => tid !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        account_id: user.accountId,
        recipe_name: form.recipe_name,
        description: form.description,
        instruction: form.instruction,
        cookTime: parseInt(form.cookTime) || 0,
        prepTime: parseInt(form.prepTime) || 0,
        servings: parseInt(form.servings) || 1,
        difficulty: form.difficulty,
        isPublic: form.isPublic,
        recipeTagIds: selectedTagIds,
      };
      if (isEdit) {
        await recipeService.update(id, payload);
      } else {
        await recipeService.create(payload);
      }
      navigate('/meal-suggestions');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page recipe-form-page">
      <div className="page-header">
        <h2>{isEdit ? 'Sửa công thức' : 'Tạo công thức mới'}</h2>
      </div>

      <div className="recipe-form-card">
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label>Tên công thức</label>
            <input
              type="text"
              name="recipe_name"
              value={form.recipe_name}
              onChange={handleChange}
              placeholder="VD: Salad ức gà rau củ"
              required
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              rows={2}
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về món ăn..."
              required
            />
          </div>

          <div className="form-group">
            <label>Hướng dẫn nấu</label>
            <textarea
              name="instruction"
              rows={5}
              value={form.instruction}
              onChange={handleChange}
              placeholder="Bước 1: Rửa sạch nguyên liệu...&#10;Bước 2: ..."
              required
            />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label>Thời gian chuẩn bị (phút)</label>
              <input name="prepTime" type="number" min="0" value={form.prepTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Thời gian nấu (phút)</label>
              <input name="cookTime" type="number" min="0" value={form.cookTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Số phần ăn</label>
              <input name="servings" type="number" min="1" value={form.servings} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Độ khó</label>
            <select name="difficulty" value={form.difficulty} onChange={handleChange}>
              <option value="Easy">Dễ</option>
              <option value="Medium">Trung bình</option>
              <option value="Hard">Khó</option>
            </select>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isPublic"
              checked={form.isPublic}
              onChange={handleChange}
            />
            Công khai
          </label>

          <div className="tags-section">
            <h3>Recipe Tags</h3>
            <div className="tags-wrap">
              {tags.map(tag => {
                const tagId = tag.tag_id || tag.Tag_id || tag.rt_Id;
                const isActive = selectedTagIds.includes(tagId);
                return (
                  <label key={tagId} className={`tag-chip${isActive ? ' active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleTag(tagId)}
                    />
                    {tag.name || tag.Name}
                  </label>
                );
              })}
              {tags.length === 0 && <span className="empty-tags">Không có tag</span>}
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo công thức'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/meal-suggestions')}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

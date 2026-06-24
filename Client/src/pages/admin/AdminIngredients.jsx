import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import { adminService } from '../../services/adminService';

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [ingredientFormData, setIngredientFormData] = useState({
    name: '',
    averagePrice: 0,
    imageUrl: '',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    ingredientTagIds: []
  });
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [availableIngredientTags, setAvailableIngredientTags] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [ingredientsData, tagsData] = await Promise.all([
        adminService.getAllIngredients(),
        adminService.getAllIngredientTags()
      ]);
      setIngredients(ingredientsData || []);
      setAvailableIngredientTags(tagsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: ingredientFormData.name,
        averagePrice: ingredientFormData.averagePrice,
        imageUrl: ingredientFormData.imageUrl,
        ingredientTagIds: ingredientFormData.ingredientTagIds,
        nutritionalValue: {
          calories: ingredientFormData.calories,
          protein: ingredientFormData.protein,
          carbohydrates: ingredientFormData.carbohydrates,
          fat: ingredientFormData.fat,
          fiber: ingredientFormData.fiber,
          sugar: ingredientFormData.sugar,
          sodium: ingredientFormData.sodium,
          cholesterol: ingredientFormData.cholesterol
        }
      };

      if (editingIngredient) {
        await adminService.updateIngredient(editingIngredient.ingredient_id || editingIngredient.id, payload);
      } else {
        await adminService.createIngredient(payload);
      }
      fetchAllData();
      closeIngredientModal();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Lỗi khi lưu nguyên liệu. Xem console để biết thêm chi tiết.');
    }
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    
    // Reverse lookup Tag IDs from Label Names since DTO only returns LabelName
    const tagIds = (ingredient.ingredientLabels || []).map(label => {
      const tag = availableIngredientTags.find(t => t.name === label.labelName);
      return tag ? tag.tag_id || tag.it_id || tag.id : null;
    }).filter(id => id !== null);

    setIngredientFormData({
      name: ingredient.name || '',
      averagePrice: ingredient.averagePrice || 0,
      imageUrl: ingredient.imageUrl || '',
      calories: ingredient.nutritional_value?.calories || 0,
      protein: ingredient.nutritional_value?.protein || 0,
      carbohydrates: ingredient.nutritional_value?.carbs || 0,
      fat: ingredient.nutritional_value?.fat || 0,
      fiber: ingredient.nutritional_value?.fiber || 0,
      sugar: ingredient.nutritional_value?.sugar || 0,
      sodium: ingredient.nutritional_value?.salt || ingredient.nutritional_value?.sodium || 0,
      cholesterol: ingredient.nutritional_value?.cholesterol || 0,
      ingredientTagIds: tagIds
    });
    setIsIngredientModalOpen(true);
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nguyên liệu này?')) {
      try {
        await adminService.deleteIngredient(id);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    }
  };

  const openIngredientModal = () => {
    setIsIngredientModalOpen(true);
    setEditingIngredient(null);
    setIngredientFormData({
      name: '',
      averagePrice: 0,
      imageUrl: '',
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0,
      ingredientTagIds: []
    });
  };

  const closeIngredientModal = () => {
    setIsIngredientModalOpen(false);
    setEditingIngredient(null);
  };

  const filteredIngredients = ingredients.filter((ing) =>
    (ing.name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading ingredients...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý Nguyên liệu</h1>
      </div>

      <div className="admin-table-container shadow-sm">
        <div className="admin-table-toolbar">
          <div className="admin-search-container">
            <FiSearch className="admin-search-icon" size={18} />
            <input
              className="admin-search-input-inner"
              placeholder="Tìm theo tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-add-new" onClick={openIngredientModal}>
            <FiPlus size={18} /> Thêm nguyên liệu
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên</th>
              <th>Giá TB</th>
              <th>Calories</th>
              <th>Tags</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  <p>Không tìm thấy nguyên liệu</p>
                </td>
              </tr>
            )}
            {filteredIngredients.map((ingredient) => (
              <tr key={ingredient.ingredient_id || ingredient.id}>
                <td>
                  {ingredient.imageUrl ? (
                    <img src={ingredient.imageUrl} alt={ingredient.name} className="admin-table-img" />
                  ) : (
                    <div className="admin-table-img-placeholder">No Img</div>
                  )}
                </td>
                <td className="font-medium">{ingredient.name}</td>
                <td>${ingredient.averagePrice?.toFixed(2) || '0.00'}</td>
                <td>
                  <span className="calorie-badge">
                    {ingredient.nutritional_value?.calories || 0} kcal
                  </span>
                </td>
                <td>
                  <div className="tags-flex">
                    {(ingredient.ingredientLabels || []).map((label, idx) => (
                      <span key={label.label_id || idx} className="tag-badge">
                        {label.labelName}
                      </span>
                    ))}
                    {(!ingredient.ingredientLabels || ingredient.ingredientLabels.length === 0) && '-'}
                  </div>
                </td>
                <td>
                  <div className="actions-flex">
                    <button className="btn-icon btn-edit" onClick={() => handleEditIngredient(ingredient)} title="Edit">
                      <FiEdit size={16} />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDeleteIngredient(ingredient.ingredient_id || ingredient.id)} title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isIngredientModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>{editingIngredient ? 'Cập nhật Nguyên liệu' : 'Thêm Nguyên liệu'}</h3>
              <button className="btn-close" onClick={closeIngredientModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleIngredientSubmit} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Tên <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredientFormData.name}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giá trung bình ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredientFormData.averagePrice}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, averagePrice: parseFloat(e.target.value) || 0 })}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Hình ảnh (URL)</label>
                <input
                  type="url"
                  className="form-control"
                  value={ingredientFormData.imageUrl}
                  onChange={(e) => setIngredientFormData({ ...ingredientFormData, imageUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thẻ (Tags) <span className="required">*</span></label>
                <select
                  className="form-control multi-select"
                  multiple
                  value={ingredientFormData.ingredientTagIds || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setIngredientFormData({ ...ingredientFormData, ingredientTagIds: selected });
                  }}
                >
                  {availableIngredientTags.map((tag) => (
                    <option key={tag.it_id || tag.tag_id || tag.id} value={tag.it_id || tag.tag_id || tag.id}>{tag.name}</option>
                  ))}
                </select>
                <small className="form-hint">Giữ Ctrl / Command để chọn nhiều tags.</small>
              </div>

              <hr />
              <h4 style={{ marginBottom: '1rem', marginTop: '1rem' }}>Giá trị dinh dưỡng</h4>
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Calories</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.calories}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, calories: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.protein}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, protein: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Carbs (g)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.carbohydrates}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, carbohydrates: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fat (g)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.fat}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, fat: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fiber (g)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.fiber}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, fiber: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sugar (g)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.sugar}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, sugar: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sodium (mg)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.sodium}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, sodium: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cholesterol (mg)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.cholesterol}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, cholesterol: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeIngredientModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIngredient ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

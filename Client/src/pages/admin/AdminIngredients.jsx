import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';
import { resolveIngredientImageUrl } from '../../utils/ingredientImages';
import ImageUpload from '../../components/common/ImageUpload';

export default function AdminIngredients() {
  const dialog = useDialog();
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
    servingSize: 100,
    servingUnit: 'g',
    everydayUnit: '',
    everydayWeight: '',
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
          cholesterol: ingredientFormData.cholesterol,
          servingSize: ingredientFormData.servingSize,
          servingUnit: ingredientFormData.servingUnit,
          everydayUnit: ingredientFormData.everydayUnit || null,
          everydayWeight: ingredientFormData.everydayWeight ? parseFloat(ingredientFormData.everydayWeight) : null
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
      dialog.error('Lỗi', 'Lỗi khi lưu nguyên liệu. Xem console để biết thêm chi tiết.');
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
      servingSize: ingredient.nutritional_value?.servingSize || 100,
      servingUnit: ingredient.nutritional_value?.servingUnit || 'g',
      everydayUnit: ingredient.nutritional_value?.everydayUnit || '',
      everydayWeight: ingredient.nutritional_value?.everydayWeight || '',
      ingredientTagIds: tagIds
    });
    setIsIngredientModalOpen(true);
  };

  const handleDeleteIngredient = async (id) => {
    const ok = await dialog.confirm({ title: 'Xóa nguyên liệu?', message: 'Bạn có chắc chắn muốn xóa nguyên liệu này?', confirmLabel: 'Xóa', danger: true });
    if (!ok) return;
    try {
      await adminService.deleteIngredient(id);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
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
      servingSize: 100,
      servingUnit: 'g',
      everydayUnit: '',
      everydayWeight: '',
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
              <th>Calories</th>
              <th>Tags</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">
                  <p>Không tìm thấy nguyên liệu</p>
                </td>
              </tr>
            )}
            {filteredIngredients.map((ingredient) => (
              <tr key={ingredient.ingredient_id || ingredient.id}>
                <td>
                  <img
                    src={resolveIngredientImageUrl(ingredient.imageUrl, ingredient.name)}
                    alt={ingredient.name}
                    className="admin-table-img"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&h=150&auto=format&fit=crop';
                    }}
                  />
                </td>
                <td className="font-medium">{ingredient.name}</td>
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
                <label className="form-label">Hình ảnh</label>
                <ImageUpload
                  value={ingredientFormData.imageUrl}
                  onChange={(url) => setIngredientFormData({ ...ingredientFormData, imageUrl: url })}
                  label="Tải ảnh nguyên liệu"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Thẻ (Tags) <span className="required">*</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', background: '#f8fafc' }}>
                  {availableIngredientTags.map((tag) => {
                    const tagId = tag.it_id || tag.tag_id || tag.id;
                    const isSelected = (ingredientFormData.ingredientTagIds || []).includes(tagId);
                    return (
                      <div 
                        key={tagId} 
                        onClick={() => {
                          if (isSelected) {
                            setIngredientFormData({ ...ingredientFormData, ingredientTagIds: ingredientFormData.ingredientTagIds.filter(t => t !== tagId) });
                          } else {
                            setIngredientFormData({ ...ingredientFormData, ingredientTagIds: [...(ingredientFormData.ingredientTagIds || []), tagId] });
                          }
                        }}
                        style={{
                          padding: '6px 12px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
                          backgroundColor: isSelected ? '#22c55e' : 'white',
                          color: isSelected ? 'white' : '#475569',
                          border: `1px solid ${isSelected ? '#22c55e' : '#cbd5e1'}`,
                          transition: 'all 0.2s', userSelect: 'none'
                        }}
                      >
                        {tag.name}
                      </div>
                    );
                  })}
                </div>
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

              <hr />
              <h4 style={{ marginBottom: '1rem', marginTop: '1rem' }}>Cấu hình Quy đổi Đơn vị Thường ngày & Khẩu phần</h4>
              <div className="form-grid-3" style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Cỡ khẩu phần (Serving Size)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.servingSize}
                    placeholder="Ví dụ: 100, 1, 3..."
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, servingSize: parseFloat(e.target.value) || 0 })} min="0" step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn vị khẩu phần (Serving Unit)</label>
                  <input
                    type="text" className="form-control"
                    value={ingredientFormData.servingUnit}
                    placeholder="Ví dụ: g, ml, quả, tép..."
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, servingUnit: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Đơn vị thường ngày (Everyday Unit)</label>
                  <input
                    type="text" className="form-control"
                    value={ingredientFormData.everydayUnit}
                    placeholder="Ví dụ: quả, chén, bó..."
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, everydayUnit: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Trọng lượng quy đổi tương đương (g)</label>
                  <input
                    type="number" className="form-control"
                    value={ingredientFormData.everydayWeight}
                    placeholder="Ví dụ: 50, 150, 3..."
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, everydayWeight: e.target.value ? parseFloat(e.target.value) : '' })} min="0" step="0.1"
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

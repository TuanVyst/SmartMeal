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
      if (editingIngredient) {
        // Update Ingredient
        await adminService.updateIngredient(editingIngredient.ingredient_id, ingredientFormData);
        
        // Update Nutritional Value (If it exists, otherwise create it)
        if (editingIngredient.nutritional_value && editingIngredient.nutritional_value.id) {
          await adminService.updateNutritionalValue(editingIngredient.nutritional_value.id, {
            Ingredient_id: editingIngredient.ingredient_id,
            Calories: ingredientFormData.calories
          });
        } else {
          await adminService.createNutritionalValue({
            Ingredient_id: editingIngredient.ingredient_id,
            Calories: ingredientFormData.calories
          });
        }
      } else {
        // Create Ingredient
        const newIngredient = await adminService.createIngredient(ingredientFormData);
        // API returns { success: true, data: { ingredient_id: "..." } }
        const createdIngredient = newIngredient?.data || newIngredient;
        if (createdIngredient && createdIngredient.ingredient_id) {
          // Immediately create Nutritional Value
          await adminService.createNutritionalValue({
            Ingredient_id: createdIngredient.ingredient_id,
            Calories: ingredientFormData.calories
          });
        }
      }
      fetchAllData();
      closeIngredientModal();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Error saving ingredient. Please check the console for details.');
    }
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    
    // Reverse lookup Tag IDs from Label Names since DTO only returns LabelName
    const tagIds = (ingredient.ingredientLabels || []).map(label => {
      const tag = availableIngredientTags.find(t => t.name === label.labelName);
      return tag ? tag.tag_id : null;
    }).filter(id => id !== null);

    setIngredientFormData({
      name: ingredient.name || '',
      averagePrice: ingredient.averagePrice || 0,
      imageUrl: ingredient.imageUrl || '',
      calories: ingredient.nutritional_value?.calories || 0,
      ingredientTagIds: tagIds
    });
    setIsIngredientModalOpen(true);
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient? This will also delete its labels and nutritional values.')) {
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
      ingredientTagIds: []
    });
  };

  const closeIngredientModal = () => {
    setIsIngredientModalOpen(false);
    setEditingIngredient(null);
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading ingredients...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Ingredients</h1>
        <p className="admin-page-subtitle">Create and update ingredients, their tags, and nutritional values all in one place.</p>
      </div>

      <div className="admin-table-container shadow-sm">
        <div className="admin-table-toolbar">
          <div className="admin-search-container">
            <FiSearch className="admin-search-icon" size={18} />
            <input
              className="admin-search-input-inner"
              placeholder="Search for name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-add-new" onClick={openIngredientModal}>
            <FiPlus size={18} /> Add New Ingredient
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Calories</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  <p>No ingredients found</p>
                </td>
              </tr>
            )}
            {filteredIngredients.map((ingredient) => (
              <tr key={ingredient.ingredient_id}>
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
                    {(ingredient.ingredientLabels || []).map((label) => (
                      <span key={label.label_id} className="tag-badge">
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
                    <button className="btn-icon btn-danger" onClick={() => handleDeleteIngredient(ingredient.ingredient_id)} title="Delete">
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
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h3>{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</h3>
              <button className="btn-close" onClick={closeIngredientModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleIngredientSubmit} className="modal-form">
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredientFormData.name}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, name: e.target.value })}
                    required
                    placeholder="e.g. Chicken Breast"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Average Price ($)</label>
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
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredientFormData.calories}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, calories: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={ingredientFormData.imageUrl}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Ingredient Tags <span className="required">*</span></label>
                <select
                  className="form-control multi-select"
                  multiple
                  value={ingredientFormData.ingredientTagIds || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setIngredientFormData({ ...ingredientFormData, ingredientTagIds: selected });
                  }}
                  required
                >
                  {availableIngredientTags.map((tag) => (
                    <option key={tag.tag_id} value={tag.tag_id}>{tag.name}</option>
                  ))}
                </select>
                <small className="form-hint">Hold Ctrl (Windows) or Command (Mac) to select multiple tags.</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeIngredientModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingIngredient ? 'Update Ingredient' : 'Create Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

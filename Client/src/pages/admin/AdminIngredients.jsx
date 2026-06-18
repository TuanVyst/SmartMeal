import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiHeart } from 'react-icons/fi';
import { adminService } from '../../services/adminService';

export default function AdminIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [nutritionalValues, setNutritionalValues] = useState([]);
  const [ingredientLabels, setIngredientLabels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isNutritionalModalOpen, setIsNutritionalModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [ingredientFormData, setIngredientFormData] = useState({
    name: '',
    averagePrice: 0,
    imageUrl: '',
    ingredientTagIds: []
  });
  const [nutritionalFormData, setNutritionalFormData] = useState({
    ingredient_id: '',
    calories: 0
  });
  const [labelFormData, setLabelFormData] = useState({
    it_id: '',
    ingredient_id: ''
  });
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [editingNutritional, setEditingNutritional] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [availableIngredientTags, setAvailableIngredientTags] = useState([]);

  useEffect(() => {
    fetchAllData();
    fetchIngredientTags();
  }, []);

  const fetchAllData = async () => {
    try {
      const [ingredientsData, nutritionalData, labelsData] = await Promise.all([
        adminService.getAllIngredients(),
        adminService.getAllNutritionalValues(),
        adminService.getAllRecipeLabels()
      ]);
      setIngredients(ingredientsData);
      setNutritionalValues(nutritionalData);
      setIngredientLabels(labelsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIngredients([]);
      setNutritionalValues([]);
      setIngredientLabels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredientTags = async () => {
    try {
      const data = await adminService.getAllIngredientTags();
      setAvailableIngredientTags(data);
    } catch (error) {
      setAvailableIngredientTags([]);
    }
  };

  const handleIngredientSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingIngredient) {
        await adminService.updateIngredient(editingIngredient.id, ingredientFormData);
      } else {
        await adminService.createIngredient(ingredientFormData);
      }
      fetchAllData();
      closeIngredientModal();
    } catch (error) {
      console.error('Error saving ingredient:', error);
    }
  };

  const handleNutritionalSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ingredient_id: nutritionalFormData.ingredient_id,
        calories: nutritionalFormData.calories
      };
      if (editingNutritional) {
        await adminService.updateNutritionalValue(editingNutritional.id, formData);
      } else {
        await adminService.createNutritionalValue(formData);
      }
      fetchAllData();
      closeNutritionalModal();
    } catch (error) {
      console.error('Error saving nutritional value:', error);
    }
  };

  const handleLabelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLabel) {
        await adminService.updateRecipeLabel(editingLabel.id, labelFormData);
      } else {
        await adminService.createRecipeLabel(labelFormData);
      }
      fetchAllData();
      closeLabelModal();
    } catch (error) {
      console.error('Error saving label:', error);
    }
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setIngredientFormData({
      name: ingredient.name || '',
      averagePrice: ingredient.averagePrice || 0,
      imageUrl: ingredient.imageUrl || '',
      ingredientTagIds: ingredient.ingredientTagIds || []
    });
    setIsIngredientModalOpen(true);
  };

  const handleEditNutritional = (nutritional) => {
    setEditingNutritional(nutritional);
    setNutritionalFormData({
      ingredient_id: nutritional.ingredient_id || '',
      calories: nutritional.calories || 0
    });
    setIsNutritionalModalOpen(true);
  };

  const handleEditLabel = (label) => {
    setEditingLabel(label);
    setLabelFormData({
      it_id: label.it_id || '',
      ingredient_id: label.ingredient_id || ''
    });
    setIsLabelModalOpen(true);
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await adminService.deleteIngredient(id);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    }
  };

  const handleDeleteNutritional = async (id) => {
    if (window.confirm('Are you sure you want to delete this nutritional value?')) {
      try {
        await adminService.deleteNutritionalValue(id);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting nutritional value:', error);
      }
    }
  };

  const handleDeleteLabel = async (id) => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      try {
        await adminService.deleteRecipeLabel(id);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting label:', error);
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
      ingredientTagIds: []
    });
  };

  const closeIngredientModal = () => {
    setIsIngredientModalOpen(false);
    setEditingIngredient(null);
  };

  const openNutritionalModal = () => {
    setIsNutritionalModalOpen(true);
    setEditingNutritional(null);
    setNutritionalFormData({
      ingredient_id: '',
      calories: 0
    });
  };

  const closeNutritionalModal = () => {
    setIsNutritionalModalOpen(false);
    setEditingNutritional(null);
  };

  const openLabelModal = () => {
    setIsLabelModalOpen(true);
    setEditingLabel(null);
    setLabelFormData({
      it_id: '',
      ingredient_id: ''
    });
  };

  const closeLabelModal = () => {
    setIsLabelModalOpen(false);
    setEditingLabel(null);
  };

  const getIngredientNameById = (id) => {
    const ingredient = ingredients.find((ing) => ing.id === id || ing.ingredient_id === id);
    return ingredient ? ingredient.name : 'Unknown';
  };

  const getTagNameById = (id) => {
    const tag = availableIngredientTags.find((tag) => tag.id === id);
    return tag ? tag.name : 'Unknown';
  };

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading ingredients...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Manage Ingredients</h1>
      </div>
      <div className="admin-tabs">
        <button className="admin-tab active">Ingredients</button>
        <button className="admin-tab">Nutritional Values</button>
        <button className="admin-tab">Labels</button>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Ingredients</h2>
          <input
            className="admin-table-search"
            placeholder="Search by ingredient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="action-btn create" onClick={openIngredientModal}>
            <FiPlus size={16} /> Add New Ingredient
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-state">
                  <p>No ingredients found</p>
                </td>
              </tr>
            )}
            {filteredIngredients.map((ingredient) => (
              <tr key={ingredient.id}>
                <td>{ingredient.name}</td>
                <td>${ingredient.averagePrice?.toFixed(2) || '0.00'}</td>
                <td>
                  {(ingredient.ingredientTagIds || []).map((tagId) => (
                    <span key={tagId} className="tag-badge">
                      {getTagNameById(tagId)}
                    </span>
                  )).join(', ') || '-'}
                </td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEditIngredient(ingredient)} title="Edit">
                    <FiEdit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteIngredient(ingredient.id)} title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isIngredientModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}</h3>
              <button className="modal-close" onClick={closeIngredientModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleIngredientSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={ingredientFormData.name}
                  onChange={(e) => setIngredientFormData({ ...ingredientFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Average Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={ingredientFormData.averagePrice}
                  onChange={(e) => setIngredientFormData({ ...ingredientFormData, averagePrice: parseFloat(e.target.value) || 0 })}
                  step="0.01"
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
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ingredient Tags</label>
                <select
                  className="form-control"
                  multiple
                  value={ingredientFormData.ingredientTagIds || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setIngredientFormData({ ...ingredientFormData, ingredientTagIds: selected });
                  }}
                >
                  {availableIngredientTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
                <small>Hold Ctrl to select multiple tags</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeIngredientModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingIngredient ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-section-separator">
        <h3>Nutritional Values</h3>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Nutritional Values</h2>
          <button className="action-btn create" onClick={openNutritionalModal}>
            <FiPlus size={16} /> Add New Nutritional Value
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Calories</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {nutritionalValues.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-state">
                  <p>No nutritional values found</p>
                </td>
              </tr>
            )}
            {nutritionalValues.map((nv) => (
              <tr key={nv.id}>
                <td>{getIngredientNameById(nv.ingredient_id || nv.ingredientId)}</td>
                <td>{nv.calories}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEditNutritional(nv)} title="Edit">
                    <FiEdit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteNutritional(nv.id)} title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isNutritionalModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingNutritional ? 'Edit Nutritional Value' : 'Add New Nutritional Value'}</h3>
              <button className="modal-close" onClick={closeNutritionalModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleNutritionalSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Ingredient</label>
                <select
                  className="form-control"
                  value={nutritionalFormData.ingredient_id}
                  onChange={(e) => setNutritionalFormData({ ...nutritionalFormData, ingredient_id: e.target.value })}
                  required
                >
                  <option value="">Select an ingredient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Calories</label>
                <input
                  type="number"
                  className="form-control"
                  value={nutritionalFormData.calories}
                  onChange={(e) => setNutritionalFormData({ ...nutritionalFormData, calories: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeNutritionalModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingNutritional ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-section-separator">
        <h3>Labels</h3>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Labels</h2>
          <button className="action-btn create" onClick={openLabelModal}>
            <FiPlus size={16} /> Add New Label
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>IT ID</th>
              <th>Ingredient ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredientLabels.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-state">
                  <p>No labels found</p>
                </td>
              </tr>
            )}
            {ingredientLabels.map((label) => (
              <tr key={label.id}>
                <td>{label.it_id}</td>
                <td>{label.ingredient_id}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEditLabel(label)} title="Edit">
                    <FiEdit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteLabel(label.id)} title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isLabelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingLabel ? 'Edit Label' : 'Add New Label'}</h3>
              <button className="modal-close" onClick={closeLabelModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleLabelSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">IT ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={labelFormData.it_id}
                  onChange={(e) => setLabelFormData({ ...labelFormData, it_id: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ingredient ID</label>
                <select
                  className="form-control"
                  value={labelFormData.ingredient_id}
                  onChange={(e) => setLabelFormData({ ...labelFormData, ingredient_id: e.target.value })}
                  required
                >
                  <option value="">Select an ingredient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>{ingredient.name} (ID: {ingredient.id})</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeLabelModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingLabel ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

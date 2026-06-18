import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiHeart } from 'react-icons/fi';
import { adminService } from '../../services/adminService';

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeLabels, setRecipeLabels] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [recipeFormData, setRecipeFormData] = useState({
    recipe_name: '',
    description: '',
    instruction: '',
    cookTime: 0,
    prepTime: 0,
    servings: 0,
    difficulty: 'easy',
    isPublic: true,
    recipeTagIds: []
  });
  const [ingredientFormData, setIngredientFormData] = useState({
    recipe_id: '',
    ingredient_id: '',
    quantity: 0,
    uom: 'g'
  });
  const [labelFormData, setLabelFormData] = useState({
    it_id: '',
    ingredient_id: ''
  });
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [editingLabel, setEditingLabel] = useState(null);
  const [availableRecipeTags, setAvailableRecipeTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);

  useEffect(() => {
    fetchAllData();
    fetchRecipeTags();
    fetchIngredients();
  }, []);

  const fetchAllData = async () => {
    try {
      const [recipesData, ingredientsData, labelsData] = await Promise.all([
        adminService.getAllRecipes(),
        adminService.getAllRecipeIngredients(),
        adminService.getAllRecipeLabels()
      ]);
      setRecipes(recipesData);
      setRecipeIngredients(ingredientsData);
      setRecipeLabels(labelsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRecipes([]);
      setRecipeIngredients([]);
      setRecipeLabels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipeTags = async () => {
    try {
      const data = await adminService.getAllRecipeTags();
      setAvailableRecipeTags(data);
    } catch (error) {
      setAvailableRecipeTags([]);
    }
  };

  const fetchIngredients = async () => {
    try {
      const data = await adminService.getAllIngredients();
      setAvailableIngredients(data);
    } catch (error) {
      setAvailableIngredients([]);
    }
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecipe) {
        await adminService.updateRecipe(editingRecipe.id, recipeFormData);
      } else {
        await adminService.createRecipe(recipeFormData);
      }
      fetchAllData();
      closeRecipeModal();
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const handleIngredientSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        recipe_id: ingredientFormData.recipe_id,
        ingredient_id: ingredientFormData.ingredient_id,
        quantity: ingredientFormData.quantity,
        uom: ingredientFormData.uom
      };
      if (editingIngredient) {
        await adminService.updateRecipeIngredient(editingIngredient.id, formData);
      } else {
        await adminService.createRecipeIngredient(formData);
      }
      fetchAllData();
      closeIngredientModal();
    } catch (error) {
      console.error('Error saving recipe ingredient:', error);
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

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setRecipeFormData({
      recipe_name: recipe.recipe_name || '',
      description: recipe.description || '',
      instruction: recipe.instruction || '',
      cookTime: recipe.cookTime || 0,
      prepTime: recipe.prepTime || 0,
      servings: recipe.servings || 0,
      difficulty: recipe.difficulty || 'easy',
      isPublic: recipe.isPublic || true,
      recipeTagIds: recipe.recipeTagIds || []
    });
    setIsRecipeModalOpen(true);
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setIngredientFormData({
      recipe_id: ingredient.recipe_id || '',
      ingredient_id: ingredient.ingredient_id || '',
      quantity: ingredient.quantity || 0,
      uom: ingredient.uom || 'g'
    });
    setIsIngredientModalOpen(true);
  };

  const handleEditLabel = (label) => {
    setEditingLabel(label);
    setLabelFormData({
      it_id: label.it_id || '',
      ingredient_id: label.ingredient_id || ''
    });
    setIsLabelModalOpen(true);
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await adminService.deleteRecipe(id);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting recipe:', error);
      }
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe ingredient?')) {
      try {
        await adminService.deleteRecipeIngredient(id);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting recipe ingredient:', error);
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

  const openRecipeModal = () => {
    setIsRecipeModalOpen(true);
    setEditingRecipe(null);
    setRecipeFormData({
      recipe_name: '',
      description: '',
      instruction: '',
      cookTime: 0,
      prepTime: 0,
      servings: 0,
      difficulty: 'easy',
      isPublic: true,
      recipeTagIds: []
    });
  };

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setEditingRecipe(null);
  };

  const openIngredientModal = () => {
    setIsIngredientModalOpen(true);
    setEditingIngredient(null);
    setIngredientFormData({
      recipe_id: '',
      ingredient_id: '',
      quantity: 0,
      uom: 'g'
    });
  };

  const closeIngredientModal = () => {
    setIsIngredientModalOpen(false);
    setEditingIngredient(null);
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

  const getRecipeTagNameById = (id) => {
    const tag = availableRecipeTags.find((tag) => tag.id === id);
    return tag ? tag.name : 'Unknown';
  };

  const getIngredientNameById = (id) => {
    const ingredient = availableIngredients.find((ing) => ing.id === id || ing.ingredient_id === id);
    return ingredient ? ingredient.name : 'Unknown';
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.recipe_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading recipes...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Manage Recipes</h1>
      </div>
      <div className="admin-tabs">
        <button className="admin-tab active">Recipes</button>
        <button className="admin-tab">Ingredients</button>
        <button className="admin-tab">Labels</button>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Recipes</h2>
          <input
            className="admin-table-search"
            placeholder="Search by recipe name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="action-btn create" onClick={openRecipeModal}>
            <FiPlus size={16} /> Add New Recipe
          </button>
        </div>
        <table className="admin-table">\n          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Category</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  <p>No recipes found</p>
                </td>
              </tr>
            )}
            {filteredRecipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>{recipe.recipe_name}</td>
                <td>{recipe.difficulty || '-'}</td>
                <td>{recipe.isPublic ? 'Public' : 'Private'}</td>
                <td>{recipe.servings || 0}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEditRecipe(recipe)} title="Edit">
                    <FiEdit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteRecipe(recipe.id)} title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isRecipeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}</h3>
              <button className="modal-close" onClick={closeRecipeModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleRecipeSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Recipe Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={recipeFormData.recipe_name}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, recipe_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  value={recipeFormData.description}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea
                  className="form-control"
                  value={recipeFormData.instruction}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, instruction: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cook Time (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={recipeFormData.cookTime}
                    onChange={(e) => setRecipeFormData({ ...recipeFormData, cookTime: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Prep Time (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={recipeFormData.prepTime}
                    onChange={(e) => setRecipeFormData({ ...recipeFormData, prepTime: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Servings</label>
                  <input
                    type="number"
                    className="form-control"
                    value={recipeFormData.servings}
                    onChange={(e) => setRecipeFormData({ ...recipeFormData, servings: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    className="form-control"
                    value={recipeFormData.difficulty}
                    onChange={(e) => setRecipeFormData({ ...recipeFormData, difficulty: e.target.value })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Public</label>
                <select
                  className="form-control"
                  value={recipeFormData.isPublic ? 'true' : 'false'}
                  onChange={(e) => setRecipeFormData({ ...recipeFormData, isPublic: e.target.value === 'true' })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Recipe Tags</label>
                <select
                  className="form-control"
                  multiple
                  value={recipeFormData.recipeTagIds || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setRecipeFormData({ ...recipeFormData, recipeTagIds: selected });
                  }}
                >
                  {availableRecipeTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
                <small>Hold Ctrl to select multiple tags</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeRecipeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingRecipe ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-section-separator">
        <h3>Recipe Ingredients</h3>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <h2>All Recipe Ingredients</h2>
          <button className="action-btn create" onClick={openIngredientModal}>
            <FiPlus size={16} /> Add New Ingredient
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Recipe Name</th>
              <th>Ingredient Name</th>
              <th>Quantity</th>
              <th>UOM</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipeIngredients.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-state">
                  <p>No recipe ingredients found</p>
                </td>
              </tr>
            )}
            {recipeIngredients.map((ri) => (
              <tr key={ri.id}>
                <td>{getIngredientNameById(ri.recipe_id)}</td>
                <td>{getIngredientNameById(ri.ingredient_id)}</td>
                <td>{ri.quantity}</td>
                <td>{ri.uom}</td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEditIngredient(ri)} title="Edit">
                    <FiEdit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteIngredient(ri.id)} title="Delete">
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
              <h3>{editingIngredient ? 'Edit Recipe Ingredient' : 'Add New Recipe Ingredient'}</h3>
              <button className="modal-close" onClick={closeIngredientModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleIngredientSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Recipe</label>
                <select
                  className="form-control"
                  value={ingredientFormData.recipe_id}
                  onChange={(e) => setIngredientFormData({ ...ingredientFormData, recipe_id: e.target.value })}
                  required
                >
                  <option value="">Select a recipe</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>{recipe.recipe_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ingredient</label>
                <select
                  className="form-control"
                  value={ingredientFormData.ingredient_id}
                  onChange={(e) => setIngredientFormData({ ...ingredientFormData, ingredient_id: e.target.value })}
                  required
                >
                  <option value="">Select an ingredient</option>
                  {availableIngredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={ingredientFormData.quantity}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, quantity: parseInt(e.target.value) || 0 })}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">UOM</label>
                  <input
                    type="text"
                    className="form-control"
                    value={ingredientFormData.uom}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, uom: e.target.value })}
                    placeholder="g, kg, cup, tbsp, etc."
                  />
                </div>
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
            {recipeLabels.length === 0 && (
              <tr>
                <td colSpan={3} className="empty-state">
                  <p>No labels found</p>
                </td>
              </tr>
            )}
            {recipeLabels.map((label) => (
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
                  {availableIngredients.map((ingredient) => (
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

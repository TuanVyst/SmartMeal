import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiMinus, FiSearch } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminRecipes() {
  const dialog = useDialog();
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;
  const [recipes, setRecipes] = useState([]);
  const [allRecipeIngredients, setAllRecipeIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeFormData, setRecipeFormData] = useState({
    recipe_name: '',
    imageUrl: '',
    description: '',
    instruction: '',
    cookTime: 0,
    prepTime: 0,
    servings: 0,
    difficulty: 'easy',
    isPublic: true,
    recipeTagIds: [],
    account_id: '',
    ingredients: [] // Array of { ingredient_id, quantity, uom, id? (for existing) }
  });
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [availableRecipeTags, setAvailableRecipeTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [recipesData, recipeIngredientsData, tagsData, ingredientsData] = await Promise.all([
        adminService.getAllRecipes(),
        adminService.getAllRecipeIngredients(),
        adminService.getAllRecipeTags(),
        adminService.getAllIngredients()
      ]);
      setRecipes(recipesData || []);
      setAllRecipeIngredients(recipeIngredientsData || []);
      setAvailableRecipeTags(tagsData || []);
      setAvailableIngredients(ingredientsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseRecipeData = {
        recipe_name: recipeFormData.recipe_name,
        imageUrl: recipeFormData.imageUrl,
        description: recipeFormData.description,
        instruction: recipeFormData.instruction,
        cookTime: recipeFormData.cookTime,
        prepTime: recipeFormData.prepTime,
        servings: recipeFormData.servings,
        difficulty: recipeFormData.difficulty,
        isPublic: recipeFormData.isPublic,
        recipeTagIds: recipeFormData.recipeTagIds,
        account_id: recipeFormData.account_id || accountId
      };

      if (editingRecipe) {
        // Update Recipe
        await adminService.updateRecipe(editingRecipe.recipe_id, baseRecipeData);
        
        // Handle Recipe Ingredients for update: 
        // Simple approach: Delete old ones and create new ones
        const oldIngredients = allRecipeIngredients.filter(ri => ri.recipe_id === editingRecipe.recipe_id);
        
        // 1. Delete old ingredients
        for (const oldIng of oldIngredients) {
          await adminService.deleteRecipeIngredient(oldIng.id || oldIng.ri_id);
        }
        
        // 2. Create new ones
        for (const ing of recipeFormData.ingredients) {
          if (ing.ingredient_id && ing.quantity > 0) {
            await adminService.createRecipeIngredient({
              recipe_id: editingRecipe.recipe_id,
              ingredient_id: ing.ingredient_id,
              quantity: ing.quantity,
              UOM: ing.uom || 'g',
              IsPrimary: !!ing.isPrimary
            });
          }
        }
      } else {
        // Create Recipe
        // Note: Make sure Account_id is set appropriately in your backend or by passing a default here
        baseRecipeData.Account_id = accountId || '00000000-0000-0000-0000-000000000000'; // Default or get from auth context
        
        const newRecipeResponse = await adminService.createRecipe(baseRecipeData);
        const createdRecipe = newRecipeResponse?.data || newRecipeResponse;
        
        if (createdRecipe && createdRecipe.recipe_id) {
          // Immediately create RecipeIngredients
          for (const ing of recipeFormData.ingredients) {
            if (ing.ingredient_id && ing.quantity > 0) {
              await adminService.createRecipeIngredient({
                recipe_id: createdRecipe.recipe_id,
                ingredient_id: ing.ingredient_id,
                quantity: ing.quantity,
                UOM: ing.uom || 'g',
                IsPrimary: !!ing.isPrimary
              });
            }
          }
        }
      }
      fetchAllData();
      closeRecipeModal();
    } catch (error) {
      console.error('Error saving recipe:', error?.message || error);
      if (error?.data) console.error('Server response:', error.data);
      dialog.error('Error', `Error saving recipe: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    
    // Reverse lookup Tag IDs from Label Names
    const tagIds = (recipe.recipeLabels || []).map(label => {
      const tag = availableRecipeTags.find(t => t.name === label.labelName);
      return tag ? tag.id || tag.rt_Id : null; // Depending on backend DTO structure
    }).filter(id => id !== null);

    // Get ingredients for this recipe
    const currentIngredients = allRecipeIngredients
      .filter(ri => ri.recipe_id === recipe.recipe_id)
      .map(ri => ({
        id: ri.id || ri.ri_id,
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        uom: ri.uom || 'g',
        isPrimary: ri.isPrimary || ri.IsPrimary || false
      }));

    setRecipeFormData({
      recipe_name: recipe.recipe_name || '',
      imageUrl: recipe.imageUrl || '',
      description: recipe.description || '',
      instruction: recipe.instruction || '',
      cookTime: recipe.cookTime || 0,
      prepTime: recipe.prepTime || 0,
      servings: recipe.servings || 0,
      difficulty: recipe.difficulty || 'easy',
      isPublic: recipe.isPublic || true,
      recipeTagIds: tagIds,
      account_id: recipe.account_id || recipe.Account_id || '',
      ingredients: currentIngredients.length > 0 ? currentIngredients : [{ ingredient_id: '', quantity: 0, uom: 'g', isPrimary: false }]
    });
    setIsRecipeModalOpen(true);
  };

  const handleDeleteRecipe = async (id) => {
    const ok = await dialog.confirm({ title: 'Delete recipe?', message: 'Are you sure you want to delete this recipe? This will also delete its labels and ingredients.', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await adminService.deleteRecipe(id);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const openRecipeModal = () => {
    setIsRecipeModalOpen(true);
    setEditingRecipe(null);
    setRecipeFormData({
      recipe_name: '',
      imageUrl: '',
      description: '',
      instruction: '',
      cookTime: 0,
      prepTime: 0,
      servings: 0,
      difficulty: 'easy',
      isPublic: true,
      recipeTagIds: [],
      account_id: '',
      ingredients: [{ ingredient_id: '', quantity: 0, uom: 'g', isPrimary: false }]
    });
  };

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setEditingRecipe(null);
  };

  // Dynamic ingredient list handlers
  const handleAddIngredientRow = () => {
    setRecipeFormData({
      ...recipeFormData,
      ingredients: [...recipeFormData.ingredients, { ingredient_id: '', quantity: 0, uom: 'g', isPrimary: false }]
    });
  };

  const handleRemoveIngredientRow = (index) => {
    const newIngredients = [...recipeFormData.ingredients];
    newIngredients.splice(index, 1);
    setRecipeFormData({
      ...recipeFormData,
      ingredients: newIngredients
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipeFormData.ingredients];
    newIngredients[index][field] = value;
    setRecipeFormData({
      ...recipeFormData,
      ingredients: newIngredients
    });
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.recipe_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="admin-loading">Loading recipes...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Manage Recipes</h1>
        <p className="admin-page-subtitle">Create and update recipes, tags, and required ingredients in one unified view.</p>
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
          <button className="btn-add-new" onClick={openRecipeModal}>
            <FiPlus size={18} /> Add New Recipe
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Difficulty</th>
              <th>Visibility</th>
              <th>Times (Prep/Cook)</th>
              <th>Tags</th>
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
              <tr key={recipe.recipe_id}>
                <td className="font-medium">{recipe.recipe_name}</td>
                <td>
                  <span className={`difficulty-badge ${recipe.difficulty?.toLowerCase()}`}>
                    {recipe.difficulty || 'Easy'}
                  </span>
                </td>
                <td>{recipe.isPublic ? 'Public' : 'Private'}</td>
                <td>{recipe.prepTime}m / {recipe.cookTime}m</td>
                <td>
                  <div className="tags-flex">
                    {(recipe.recipeLabels || []).map((label) => (
                      <span key={label.label_id} className="tag-badge">
                        {label.labelName}
                      </span>
                    ))}
                    {(!recipe.recipeLabels || recipe.recipeLabels.length === 0) && '-'}
                  </div>
                </td>
                <td>
                  <div className="actions-flex">
                    <button className="btn-icon btn-edit" onClick={() => handleEditRecipe(recipe)} title="Edit">
                      <FiEdit size={16} />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDeleteRecipe(recipe.recipe_id)} title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isRecipeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-xl">
            <div className="modal-header">
              <h3>{editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}</h3>
              <button className="btn-close" onClick={closeRecipeModal}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleRecipeSubmit} className="modal-form scrollable-form">
              <div className="form-two-column-layout">
                {/* Left Column: Basic Info */}
                <div className="form-column">
                  <h4 className="column-title">Basic Information</h4>
                  <div className="form-group">
                    <label className="form-label">Recipe Name <span className="required">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      value={recipeFormData.recipe_name}
                      onChange={(e) => setRecipeFormData({ ...recipeFormData, recipe_name: e.target.value })}
                      required
                      placeholder="e.g. Garlic Butter Steak"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={recipeFormData.imageUrl}
                      onChange={(e) => setRecipeFormData({ ...recipeFormData, imageUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={recipeFormData.description}
                      onChange={(e) => setRecipeFormData({ ...recipeFormData, description: e.target.value })}
                      rows={3}
                      placeholder="Brief overview of the recipe..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Instructions <span className="required">*</span></label>
                    <textarea
                      className="form-control"
                      value={recipeFormData.instruction}
                      onChange={(e) => setRecipeFormData({ ...recipeFormData, instruction: e.target.value })}
                      rows={5}
                      required
                      placeholder="Step 1... Step 2..."
                    />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Prep Time (mins)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={recipeFormData.prepTime}
                        onChange={(e) => setRecipeFormData({ ...recipeFormData, prepTime: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cook Time (mins)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={recipeFormData.cookTime}
                        onChange={(e) => setRecipeFormData({ ...recipeFormData, cookTime: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
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
                  </div>

                  <div className="form-group">
                    <label className="form-label">Recipe Tags <span className="required">*</span></label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', maxHeight: '150px', overflowY: 'auto', background: '#f8fafc' }}>
                      {availableRecipeTags.map((tag) => {
                        const tagId = tag.id || tag.rt_Id;
                        const isSelected = (recipeFormData.recipeTagIds || []).includes(tagId);
                        return (
                          <div 
                            key={tagId} 
                            onClick={() => {
                              if (isSelected) {
                                setRecipeFormData({ ...recipeFormData, recipeTagIds: recipeFormData.recipeTagIds.filter(t => t !== tagId) });
                              } else {
                                setRecipeFormData({ ...recipeFormData, recipeTagIds: [...(recipeFormData.recipeTagIds || []), tagId] });
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
                </div>

                {/* Right Column: Ingredients */}
                <div className="form-column">
                  <div className="dynamic-list-header">
                    <h4 className="column-title mb-0">Ingredients List</h4>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddIngredientRow}>
                      <FiPlus size={14} /> Add Row
                    </button>
                  </div>
                  
                  <div className="dynamic-list-container">
                    {recipeFormData.ingredients.length === 0 && (
                      <div className="empty-state-small">No ingredients added yet.</div>
                    )}
                    {recipeFormData.ingredients.map((ing, index) => (
                      <div key={index} className="dynamic-list-row">
                        <div className="form-group mb-0 flex-grow">
                          <label className="form-label-sm">Ingredient</label>
                          <select
                            className="form-control"
                            value={ing.ingredient_id}
                            onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                            required
                          >
                            <option value="">Select ingredient</option>
                            {availableIngredients.map((availIng) => (
                              <option key={availIng.ingredient_id || availIng.id} value={availIng.ingredient_id || availIng.id}>
                                {availIng.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group mb-0 w-24">
                          <label className="form-label-sm">Qty</label>
                          <input
                            type="number"
                            className="form-control"
                            value={ing.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>
                        <div className="form-group mb-0 w-24">
                          <label className="form-label-sm">UOM</label>
                          <input
                            type="text"
                            className="form-control"
                            value={ing.uom}
                            onChange={(e) => handleIngredientChange(index, 'uom', e.target.value)}
                            placeholder="g, cup..."
                            required
                          />
                        </div>
                        <div className="form-group mb-0" style={{ minWidth: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <label className="form-label-sm" style={{ marginBottom: '6px' }}>Primary?</label>
                          <input
                            type="checkbox"
                            checked={!!ing.isPrimary}
                            onChange={(e) => handleIngredientChange(index, 'isPrimary', e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#22c55e' }}
                          />
                        </div>
                        <button 
                          type="button" 
                          className="btn-icon btn-danger remove-row"
                          onClick={() => handleRemoveIngredientRow(index)}
                          title="Remove ingredient"
                        >
                          <FiMinus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions border-top">
                <button type="button" className="btn btn-secondary" onClick={closeRecipeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

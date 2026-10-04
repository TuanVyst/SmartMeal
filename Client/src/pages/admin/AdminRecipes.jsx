import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';
import { useAuth } from '../../context/AuthContext';
import RecipeEditorModal from '../../components/admin/RecipeEditorModal';

export default function AdminRecipes() {
  const dialog = useDialog();
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;
  const [recipes, setRecipes] = useState([]);
  const [allRecipeIngredients, setAllRecipeIngredients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [availableRecipeTags, setAvailableRecipeTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);

  useEffect(() => {
    fetchAllData(true);
  }, []);

  const fetchAllData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
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
      if (isInitial) setLoading(false);
    }
  };

  const handleSaveRecipe = async ({ baseRecipeData, ingredients }) => {
    setSaving(true);
    try {
      baseRecipeData.account_id = baseRecipeData.account_id || accountId;

      if (editingRecipe) {
        // 1. Update Recipe
        await adminService.updateRecipe(editingRecipe.recipe_id, baseRecipeData);

        // 2. Identify all old ingredients to delete
        const existingIds = new Set();
        const oldIngredients = [];

        (allRecipeIngredients || []).forEach(ri => {
          if (ri.recipe_id === editingRecipe.recipe_id || ri.Recipe_id === editingRecipe.recipe_id) {
            const id = ri.id || ri.ri_id || ri.RecipeIngredient_id || ri.recipeIngredient_id;
            if (id && !existingIds.has(id)) {
              existingIds.add(id);
              oldIngredients.push(ri);
            }
          }
        });

        (editingRecipe.recipeIngredients || []).forEach(ri => {
          const id = ri.id || ri.ri_id || ri.RecipeIngredient_id || ri.recipeIngredient_id;
          if (id && !existingIds.has(id)) {
            existingIds.add(id);
            oldIngredients.push(ri);
          }
        });

        // 3. Delete old ingredients
        for (const oldIng of oldIngredients) {
          const id = oldIng.id || oldIng.ri_id || oldIng.RecipeIngredient_id || oldIng.recipeIngredient_id;
          if (id) {
            try {
              await adminService.deleteRecipeIngredient(id);
            } catch (err) {
              console.warn('Could not delete old recipe ingredient:', id, err);
            }
          }
        }

        // 4. Create new ones
        for (const ing of ingredients) {
          if (ing.ingredient_id && ing.quantity > 0) {
            await adminService.createRecipeIngredient({
              recipe_id: editingRecipe.recipe_id,
              ingredient_id: ing.ingredient_id,
              quantity: Math.round(Number(ing.quantity)) || 1,
              UOM: ing.uom || 'g',
              IsPrimary: !!ing.isPrimary
            });
          }
        }

        dialog.alert('Thành công', 'Đã cập nhật công thức thành công!');
      } else {
        // Create Recipe
        baseRecipeData.Account_id = accountId || '00000000-0000-0000-0000-000000000000';

        const newRecipeResponse = await adminService.createRecipe(baseRecipeData);
        const createdRecipe = newRecipeResponse?.data || newRecipeResponse;

        if (createdRecipe && createdRecipe.recipe_id) {
          for (const ing of ingredients) {
            if (ing.ingredient_id && ing.quantity > 0) {
              await adminService.createRecipeIngredient({
                recipe_id: createdRecipe.recipe_id,
                ingredient_id: ing.ingredient_id,
                quantity: Math.round(Number(ing.quantity)) || 1,
                UOM: ing.uom || 'g',
                IsPrimary: !!ing.isPrimary
              });
            }
          }
        }

        dialog.alert('Thành công', 'Đã tạo công thức mới thành công!');
      }

      await fetchAllData();
      closeRecipeModal();
    } catch (error) {
      console.error('Error saving recipe:', error?.message || error);
      if (error?.data) console.error('Server response:', error.data);
      dialog.error('Lỗi', `Lỗi khi lưu công thức: ${error?.message || 'Lỗi không xác định'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setIsRecipeModalOpen(true);
  };

  const handleDeleteRecipe = async (id) => {
    const ok = await dialog.confirm({
      title: 'Xóa công thức?',
      message: 'Bạn có chắc chắn muốn xóa công thức này? Tất cả nhãn và nguyên liệu liên quan cũng sẽ bị gỡ bỏ.',
      confirmLabel: 'Xóa',
      danger: true
    });
    if (!ok) return;
    try {
      await adminService.deleteRecipe(id);
      fetchAllData();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      dialog.error('Lỗi', 'Không thể xóa công thức này.');
    }
  };

  const openRecipeModal = () => {
    setEditingRecipe(null);
    setIsRecipeModalOpen(true);
  };

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setEditingRecipe(null);
  };

  // Get current ingredients for editing recipe
  const currentRecipeIngredients = editingRecipe
    ? (editingRecipe.recipeIngredients || allRecipeIngredients.filter(
        ri => ri.recipe_id === editingRecipe.recipe_id || ri.Recipe_id === editingRecipe.recipe_id
      ))
    : [];

  const filteredRecipes = recipes
    .filter((recipe) => (recipe.recipe_name || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return <div className="admin-loading">Đang tải danh sách công thức & món ăn...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý Món ăn & Công thức</h1>
        <p className="admin-page-subtitle">Tạo mới, chỉnh sửa công thức, chuẩn hóa từng bước chế biến và quản lý nguyên liệu dễ dàng.</p>
      </div>

      <div className="admin-table-container shadow-sm">
        <div className="admin-table-toolbar">
          <div className="admin-search-container">
            <FiSearch className="admin-search-icon" size={18} />
            <input
              className="admin-search-input-inner"
              placeholder="Tìm kiếm theo tên món ăn / công thức..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-add-new" onClick={openRecipeModal}>
            <FiPlus size={18} /> Thêm công thức mới
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên món ăn</th>
              <th>Độ khó</th>
              <th>Hiển thị</th>
              <th>Thời gian (Chuẩn bị / Nấu)</th>
              <th>Thẻ phân loại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecipes.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  <p>Không tìm thấy công thức nào</p>
                </td>
              </tr>
            )}
            {filteredRecipes.map((recipe) => (
              <tr key={recipe.recipe_id}>
                <td className="font-medium">{recipe.recipe_name}</td>
                <td>
                  <span className={`difficulty-badge ${recipe.difficulty?.toLowerCase()}`}>
                    {recipe.difficulty === 'easy' ? 'Dễ' : recipe.difficulty === 'medium' ? 'Trung bình' : recipe.difficulty === 'hard' ? 'Khó' : (recipe.difficulty || 'Dễ')}
                  </span>
                </td>
                <td>{recipe.isPublic ? 'Công khai' : 'Riêng tư'}</td>
                <td>{recipe.prepTime} phút / {recipe.cookTime} phút</td>
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
                    <button className="btn-icon btn-edit" onClick={() => handleEditRecipe(recipe)} title="Chỉnh sửa">
                      <FiEdit size={16} />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDeleteRecipe(recipe.recipe_id)} title="Xóa">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Redesigned Unified Recipe Editor Modal */}
      <RecipeEditorModal
        isOpen={isRecipeModalOpen}
        onClose={closeRecipeModal}
        onSave={handleSaveRecipe}
        initialRecipe={editingRecipe}
        availableRecipeTags={availableRecipeTags}
        availableIngredients={availableIngredients}
        currentIngredients={currentRecipeIngredients}
        saving={saving}
      />
    </div>
  );
}

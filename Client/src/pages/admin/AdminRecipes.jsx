import { useState, useEffect, useMemo } from 'react';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter,
  FiArrowUp, FiArrowDown, FiRotateCcw, FiChevronLeft, FiChevronRight,
  FiX
} from 'react-icons/fi';
import { adminService } from '../../services/adminService';
import { useDialog } from '../../context/DialogContext';
import { useAuth } from '../../context/AuthContext';
import RecipeEditorModal from '../../components/admin/RecipeEditorModal';
import { resolveRecipeImageUrl, FALLBACK_MEAL_IMAGE } from '../../utils/recipeImages';
import './AdminRecipes.css';
export default function AdminRecipes() {
  const dialog = useDialog();
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [cookTimeFilter, setCookTimeFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  // Sort states: field and order
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [availableRecipeTags, setAvailableRecipeTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  useEffect(() => {
    let ignore = false;
    const loadInitialData = async () => {
      try {
        const [recipesData, tagsData, ingredientsData] = await Promise.all([
          adminService.getAllRecipes(),
          adminService.getAllRecipeTags(),
          adminService.getAllIngredients()
        ]);
        if (!ignore) {
          setRecipes(recipesData || []);
          setAvailableRecipeTags(tagsData || []);
          setAvailableIngredients(ingredientsData || []);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadInitialData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSaveRecipe = async ({ baseRecipeData, ingredients }) => {
    if (saving) return;
    setSaving(true);
    try {
      const formattedIngredients = (ingredients || [])
        .filter(ing => ing.ingredient_id && Number(ing.quantity) > 0)
        .map(ing => ({
          ingredient_id: ing.ingredient_id,
          quantity: Math.round(Number(ing.quantity)) || 1,
          UOM: ing.uom || ing.UOM || 'g',
          IsPrimary: !!(ing.isPrimary ?? ing.IsPrimary)
        }));

      const payload = {
        ...baseRecipeData,
        account_id: baseRecipeData.account_id || accountId || '00000000-0000-0000-0000-000000000000',
        ingredients: formattedIngredients
      };

      if (editingRecipe) {
        const res = await adminService.updateRecipe(editingRecipe.recipe_id, payload);
        const updatedRecipe = res?.data || res;
        if (updatedRecipe && updatedRecipe.recipe_id) {
          setRecipes(prev =>
            prev.map(r => (r.recipe_id === updatedRecipe.recipe_id ? updatedRecipe : r))
          );
        }
        closeRecipeModal();
        dialog.success('Thành công', 'Đã cập nhật công thức thành công!');
      } else {
        payload.Account_id = accountId || '00000000-0000-0000-0000-000000000000';
        const res = await adminService.createRecipe(payload);
        const createdRecipe = res?.data || res;
        if (createdRecipe && createdRecipe.recipe_id) {
          setRecipes(prev => [createdRecipe, ...prev]);
        }
        closeRecipeModal();
        dialog.success('Thành công', 'Đã tạo công thức mới thành công!');
      }
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
      setRecipes(prev => prev.filter(r => r.recipe_id !== id));
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
    ? (editingRecipe.recipeIngredients || [])
    : [];

  // Handle sorting toggle by column click
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'recipe_name' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const handleSortSelectChange = (e) => {
    const [field, order] = e.target.value.split('-');
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  // Filter & Sort logic
  const filteredAndSortedRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return recipes
      .filter((recipe) => {
        // 1. Search keyword
        if (query) {
          const nameMatch = (recipe.recipe_name || '').toLowerCase().includes(query);
          const descMatch = (recipe.description || '').toLowerCase().includes(query);
          if (!nameMatch && !descMatch) return false;
        }

        // 2. Difficulty
        if (difficultyFilter !== 'all') {
          const diff = (recipe.difficulty || 'easy').toLowerCase();
          if (diff !== difficultyFilter.toLowerCase()) return false;
        }

        // 3. Tag / Label
        if (tagFilter !== 'all') {
          const hasTag = (recipe.recipeLabels || []).some((l) => {
            const name = l.labelName || l.label_name || l.name || '';
            return name.toLowerCase() === tagFilter.toLowerCase();
          });
          if (!hasTag) return false;
        }

        // 4. Cook Time
        if (cookTimeFilter !== 'all') {
          const time = Number(recipe.cookTime) || 0;
          if (cookTimeFilter === 'quick' && time >= 15) return false;
          if (cookTimeFilter === 'medium' && (time < 15 || time > 30)) return false;
          if (cookTimeFilter === 'long' && time <= 30) return false;
        }

        // 5. Visibility
        if (visibilityFilter !== 'all') {
          if (visibilityFilter === 'public' && recipe.isPublic === false) return false;
          if (visibilityFilter === 'private' && recipe.isPublic !== false) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'recipe_name') {
          comp = (a.recipe_name || '').localeCompare(b.recipe_name || '', 'vi');
        } else if (sortBy === 'cookTime') {
          comp = (Number(a.cookTime) || 0) - (Number(b.cookTime) || 0);
        } else if (sortBy === 'prepTime') {
          comp = (Number(a.prepTime) || 0) - (Number(b.prepTime) || 0);
        } else if (sortBy === 'difficulty') {
          const diffOrder = { easy: 1, medium: 2, hard: 3 };
          const aRank = diffOrder[(a.difficulty || '').toLowerCase()] || 2;
          const bRank = diffOrder[(b.difficulty || '').toLowerCase()] || 2;
          comp = aRank - bRank;
        } else if (sortBy === 'createdAt') {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          comp = aDate - bDate;
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [recipes, search, difficultyFilter, tagFilter, cookTimeFilter, visibilityFilter, sortBy, sortOrder]);

  // Pagination
  const totalItems = filteredAndSortedRecipes.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalItems / (Number(pageSize) || 15)));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRecipes = useMemo(() => {
    if (pageSize === 'all') return filteredAndSortedRecipes;
    const size = Number(pageSize) || 15;
    const start = (safePage - 1) * size;
    return filteredAndSortedRecipes.slice(start, start + size);
  }, [filteredAndSortedRecipes, safePage, pageSize]);

  const activeFiltersCount =
    (search.trim() ? 1 : 0) +
    (difficultyFilter !== 'all' ? 1 : 0) +
    (tagFilter !== 'all' ? 1 : 0) +
    (cookTimeFilter !== 'all' ? 1 : 0) +
    (visibilityFilter !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSearch('');
    setDifficultyFilter('all');
    setTagFilter('all');
    setCookTimeFilter('all');
    setVisibilityFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  if (loading) return <div className="admin-loading">Đang tải danh sách công thức & món ăn...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý Món ăn & Công thức</h1>
        <p className="admin-page-subtitle">Tạo mới, chỉnh sửa công thức, chuẩn hóa từng bước chế biến và quản lý nguyên liệu dễ dàng.</p>
      </div>

      <div className="admin-table-container shadow-sm">
        {/* Top Toolbar: Search + Action Button */}
        <div className="admin-recipe-toolbar-wrapper">
          <div className="admin-recipe-toolbar-top">
            <div className="admin-search-container" style={{ position: 'relative', flex: '1', maxWidth: '420px' }}>
              <FiSearch className="admin-search-icon" size={18} />
              <input
                className="admin-search-input-inner"
                placeholder="Tìm theo tên món ăn, mô tả..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {search && (
                <button
                  type="button"
                  className="admin-search-clear-btn"
                  onClick={() => {
                    setSearch('');
                    setCurrentPage(1);
                  }}
                  title="Xóa tìm kiếm"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Quick Sort Dropdown + Add Recipe Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div className="admin-filter-item">
                <span className="admin-filter-label">Sắp xếp:</span>
                <select
                  className="admin-filter-select"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortSelectChange}
                >
                  <option value="createdAt-desc">Mới nhất</option>
                  <option value="createdAt-asc">Cũ nhất</option>
                  <option value="recipe_name-asc">Tên món (A - Z)</option>
                  <option value="recipe_name-desc">Tên món (Z - A)</option>
                  <option value="cookTime-asc">Nấu nhanh nhất</option>
                  <option value="cookTime-desc">Nấu lâu nhất</option>
                  <option value="difficulty-asc">Độ khó (Dễ → Khó)</option>
                  <option value="difficulty-desc">Độ khó (Khó → Dễ)</option>
                </select>
              </div>

              <button className="btn-add-new" onClick={openRecipeModal}>
                <FiPlus size={18} /> Thêm công thức mới
              </button>
            </div>
          </div>

          {/* Filters Bar: Difficulty, Tags, Cook Time, Visibility + Reset */}
          <div className="admin-recipe-filters-bar">
            <div className="admin-filter-item">
              <FiFilter size={15} style={{ color: '#64748b' }} />
              <span className="admin-filter-label">Lọc:</span>
            </div>

            {/* Difficulty Filter */}
            <div className="admin-filter-item">
              <select
                className={`admin-filter-select ${difficultyFilter !== 'all' ? 'has-value' : ''}`}
                value={difficultyFilter}
                onChange={(e) => {
                  setDifficultyFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả độ khó</option>
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>

            {/* Tag / Category Filter */}
            <div className="admin-filter-item">
              <select
                className={`admin-filter-select ${tagFilter !== 'all' ? 'has-value' : ''}`}
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả thẻ phân loại</option>
                {availableRecipeTags.map((tag) => {
                  const name = tag.name || tag.Name;
                  return (
                    <option key={tag.rt_Id || tag.rt_id || tag.id || name} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Cook Time Range Filter */}
            <div className="admin-filter-item">
              <select
                className={`admin-filter-select ${cookTimeFilter !== 'all' ? 'has-value' : ''}`}
                value={cookTimeFilter}
                onChange={(e) => {
                  setCookTimeFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Mọi thời gian nấu</option>
                <option value="quick">⚡ Dưới 15 phút</option>
                <option value="medium">⏱️ 15 - 30 phút</option>
                <option value="long">🍲 Trên 30 phút</option>
              </select>
            </div>

            {/* Visibility Filter */}
            <div className="admin-filter-item">
              <select
                className={`admin-filter-select ${visibilityFilter !== 'all' ? 'has-value' : ''}`}
                value={visibilityFilter}
                onChange={(e) => {
                  setVisibilityFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="public">🌐 Công khai</option>
                <option value="private">🔒 Riêng tư / Ẩn</option>
              </select>
            </div>

            {/* Active Filters count / Reset Button */}
            {activeFiltersCount > 0 ? (
              <button type="button" className="admin-btn-reset" onClick={handleResetFilters}>
                <FiRotateCcw size={14} />
                Đặt lại bộ lọc ({activeFiltersCount})
              </button>
            ) : (
              <div className="admin-filter-stats">
                <span>Tổng cộng:</span>
                <span className="admin-filter-stats-badge">{totalItems} món</span>
              </div>
            )}
          </div>
        </div>

        {/* Recipes Table */}
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Hình ảnh</th>
              <th className="sortable-th" onClick={() => handleSort('recipe_name')}>
                <div className="sort-header-content">
                  <span>Tên món ăn</span>
                  {sortBy === 'recipe_name' ? (
                    sortOrder === 'asc' ? <FiArrowUp className="sort-icon-active" size={14} /> : <FiArrowDown className="sort-icon-active" size={14} />
                  ) : (
                    <span className="sort-icon-idle">↕</span>
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => handleSort('difficulty')} style={{ width: '130px' }}>
                <div className="sort-header-content">
                  <span>Độ khó</span>
                  {sortBy === 'difficulty' ? (
                    sortOrder === 'asc' ? <FiArrowUp className="sort-icon-active" size={14} /> : <FiArrowDown className="sort-icon-active" size={14} />
                  ) : (
                    <span className="sort-icon-idle">↕</span>
                  )}
                </div>
              </th>
              <th className="sortable-th" onClick={() => handleSort('cookTime')} style={{ width: '220px' }}>
                <div className="sort-header-content">
                  <span>Chuẩn bị / Nấu</span>
                  {sortBy === 'cookTime' ? (
                    sortOrder === 'asc' ? <FiArrowUp className="sort-icon-active" size={14} /> : <FiArrowDown className="sort-icon-active" size={14} />
                  ) : (
                    <span className="sort-icon-idle">↕</span>
                  )}
                </div>
              </th>
              <th>Thẻ phân loại</th>
              <th style={{ width: '110px', textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecipes.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state" style={{ padding: '48px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '8px' }}>
                    Không tìm thấy công thức nào phù hợp với bộ lọc
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      className="admin-btn-reset"
                      style={{ margin: '0 auto', display: 'inline-flex' }}
                      onClick={handleResetFilters}
                    >
                      <FiRotateCcw size={14} /> Đặt lại tất cả bộ lọc
                    </button>
                  )}
                </td>
              </tr>
            )}
            {paginatedRecipes.map((recipe) => (
              <tr key={recipe.recipe_id}>
                <td>
                  <img
                    src={resolveRecipeImageUrl(recipe.recipe_name, recipe.imageUrl || recipe.ImageUrl)}
                    alt={recipe.recipe_name}
                    className="admin-table-img"
                    onError={(e) => {
                      e.target.src = FALLBACK_MEAL_IMAGE;
                    }}
                  />
                </td>
                <td className="font-medium">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{recipe.recipe_name}</span>
                    {recipe.isPublic === false && (
                      <span
                        style={{
                          fontSize: '11px',
                          background: '#f1f5f9',
                          color: '#64748b',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}
                      >
                        Ẩn
                      </span>
                    )}
                  </div>
                  {recipe.description && (
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '4px 0 0', lineHeight: 1.3 }}>
                      {recipe.description.length > 70
                        ? `${recipe.description.slice(0, 70)}...`
                        : recipe.description}
                    </p>
                  )}
                </td>
                <td>
                  <span className={`difficulty-badge ${recipe.difficulty?.toLowerCase()}`}>
                    {recipe.difficulty === 'easy'
                      ? 'Dễ'
                      : recipe.difficulty === 'medium'
                      ? 'Trung bình'
                      : recipe.difficulty === 'hard'
                      ? 'Khó'
                      : recipe.difficulty || 'Dễ'}
                  </span>
                </td>

                <td>
                  <div style={{ fontSize: '13.5px', color: '#334155' }}>
                    <span>{recipe.prepTime || 0}p</span>
                    <span style={{ color: '#94a3b8', margin: '0 4px' }}>/</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{recipe.cookTime || 0}p</span>
                    {recipe.servings ? (
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
                        ({recipe.servings} phần)
                      </span>
                    ) : null}
                  </div>
                </td>
                <td>
                  <div className="tags-flex">
                    {(recipe.recipeLabels || []).map((label) => (
                      <span key={label.label_id || label.id || label.labelName} className="tag-badge">
                        {label.labelName || label.label_name || label.name}
                      </span>
                    ))}
                    {(!recipe.recipeLabels || recipe.recipeLabels.length === 0) && '-'}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className="actions-flex" style={{ justifyContent: 'center' }}>
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

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="admin-pagination-container">
            <div className="admin-pagination-info">
              Hiển thị{' '}
              <strong>
                {pageSize === 'all'
                  ? `1 - ${totalItems}`
                  : `${(safePage - 1) * Number(pageSize) + 1} - ${Math.min(safePage * Number(pageSize), totalItems)}`}
              </strong>{' '}
              trên tổng số <strong>{totalItems}</strong> công thức
              {activeFiltersCount > 0 && ` (lọc từ ${recipes.length} món)`}
            </div>

            <div className="admin-pagination-controls">
              <span style={{ fontSize: '13px', color: '#64748b', marginRight: '4px' }}>Số dòng:</span>
              <select
                className="page-size-selector"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value="all">Tất cả</option>
              </select>

              {pageSize !== 'all' && totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    title="Trang trước"
                  >
                    <FiChevronLeft size={16} />
                  </button>

                  <span style={{ fontSize: '13px', color: '#475569', padding: '0 8px', fontWeight: 500 }}>
                    Trang {safePage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    className="pagination-btn"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    title="Trang kế tiếp"
                  >
                    <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
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

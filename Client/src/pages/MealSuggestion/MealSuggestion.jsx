import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import RecipeHealthScore from '../../components/common/RecipeHealthScore';
import IngredientLockBadge from '../../components/common/IngredientLockBadge';
import DiaryEntryDrawer from '../../components/common/DiaryEntryDrawer';
import { mockRecipesData } from '../../utils/mockData';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import './MealSuggestion.css';
import {
  MdBlock, MdCheckCircle, MdOutlineKitchen, MdWarning,
} from 'react-icons/md';

export default function MealSuggestion() {
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;
  const { 
    lockedIngredients = [], 
    reducedIngredients = [], 
    preferredIngredients = [], 
    getHealthScoreForRecipe 
  } = useHealthProfile();

  const [ingredients, setIngredients] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [leftTab, setLeftTab] = useState('pantry');
  const [pantryItems, setPantryItems] = useState(() => {
    const saved = localStorage.getItem(`pantry_${accountId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showAllergicRecipes, setShowAllergicRecipes] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [drawerRecipe, setDrawerRecipe] = useState(null);

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/ingredient');
      setIngredients(res.data.data || []);
    } catch (err) {
      console.error('Không thể tải nguyên liệu:', err);
    }
  };

  const fetchUserAllergies = async () => {
    try {
      const res = await api.get(`/allergy?accountId=${accountId}`);
      setAllergies(res.data.data || []);
    } catch (err) {
      console.error('Không thể tải danh sách dị ứng:', err);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchUserAllergies();
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      localStorage.setItem(`pantry_${accountId}`, JSON.stringify(pantryItems));
    }
  }, [pantryItems, accountId]);

  const handleTogglePantry = (ingId) => {
    setPantryItems(prev => {
      if (prev.includes(ingId)) {
        return prev.filter(id => id !== ingId);
      } else {
        return [...prev, ingId];
      }
    });
  };

  const handleToggleAllergy = async (ingId) => {
    if (!accountId) return;
    const existingAllergy = allergies.find(a => a.ingredient_id === ingId);
    try {
      if (existingAllergy) {
        await api.delete(`/allergy/${existingAllergy.allergy_id}`);
        triggerAlert('Đã xóa khỏi danh sách dị ứng.', 'success');
      } else {
        await api.post('/allergy', {
          account_id: accountId,
          ingredient_id: ingId
        });
        triggerAlert('Đã thêm vào danh sách dị ứng.', 'success');
        setPantryItems(prev => prev.filter(id => id !== ingId));
      }
      await fetchUserAllergies();
    } catch (err) {
      console.error(err);
      triggerAlert('Cập nhật dị ứng thất bại.', 'error');
    }
  };

  const triggerAlert = (msg, type = 'info') => {
    setAlertMsg({ text: msg, type });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const getGroupedIngredients = () => {
    const groups = {};
    ingredients.forEach(ing => {
      const labels = ing.ingredientLabels || [];
      const tagName = labels.length > 0 ? labels[0].labelName : 'Khác';
      if (!groups[tagName]) {
        groups[tagName] = [];
      }
      groups[tagName].push(ing);
    });
    return groups;
  };

  const groupedIngredients = getGroupedIngredients();

  const normalizeText = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .trim();
  };

  const getRecipeHealthInfo = (recipe) => {
    if (!lockedIngredients.length) return null;
    const recipeIngNames = (recipe.ingredients || []).map(i => i.name) || recipe.requiredIngredients || [];
    const locked = lockedIngredients.filter(li =>
      recipeIngNames.some(ri => normalizeText(ri).includes(normalizeText(li)))
    );
    const reduced = reducedIngredients.filter(ri =>
      recipeIngNames.some(rin => normalizeText(rin).includes(normalizeText(ri)))
    );
    return { locked, reduced };
  };

  const suggestedRecipes = mockRecipesData.map(recipe => {
    const allergicIngredients = recipe.requiredIngredients.filter(reqIng => {
      const sysIng = ingredients.find(i => {
        const dbName = normalizeText(i.name);
        const recipeName = normalizeText(reqIng);
        return dbName === recipeName || dbName.includes(recipeName) || recipeName.includes(dbName);
      });
      return sysIng && allergies.some(a => a.ingredient_id === sysIng.ingredient_id);
    });

    const hasAllergyConflict = allergicIngredients.length > 0;

    const allIngredientsMapped = recipe.requiredIngredients.map(reqIng => {
      const sysIng = ingredients.find(i => {
        const dbName = normalizeText(i.name);
        const recipeName = normalizeText(reqIng);
        return dbName === recipeName || dbName.includes(recipeName) || recipeName.includes(dbName);
      });
      const possessed = sysIng ? pantryItems.includes(sysIng.ingredient_id) : false;
      return { name: reqIng, possessed };
    });

    const possessedCount = allIngredientsMapped.filter(i => i.possessed).length;
    const matchPercentage = Math.round((possessedCount / recipe.requiredIngredients.length) * 100);
    const missingIngredients = allIngredientsMapped.filter(i => !i.possessed).map(i => i.name);

    return {
      ...recipe,
      matchPercentage,
      missingIngredients,
      allIngredients: allIngredientsMapped,
      hasAllergyConflict,
      allergicIngredients,
    };
  })
  .filter(recipe => showAllergicRecipes || !recipe.hasAllergyConflict)
  .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <div className="meal-suggestion-container">
      {alertMsg && (
        <div className={`suggestion-alert banner-${alertMsg.type}`}>
          {alertMsg.text}
        </div>
      )}

      <div className="pantry-config-sidebar glass-panel">
        <div className="sidebar-tabs-nav">
          <button
            className={`sidebar-tab-btn ${leftTab === 'pantry' ? 'active' : ''}`}
            onClick={() => setLeftTab('pantry')}
          >
            <MdOutlineKitchen className="tab-icon" />
            Tủ lạnh
          </button>
          <button
            className={`sidebar-tab-btn ${leftTab === 'allergy' ? 'active' : ''}`}
            onClick={() => setLeftTab('allergy')}
          >
            <MdBlock className="tab-icon" />
            Dị ứng
          </button>
          <button
            className={`sidebar-tab-btn ${leftTab === 'health' ? 'active' : ''}`}
            onClick={() => setLeftTab('health')}
          >
            ❤️ Sức khoẻ
          </button>
        </div>

        {leftTab === 'health' ? (
          <div className="tab-info-text">
            <p>Thông tin dinh dưỡng dựa trên hồ sơ sức khoẻ của bạn</p>
          </div>
        ) : (
          <div className="tab-info-text">
            {leftTab === 'pantry' ? (
              <p>Chọn các nguyên liệu bạn đang **sẵn có** ở nhà để hệ thống gợi ý thực đơn thích hợp nhất.</p>
            ) : (
              <p>Chọn những thực phẩm bạn **bị dị ứng** (không ăn được) để lọc sạch các công thức nguy hiểm.</p>
            )}
          </div>
        )}

        <div className="category-scroll-container">
          {leftTab === 'pantry' && Object.keys(groupedIngredients).map(categoryName => (
            <div key={categoryName} className="category-group">
              <h4 className="category-header">{categoryName}</h4>
              <div className="ingredients-pills-list">
                {groupedIngredients[categoryName].map(ing => {
                  const isPantry = pantryItems.includes(ing.ingredient_id);
                  const isAllergy = allergies.some(a => a.ingredient_id === ing.ingredient_id);
                  return (
                    <button
                      key={ing.ingredient_id}
                      className={`ing-pill pantry-pill ${isPantry ? 'selected' : ''} ${isAllergy ? 'disabled-allergic' : ''}`}
                      onClick={() => !isAllergy && handleTogglePantry(ing.ingredient_id)}
                      disabled={isAllergy}
                      title={isAllergy ? 'Thực phẩm bị dị ứng không thể chọn vào Tủ lạnh' : ''}
                    >
                      {isPantry && <MdCheckCircle className="pill-check-icon" />}
                      {ing.name}
                      {isAllergy && <span className="disabled-pill-text">(Dị ứng)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {leftTab === 'allergy' && Object.keys(groupedIngredients).map(categoryName => (
            <div key={categoryName} className="category-group">
              <h4 className="category-header">{categoryName}</h4>
              <div className="ingredients-pills-list">
                {groupedIngredients[categoryName].map(ing => {
                  const isAllergy = allergies.some(a => a.ingredient_id === ing.ingredient_id);
                  return (
                    <button
                      key={ing.ingredient_id}
                      className={`ing-pill allergy-pill ${isAllergy ? 'selected' : ''}`}
                      onClick={() => handleToggleAllergy(ing.ingredient_id)}
                    >
                      {isAllergy && <MdBlock className="pill-check-icon" />}
                      {ing.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {leftTab === 'health' && (
            <div>
              {lockedIngredients.length === 0 && reducedIngredients.length === 0 && preferredIngredients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>
                  <p style={{ fontSize: 14, marginBottom: 8 }}>Chưa có hồ sơ sức khoẻ</p>
                  <p style={{ fontSize: 13 }}>Vui lòng hoàn thành khảo sát sức khoẻ để nhận gợi ý</p>
                </div>
              ) : (
                <>
                  {lockedIngredients.length > 0 && (
                    <div className="category-group" style={{ marginBottom: 20 }}>
                      <h4 className="category-header" style={{ color: '#dc2626' }}>🔒 Nguyên liệu bị khoá</h4>
                      <div className="ingredients-pills-list">
                        {lockedIngredients.map(ing => (
                          <IngredientLockBadge key={ing} ingredient={ing} type="locked" />
                        ))}
                      </div>
                    </div>
                  )}
                  {reducedIngredients.length > 0 && (
                    <div className="category-group" style={{ marginBottom: 20 }}>
                      <h4 className="category-header" style={{ color: '#ea580c' }}>↓ Nguyên liệu giảm lượng</h4>
                      <div className="ingredients-pills-list">
                        {reducedIngredients.map(ing => (
                          <IngredientLockBadge key={ing} ingredient={ing} type="reduced" />
                        ))}
                      </div>
                    </div>
                  )}
                  {preferredIngredients.length > 0 && (
                    <div className="category-group" style={{ marginBottom: 20 }}>
                      <h4 className="category-header" style={{ color: '#16a34a' }}>✓ Nguyên liệu ưu tiên</h4>
                      <div className="ingredients-pills-list">
                        {preferredIngredients.map(ing => (
                          <IngredientLockBadge key={ing} ingredient={ing} type="preferred" />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="suggestions-main-content">
        <div className="suggestions-header-bar">
          <div>
            <h2>Gợi ý Thực đơn Thông minh</h2>
            <span className="results-count-text">Tìm thấy {suggestedRecipes.length} công thức món ăn</span>
          </div>
          <div className="allergy-toggle-checkbox">
            <label>
              <input
                type="checkbox"
                checked={showAllergicRecipes}
                onChange={(e) => setShowAllergicRecipes(e.target.checked)}
              />
              Hiển thị món ăn chứa chất dị ứng
            </label>
          </div>
        </div>

        {suggestedRecipes.length === 0 ? (
          <div className="empty-suggestions-card">
            <MdWarning className="empty-warn-icon" />
            <p>Không có công thức món ăn nào phù hợp với cài đặt của bạn. Thử thêm nguyên liệu vào tủ lạnh hoặc tắt lọc dị ứng nhé!</p>
          </div>
        ) : (
          <div className="recipes-grid-suggestions">
            {suggestedRecipes.map(recipe => {
              const healthInfo = getRecipeHealthInfo(recipe);
              const score = getHealthScoreForRecipe(recipe);
              const lowScore = score < 50;

              return (
                <div
                  key={recipe.id}
                  className={`recipe-suggestion-card-wrapper ${recipe.hasAllergyConflict ? 'allergic-warning-card' : ''}`}
                >
                  {recipe.hasAllergyConflict && (
                    <div className="allergy-card-overlay">
                      <MdWarning className="warn-badge-icon" />
                      <span>Cảnh báo Dị ứng: Chứa {recipe.allergicIngredients.join(', ')}</span>
                    </div>
                  )}

                  <div style={{
                    opacity: lowScore ? 0.6 : 1,
                    transition: 'opacity 0.2s',
                    position: 'relative',
                  }}>
                    {lowScore && (
                      <div style={{
                        position: 'absolute', top: 8, left: 8, zIndex: 10,
                        background: '#fef2f2', color: '#dc2626',
                        padding: '4px 10px', borderRadius: 8,
                        fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <MdWarning /> Ít phù hợp
                      </div>
                    )}

                    <RecipeCard recipe={recipe} />

                    <div style={{ padding: '8px 16px 12px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <RecipeHealthScore recipe={recipe} />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDrawerRecipe(recipe); }}
                          style={{
                            padding: '6px 14px', border: '1px solid #22C55E', borderRadius: 8,
                            background: 'white', color: '#22C55E',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          + Thêm vào nhật ký
                        </button>
                      </div>
                      {healthInfo?.reduced?.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '2px 8px', borderRadius: 10,
                            background: '#fff7ed', color: '#ea580c',
                            fontSize: 11, fontWeight: 500,
                          }}>
                            ⚡ Đã điều chỉnh cho bạn
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DiaryEntryDrawer
        recipe={drawerRecipe}
        isOpen={!!drawerRecipe}
        onClose={() => setDrawerRecipe(null)}
      />
    </div>
  );
}
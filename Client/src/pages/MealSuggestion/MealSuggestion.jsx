import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import { mockRecipesData } from '../../utils/mockData';
import './MealSuggestion.css';
import { 
  MdBlock, MdCheckCircle, MdOutlineKitchen, 
  MdLocalDining, MdWarning, MdArrowForward 
} from 'react-icons/md';

export default function MealSuggestion() {
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;

  // DB Data
  const [ingredients, setIngredients] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tabs: pantry | allergy
  const [leftTab, setLeftTab] = useState('pantry');

  // Pantry selection state (stored locally in memory / state)
  const [pantryItems, setPantryItems] = useState(() => {
    const saved = localStorage.getItem(`pantry_${accountId}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Show allergic recipes toggle
  const [showAllergicRecipes, setShowAllergicRecipes] = useState(false);

  // Alert banner
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchUserAllergies();
    }
  }, [accountId]);

  // Persist pantry items to localStorage
  useEffect(() => {
    if (accountId) {
      localStorage.setItem(`pantry_${accountId}`, JSON.stringify(pantryItems));
    }
  }, [pantryItems, accountId]);

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
      setLoading(true);
      const res = await api.get(`/allergy?accountId=${accountId}`);
      setAllergies(res.data.data || []);
    } catch (err) {
      console.error('Không thể tải danh sách dị ứng:', err);
    } finally {
      setLoading(false);
    }
  };

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
      setLoading(true);
      if (existingAllergy) {
        // Remove allergy
        await api.delete(`/allergy/${existingAllergy.allergy_id}`);
        triggerAlert('Đã xóa khỏi danh sách dị ứng.', 'success');
      } else {
        // Add allergy
        await api.post('/allergy', {
          account_id: accountId,
          ingredient_id: ingId
        });
        triggerAlert('Đã thêm vào danh sách dị ứng.', 'success');
        
        // Auto-remove from pantry if added to allergy
        setPantryItems(prev => prev.filter(id => id !== ingId));
      }
      await fetchUserAllergies();
    } catch (err) {
      console.error(err);
      triggerAlert('Cập nhật dị ứng thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (msg, type = 'info') => {
    setAlertMsg({ text: msg, type });
    setTimeout(() => setAlertMsg(null), 3000);
  };

  // Group ingredients by their first label/tag for display
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

  // Recipe Suggestion Matching Logic
  const suggestedRecipes = mockRecipesData.map(recipe => {
    // Check if user is allergic to any ingredients in the recipe
    const allergicIngredients = recipe.requiredIngredients.filter(reqIng => {
      // Find system ingredient matching this recipe ingredient
      const sysIng = ingredients.find(i => i.name.toLowerCase() === reqIng.toLowerCase() || 
                                           i.name.toLowerCase().includes(reqIng.toLowerCase()));
      return sysIng && allergies.some(a => a.ingredient_id === sysIng.ingredient_id);
    });

    const hasAllergyConflict = allergicIngredients.length > 0;

    // Check match count
    const allIngredientsMapped = recipe.requiredIngredients.map(reqIng => {
      const sysIng = ingredients.find(i => i.name.toLowerCase() === reqIng.toLowerCase() || 
                                           i.name.toLowerCase().includes(reqIng.toLowerCase()));
      
      const possessed = sysIng ? pantryItems.includes(sysIng.ingredient_id) : false;

      return {
        name: reqIng,
        possessed
      };
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
      allergicIngredients
    };
  })
  // Filter out allergic recipes if disabled
  .filter(recipe => showAllergicRecipes || !recipe.hasAllergyConflict)
  // Sort by match percentage
  .sort((a, b) => b.matchPercentage - a.matchPercentage);

  return (
    <div className="meal-suggestion-container">
      {alertMsg && (
        <div className={`suggestion-alert banner-${alertMsg.type}`}>
          {alertMsg.text}
        </div>
      )}

      {/* LEFT SIDEBAR: Pantry & Allergy Configurator */}
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
        </div>

        <div className="tab-info-text">
          {leftTab === 'pantry' ? (
            <p>Chọn các nguyên liệu bạn đang **sẵn có** ở nhà để hệ thống gợi ý thực đơn thích hợp nhất.</p>
          ) : (
            <p>Chọn những thực phẩm bạn **bị dị ứng** (không ăn được) để lọc sạch các công thức nguy hiểm.</p>
          )}
        </div>

        {/* Ingredients classified by category */}
        <div className="category-scroll-container">
          {Object.keys(groupedIngredients).map(categoryName => (
            <div key={categoryName} className="category-group">
              <h4 className="category-header">{categoryName}</h4>
              <div className="ingredients-pills-list">
                {groupedIngredients[categoryName].map(ing => {
                  const isPantry = pantryItems.includes(ing.ingredient_id);
                  const isAllergy = allergies.some(a => a.ingredient_id === ing.ingredient_id);

                  if (leftTab === 'pantry') {
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
                  } else {
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
                  }
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT MAIN SECTION: Recipe Suggestions */}
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
            {suggestedRecipes.map(recipe => (
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
                
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

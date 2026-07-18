import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { getIngredients } from '../../services/foodService';
import { recipeService } from '../../services/recipeService';
import { allergyService } from '../../services/allergyService';
import { useAuth } from '../../context/AuthContext';
import RecipeCard from '../../components/RecipeCard/RecipeCard';
import RecipeHealthScore from '../../components/common/RecipeHealthScore';
import DiaryEntryDrawer from '../../components/common/DiaryEntryDrawer';
import HealthWarningPopup from '../../components/common/HealthWarningPopup';
import { resolveRecipeImageUrl } from '../../utils/recipeImages';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { nutritionLogService } from '../../services/nutritionLogService';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import './MealSuggestion.css';
import {
  MdBlock, MdCheckCircle, MdOutlineKitchen, MdWarning,
} from 'react-icons/md';
import { FiFilter, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import AdvancedRecipeFilter from '../../components/RecipeFilter/AdvancedRecipeFilter';

export default function MealSuggestion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = user?.accountId || user?.account_id;
  const { 
    lockedIngredients = [], 
    reducedIngredients = [], 
    preferredIngredients = [], 
    getHealthScoreDetails,
    dailyTargets
  } = useHealthProfile();

  const [ingredients, setIngredients] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [leftTab, setLeftTab] = useState('pantry');
  const [pantryItems, setPantryItems] = useState(() => {
    const saved = localStorage.getItem(`pantry_${accountId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showAllergicRecipes, setShowAllergicRecipes] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [drawerRecipe, setDrawerRecipe] = useState(null);
  const [warningPopupData, setWarningPopupData] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('');
  const [pantryMode, setPantryMode] = useState('explore'); // 'explore' | 'cook'
  const [selectedCookingMethod, setSelectedCookingMethod] = useState(null);
  
  // Advanced Filter States
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 992);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('suitability');
  const [timeRange, setTimeRange] = useState([0, 180]);
  const [difficultyFilter, setDifficultyFilter] = useState([]);
  const [caloriesRange, setCaloriesRange] = useState([0, 1000]);
  const [minHealthScore, setMinHealthScore] = useState(0);

  const [todayTotals, setTodayTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 });

  const COOKING_METHODS = [
    { key: 'xao',   label: 'Xào',         keywords: ['xào'] },
    { key: 'chien', label: 'Chiên/Rán',   keywords: ['chiên', 'rán'] },
    { key: 'nuong', label: 'Nướng',       keywords: ['nướng'] },
    { key: 'luoc',  label: 'Luộc/Hấp',    keywords: ['luộc', 'hấp'] },
    { key: 'canh',  label: 'Canh/Súp',    keywords: ['canh', 'súp', 'lẩu', 'nước'] },
    { key: 'kho',   label: 'Kho/Rim',     keywords: ['kho', 'rim'] },
    { key: 'salad', label: 'Salad/Trộn',  keywords: ['salad', 'gỏi', 'trộn'] },
    { key: 'ham',   label: 'Hầm/Ninh',    keywords: ['hầm', 'ninh', 'om'] },
    { key: 'banh',  label: 'Làm bánh',    keywords: ['bánh'] },
    { key: 'phache',label: 'Đồ uống/Tráng miệng', keywords: ['sinh tố', 'chè', 'nước ép', 'trà', 'cà phê', 'sữa', 'kem', 'tráng miệng', 'đồ uống'] },
  ];

  const detectCookingMethod = (recipe, normalTitle) => {
    const labels = recipe.recipeLabels || recipe.RecipeLabels || [];
    
    // Check labels first
    for (const m of COOKING_METHODS) {
      if (labels.some(l => {
        const nLabel = normalizeText(l.labelName || l);
        return m.keywords.some(kw => nLabel.includes(normalizeText(kw)));
      })) return m.key;
    }
    
    // Check title with word boundary regex
    for (const m of COOKING_METHODS) {
      if (m.keywords.some(kw => {
         const nKw = normalizeText(kw);
         return new RegExp(`(^|\\s)${nKw}(\\s|$)`).test(normalTitle);
      })) return m.key;
    }
    
    return null;
  };

  const fetchTodayLogs = async () => {
    if (!accountId) return;
    try {
      const res = await nutritionLogService.getAll(accountId);
      const logs = res.data?.data || [];
      const today = getTodayDateKey();
      const todayLogs = logs.filter(l => toDateKey(l.logDate) === today);
      
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 };
      todayLogs.forEach(l => {
        totals.calories += l.totalCalories || 0;
        totals.protein += l.totalProtein || 0;
        totals.carbs += l.totalCarbs || 0;
        totals.fat += l.totalFat || 0;
        totals.fiber += l.totalFiber || 0;
        totals.sugar += l.totalSugar || 0;
        totals.sodium += l.totalSalt || l.totalSodium || 0;
        totals.cholesterol += l.totalCholesterol || 0;
      });
      setTodayTotals(totals);
    } catch (err) {
      console.error('Không thể tải nhật ký hôm nay:', err);
    }
  };

  const fetchIngredients = async () => {
    try {
      const res = await getIngredients();
      setIngredients(res.data.data || []);
    } catch (err) {
      console.error('Không thể tải nguyên liệu:', err);
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await recipeService.getAll();
      setRecipes(res.data.data || []);
    } catch (err) {
      console.error('Không thể tải công thức:', err);
    }
  };

  const fetchUserAllergies = async () => {
    try {
      const res = await allergyService.getAll(accountId);
      setAllergies(res.data.data || []);
    } catch (err) {
      console.error('Không thể tải danh sách dị ứng:', err);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [pantryItems, accountId]);

  useEffect(() => {
    if (accountId) {
      fetchUserAllergies();
      fetchTodayLogs();
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
        await allergyService.delete(existingAllergy.allergy_id);
        triggerAlert('Đã xóa khỏi danh sách dị ứng.', 'success');
      } else {
        await allergyService.create({
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

  const normalizeText = (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .trim();
  };

  const groupedIngredients = getGroupedIngredients();

  const filteredGroupedIngredients = useMemo(() => {
    if (!ingredientSearchQuery.trim()) return groupedIngredients;

    const escaped = ingredientSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'iu');
    const result = {};
    Object.keys(groupedIngredients).forEach(category => {
      const matches = groupedIngredients[category].filter(ing =>
        re.test(ing.name)
      );
      if (matches.length > 0) {
        result[category] = matches;
      }
    });
    return result;
  }, [groupedIngredients, ingredientSearchQuery]);

  const getRecipeHealthInfo = (recipe) => {
    if (!lockedIngredients.length) return null;
    const recipeIngNames = (recipe.ingredients || []).map(i => i.name) || recipe.requiredIngredients || [];
    const locked = lockedIngredients.filter(li => {
      const escaped = li.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return recipeIngNames.some(ri => new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'iu').test(ri));
    });
    const reduced = reducedIngredients.filter(ri => {
      const escaped = ri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return recipeIngNames.some(rin => new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'iu').test(rin));
    });
    return { locked, reduced };
  };

  const matchSystemIngredient = (recipeIngName, allSysIngredients) => {
    const rName = normalizeText(recipeIngName);
    const matches = allSysIngredients.filter(sysIng => {
      const dbName = normalizeText(sysIng.name);
      if (dbName === rName) return true;
      const escapedDbName = dbName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<!\\p{L})${escapedDbName}(?!\\p{L})`, 'iu');
      return regex.test(rName);
    });
    if (matches.length === 0) return null;
    return matches.sort((a, b) => b.name.length - a.name.length)[0];
  };

  const mappedRecipes = useMemo(() => recipes.map(rec => {
    // --- Normalize fields from both getAll and suggestFromPantry response formats ---
    const recipeName = rec.recipe_name || rec.Recipe_name || "";
    const recipeId = rec.recipe_id || rec.Recipe_id || "";
    const description = rec.description || rec.Description || "";
    const prepTime = rec.prepTime || rec.PrepTime || 0;
    const cookTime = rec.cookTime || rec.CookTime || 0;
    const servings = rec.servings || rec.Servings || 1;
    const difficultyRaw = rec.difficulty || rec.Difficulty || "easy";
    const difficultyMap = { easy: "Dễ", medium: "Trung bình", hard: "Khó" };
    const difficulty = difficultyMap[difficultyRaw.toLowerCase()] || difficultyRaw;
    const recipeIngredients = rec.recipeIngredients || rec.RecipeIngredients || [];

    // --- Image ---
    const imageUrl = resolveRecipeImageUrl(recipeName);

    // --- Handle suggestFromPantry response (pre-computed matchPercentage, missingIngredients, allIngredients) ---
    const fromPantry = rec.matchPercentage !== undefined;
    let matchPercentage, missingIngredients, allIngredients, requiredIngredients;
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0, totalSugar = 0, totalSodium = 0, totalCholesterol = 0;

    if (fromPantry) {
      allIngredients = (rec.allIngredients || []).map(ai => ({
        name: ai.name || ai.Name || 'Nguyên liệu',
        amount: ai.amount || ai.Amount || '',
        possessed: ai.possessed !== undefined ? ai.possessed : false,
        isPrimary: ai.isPrimary !== undefined ? ai.isPrimary : (ai.IsPrimary !== undefined ? ai.IsPrimary : false),
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 }
      }));
      requiredIngredients = allIngredients.map(i => i.name);
      missingIngredients = rec.missingIngredients || [];
      const hasMissingPrimary = allIngredients.some(i => i.isPrimary && !i.possessed);
      matchPercentage = hasMissingPrimary ? 0 : rec.matchPercentage;
      // ponytail: suggestFromPantry doesn't return nutritional values; calories stay 0
    } else {
      // Existing client-side calculation for getAll response
      const mappedIngredients = recipeIngredients.map(ri => {
        const quantityVal = ri.quantity || ri.Quantity || 0;
        const uom = ri.uom || ri.UOM || "";
        const ingName = ri.name || ri.Name || 'Nguyên liệu';

        let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 };
        const nv = ri.nutritionalValue || ri.NutritionalValue;
        if (nv) {
          const servingSize = nv.servingSize || nv.ServingSize || 1;
          const multiplier = quantityVal / servingSize;
          nutrition = {
            calories: Math.round((nv.calories || nv.Calories || 0) * multiplier * 10) / 10,
            protein: Math.round((nv.protein || nv.Protein || 0) * multiplier * 10) / 10,
            carbs: Math.round((nv.carbs || nv.Carbs || nv.carbohydrates || nv.Carbohydrates || 0) * multiplier * 10) / 10,
            fat: Math.round((nv.fat || nv.Fat || 0) * multiplier * 10) / 10,
            fiber: Math.round((nv.fiber || nv.Fiber || 0) * multiplier * 10) / 10,
            sugar: Math.round((nv.sugar || nv.Sugar || 0) * multiplier * 10) / 10,
            sodium: Math.round((nv.salt || nv.Salt || nv.sodium || nv.Sodium || 0) * multiplier * 10) / 10,
            cholesterol: Math.round((nv.cholesterol || nv.Cholesterol || 0) * multiplier * 10) / 10,
          };
        }

        totalCalories += nutrition.calories;
        totalProtein += nutrition.protein;
        totalCarbs += nutrition.carbs;
        totalFat += nutrition.fat;
        totalFiber += nutrition.fiber;
        totalSugar += nutrition.sugar;
        totalSodium += nutrition.sodium;
        totalCholesterol += nutrition.cholesterol;

        const sysIng = matchSystemIngredient(ingName, ingredients);
        const possessed = sysIng ? pantryItems.includes(sysIng.ingredient_id) : false;
        const isPrimary = ri.isPrimary !== undefined ? ri.isPrimary : (ri.IsPrimary !== undefined ? ri.IsPrimary : false);

        return { name: ingName, amount: `${quantityVal} ${uom}`.trim(), possessed, isPrimary, nutrition };
      });

      allIngredients = mappedIngredients;
      requiredIngredients = mappedIngredients.map(i => i.name);
      missingIngredients = mappedIngredients.filter(i => !i.possessed).map(i => i.name);
      const hasMissingPrimary = mappedIngredients.some(i => i.isPrimary && !i.possessed);
      if (hasMissingPrimary) {
        matchPercentage = 0;
      } else {
        const possessedCount = mappedIngredients.filter(i => i.possessed).length;
        matchPercentage = requiredIngredients.length > 0 ? Math.round((possessedCount / requiredIngredients.length) * 100) : 0;
      }
    }

    const calculatedCalories = Math.round(totalCalories / servings);

    // --- Allergy check (always client-side) ---
    const allergicIngredients = requiredIngredients.filter(reqIng => {
      const sysIng = matchSystemIngredient(reqIng, ingredients);
      return sysIng && allergies.some(a => a.ingredient_id === sysIng.ingredient_id);
    });
    const hasAllergyConflict = allergicIngredients.length > 0;

    // --- Health Score ---
    const healthDetails = getHealthScoreDetails ? getHealthScoreDetails({
      nutrition: {
        calories: calculatedCalories,
        protein: totalProtein / servings,
        carbs: totalCarbs / servings,
        fat: totalFat / servings,
        fiber: totalFiber / servings,
        sugar: totalSugar / servings,
        sodium: totalSodium / servings,
        cholesterol: totalCholesterol / servings
      },
      ingredients: allIngredients,
      title: recipeName
    }) : { score: 100, reasons: [], allergyBlock: false, matchedAllergies: [] };

    return {
      id: recipeId,
      title: recipeName,
      description,
      time: `${prepTime + cookTime} phút`,
      difficulty,
      calories: `${calculatedCalories} kcal`,
      imageUrl,
      matchPercentage,
      missingIngredients,
      allIngredients,
      ingredients: allIngredients,
      requiredIngredients,
      hasAllergyConflict,
      allergicIngredients,
      servings,
      nutrition: {
        calories: calculatedCalories,
        protein: Math.round(totalProtein / servings),
        carbs: Math.round(totalCarbs / servings),
        fat: Math.round(totalFat / servings),
        fiber: Math.round(totalFiber / servings),
        sugar: Math.round(totalSugar / servings),
        sodium: Math.round(totalSodium / servings),
        cholesterol: Math.round(totalCholesterol / servings)
      },
      healthDetails,
      cookingMethod: detectCookingMethod(rec, normalizeText(recipeName))
    };
  }), [recipes, lockedIngredients, reducedIngredients, pantryItems, getHealthScoreDetails, ingredients, allergies]);

  const baseFilteredRecipes = useMemo(() => {
    return mappedRecipes
      .filter(recipe => showAllergicRecipes || !recipe.hasAllergyConflict)
      .filter(recipe => {
        // 1. Filter by Pantry Mode
        if (pantryItems.length > 0) {
          if (pantryMode === 'cook') {
            // Cook mode: must have ALL primary ingredients in pantry
            const primaryIngs = recipe.allIngredients?.filter(i => i.isPrimary) || [];
            if (primaryIngs.length > 0) {
              // If recipe has primary ingredients, all must be possessed
              const allPrimaryPossessed = primaryIngs.every(i => i.possessed);
              if (!allPrimaryPossessed) return false;
            } else {
              // No primary ingredients defined → require at least 50% match
              if ((recipe.matchPercentage || 0) < 50) return false;
            }
          } else {
            // Explore mode: must contain at least one of the selected ingredients
            const hasPossessed = recipe.allIngredients?.some(i => i.possessed);
            if (!hasPossessed) return false;
          }
        }
        return true;
      });
  }, [mappedRecipes, showAllergicRecipes, pantryItems, pantryMode]);

  // Calculate available cooking methods based on baseFilteredRecipes
  const availableCookingMethods = useMemo(() => {
    const methods = {};
    baseFilteredRecipes.forEach(recipe => {
      if (recipe.cookingMethod) {
        methods[recipe.cookingMethod] = (methods[recipe.cookingMethod] || 0) + 1;
      }
    });
    return methods;
  }, [baseFilteredRecipes]);

  const suggestedRecipes = useMemo(() => {
    return baseFilteredRecipes
      .filter(recipe => {
        // 2. Filter by Cooking Method
        if (selectedCookingMethod && recipe.cookingMethod !== selectedCookingMethod) {
          return false;
        }
        // 3. Filter by Search Query
        if (searchQuery.trim() && !normalizeText(recipe.title).includes(normalizeText(searchQuery))) {
          return false;
        }
        
        // 4. Advanced Filters
        const rTime = parseInt(recipe.time) || 0;
        if (rTime < timeRange[0] || (timeRange[1] < 180 && rTime > timeRange[1])) return false;
        
        if (difficultyFilter.length > 0 && !difficultyFilter.includes(recipe.difficulty)) return false;
        
        const rCals = recipe.healthDetails?.calories || recipe.nutrition?.calories || 0;
        if (rCals < caloriesRange[0] || (caloriesRange[1] < 1000 && rCals > caloriesRange[1])) return false;
        
        const rScore = recipe.healthDetails?.score || 0;
        if (rScore < minHealthScore) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'difficulty') {
          const diffMap = { 'Dễ': 1, 'Trung bình': 2, 'Khó': 3 };
          const dA = diffMap[a.difficulty] || 99;
          const dB = diffMap[b.difficulty] || 99;
          if (dA !== dB) return dA - dB;
        } else if (sortBy === 'time') {
          const tA = parseInt(a.time) || 999;
          const tB = parseInt(b.time) || 999;
          if (tA !== tB) return tA - tB;
        } else if (sortBy === 'calories') {
          const cA = a.healthDetails?.calories || a.nutrition?.calories || 9999;
          const cB = b.healthDetails?.calories || b.nutrition?.calories || 9999;
          if (cA !== cB) return cA - cB;
        }
        
        const scoreA = (a.healthDetails?.score || 0) * 0.6 + (a.matchPercentage || 0) * 0.4;
        const scoreB = (b.healthDetails?.score || 0) * 0.6 + (b.matchPercentage || 0) * 0.4;
        return scoreB - scoreA;
      });
  }, [baseFilteredRecipes, selectedCookingMethod, searchQuery, sortBy, timeRange, difficultyFilter, caloriesRange, minHealthScore]);


  const handleAddToDiaryClick = (recipe) => {
    const { score, reasons, allergyBlock, matchedAllergies } = recipe.healthDetails || {};
    if (allergyBlock || (score !== undefined && score < 80)) {
      setWarningPopupData({ recipe, score, reasons, allergyBlock, matchedAllergies });
    } else {
      setDrawerRecipe(recipe);
    }
  };

  return (
    <div className="meal-suggestion-container">
      {alertMsg && (
        <div className={`suggestion-alert banner-${alertMsg.type}`}>
          {alertMsg.text}
        </div>
      )}

      <div className={`pantry-config-sidebar glass-panel ${!isSidebarOpen ? 'collapsed' : ''}`}>
        <div 
          className="sidebar-header-toggle" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
            {leftTab === 'pantry' ? <MdOutlineKitchen size={20} color="#10b981" style={{ flexShrink: 0 }} /> : <MdBlock size={20} color="#ef4444" style={{ flexShrink: 0 }} />}
            <span className="sidebar-title-label">Nguyên liệu & Dị ứng</span>
          </div>
          <button className="toggle-collapse-btn">
            {isSidebarOpen ? <FiChevronUp size={20} className="mobile-icon" /> : <FiChevronDown size={20} className="mobile-icon" />}
            {isSidebarOpen ? <FiChevronLeft size={20} className="desktop-icon" /> : <FiChevronRight size={20} className="desktop-icon" />}
          </button>
        </div>

        <div className="sidebar-collapsible-wrapper" aria-hidden={!isSidebarOpen}>
          <div className="sidebar-collapsible-content">
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

            {leftTab === 'pantry' ? (
                <div className="tab-info-text">
              <p>Chọn các nguyên liệu bạn đang **sẵn có** ở nhà để hệ thống gợi ý thực đơn thích hợp nhất.</p>
              
              <div className="pantry-mode-switcher">
                <button 
                  className={`mode-btn ${pantryMode === 'explore' ? 'active' : ''}`}
                  onClick={() => setPantryMode('explore')}
                >
                  🔍 Khám phá
                </button>
                <button 
                  className={`mode-btn ${pantryMode === 'cook' ? 'active' : ''}`}
                  onClick={() => setPantryMode('cook')}
                >
                  🍳 Nấu ăn
                </button>
              </div>
            </div>
          ) : (
            <div className="tab-info-text">
              <p>Chọn những thực phẩm bạn **bị dị ứng** (không ăn được) để lọc sạch các công thức nguy hiểm.</p>
            </div>
          )}

        <div className="ingredient-search-wrapper">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="ingredient-search-bar" style={{ flex: 1 }}>
              <FiSearch size={16} />
              <input
                type="text"
                placeholder={leftTab === 'pantry' ? 'Tìm nguyên liệu trong tủ lạnh...' : 'Tìm nguyên liệu dị ứng...'}
                value={ingredientSearchQuery}
                onChange={(e) => setIngredientSearchQuery(e.target.value)}
              />
              {ingredientSearchQuery && (
                <button
                  className="ingredient-search-clear"
                  onClick={() => setIngredientSearchQuery('')}
                >
                  &times;
                </button>
              )}
            </div>
            
            {leftTab === 'pantry' && pantryItems.length > 0 && (
              <button
                onClick={() => setPantryItems([])}
                title={`Xóa chọn ${pantryItems.length} nguyên liệu`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569',
                  padding: '10px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; }}
              >
                <FiRefreshCw size={16} />
              </button>
            )}
          </div>
          
          {ingredientSearchQuery && Object.keys(filteredGroupedIngredients).length > 0 && (
            <div className="ingredient-search-dropdown">
              {Object.values(filteredGroupedIngredients).flat().slice(0, 10).map(ing => (
                <button 
                  key={ing.ingredient_id} 
                  className="dropdown-item"
                  onClick={() => {
                    if (leftTab === 'pantry') {
                      if (!allergies.some(a => a.ingredient_id === ing.ingredient_id)) {
                        handleTogglePantry(ing.ingredient_id);
                        setIngredientSearchQuery('');
                      }
                    } else {
                      handleToggleAllergy(ing.ingredient_id);
                      setIngredientSearchQuery('');
                    }
                  }}
                  disabled={leftTab === 'pantry' && allergies.some(a => a.ingredient_id === ing.ingredient_id)}
                >
                  {ing.name}
                  {leftTab === 'pantry' && allergies.some(a => a.ingredient_id === ing.ingredient_id) && 
                    <span className="disabled-pill-text">(Dị ứng)</span>
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {pantryItems.length > 0 && (
          <div className="cooking-method-section">
            <h4 className="category-header">Chế biến theo</h4>
            <div className="cooking-method-chips">
              <button 
                className={`cooking-chip ${selectedCookingMethod === null ? 'active' : ''}`}
                onClick={() => setSelectedCookingMethod(null)}
              >
                Tất cả
              </button>
              {COOKING_METHODS.map(method => {
                const count = availableCookingMethods[method.key] || 0;
                if (count === 0) return null;
                return (
                  <button 
                    key={method.key}
                    className={`cooking-chip ${selectedCookingMethod === method.key ? 'active' : ''}`}
                    onClick={() => setSelectedCookingMethod(method.key === selectedCookingMethod ? null : method.key)}
                  >
                    {method.label}
                    <span className="recipe-count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="category-scroll-container">
          {leftTab === 'pantry' && (Object.keys(filteredGroupedIngredients).length > 0
            ? Object.keys(filteredGroupedIngredients).map(categoryName => (
            <div key={categoryName} className="category-group">
              <h4 className="category-header">{categoryName}</h4>
              <div className="ingredients-pills-list">
                {filteredGroupedIngredients[categoryName].map(ing => {
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
          ))
            : <div className="ingredient-search-empty">Không tìm thấy nguyên liệu nào</div>
          )}

          {leftTab === 'allergy' && (Object.keys(filteredGroupedIngredients).length > 0
            ? Object.keys(filteredGroupedIngredients).map(categoryName => (
            <div key={categoryName} className="category-group">
              <h4 className="category-header">{categoryName}</h4>
              <div className="ingredients-pills-list">
                {filteredGroupedIngredients[categoryName].map(ing => {
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
          ))
            : <div className="ingredient-search-empty">Không tìm thấy nguyên liệu nào</div>
          )}
            </div>
          </div>
        </div>
      </div>

      <div className="suggestions-main-content">
        <div className="suggestions-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2>Gợi ý Thực đơn Thông minh</h2>
            <span className="results-count-text">
              {searchQuery.trim()
                ? `Tìm thấy ${suggestedRecipes.length} công thức cho "${searchQuery}"`
                : `Tìm thấy ${suggestedRecipes.length} công thức món ăn`}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 16px',
                    borderRadius: '24px',
                    border: '1px solid #10b981',
                    background: '#ecfdf5',
                    color: '#047857',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  className="desktop-only-btn"
                >
                  <MdOutlineKitchen size={16} />
                  Hiện nguyên liệu
                </button>
              )}
              <button 
                onClick={() => setIsFilterOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '24px',
                  border: '1px solid #e2e8f0',
                  background: (timeRange[0]!==0 || timeRange[1]!==180 || difficultyFilter.length>0 || caloriesRange[0]!==0 || caloriesRange[1]!==1000 || minHealthScore>0) ? '#ecfdf5' : 'white',
                  color: (timeRange[0]!==0 || timeRange[1]!==180 || difficultyFilter.length>0 || caloriesRange[0]!==0 || caloriesRange[1]!==1000 || minHealthScore>0) ? '#047857' : '#475569',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <FiFilter size={16} />
                Bộ lọc
                {timeRange[0]!==0 || timeRange[1]!==180 ? ` (${timeRange[0]}-${timeRange[1]>=180 ? '180+' : timeRange[1]}p)` : ''}
              </button>
              
              <div className="suggestions-search-bar" style={{ margin: 0 }}>
                <FiSearch size={16} />
                <input
                  type="text"
                  placeholder="Tìm theo tên món ăn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="allergy-toggle-checkbox" style={{ margin: 0 }}>
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
        </div>

        {isFilterOpen && (
          <AdvancedRecipeFilter 
            sortBy={sortBy} setSortBy={setSortBy}
            timeRange={timeRange} setTimeRange={setTimeRange}
            difficultyFilter={difficultyFilter} setDifficultyFilter={setDifficultyFilter}
            caloriesRange={caloriesRange} setCaloriesRange={setCaloriesRange}
            minHealthScore={minHealthScore} setMinHealthScore={setMinHealthScore}
            onClose={() => setIsFilterOpen(false)}
            totalResults={suggestedRecipes.length}
          />
        )}

        {suggestedRecipes.length === 0 ? (
          <div className="empty-suggestions-card">
            {searchQuery.trim() ? (
              <>
                <MdWarning className="empty-warn-icon" />
                <p className="no-recipe-found-message">Hiện SmartMeal chưa có món ăn "{searchQuery}".</p>
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                >
                  Xoá tìm kiếm
                </button>
              </>
            ) : (
              <>
                <MdWarning className="empty-warn-icon" />
                <p>Không có công thức món ăn nào phù hợp với cài đặt của bạn. {pantryMode === 'cook' ? 'Thử chọn thêm nguyên liệu hoặc chuyển sang chế độ Khám phá nhé!' : 'Thử thêm nguyên liệu vào tủ lạnh hoặc tắt lọc dị ứng nhé!'}</p>
              </>
            )}
          </div>
        ) : (
          <div className="recipes-grid-suggestions">
            {suggestedRecipes.map(recipe => {
              const healthInfo = getRecipeHealthInfo(recipe);
              const score = recipe.healthDetails?.score ?? 100;
              const lowScore = score < 60;

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
                    opacity: recipe.hasAllergyConflict || lowScore ? 0.7 : 1,
                    transition: 'opacity 0.2s',
                    position: 'relative',
                  }}>
                    {/* Badge nổi bật trên ảnh card */}
                    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
                      <RecipeHealthScore recipe={recipe} variant="card" />
                    </div>

                    {/* Nút dấu cộng nằm ngay bên dưới Health Score */}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleAddToDiaryClick(recipe); }}
                      title="Thêm vào nhật ký"
                      style={{
                        position: 'absolute', top: 152, right: 12, zIndex: 10,
                        width: 36, height: 36, borderRadius: '50%',
                        background: '#22C55E', color: 'white', border: 'none',
                        fontSize: 24, fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                        lineHeight: 1, paddingBottom: 4
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      +
                    </button>

                    <RecipeCard recipe={recipe} />

                    <div style={{ padding: '8px 16px 12px', borderTop: '1px solid #f1f5f9' }}>
                      {healthInfo?.reduced?.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '2px 8px', borderRadius: 10,
                            background: '#fff7ed', color: '#ea580c',
                            fontSize: 11, fontWeight: 500,
                          }}>
                            Đã điều chỉnh cho bạn
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

      {/* Floating Action Button for Sidebar */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fab-reopen-sidebar"
          title="Mở bảng nguyên liệu"
        >
          <MdOutlineKitchen size={24} />
        </button>
      )}

      {warningPopupData && (
        <HealthWarningPopup
          {...warningPopupData}
          onCancel={() => setWarningPopupData(null)}
          onConfirm={() => {
            const rec = warningPopupData.recipe;
            setWarningPopupData(null);
            setDrawerRecipe(rec);
          }}
        />
      )}

      <DiaryEntryDrawer
        recipe={drawerRecipe}
        isOpen={!!drawerRecipe}
        todayTotals={todayTotals}
        dailyGoal={dailyTargets}
        onClose={() => setDrawerRecipe(null)}
      />
    </div>
  );
}
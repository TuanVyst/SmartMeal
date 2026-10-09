import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFavorite } from '../../context/FavoriteContext';
import { HealthProfileContext } from '../../context/HealthProfileContext';
import { nutritionLogService } from '../../services/nutritionLogService';
import { recipeService } from '../../services/recipeService';
import heroSaladImg    from '../../assets/hero_salad_bowl.png';
import { resolveRecipeImageUrl } from '../../utils/recipeImages';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import { getIngredients } from '../../services/foodService';
import { FiZap, FiActivity, FiBarChart2, FiDroplet, FiHeart, FiLock } from 'react-icons/fi';
import HealthTipCard from '../../components/common/HealthTipCard';
import CalorieGoalReminder from '../../components/common/CalorieGoalReminder';
import { useNutrientFocus, LIMIT_NUTRIENTS } from '../../utils/nutrientFocus';
import './Dashboard.css';

const SPEED = 0.05;

function mapRecipeToSuggestion(recipe, index) {
  const id = recipe.recipe_id || recipe.Recipe_id || recipe.id || `recipe-${index}`;
  const name = recipe.recipe_name || recipe.Recipe_name || recipe.title || 'Món ăn';
  const imageUrl = resolveRecipeImageUrl(name);
  const servings = recipe.servings || recipe.Servings || 1;
  const recipeIngredients = recipe.recipeIngredients || recipe.RecipeIngredients || [];

  let totalCalories = 0;
  recipeIngredients.forEach(ri => {
    const nv = ri.nutritionalValue || ri.NutritionalValue;
    if (!nv) return;
    const quantity = ri.quantity || ri.Quantity || 0;
    const servingSize = nv.servingSize || nv.ServingSize || 1;
    const multiplier = quantity / servingSize;
    totalCalories += (nv.calories || nv.Calories || 0) * multiplier;
  });

  const displayCalories = totalCalories > 0
    ? Math.round(totalCalories / servings)
    : Math.round(recipe.calories || recipe.nutrition?.calories || 0);

  return {
    id,
    title: name,
    name,
    calories: displayCalories,
    imageUrl,
    img: imageUrl,
    tag: index % 2 === 0 ? 'Lành mạnh' : 'Giàu protein',
  };
}

function AnimatedBar({ pct, className }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="nutrition-progress-bar-wrap">
      <div className={`nutrition-progress-bar ${className}`} style={{ width: `${width}%` }} />
    </div>
  );
}

/* ── Circular progress for nutrients ── */
function NutrientCircle({ label, value, unit, pct, color, active, limit, onClick }) {
  const [animatedPct, setAnimatedPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimatedPct(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const displayPct = Math.min(Math.max(animatedPct, 0), 100);
  const strokeDash = `${(displayPct / 100) * circumference} ${circumference}`;

  return (
    <button
      type="button"
      className={`nutrient-circle-container nutrient-focusable${active ? ' is-focused' : ''}`}
      onClick={onClick}
      aria-pressed={!!active}
      title={active ? 'Bỏ chọn' : `Tập trung vào ${label.toLowerCase()}`}
    >
      <div className="nutrient-circle-svg-wrapper">
        <svg className="nutrient-circle-svg" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle
            cx="36" cy="36" r={radius} fill="none" stroke={color}
            strokeWidth="6" strokeLinecap="round" strokeDasharray={strokeDash}
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="nutrient-circle-val-text">
          <span className="val">{value}</span>
          <span className="unit">{unit}</span>
        </div>
      </div>
      <div className="nutrient-circle-label">{label}</div>
    </button>
  );
}

function deriveLogNutrients(log, recipes = [], ingredients = []) {
  const result = { fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 };
  if (!log) return result;

  try {
    const recipeId = log.recipe_id || log.recipe?.recipe_id || log.Recipe_id;
    const ingId = log.ingredient_id || log.ingredient?.ingredient_id || log.Ingredient_id;

    if (recipeId) {
      const recipe = (recipes || []).find(r => r && (r.recipe_id === recipeId || r.Recipe_id === recipeId)) || log.recipe;
      if (recipe) {
        const riList = recipe.recipeIngredients || recipe.RecipeIngredients || [];
        (riList || []).forEach(ri => {
          if (!ri) return;
          const nv = ri.ingredient?.nutritional_value || ri.Ingredient?.Nutritional_value
                  || ri.nutritionalValue || ri.NutritionalValue;
          if (nv) {
            const qty = ri.quantity || ri.Quantity || 0;
            const sv = nv.servingSize || nv.ServingSize || 1;
            const mult = sv > 0 ? qty / sv : 1;
            result.fiber += (nv.fiber || nv.Fiber || 0) * mult;
            result.sugar += (nv.sugar || nv.Sugar || 0) * mult;
            result.sodium += (nv.salt || nv.Salt || nv.sodium || nv.Sodium || 0) * mult;
            result.cholesterol += (nv.cholesterol || nv.Cholesterol || 0) * mult;
          }
        });
        const servings = recipe.servings || recipe.Servings || 1;
        const factor = servings > 0 ? (log.quantity || 1) / servings : 1;
        result.fiber *= factor;
        result.sugar *= factor;
        result.sodium *= factor;
        result.cholesterol *= factor;
      }
    } else if (ingId) {
      const ing = (ingredients || []).find(i => i && (i.ingredient_id === ingId || i.Ingredient_id === ingId)) || log.ingredient;
      if (ing) {
        const nv = ing.nutritional_value || ing.Nutritional_value || ing.nutritionalValue || ing.NutritionalValue;
        if (nv) {
          const size = nv.servingSize || nv.ServingSize || 100;
          const factor = size > 0 ? (log.quantity || 100) / size : 1;
          result.fiber = (nv.fiber || nv.Fiber || 0) * factor;
          result.sugar = (nv.sugar || nv.Sugar || 0) * factor;
          result.sodium = (nv.salt || nv.Salt || nv.sodium || nv.Sodium || 0) * factor;
          result.cholesterol = (nv.cholesterol || nv.Cholesterol || 0) * factor;
        }
      }
    }
  } catch (err) {
    console.error('Error deriving log nutrients:', err);
  }
  return result;
}

export default function Dashboard() {
  const { user, isPremium }         = useAuth();
  const { isFavorite, toggleFavorite } = useFavorite();
  const healthCtx        = useContext(HealthProfileContext);
  const navigate         = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [nutrientFocus, setNutrientFocus] = useNutrientFocus();

  const accountId = user?.accountId || user?.account_id;

  useEffect(() => {
    if (!accountId) return;

    const fetchTodayLogs = async () => {
      try {
        const res = await nutritionLogService.getAll(accountId);
        setNutritionLogs(res.data.data || []);
      } catch (err) {
        console.error("Lỗi khi tải nhật ký dinh dưỡng:", err);
      }
    };

    fetchTodayLogs();

    let debounceTimer;
    const debouncedFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchTodayLogs();
      }, 1500);
    };

    const handleUpdate = () => {
      debouncedFetch();
    };

    const handleFocus = () => fetchTodayLogs();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchTodayLogs();
      }
    };

    window.addEventListener('smartmeal:nutrition-updated', handleUpdate);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('smartmeal:nutrition-updated', handleUpdate);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [accountId]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [recRes, ingRes] = await Promise.all([
          recipeService.getAll(),
          getIngredients()
        ]);
        if (isMounted) {
          const allRecipes = recRes.data.data || [];
          setRecipes(allRecipes);
          setMealSuggestions(allRecipes.slice(0, 8).map(mapRecipeToSuggestion));
          setIngredients(ingRes.data.data || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
      }
    };

    fetchData();

    setIsMounted(true);

    return () => { isMounted = false; };
  }, []);

  const scrollRef = useRef(null);
  const rafRef = useRef(null);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const dirRef = useRef(1);
  const lastTimeRef = useRef(0);

  const startScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || carouselPaused) return;

    const animate = (time) => {
      if (carouselPaused || !el) return;
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      const step = SPEED * delta;

      el.scrollLeft += step * dirRef.current;

      const maxScroll = el.scrollWidth - el.clientWidth;
      if (dirRef.current > 0 && el.scrollLeft >= maxScroll - 1) {
        dirRef.current = -1;
      } else if (dirRef.current < 0 && el.scrollLeft <= 1) {
        dirRef.current = 1;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [carouselPaused]);

  useEffect(() => {
    lastTimeRef.current = 0;
    startScroll();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [startScroll]);

  const handleCarouselPause = useCallback(() => {
    setCarouselPaused(true);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const handleCarouselResume = useCallback(() => {
    setCarouselPaused(false);
  }, []);

  if (user?.role === 'Admin') return <Navigate to="/admin" replace />;

  const displayName = user?.username || 'Bạn';
  const todayStr = getTodayDateKey();
  const logsToday = nutritionLogs.filter(log => {
    const logDateStr = toDateKey(log.logDate);
    return logDateStr === todayStr;
  });

  const totalsToday = logsToday.reduce((acc, curr) => {
    acc.calories += curr.totalCalories || 0;
    acc.protein += curr.totalProtein || 0;
    acc.carbs += curr.totalCarbs || 0;
    acc.fat += curr.totalFat || 0;

    const hasFiber = curr.totalFiber != null;
    const hasSugar = curr.totalSugar != null;
    const hasSalt = curr.totalSalt != null || curr.totalSodium != null;
    const hasCholesterol = curr.totalCholesterol != null;

    if (hasFiber && hasSugar && hasSalt && hasCholesterol) {
      acc.fiber += curr.totalFiber || 0;
      acc.sugar += curr.totalSugar || 0;
      acc.sodium += curr.totalSalt || curr.totalSodium || 0;
      acc.cholesterol += curr.totalCholesterol || 0;
    } else {
      const d = deriveLogNutrients(curr, recipes, ingredients);
      acc.fiber += hasFiber ? (curr.totalFiber || 0) : d.fiber;
      acc.sugar += hasSugar ? (curr.totalSugar || 0) : d.sugar;
      acc.sodium += hasSalt ? (curr.totalSalt || curr.totalSodium || 0) : d.sodium;
      acc.cholesterol += hasCholesterol ? (curr.totalCholesterol || 0) : d.cholesterol;
    }
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 });

  const dailyTargets = healthCtx?.dailyTargets || {
    calories: 2000, protein: 75, carbs: 250, fat: 65, fiber: 25, sugarLimit: 50, saltLimit: 5
  };

  const caloriesTarget = dailyTargets.calories || 2000;
  const proteinTarget = dailyTargets.protein || 75;
  const carbsTarget = dailyTargets.carbs || 250;
  const fatTarget = dailyTargets.fat || 65;
  const fiberTarget = dailyTargets.fiber || 25;
  const sugarTarget = dailyTargets.sugarLimit || 50;
  const saltTarget = dailyTargets.saltLimit || 5;

  const cholesterolTarget = 300;
  const nutritionData = [
    { key: 'calories',  icon: <FiZap size={20} />, label: 'Calorie nạp vào', value: Math.round(totalsToday.calories),  unit: 'kcal', target: caloriesTarget, pct: Math.min(Math.round((totalsToday.calories / caloriesTarget) * 100), 100) },
    { key: 'protein',   icon: <FiActivity size={20} />, label: 'Protein',          value: Math.round(totalsToday.protein),   unit: 'g',    target: proteinTarget,  pct: Math.min(Math.round((totalsToday.protein / proteinTarget) * 100), 100) },
    { key: 'carbs',     icon: <FiBarChart2 size={20} />, label: 'Carbs',            value: Math.round(totalsToday.carbs),     unit: 'g',    target: carbsTarget,    pct: Math.min(Math.round((totalsToday.carbs / carbsTarget) * 100), 100) },
    { key: 'fat',       icon: <FiDroplet size={20} />, label: 'Chất béo',         value: Math.round(totalsToday.fat),       unit: 'g',    target: fatTarget,      pct: Math.min(Math.round((totalsToday.fat / fatTarget) * 100), 100) },
    { key: 'fiber',     icon: <FiZap size={20} />, label: 'Chất xơ',           value: Math.round(totalsToday.fiber),     unit: 'g',    target: fiberTarget,    pct: Math.min(Math.round((totalsToday.fiber / fiberTarget) * 100), 100) },
    { key: 'sugar',     icon: <FiActivity size={20} />, label: 'Đường',           value: Math.round(totalsToday.sugar),     unit: 'g',    target: sugarTarget,    pct: Math.min(Math.round((totalsToday.sugar / sugarTarget) * 100), 100) },
    { key: 'sodium',    icon: <FiDroplet size={20} />, label: 'Muối',             value: Math.round(totalsToday.sodium * 10) / 10, unit: 'g', target: saltTarget, pct: Math.min(Math.round((totalsToday.sodium / saltTarget) * 100), 100) },
    { key: 'cholesterol', icon: <FiHeart size={20} />, label: 'Cholesterol',      value: Math.round(totalsToday.cholesterol), unit: 'mg', target: cholesterolTarget, pct: Math.min(Math.round((totalsToday.cholesterol / cholesterolTarget) * 100), 100) },
  ];

  const circleNutrients = [
    { key: 'protein', label: 'Đạm', color: '#3b82f6' },
    { key: 'sugar', label: 'Đường', color: '#eab308' },
    { key: 'sodium', label: 'Muối', color: '#94a3b8' },
    { key: 'fat', label: 'Chất béo', color: '#f97316' },
    { key: 'carbs', label: 'Chất bột đường (carb)', color: '#8b5cf6' },
    { key: 'fiber', label: 'Chất xơ', color: '#22c55e' },
    { key: 'cholesterol', label: 'Cholesterol', color: '#ec4899' },
  ];

  return (
    <div className="dashboard-page">

      {/* ══════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════ */}
      <section className="dashboard-hero">
        {/* Floating particles */}
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />

        <div className="hero-left">
          <div className="hero-tag">Chào mừng trở lại</div>

          <h1 className="hero-title">
            Xin chào, {displayName}!
          </h1>
          <p className="hero-subtitle">
            Hôm nay là một ngày tuyệt vời để<br />
            chăm sóc bản thân và ăn uống lành mạnh.
          </p>

          <button
            className="hero-cta-btn"
            onClick={() => navigate('/journal')}
          >
            Vào nhật ký
          </button>
        </div>

        <div className="hero-right">
          <img
            src={heroSaladImg}
            alt="Healthy salad bowl"
            className="hero-food-img hero-food-img--large"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NUTRITION CIRCLES (PORTAL)
         ══════════════════════════════════════════ */}
      {isMounted && document.getElementById('nutrition-circles-portal-target') ? createPortal(
        <div className="dashboard-nutrition-circles">
          {circleNutrients.map(cn => {
            const data = nutritionData.find(d => d.key === cn.key);
            if (!data) return null;
            return (
              <NutrientCircle
                key={cn.key}
                label={cn.label}
                value={data.value}
                unit={data.unit}
                pct={data.pct}
                color={cn.color}
                active={nutrientFocus.includes(cn.key)}
                limit={LIMIT_NUTRIENTS.includes(cn.key)}
                onClick={() => {
                  import('../../utils/nutrientFocus').then(({ toggleNutrientFocus }) => {
                    toggleNutrientFocus(cn.key);
                  });
                }}
              />
            );
          })}
        </div>,
        document.getElementById('nutrition-circles-portal-target')
      ) : null}

      {/* ══════════════════════════════════════════
          HEALTH TIP
         ══════════════════════════════════════════ */}
      <section className="health-tip-section">
        <HealthTipCard
          totalsToday={totalsToday}
          dailyTargets={dailyTargets}
          healthProfile={healthCtx?.healthProfile}
        />
        <CalorieGoalReminder />
      </section>
    </div>
  );
}

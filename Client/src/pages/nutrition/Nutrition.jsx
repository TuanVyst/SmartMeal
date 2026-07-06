import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { useDialog } from '../../context/DialogContext';
import { getIngredients } from '../../services/foodService';
import { recipeService } from '../../services/recipeService';
import { nutritionLogService } from '../../services/nutritionLogService';
import { nutritionGoalService } from '../../services/nutritionGoalService';
import HealthProfileEditor from '../../components/HealthProfileEditor';
import { formatDateVi, getTodayDateKey, toDateKey } from '../../utils/dateTime';
import { notifyNutritionUpdated } from '../../utils/nutritionEvents';
import './Nutrition.css';
import { 
  MdFastfood, MdBarChart, MdAddCircleOutline, 
  MdDeleteOutline, MdWarning, MdDoneAll, MdSettings 
} from 'react-icons/md';
import { FiTrendingDown, FiActivity, FiMinimize2, FiHeart, FiDroplet, FiAlertCircle, FiZap } from 'react-icons/fi';

// Meal type mapping: normalizes English keys and Vietnamese labels to a canonical key
const MEAL_TYPE_CANONICAL = {
  breakfast: 'breakfast', Sáng: 'breakfast',
  lunch: 'lunch', Trưa: 'lunch',
  dinner: 'dinner', Tối: 'dinner',
  snack: 'snack', 'Bữa phụ': 'snack',
};

const MEAL_TYPE_DISPLAY = {
  breakfast: 'Sáng',
  lunch: 'Trưa',
  dinner: 'Tối',
  snack: 'Phụ',
};

const MEAL_TYPE_COLOR = {
  breakfast: { bg: '#dcfce7', text: '#15803d' },   // light green
  lunch:     { bg: '#ffedd5', text: '#c2410c' },    // orange
  dinner:    { bg: '#f3e8ff', text: '#7c3aed' },    // purple
  snack:     { bg: '#fef9c3', text: '#a16207' },    // yellow
};

const conditionLabels = {
  diabetes: 'Tiểu đường type 2',
  hypertension: 'Huyết áp cao',
  cholesterol: 'Cholesterol cao',
  heartDisease: 'Bệnh tim mạch',
  gerd: 'Dạ dày / Trào ngược',
  gout: 'Gout',
};

const goalLabels = {
  lose: { icon: <FiTrendingDown size={16} />, label: 'Giảm cân' },
  gain: { icon: <FiActivity size={16} />, label: 'Tăng cơ' },
  maintain: { icon: <FiMinimize2 size={16} />, label: 'Duy trì' },
  heart: { icon: <FiHeart size={16} />, label: 'Cải thiện tim mạch' },
  diabetes: { icon: <FiDroplet size={16} />, label: 'Kiểm soát đường huyết' },
};

const bmiColorMap = {
  underweight: { bg: '#dbeafe', text: '#2563eb', label: 'Thiếu cân' },
  normal: { bg: '#dcfce7', text: '#16a34a', label: 'Bình thường' },
  overweight: { bg: '#ffedd5', text: '#ea580c', label: 'Thừa cân' },
  obese: { bg: '#fef2f2', text: '#dc2626', label: 'Béo phì' },
};

function canonicalMealType(mt) {
  return MEAL_TYPE_CANONICAL[mt] || mt;
}

function mealBadgeStyle(mt) {
  const key = canonicalMealType(mt);
  const c = MEAL_TYPE_COLOR[key];
  return c ? { background: c.bg, color: c.text } : {};
}

function mealBadgeLabel(mt) {
  const key = canonicalMealType(mt);
  return MEAL_TYPE_DISPLAY[key] || mt;
}

function mealBarColor(mt) {
  const key = canonicalMealType(mt);
  const c = MEAL_TYPE_COLOR[key];
  if (!c) return 'linear-gradient(90deg, #16a34a, #4ade80)';
  return `linear-gradient(90deg, ${c.text}, ${c.bg})`;
}

export default function Nutrition() {
  const dialog = useDialog();
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;
  const { healthProfile, lockedIngredients, dailyCalorieBudget, dailyTargets } = useHealthProfile();

  const conditions = healthProfile?.conditions || [];
  const hasDiabetes = conditions.includes('diabetes');
  const hasHypertension = conditions.includes('hypertension');
  const hasHeartDisease = conditions.includes('heartDisease');

  const [activeTab, setActiveTab] = useState('history'); // history | stats
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());

  // Data from backend
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);

  // Form states
  const [logType, setLogType] = useState('ingredient'); // ingredient | recipe | custom
  const [selectedItem, setSelectedItem] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('g');

  // Manual override macro values
  const [manualMacros, setManualMacros] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    customName: ''
  });

  // Goal editor state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    targetCalories: 2000,
    targetProtein: 75,
    targetCarbs: 250,
    targetFat: 65,
    targetFiber: 25,
    targetSodium: 2300, // mg
    targetCholesterol: 300 // mg
  });

  const [loading, setLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Log detail
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [showLogDetail, setShowLogDetail] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (accountId) {
      fetchUserLogsAndGoals();
    }
  }, [accountId]);

  const fetchBaseData = async () => {
    try {
      const ingRes = await getIngredients();
      setIngredients(ingRes.data.data || []);

      const recRes = await recipeService.getAll();
      setRecipes(recRes.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải nguyên liệu/công thức:', err);
    }
  };

  const fetchUserLogsAndGoals = async () => {
    try {
      setLoading(true);
      const logsRes = await nutritionLogService.getAll(accountId);
      const logs = logsRes.data.data || [];
      setNutritionLogs(logs);

      const goalsRes = await nutritionGoalService.getAll(accountId);
      const userGoals = goalsRes.data.data || [];
      if (userGoals.length > 0) {
        const latestGoal = userGoals[0];
        setCurrentGoal(latestGoal);
        setGoalForm({
          targetCalories: latestGoal.targetCalories || 2000,
          targetProtein: latestGoal.targetProtein || 75,
          targetCarbs: latestGoal.targetCarbs || 250,
          targetFat: latestGoal.targetFat || 65,
          targetFiber: latestGoal.targetFiber || 25,
          targetSodium: 2300,
          targetCholesterol: 300
        });
      } else {
        setCurrentGoal(null);
      }

      return logs;
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu người dùng:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Adjust default quantity when switching log type
  useEffect(() => {
    if (logType === 'recipe') {
      setQuantity(1);
    } else {
      setQuantity(100);
    }
  }, [logType]);

  // Auto-fill macros when selecting an item
  useEffect(() => {
    if (logType === 'ingredient' && selectedItem) {
      const ing = ingredients.find(i => i.ingredient_id === selectedItem);
      if (ing && ing.nutritional_value) {
        const nv = ing.nutritional_value;
        const size = nv.servingSize || 100;
        const factor = quantity / size;
        setUnit(nv.servingUnit || 'g');
        setManualMacros({
          calories: Math.round(nv.calories * factor * 10) / 10,
          protein: Math.round((nv.protein || 0) * factor * 10) / 10,
          carbs: Math.round((nv.carbs || nv.carbohydrates || 0) * factor * 10) / 10,
          fat: Math.round((nv.fat || 0) * factor * 10) / 10,
          fiber: Math.round((nv.fiber || 0) * factor * 10) / 10,
          sugar: Math.round((nv.sugar || 0) * factor * 10) / 10,
          sodium: Math.round((nv.salt || nv.sodium || 0) * factor * 10) / 10,
          cholesterol: Math.round((nv.cholesterol || 0) * factor * 10) / 10,
          customName: ing.name
        });
      }
    } else if (logType === 'recipe' && selectedItem) {
      const rec = recipes.find(r => r.recipe_id === selectedItem);
      if (rec) {
        setUnit('phần');
        
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        let totalFiber = 0;
        let totalSugar = 0;
        let totalSodium = 0;
        let totalCholesterol = 0;

        const recipeIngredients = rec.recipeIngredients || rec.RecipeIngredients || [];
        recipeIngredients.forEach(ri => {
          const nv = ri.nutritionalValue || ri.NutritionalValue;
          if (nv) {
            const quantityVal = ri.quantity || ri.Quantity || 0;
            const servingSize = nv.servingSize || nv.ServingSize || 1;
            const multiplier = quantityVal / servingSize;
            totalCalories += (nv.calories || nv.Calories || 0) * multiplier;
            totalProtein += (nv.protein || nv.Protein || 0) * multiplier;
            totalCarbs += (nv.carbs || nv.Carbs || nv.carbohydrates || nv.Carbohydrates || 0) * multiplier;
            totalFat += (nv.fat || nv.Fat || 0) * multiplier;
            totalFiber += (nv.fiber || nv.Fiber || 0) * multiplier;
            totalSugar += (nv.sugar || nv.Sugar || 0) * multiplier;
            totalSodium += (nv.salt || nv.Salt || nv.sodium || nv.Sodium || 0) * multiplier;
            totalCholesterol += (nv.cholesterol || nv.Cholesterol || 0) * multiplier;
          }
        });

        const servings = rec.servings || rec.Servings || 1;
        const factor = quantity / servings;

        setManualMacros({
          calories: Math.round(totalCalories * factor * 10) / 10,
          protein: Math.round(totalProtein * factor * 10) / 10,
          carbs: Math.round(totalCarbs * factor * 10) / 10,
          fat: Math.round(totalFat * factor * 10) / 10,
          fiber: Math.round(totalFiber * factor * 10) / 10,
          sugar: Math.round(totalSugar * factor * 10) / 10,
          sodium: Math.round(totalSodium * factor * 10) / 10,
          cholesterol: Math.round(totalCholesterol * factor * 10) / 10,
          customName: rec.recipe_name || rec.Recipe_name || ""
        });
      }
    } else if (logType === 'custom') {
      setUnit('g');
      setSelectedItem('');
    }
  }, [logType, selectedItem, quantity]);

  const handleViewLogDetail = async (logId) => {
    if (!logId) return;
    try {
      const res = await nutritionLogService.getById(logId);
      setSelectedLogDetail(res.data.data || res.data);
      setShowLogDetail(true);
    } catch (err) {
      console.error('Lỗi tải chi tiết nutrition log:', err);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!accountId) return;

    if (logType !== 'custom' && !selectedItem) {
      triggerAlert('Vui lòng chọn một món ăn hoặc nguyên liệu!', 'error');
      return;
    }

    if (logType === 'custom' && !manualMacros.customName) {
      triggerAlert('Vui lòng nhập tên món ăn tùy chỉnh!', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        account_id: accountId,
        logDate: new Date(selectedDate).toISOString(),
        mealType,
        recipe_id: logType === 'recipe' ? selectedItem : null,
        ingredient_id: logType === 'ingredient' ? selectedItem : null,
        quantity: parseFloat(quantity),
        unit,
        totalCalories: (logType === 'recipe' || logType === 'custom' || manualMacros.calories > 0) ? parseFloat(manualMacros.calories) : null,
        totalProtein: (logType === 'recipe' || logType === 'custom' || manualMacros.protein > 0) ? parseFloat(manualMacros.protein) : null,
        totalCarbs: (logType === 'recipe' || logType === 'custom' || manualMacros.carbs > 0) ? parseFloat(manualMacros.carbs) : null,
        totalFat: (logType === 'recipe' || logType === 'custom' || manualMacros.fat > 0) ? parseFloat(manualMacros.fat) : null,
        totalFiber: (logType === 'recipe' || logType === 'custom' || manualMacros.fiber > 0) ? parseFloat(manualMacros.fiber) : null,
        totalSugar: (logType === 'recipe' || logType === 'custom' || manualMacros.sugar > 0) ? parseFloat(manualMacros.sugar) : null,
        totalSalt: (logType === 'recipe' || logType === 'custom' || manualMacros.sodium > 0) ? parseFloat(manualMacros.sodium) : null,
        totalCholesterol: (logType === 'recipe' || logType === 'custom' || manualMacros.cholesterol > 0) ? parseFloat(manualMacros.cholesterol) : null
      };

      await nutritionLogService.create(payload);
      triggerAlert('Ghi nhận bữa ăn thành công!', 'success');

      // Immediate delta update for Sidebar Progress Ring + hook will auto-refetch
      const logDateKey = toDateKey(new Date(selectedDate).toISOString());
      if (logDateKey === getTodayDateKey()) {
        const addedCalories = parseFloat(manualMacros.calories) || parseFloat(payload.totalCalories) || 0;
        notifyNutritionUpdated({ deltaCalories: addedCalories });
      }
      
      // Reset form
      setSelectedItem('');
      setQuantity(logType === 'recipe' ? 1 : 100);
      setManualMacros({
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0, customName: ''
      });

      // Reload Nutrition page data (hook auto-refetches separately for sidebar sync)
      await fetchUserLogsAndGoals();
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      triggerAlert('Ghi nhận bữa ăn thất bại, vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (id) => {
    const ok = await dialog.confirm({ title: 'Xóa bản ghi?', message: 'Bạn có chắc chắn muốn xóa bản ghi nhật ký này?', confirmLabel: 'Xóa', danger: true });
    if (!ok) return;
    try {
      setLoading(true);
      const logToDelete = nutritionLogs.find(
        (log) => (log.id || log.log_id || log.nutrition_log_id) === id
      );
      const removedCalories = logToDelete?.totalCalories || 0;
      const logDateKey = toDateKey(logToDelete?.logDate);

      await nutritionLogService.delete(id);
      triggerAlert('Đã xóa bản ghi nhật ký.', 'success');

      // Immediate delta update for Sidebar Progress Ring + hook will auto-refetch
      if (logDateKey === getTodayDateKey() && removedCalories > 0) {
        notifyNutritionUpdated({ deltaCalories: -removedCalories });
      }

      await fetchUserLogsAndGoals();
    } catch (err) {
      console.error(err);
      triggerAlert('Không thể xóa bản ghi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    if (!accountId) return;

    try {
      setLoading(true);
      const payload = {
        account_id: accountId,
        targetCalories: parseFloat(goalForm.targetCalories),
        targetProtein: parseFloat(goalForm.targetProtein),
        targetCarbs: parseFloat(goalForm.targetCarbs),
        targetFat: parseFloat(goalForm.targetFat),
        targetFiber: parseFloat(goalForm.targetFiber)
      };

      if (currentGoal) {
        await nutritionGoalService.update(currentGoal.goal_id, payload);
      } else {
        await nutritionGoalService.create(payload);
      }

      triggerAlert('Cập nhật mục tiêu dinh dưỡng thành công!', 'success');
      setIsEditingGoal(false);
      await fetchUserLogsAndGoals();
    } catch (err) {
      console.error(err);
      triggerAlert('Cập nhật mục tiêu thất bại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (msg, type = 'info') => {
    setAlertMsg({ text: msg, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Helper calculations for current date
  const logsToday = nutritionLogs.filter(log => {
    const logDateStr = toDateKey(log.logDate);
    return logDateStr === selectedDate;
  });

  const totalsToday = logsToday.reduce((acc, curr) => {
    acc.calories += curr.totalCalories || 0;
    acc.protein += curr.totalProtein || 0;
    acc.carbs += curr.totalCarbs || 0;
    acc.fat += curr.totalFat || 0;
    acc.fiber += curr.totalFiber || 0;
    acc.sugar += curr.totalSugar || 0;
    acc.sodium += curr.totalSalt || curr.totalSodium || 0;
    acc.cholesterol += curr.totalCholesterol || 0;
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 });

  const activeGoal = {
    calories: currentGoal?.targetCalories || dailyTargets?.calories || 2000,
    protein: currentGoal?.targetProtein || dailyTargets?.protein || 75,
    carbs: currentGoal?.targetCarbs || dailyTargets?.carbs || 250,
    fat: currentGoal?.targetFat || dailyTargets?.fat || 65,
    fiber: currentGoal?.targetFiber || dailyTargets?.fiber || 25,
    sugar: dailyTargets?.sugarLimit || 50,
    sodium: dailyTargets?.saltLimit || 5,
    cholesterol: 300
  };

  const calProgress = Math.min(Math.round((totalsToday.calories / activeGoal.calories) * 100), 200);

  // SVG Chart data preparations (Last 7 days)
  const getLast7Days = () => {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(toDateKey(d));
    }
    return days;
  };

  const last7Days = getLast7Days();
  const dailyCaloriesData = last7Days.map(dateStr => {
    const dayLogs = nutritionLogs.filter(l => toDateKey(l.logDate) === dateStr);
    const cal = dayLogs.reduce((sum, l) => sum + (l.totalCalories || 0), 0);
    const dObj = new Date(dateStr);
    const weekdays = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return {
      date: dateStr,
      displayWeekday: weekdays[dObj.getDay()],
      displayDayMonth: `${dateStr.substring(8,10)}/${dateStr.substring(5,7)}`,
      calories: cal
    };
  });

  const maxCalInChart = Math.max(...dailyCaloriesData.map(d => d.calories), activeGoal.calories, 1000);

  // Average Calories per MealType (normalized to English keys for filtering)
  const mealTypeAverages = [
    { key: 'breakfast', label: 'Sáng' },
    { key: 'lunch', label: 'Trưa' },
    { key: 'dinner', label: 'Tối' },
    { key: 'snack', label: 'Bữa phụ' },
  ].map(({ key, label }) => {
    const typeLogs = nutritionLogs.filter(l => canonicalMealType(l.mealType) === key);
    const total = typeLogs.reduce((sum, l) => sum + (l.totalCalories || 0), 0);
    const count = new Set(typeLogs.map(l => l.logDate?.split('T')[0])).size || 1;
    return {
      key,
      type: label,
      avg: Math.round(total / count)
    };
  });

  return (
    <>
    <div className="nutrition-container">
      {alertMsg && (
        <div className={`alert-banner alert-${alertMsg.type}`}>
          {alertMsg.type === 'error' ? <MdWarning className="alert-icon" /> : <MdDoneAll className="alert-icon" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      <div className="nutrition-header-card">
        <div>
          <h1>Theo dõi Dinh dưỡng & Bữa ăn</h1>
          <p className="subtitle">Ghi nhận lượng thức ăn nạp vào và so sánh với mục tiêu sức khỏe của bạn</p>
        </div>
        <div className="date-picker-wrapper">
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="header-date-input"
          />
        </div>
      </div>

      {/* Health Profile Card */}
      {healthProfile && <HealthProfileEditor />}

      {/* Tabs Switcher */}
      <div className="tabs-nav">

        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <MdFastfood className="tab-icon" />
          Nhật ký & Mục tiêu
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <MdBarChart className="tab-icon" />
          Thống kê & Phân tích
        </button>
      </div>

      <div className="tab-content-wrapper">
        



        {/* TAB 2: HISTORY & GOALS */}
        {activeTab === 'history' && (
          <div className="tab-panel animate-fade-in">
            {/* Daily summaries comparing with goals */}
            <div className="goal-comparison-layout">
              <div className="goal-main-card glass-panel">
                <div className="goal-card-header">
                  <h3>So sánh với Mục tiêu Hôm nay</h3>
                  <button className="goal-settings-btn" onClick={() => setIsEditingGoal(!isEditingGoal)}>
                    <MdSettings /> Thiết lập Mục tiêu
                  </button>
                </div>

                {isEditingGoal ? (
                  <form onSubmit={handleSaveGoal} className="goal-editor-form">
                    <div className="goal-form-grid">
                      <div className="group">
                        <label>Mục tiêu Năng lượng (kcal)</label>
                        <input type="number" value={goalForm.targetCalories} onChange={e => setGoalForm({...goalForm, targetCalories: e.target.value})} />
                      </div>
                      <div className="group">
                        <label>Mục tiêu Đạm (g)</label>
                        <input type="number" value={goalForm.targetProtein} onChange={e => setGoalForm({...goalForm, targetProtein: e.target.value})} />
                      </div>
                      <div className="group">
                        <label>Mục tiêu Carb (g)</label>
                        <input type="number" value={goalForm.targetCarbs} onChange={e => setGoalForm({...goalForm, targetCarbs: e.target.value})} />
                      </div>
                      <div className="group">
                        <label>Mục tiêu Chất béo (g)</label>
                        <input type="number" value={goalForm.targetFat} onChange={e => setGoalForm({...goalForm, targetFat: e.target.value})} />
                      </div>
                    </div>
                    <div className="goal-form-actions">
                      <button type="submit" className="btn-save-goal">Lưu</button>
                      <button type="button" className="btn-cancel-goal" onClick={() => setIsEditingGoal(false)}>Hủy</button>
                    </div>
                  </form>
                ) : (
                  <div className="goal-status-view">
                    <div className="calories-gauge-row">
                      <div className="calories-gauge-label">
                        <span className="val-consumed">{Math.round(totalsToday.calories)}</span>
                        <span className="slash">/</span>
                        <span className="val-target">{activeGoal.calories} kcal</span>
                      </div>
                      <div className="gauge-bar-bg">
                        <div 
                          className={`gauge-bar-fill ${calProgress <= 33 ? 'safe' : calProgress <= 66 ? 'warning' : 'danger'}`}
                          style={{ width: `${Math.min(calProgress, 100)}%` }}
                        ></div>
                      </div>
                      <span className="pct-label">{calProgress}%</span>
                    </div>

                    <div className="macros-breakdown-bars">
                      {/* Protein */}
                      <div className="macro-bar-item">
                        <div className="label-row">
                          <span>Đạm</span>
                          <span>{Math.round(totalsToday.protein)}g / {activeGoal.protein}g</span>
                        </div>
                        <div className="bar-bg">
                          <div className="bar-fill protein-bg" style={{ width: `${Math.min((totalsToday.protein / activeGoal.protein) * 100, 100)}%` }}></div>
                        </div>
                        {totalsToday.protein > activeGoal.protein && <span className="warning-badge">Vượt mục tiêu</span>}
                      </div>

                      {/* Carbs */}
                      <div className="macro-bar-item">
                        <div className="label-row">
                          <span>Carb</span>
                          <span>{Math.round(totalsToday.carbs)}g / {activeGoal.carbs}g</span>
                        </div>
                        <div className="bar-bg">
                          <div className="bar-fill carbs-bg" style={{ width: `${Math.min((totalsToday.carbs / activeGoal.carbs) * 100, 100)}%` }}></div>
                        </div>
                        {totalsToday.carbs > activeGoal.carbs && <span className="warning-badge">Vượt mục tiêu</span>}
                      </div>

                      {/* Fat */}
                      <div className="macro-bar-item">
                        <div className="label-row">
                          <span>Chất béo</span>
                          <span>{Math.round(totalsToday.fat)}g / {activeGoal.fat}g</span>
                        </div>
                        <div className="bar-bg">
                          <div className="bar-fill fat-bg" style={{ width: `${Math.min((totalsToday.fat / activeGoal.fat) * 100, 100)}%` }}></div>
                        </div>
                        {totalsToday.fat > activeGoal.fat && <span className="warning-badge">Vượt mục tiêu</span>}
                      </div>
                    </div>

                    {/* Sugar & Sodium dietary restriction bars */}
                    <div className="restriction-bars-section">
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiAlertCircle size={14} /> Hạn chế ăn uống
                        {(hasDiabetes || hasHypertension || hasHeartDisease) && (
                          <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 8,
                            background: '#fef2f2', color: '#dc2626', fontWeight: 600,
                          }}>
                            Có bệnh lý nền
                          </span>
                        )}
                      </div>

                      {/* Sugar bar */}
                      <div className="macro-bar-item">
                        <div className="label-row">
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiZap size={14} /> Đường
                            {hasDiabetes && (
                              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: totalsToday.sugar > activeGoal.sugar ? '#fef2f2' : '#fffbeb', color: totalsToday.sugar > activeGoal.sugar ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                                Tiểu đường
                              </span>
                            )}
                          </span>
                          <span style={{ fontWeight: totalsToday.sugar > activeGoal.sugar ? 700 : 400, color: totalsToday.sugar > activeGoal.sugar ? '#dc2626' : undefined }}>
                            {Math.round(totalsToday.sugar)}g / {activeGoal.sugar}g
                          </span>
                        </div>
                        <div className="bar-bg">
                            <div className="bar-fill" style={{ width: `${Math.min((totalsToday.sugar / activeGoal.sugar) * 100, 100)}%`, background: totalsToday.sugar > activeGoal.sugar ? '#dc2626' : '#EAB308' }}></div>
                        </div>
                        {totalsToday.sugar > activeGoal.sugar && <span className="warning-badge">Vượt giới hạn</span>}
                      </div>

                      {/* Sodium bar */}
                      <div className="macro-bar-item">
                        <div className="label-row">
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiDroplet size={14} /> Muối
                            {(hasHypertension || hasHeartDisease) && (
                              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: totalsToday.sodium > activeGoal.sodium ? '#fef2f2' : '#fffbeb', color: totalsToday.sodium > activeGoal.sodium ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                                Huyết áp
                              </span>
                            )}
                          </span>
                          <span style={{ fontWeight: totalsToday.sodium > activeGoal.sodium ? 700 : 400, color: totalsToday.sodium > activeGoal.sodium ? '#dc2626' : undefined }}>
                            {Math.round(totalsToday.sodium * 10) / 10}g / {activeGoal.sodium}g
                          </span>
                        </div>
                        <div className="bar-bg">
                          <div className="bar-fill" style={{ width: `${Math.min((totalsToday.sodium / activeGoal.sodium) * 100, 100)}%`, background: totalsToday.sodium > activeGoal.sodium ? '#dc2626' : '#06b6d4' }}></div>
                        </div>
                        {totalsToday.sodium > activeGoal.sodium && <span className="warning-badge">Vượt giới hạn</span>}
                      </div>

                      {/* Cholesterol bar */}
                      <div className="macro-bar-item">
                        <div className="label-row">
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiHeart size={14} /> Cholesterol
                            {hasHeartDisease && (
                              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: totalsToday.cholesterol > activeGoal.cholesterol ? '#fef2f2' : '#fffbeb', color: totalsToday.cholesterol > activeGoal.cholesterol ? '#dc2626' : '#d97706', fontWeight: 600 }}>
                                Tim mạch
                              </span>
                            )}
                          </span>
                          <span style={{ fontWeight: totalsToday.cholesterol > activeGoal.cholesterol ? 700 : 400, color: totalsToday.cholesterol > activeGoal.cholesterol ? '#dc2626' : undefined }}>
                            {Math.round(totalsToday.cholesterol)}mg / {activeGoal.cholesterol}mg
                          </span>
                        </div>
                        <div className="bar-bg">
                            <div className="bar-fill" style={{ width: `${Math.min((totalsToday.cholesterol / activeGoal.cholesterol) * 100, 100)}%`, background: totalsToday.cholesterol > activeGoal.cholesterol ? '#dc2626' : '#3B82F6' }}></div>
                        </div>
                        {totalsToday.cholesterol > activeGoal.cholesterol && <span className="warning-badge">Vượt giới hạn</span>}
                      </div>
                    </div>

                    {/* Health Limits warnings (Sodium, Cholesterol) */}
                    <div className="health-warnings-section">
                      {totalsToday.sodium > activeGoal.sodium && (
                        <div className="health-alert-box alert-danger">
                          <MdWarning className="warn-icon" />
                          <div>
                            <strong>Cảnh báo huyết áp (Muối vượt ngưỡng):</strong> Bạn đã nạp {Math.round(totalsToday.sodium * 10) / 10}g Muối (Ngưỡng khuyên dùng: {activeGoal.sodium}g). Hạn chế ăn mặn!
                          </div>
                        </div>
                      )}

                      {totalsToday.cholesterol > activeGoal.cholesterol && (
                        <div className="health-alert-box alert-danger">
                          <MdWarning className="warn-icon" />
                          <div>
                            <strong>Cảnh báo tim mạch (Cholesterol cao):</strong> Lượng Cholesterol nạp vào đã đạt {Math.round(totalsToday.cholesterol)}mg (Ngưỡng khuyên dùng: {activeGoal.cholesterol}mg). Hãy giảm mỡ động vật!
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Day Summary */}
                    <div className="day-summary-summary">
                      {totalsToday.calories === 0 ? (
                        <p>Hôm nay bạn chưa ghi nhận bữa ăn nào. Hãy chuyển qua tab <strong>Ghi nhận bữa ăn</strong> nhé!</p>
                      ) : totalsToday.calories < activeGoal.calories ? (
                        <p className="summary-text deficit">
                          Hôm nay bạn còn <strong>thiếu {Math.round(activeGoal.calories - totalsToday.calories)} kcal</strong> nữa để đạt mục tiêu dinh dưỡng hàng ngày.
                        </p>
                      ) : (
                        <p className="summary-text surplus">
                          Hôm nay bạn đã <strong>nạp dư {Math.round(totalsToday.calories - activeGoal.calories)} kcal</strong> so với mục tiêu đặt ra.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Logs history list */}
              <div className="logs-list-card">
                <h3>Các bữa ăn đã nạp ngày {formatDateVi(selectedDate)}</h3>
                <div className="logs-list-container">
                  {logsToday.length === 0 ? (
                    <div className="empty-logs-placeholder">
                      <p>Không tìm thấy bữa ăn nào được ghi nhận cho ngày này.</p>
                    </div>
                  ) : (
                    logsToday.map(log => {
                      const name = log.recipe?.recipe_name || log.ingredient?.name || 'Món ăn tùy chỉnh';
                      return (
                        <div key={log.log_id} className="log-list-item">
                          <div className="item-main" style={{ cursor: 'pointer' }} onClick={() => handleViewLogDetail(log.log_id)}>
                            <span className="meal-badge" style={mealBadgeStyle(log.mealType)}>{mealBadgeLabel(log.mealType)}</span>
                            <div className="item-details">
                              <span className="item-name">{name}</span>
                              <span className="item-qty">{log.quantity} {log.unit} &middot; {log.totalCalories} kcal</span>
                            </div>
                          </div>
                          <div className="item-macros">
                            <span>Đạm: {Math.round(log.totalProtein || 0)}g</span>
                            <span>Carb: {Math.round(log.totalCarbs || 0)}g</span>
                            <span>Béo: {Math.round(log.totalFat || 0)}g</span>
                          </div>
                          <button className="btn-delete-log" onClick={() => handleDeleteLog(log.log_id)}>
                            <MdDeleteOutline />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STATS & INSIGHTS */}
        {activeTab === 'stats' && (
          <div className="tab-panel animate-fade-in">
            <div className="grid-2-cols">
              
              {/* SVG Calorie Trend Chart */}
              <div className="stats-card glass-panel">
                <h3>Xu hướng Năng lượng 7 ngày qua</h3>
                <div className="chart-wrapper">
                  <svg viewBox="0 0 700 310" className="svg-chart">
                    <defs>
                      <linearGradient id="grad-normal" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#86efac" />
                      </linearGradient>
                      <linearGradient id="grad-over" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#fca5a5" />
                      </linearGradient>
                    </defs>

                    {/* Y-axis grid lines + value labels */}
                    {[0, 1, 2, 3].map(i => {
                      const yVal = Math.round((maxCalInChart / 3) * i);
                      const yPos = 245 - (yVal / maxCalInChart) * 210;
                      return (
                        <g key={`grid-${i}`}>
                          <line
                            x1="56" y1={yPos} x2="670" y2={yPos}
                            stroke={i === 0 ? '#cbd5e1' : '#e2e8f0'}
                            strokeDasharray={i === 0 ? '0' : '5 4'}
                            strokeWidth="1"
                          />
                          <text
                            x="50" y={yPos + 4}
                            textAnchor="end"
                            fill="#94a3b8"
                            fontSize="10"
                            fontFamily="Inter, sans-serif"
                          >
                            {yVal > 0 ? `${(yVal / 1000).toFixed(1)}k` : '0'}
                          </text>
                        </g>
                      );
                    })}

                    {/* Goal Line */}
                    {(() => {
                      const goalY = 245 - (activeGoal.calories / maxCalInChart) * 210;
                      return (
                        <>
                          <line
                            x1="56" y1={goalY} x2="670" y2={goalY}
                            stroke="#f59e0b"
                            strokeWidth="2"
                            strokeDasharray="8 4"
                            opacity="0.85"
                          />
                          <rect
                            x="598" y={goalY - 13}
                            width="70" height="16"
                            rx="4"
                            fill="#fef3c7"
                            stroke="#f59e0b"
                            strokeWidth="1"
                          />
                          <text
                            x="633" y={goalY - 2}
                            textAnchor="middle"
                            fill="#b45309"
                            fontSize="9.5"
                            fontWeight="700"
                            fontFamily="Inter, sans-serif"
                          >
                            Mục tiêu
                          </text>
                        </>
                      );
                    })()}

                    {/* Bars */}
                    {dailyCaloriesData.map((d, index) => {
                      const COL_W = 42;
                      const COL_SPACING = 85;
                      const x = 72 + index * COL_SPACING;
                      const barHeight = d.calories > 0
                        ? Math.max((d.calories / maxCalInChart) * 210, 3)
                        : 0;
                      const y = 245 - barHeight;
                      const isOver = d.calories >= activeGoal.calories;
                      const isToday = index === 6;

                      return (
                        <g key={d.date} className="bar-group">
                          <title>
                            {`${d.displayWeekday} ${d.displayDayMonth} — Năng lượng: ${Math.round(d.calories)} kcal / Mục tiêu: ${activeGoal.calories} kcal`}
                          </title>

                          {/* Bar */}
                          <rect
                            x={x}
                            y={barHeight > 0 ? y : 243}
                            width={COL_W}
                            height={Math.max(barHeight, 2)}
                            rx="6"
                            fill={d.calories > 0
                              ? (isOver ? 'url(#grad-over)' : 'url(#grad-normal)')
                              : '#e2e8f0'}
                            opacity={d.calories > 0 ? 1 : 0.45}
                          />

                          {/* Today highlight ring */}
                          {isToday && barHeight > 0 && (
                            <rect
                              x={x - 2} y={y - 2}
                              width={COL_W + 4} height={barHeight + 4}
                              rx="8"
                              fill="none"
                              stroke="#22c55e"
                              strokeWidth="2"
                              opacity="0.65"
                            />
                          )}

                          {/* Value label above bar */}
                          {d.calories > 0 && (
                            <text
                              x={x + COL_W / 2}
                              y={y - 7}
                              textAnchor="middle"
                              fill={isOver ? '#dc2626' : '#15803d'}
                              fontSize="10"
                              fontWeight="700"
                              fontFamily="Inter, sans-serif"
                            >
                              {Math.round(d.calories)}
                            </text>
                          )}

                          {/* X-axis: Weekday */}
                          <text
                            x={x + COL_W / 2}
                            y="267"
                            textAnchor="middle"
                            fill={isToday ? '#15803d' : '#4b5563'}
                            fontSize="11"
                            fontWeight={isToday ? '700' : '500'}
                            fontFamily="Inter, sans-serif"
                          >
                            {d.displayWeekday}
                          </text>

                          {/* X-axis: Day/Month */}
                          <text
                            x={x + COL_W / 2}
                            y="283"
                            textAnchor="middle"
                            fill={isToday ? '#22c55e' : '#9ca3af'}
                            fontSize="9.5"
                            fontFamily="Inter, sans-serif"
                          >
                            {d.displayDayMonth}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Average Calories per Meal */}
              <div className="stats-card glass-panel">
                <h3>Phân bổ Năng lượng theo Bữa ăn</h3>
                <p className="preview-subtitle">Trung bình Năng lượng nạp vào của từng loại bữa ăn</p>
                <div className="meal-averages-list">
                  {mealTypeAverages.map(m => {
                    const pctOfGoal = Math.min(Math.round((m.avg / activeGoal.calories) * 100), 100);
                    const c = MEAL_TYPE_COLOR[m.key];
                    const isFull = m.avg >= activeGoal.calories;
                    const barBg = c ? c.bg : '#edf2f7';
                    const barFill = isFull
                      ? (c ? c.text : '#16a34a')
                      : (c ? `linear-gradient(90deg, ${c.text}, ${c.bg})` : 'linear-gradient(90deg, #16a34a, #4ade80)');
                    return (
                      <div key={m.key} className="meal-avg-item">
                        <div className="meal-info">
                          <span className="meal-type-name" style={c ? { color: c.text } : {}}>{m.type}</span>
                          <span className="meal-avg-val">{m.avg} kcal</span>
                        </div>
                        <div className="meal-avg-bar-bg">
                          <div 
                            className="meal-avg-bar-fill"
                            style={{ width: `${pctOfGoal}%`, background: barFill }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Insights & Sufficiency */}
            <div className="insights-card glass-panel margin-top-20">
              <h3>Phân tích & Nhận xét Sức khỏe</h3>
              <div className="insights-grid">
                <div className="insight-box">
                  <h4>Đánh giá tuần này</h4>
                  {(() => {
                    const daysWithData = dailyCaloriesData.filter(d => d.calories > 0);
                    const sufficientDays = daysWithData.filter(d => d.calories >= activeGoal.calories * 0.9 && d.calories <= activeGoal.calories * 1.15).length;
                    
                    if (daysWithData.length === 0) {
                      return <p>Hãy ghi nhận thêm bữa ăn để hệ thống phân tích xu hướng dinh dưỡng của bạn.</p>;
                    }
                    
                    return (
                      <p>
                        Bạn có <strong>{sufficientDays}/{daysWithData.length} ngày</strong> ăn uống đạt chuẩn Calo mục tiêu (độ lệch dưới 15%). 
                        Trung bình lượng nạp là <strong>{Math.round(daysWithData.reduce((s,d) => s + d.calories, 0) / daysWithData.length)} kcal</strong>/ngày.
                      </p>
                    );
                  })()}
                </div>

                <div className="insight-box">
                  <h4>Lưu ý Tim mạch & Huyết áp</h4>
                  {(() => {
                    const highSodiumDays = dailyCaloriesData.filter(d => {
                      const dayLogs = nutritionLogs.filter(l => l.logDate?.split('T')[0] === d.date);
                      const sodium = dayLogs.reduce((sum, l) => sum + (l.totalSalt || l.totalSodium || 0), 0);
                      return sodium > activeGoal.sodium;
                    }).length;

                    if (highSodiumDays > 0) {
                      return (
                        <p className="warn-text">
                          Cảnh báo! Có <strong>{highSodiumDays} ngày</strong> trong tuần qua lượng nạp <strong>Muối của bạn vượt mức khuyên dùng</strong>. 
                          Hãy giảm thiểu các thức ăn nhanh, nước chấm, muối gia vị để bảo vệ thành mạch huyết áp.
                        </p>
                      );
                    }
                    return <p className="good-text">Tốt! Chỉ số Muối nạp vào của bạn nằm trong phạm vi lý tưởng. Hãy tiếp tục duy trì thực đơn lành mạnh!</p>;
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>

    {/* NutritionLog Detail Modal */}
    {showLogDetail && selectedLogDetail && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        visibility: showLogDetail ? 'visible' : 'hidden',
      }}>
        <div onClick={() => setShowLogDetail(false)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
          opacity: showLogDetail ? 1 : 0, transition: 'opacity 0.3s ease',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'white', borderRadius: '20px 20px 0 0', padding: 24,
          transform: showLogDetail ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-out',
          maxHeight: '90vh', overflowY: 'auto',
        }}>
          <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '0 auto 20px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
            Chi tiết Nutrition Log
          </h3>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
            {selectedLogDetail.logDate && `Ngày: ${new Date(selectedLogDetail.logDate?.split('T')[0]).toLocaleDateString('vi-VN')}`}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Loại bữa</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{selectedLogDetail.mealType || '—'}</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Năng lượng</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#22C55E' }}>{selectedLogDetail.totalCalories || 0} kcal</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Đạm</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6' }}>{selectedLogDetail.totalProtein || 0} g</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Carb</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b' }}>{selectedLogDetail.totalCarbs || 0} g</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Chất béo</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>{selectedLogDetail.totalFat || 0} g</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Chất xơ</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#22C55E' }}>{selectedLogDetail.totalFiber || 0} g</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Đường</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#a855f7' }}>{selectedLogDetail.totalSugar || 0} g</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Muối</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#dc2626' }}>{selectedLogDetail.totalSalt || selectedLogDetail.totalSodium || 0} g</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Cholesterol</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#8b5cf6' }}>{selectedLogDetail.totalCholesterol || 0} mg</div>
            </div>
            <div className="detail-item">
              <span style={{ fontSize: 12, color: '#64748b' }}>Khẩu phần</span>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{selectedLogDetail.quantity || 0} {selectedLogDetail.unit || 'g'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => setShowLogDetail(false)} style={{
              flex: 1, padding: '12px', border: '2px solid #e2e8f0', borderRadius: 10,
              background: 'white', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import api from '../../services/api';
import HealthProfileEditor from '../../components/HealthProfileEditor';
import './Nutrition.css';
import { 
  MdFastfood, MdCalendarToday, MdBarChart, MdAddCircleOutline, 
  MdDeleteOutline, MdWarning, MdDoneAll, MdSettings 
} from 'react-icons/md';

const conditionLabels = {
  diabetes: 'Tiểu đường type 2',
  hypertension: 'Huyết áp cao',
  cholesterol: 'Cholesterol cao',
  heartDisease: 'Bệnh tim mạch',
  gerd: 'Dạ dày / Trào ngược',
  gout: 'Gout',
};

const goalLabels = {
  lose: { icon: '🔥', label: 'Giảm cân' },
  gain: { icon: '💪', label: 'Tăng cơ' },
  maintain: { icon: '⚖️', label: 'Duy trì' },
  heart: { icon: '❤️', label: 'Cải thiện tim mạch' },
  diabetes: { icon: '🩸', label: 'Kiểm soát đường huyết' },
};

const bmiColorMap = {
  underweight: { bg: '#dbeafe', text: '#2563eb', label: 'Thiếu cân' },
  normal: { bg: '#dcfce7', text: '#16a34a', label: 'Bình thường' },
  overweight: { bg: '#ffedd5', text: '#ea580c', label: 'Thừa cân' },
  obese: { bg: '#fef2f2', text: '#dc2626', label: 'Béo phì' },
};

export default function Nutrition() {
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;
  const { healthProfile, lockedIngredients, dailyCalorieBudget, dailyTargets } = useHealthProfile();

  const conditions = healthProfile?.conditions || [];
  const hasDiabetes = conditions.includes('diabetes');
  const hasHypertension = conditions.includes('hypertension');
  const hasHeartDisease = conditions.includes('heartDisease');

  const [activeTab, setActiveTab] = useState('log'); // log | history | stats
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Data from backend
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);

  // Form states
  const [logType, setLogType] = useState('ingredient'); // ingredient | recipe | custom
  const [selectedItem, setSelectedItem] = useState('');
  const [mealType, setMealType] = useState('Sáng');
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
      const ingRes = await api.get('/ingredient');
      setIngredients(ingRes.data.data || []);

      const recRes = await api.get('/recipe');
      setRecipes(recRes.data.data || []);
    } catch (err) {
      console.error('Lỗi khi tải nguyên liệu/công thức:', err);
    }
  };

  const fetchUserLogsAndGoals = async () => {
    try {
      setLoading(true);
      // Fetch logs
      const logsRes = await api.get(`/nutritionlog?accountId=${accountId}`);
      setNutritionLogs(logsRes.data.data || []);

      // Fetch goals
      const goalsRes = await api.get(`/nutritiongoal?accountId=${accountId}`);
      const userGoals = goalsRes.data.data || [];
      if (userGoals.length > 0) {
        // Find first active/latest goal
        const latestGoal = userGoals[0];
        setCurrentGoal(latestGoal);
        setGoalForm({
          targetCalories: latestGoal.targetCalories || 2000,
          targetProtein: latestGoal.targetProtein || 75,
          targetCarbs: latestGoal.targetCarbs || 250,
          targetFat: latestGoal.targetFat || 65,
          targetFiber: latestGoal.targetFiber || 25,
          targetSodium: 2300, // fallback defaults
          targetCholesterol: 300
        });
      } else {
        setCurrentGoal(null);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu người dùng:', err);
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

      await api.post('/nutritionlog', payload);
      triggerAlert('Ghi nhận bữa ăn thành công!', 'success');
      
      // Reset form
      setSelectedItem('');
      setQuantity(logType === 'recipe' ? 1 : 100);
      setManualMacros({
        calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0, customName: ''
      });

      // Reload
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
    if (!confirm('Bạn có chắc chắn muốn xóa bản ghi nhật ký này?')) return;
    try {
      setLoading(true);
      await api.delete(`/nutritionlog/${id}`);
      triggerAlert('Đã xóa bản ghi nhật ký.', 'success');
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
        await api.put(`/nutritiongoal/${currentGoal.goal_id}`, payload);
      } else {
        await api.post('/nutritiongoal', payload);
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
    const logDateStr = log.logDate?.split('T')[0];
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
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const dailyCaloriesData = last7Days.map(dateStr => {
    const dayLogs = nutritionLogs.filter(l => l.logDate?.split('T')[0] === dateStr);
    const cal = dayLogs.reduce((sum, l) => sum + (l.totalCalories || 0), 0);
    return {
      date: dateStr,
      displayDate: new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }),
      calories: cal
    };
  });

  const maxCalInChart = Math.max(...dailyCaloriesData.map(d => d.calories), activeGoal.calories, 1000);

  // Average Calories per MealType
  const mealTypeAverages = ['Sáng', 'Trưa', 'Tối', 'Bữa phụ'].map(type => {
    const typeLogs = nutritionLogs.filter(l => l.mealType === type);
    const total = typeLogs.reduce((sum, l) => sum + (l.totalCalories || 0), 0);
    const count = new Set(typeLogs.map(l => l.logDate?.split('T')[0])).size || 1;
    return {
      type,
      avg: Math.round(total / count)
    };
  });

  return (
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
          <MdCalendarToday className="calendar-icon" />
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
          className={`tab-btn ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          <MdAddCircleOutline className="tab-icon" />
          Ghi nhận bữa ăn
        </button>
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
        
        {/* TAB 1: LOG MEAL */}
        {activeTab === 'log' && (
          <div className="tab-panel animate-fade-in">
            <div className="grid-2-cols">
              <div className="form-card">
                <h2>Khởi tạo bữa ăn mới</h2>
                <form onSubmit={handleAddLog}>
                  <div className="log-type-selector">
                    <label className={`type-btn ${logType === 'ingredient' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="logType" 
                        value="ingredient" 
                        checked={logType === 'ingredient'}
                        onChange={() => setLogType('ingredient')}
                      />
                      Nguyên liệu đơn lẻ
                    </label>
                    <label className={`type-btn ${logType === 'recipe' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="logType" 
                        value="recipe" 
                        checked={logType === 'recipe'}
                        onChange={() => setLogType('recipe')}
                      />
                      Công thức món ăn
                    </label>
                    <label className={`type-btn ${logType === 'custom' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="logType" 
                        value="custom" 
                        checked={logType === 'custom'}
                        onChange={() => setLogType('custom')}
                      />
                      Tự nhập chỉ số
                    </label>
                  </div>

                  {logType === 'ingredient' && (
                    <div className="form-group">
                      <label htmlFor="ingredient-select">Chọn nguyên liệu</label>
                      <select 
                        id="ingredient-select" 
                        value={selectedItem} 
                        onChange={(e) => setSelectedItem(e.target.value)}
                        className="form-input"
                      >
                        <option value="">-- Chọn nguyên liệu --</option>
                        {ingredients.map(i => (
                          <option key={i.ingredient_id} value={i.ingredient_id}>
                            {i.name} ({i.nutritional_value?.calories} kcal / {i.nutritional_value?.servingSize || 100}g)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {logType === 'recipe' && (
                    <div className="form-group">
                      <label htmlFor="recipe-select">Chọn công thức món ăn</label>
                      <select 
                        id="recipe-select" 
                        value={selectedItem} 
                        onChange={(e) => setSelectedItem(e.target.value)}
                        className="form-input"
                      >
                        <option value="">-- Chọn công thức --</option>
                        {recipes.map(r => (
                          <option key={r.recipe_id} value={r.recipe_id}>
                            {r.recipe_name} ({r.cookTime + r.prepTime} phút)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {logType === 'custom' && (
                    <div className="form-group">
                      <label htmlFor="custom-name">Tên bữa ăn / Món ăn</label>
                      <input 
                        type="text" 
                        id="custom-name"
                        value={manualMacros.customName}
                        onChange={(e) => setManualMacros({...manualMacros, customName: e.target.value})}
                        placeholder="Ví dụ: Phở bò, Sinh tố bơ..."
                        className="form-input"
                        required
                      />
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="meal-type">Loại bữa ăn</label>
                      <select 
                        id="meal-type" 
                        value={mealType} 
                        onChange={(e) => setMealType(e.target.value)}
                        className="form-input"
                      >
                        <option value="Sáng">Bữa Sáng</option>
                        <option value="Trưa">Bữa Trưa</option>
                        <option value="Tối">Bữa Tối</option>
                        <option value="Bữa phụ">Bữa phụ</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="quantity">Số lượng ({unit})</label>
                      <input 
                        type="number" 
                        id="quantity" 
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? 'Đang ghi nhận...' : 'Lưu vào nhật ký'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Dynamic nutritional preview card */}
              <div className="preview-card glass-panel">
                <h3>Xem trước Dinh dưỡng</h3>
                <p className="preview-subtitle">Dựa trên khối lượng nạp vào ước tính</p>
                
                <div className="preview-calories-gauge">
                  <div className="gauge-value">{manualMacros.calories || 0}</div>
                  <div className="gauge-label">kCal nạp vào</div>
                </div>

                <div className="preview-grid">
                  <div className="preview-item">
                    <span className="macro-dot protein-dot"></span>
                    <span className="macro-name">Đạm:</span>
                    <span className="macro-val">{manualMacros.protein || 0} g</span>
                  </div>
                  <div className="preview-item">
                    <span className="macro-dot carbs-dot"></span>
                    <span className="macro-name">Carb:</span>
                    <span className="macro-val">{manualMacros.carbs || 0} g</span>
                  </div>
                  <div className="preview-item">
                    <span className="macro-dot fat-dot"></span>
                    <span className="macro-name">Chất béo:</span>
                    <span className="macro-val">{manualMacros.fat || 0} g</span>
                  </div>
                  <div className="preview-item">
                    <span className="macro-dot fiber-dot"></span>
                    <span className="macro-name">Chất xơ:</span>
                    <span className="macro-val">{manualMacros.fiber || 0} g</span>
                  </div>
                  <div className="preview-item">
                    <span className="macro-dot sodium-dot"></span>
                    <span className="macro-name">Muối:</span>
                    <span className="macro-val">{manualMacros.sodium || 0} g</span>
                  </div>
                  <div className="preview-item">
                    <span className="macro-dot" style={{ background: '#a855f7' }}></span>
                    <span className="macro-name">Đường:</span>
                    <span className="macro-val">{manualMacros.sugar || 0} g</span>
                  </div>
                  <div className="preview-item">
                    <span className="macro-dot cholesterol-dot"></span>
                    <span className="macro-name">Cholesterol:</span>
                    <span className="macro-val">{manualMacros.cholesterol || 0} mg</span>
                  </div>
                </div>

                {logType === 'custom' && (
                  <div className="custom-fields-editor">
                    <h4>Cấu hình chi tiết (Tùy chỉnh)</h4>
                    <div className="custom-fields-grid">
                      <div className="field">
                        <label>Năng lượng (kcal)</label>
                        <input type="number" step="any" value={manualMacros.calories} onChange={e => setManualMacros({...manualMacros, calories: parseFloat(e.target.value) || 0})}/>
                      </div>
                      <div className="field">
                        <label>Đạm (g)</label>
                        <input type="number" step="any" value={manualMacros.protein} onChange={e => setManualMacros({...manualMacros, protein: parseFloat(e.target.value) || 0})}/>
                      </div>
                      <div className="field">
                        <label>Carb (g)</label>
                        <input type="number" step="any" value={manualMacros.carbs} onChange={e => setManualMacros({...manualMacros, carbs: parseFloat(e.target.value) || 0})}/>
                      </div>
                      <div className="field">
                        <label>Chất béo (g)</label>
                        <input type="number" step="any" value={manualMacros.fat} onChange={e => setManualMacros({...manualMacros, fat: parseFloat(e.target.value) || 0})}/>
                      </div>
                      <div className="field">
                        <label>Muối (g)</label>
                        <input type="number" step="any" value={manualMacros.sodium} onChange={e => setManualMacros({...manualMacros, sodium: parseFloat(e.target.value) || 0})}/>
                      </div>
                      <div className="field">
                        <label>Cholesterol (mg)</label>
                        <input type="number" step="any" value={manualMacros.cholesterol} onChange={e => setManualMacros({...manualMacros, cholesterol: parseFloat(e.target.value) || 0})}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                          className={`gauge-bar-fill ${calProgress > 100 ? 'over' : ''}`}
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
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>⚕️</span> Hạn chế ăn uống
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
                            🍬 Đường
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
                          <div className="bar-fill" style={{ width: `${Math.min((totalsToday.sugar / activeGoal.sugar) * 100, 100)}%`, background: totalsToday.sugar > activeGoal.sugar ? '#dc2626' : '#a855f7' }}></div>
                        </div>
                        {totalsToday.sugar > activeGoal.sugar && <span className="warning-badge">Vượt giới hạn</span>}
                      </div>

                      {/* Sodium bar */}
                      <div className="macro-bar-item">
                        <div className="label-row">
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            🧂 Muối
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
                            💗 Cholesterol
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
                          <div className="bar-fill" style={{ width: `${Math.min((totalsToday.cholesterol / activeGoal.cholesterol) * 100, 100)}%`, background: totalsToday.cholesterol > activeGoal.cholesterol ? '#dc2626' : '#8b5cf6' }}></div>
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
                <h3>Các bữa ăn đã nạp ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</h3>
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
                          <div className="item-main">
                            <span className="meal-badge">{log.mealType}</span>
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
                  <svg viewBox="0 0 500 240" className="svg-chart">
                    {/* Grid Lines */}
                    <line x1="40" y1="30" x2="480" y2="30" stroke="#f0f2f5" strokeDasharray="4" />
                    <line x1="40" y1="95" x2="480" y2="95" stroke="#f0f2f5" strokeDasharray="4" />
                    <line x1="40" y1="160" x2="480" y2="160" stroke="#f0f2f5" strokeDasharray="4" />
                    <line x1="40" y1="195" x2="480" y2="195" stroke="#ccc" />

                    {/* Goal Line */}
                    {(() => {
                      const goalY = 195 - (activeGoal.calories / maxCalInChart) * 165;
                      return (
                        <>
                          <line x1="40" y1={goalY} x2="480" y2={goalY} stroke="var(--primary-color, #ff6b6b)" strokeWidth="2" strokeDasharray="6 3" />
                          <text x="440" y={goalY - 5} fill="var(--primary-color, #ff6b6b)" fontSize="10" fontWeight="bold">Mục tiêu</text>
                        </>
                      );
                    })()}

                    {/* Columns */}
                    {dailyCaloriesData.map((d, index) => {
                      const colWidth = 35;
                      const colSpacing = 60;
                      const x = 50 + index * colSpacing;
                      const barHeight = (d.calories / maxCalInChart) * 165;
                      const y = 195 - barHeight;

                      return (
                        <g key={d.date} className="bar-group">
                          {/* Value label */}
                          {d.calories > 0 && (
                            <text x={x + colWidth / 2} y={y - 8} textAnchor="middle" fill="#555" fontSize="10" fontWeight="bold">
                              {Math.round(d.calories)}
                            </text>
                          )}
                          {/* Bar */}
                          <rect 
                            x={x} 
                            y={y} 
                            width={colWidth} 
                            height={Math.max(barHeight, 2)} 
                            rx="4" 
                            fill={d.calories >= activeGoal.calories ? 'url(#grad-over)' : 'url(#grad-normal)'}
                          />
                          {/* X label */}
                          <text x={x + colWidth / 2} y="215" textAnchor="middle" fill="#666" fontSize="10">
                            {d.displayDate.split(',')[0]}
                          </text>
                          <text x={x + colWidth / 2} y="228" textAnchor="middle" fill="#999" fontSize="9">
                            {d.displayDate.split(' ')[1]}
                          </text>
                        </g>
                      );
                    })}

                    {/* Definitions of Gradients */}
                    <defs>
                      <linearGradient id="grad-normal" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4facfe" />
                        <stop offset="100%" stopColor="#00f2fe" />
                      </linearGradient>
                      <linearGradient id="grad-over" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff0844" />
                        <stop offset="100%" stopColor="#ffb199" />
                      </linearGradient>
                    </defs>
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
                    return (
                      <div key={m.type} className="meal-avg-item">
                        <div className="meal-info">
                          <span className="meal-type-name">{m.type}</span>
                          <span className="meal-avg-val">{m.avg} kcal</span>
                        </div>
                        <div className="meal-avg-bar-bg">
                          <div 
                            className="meal-avg-bar-fill"
                            style={{ width: `${pctOfGoal}%` }}
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
  );
}

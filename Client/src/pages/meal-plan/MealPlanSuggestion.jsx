import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { resolveRecipeImageUrl } from '../../utils/recipeImages';
import SuggestNextPlanPopup from '../../components/forms/SuggestNextPlanPopup';
import { FiCalendar, FiPlus, FiCheck, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiClock, FiZap, FiLock } from 'react-icons/fi';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import { toast } from 'react-hot-toast';
import UpgradePaywallModal from '../../components/common/UpgradePaywallModal';
import { useNutrientFocus, focusQueryParam, NUTRIENT_FOCUS_LABELS } from '../../utils/nutrientFocus';
import { notifyNutritionUpdated } from '../../utils/nutritionEvents';
import './MealPlanSuggestion.css';

const SLOT_LABELS = { breakfast: 'Bữa Sáng', lunch: 'Bữa Trưa', dinner: 'Bữa Tối' };
const SLOT_ICONS  = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
const SLOT_ORDER  = ['breakfast', 'lunch', 'dinner'];
const WEEKDAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

const SLOT_COLORS = {
  breakfast: { bg: '#fef9ec', border: '#fde68a', badge: '#f59e0b', text: '#92400e', soft: '#fef3c7' },
  lunch:     { bg: '#eff6ff', border: '#bfdbfe', badge: '#3b82f6', text: '#1e40af', soft: '#dbeafe' },
  dinner:    { bg: '#f5f3ff', border: '#ddd6fe', badge: '#8b5cf6', text: '#5b21b6', soft: '#ede9fe' },
};

const getWeekMondayKey = (dateVal) => {
  const d = dateVal instanceof Date ? new Date(dateVal) : new Date(String(dateVal).split('T')[0] + 'T12:00:00');
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const readCachedWeekPlan = (accountId, dateVal) => {
  if (!accountId) return null;
  try {
    const weekKey = `smartmeal_weekplan_${accountId}_${getWeekMondayKey(dateVal)}`;
    const raw = sessionStorage.getItem(weekKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCachedWeekPlan = (accountId, dateVal, plan) => {
  if (!accountId || !plan) return;
  try {
    const weekKey = `smartmeal_weekplan_${accountId}_${getWeekMondayKey(dateVal)}`;
    sessionStorage.setItem(weekKey, JSON.stringify(plan));
  } catch {
    // ignore storage errors
  }
};

export default function MealPlanSuggestion() {
  const { user, isPremium, hasProAccess } = useAuth();
  const navigate = useNavigate();
  const accountId = user?.accountId || user?.account_id;

  const [currentWeekDate, setCurrentWeekDate] = useState(() => new Date());
  const [weekPlan, setWeekPlan] = useState(() => readCachedWeekPlan(accountId, new Date()));
  const [loadingPlans, setLoadingPlans] = useState(() => !readCachedWeekPlan(accountId, new Date()));
  const [showPopup, setShowPopup] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [mealToDelete, setMealToDelete] = useState(null);

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [quickGenerating, setQuickGenerating] = useState(null);

  // Pro features (access resolved centrally in AuthContext)
  const [showPaywall, setShowPaywall] = useState(false);
  const [nutrientFocus, setNutrientFocus] = useNutrientFocus();

  // ── Safe date helpers (no UTC shift) ────────────────────────────────────
  const safeDate = (dateVal) => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') {
      return dateVal.split('T')[0];
    }
    const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = safeDate(new Date());

  const isTodayDate = (dateStr) => {
    if (!dateStr) return false;
    return safeDate(dateStr) === todayStr;
  };

  const isPastDateStr = (dateStr) => {
    if (!dateStr) return false;
    return safeDate(dateStr) < todayStr;
  };

  const applyPlanState = useCallback((plan, dateReference, targetDateStr = null) => {
    if (!plan) return;
    setWeekPlan(plan);
    writeCachedWeekPlan(accountId, dateReference || new Date(), plan);
    if (plan?.days?.length > 0) {
      if (targetDateStr) {
        const idx = plan.days.findIndex(d => d.dayDate && safeDate(d.dayDate) === targetDateStr);
        setSelectedDayIdx(idx >= 0 ? idx : 0);
      } else {
        const todayIdx = plan.days.findIndex(d => isTodayDate(d.dayDate));
        setSelectedDayIdx(todayIdx >= 0 ? todayIdx : 0);
      }
    }
  }, [accountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWeekPlan = useCallback(async (dateToFetch, targetDateStr = null, silent = false) => {
    if (!accountId) return;
    const cached = readCachedWeekPlan(accountId, dateToFetch || new Date());
    if (cached && !silent) {
      applyPlanState(cached, dateToFetch, targetDateStr);
      setLoadingPlans(false);
    } else if (!silent) {
      setLoadingPlans(true);
    }
    try {
      const dateStr = safeDate(dateToFetch || new Date());
      const res = await api.get(`/MealPlan/week?date=${dateStr}`);
      const plan = res.data.data;
      applyPlanState(plan, dateToFetch, targetDateStr);
    } catch (err) {
      console.error('Lỗi tải thực đơn tuần:', err);
    } finally {
      setLoadingPlans(false);
    }
  }, [accountId, applyPlanState]);

  useEffect(() => {
    fetchWeekPlan(new Date());
  }, [fetchWeekPlan]);

  const handlePopupClose = (msg) => {
    setShowPopup(false);
    if (msg) {
      setAlertMsg(msg);
      setTimeout(() => setAlertMsg(null), 3000);
      if (msg.date) {
        const pickedDate = new Date(msg.date + 'T12:00:00');
        setCurrentWeekDate(pickedDate);
        if (msg.planData) {
          applyPlanState(msg.planData, pickedDate, msg.date);
          return;
        }
        fetchWeekPlan(pickedDate, msg.date);
        return;
      }
    }
  };
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekDate(prev);
    fetchWeekPlan(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekDate);
    next.setDate(next.getDate() + 7);
    setCurrentWeekDate(next);
    fetchWeekPlan(next);
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentWeekDate(now);
    fetchWeekPlan(now);
  };

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    // e.target.value is always YYYY-MM-DD (the input's internal format)
    const dateStr = e.target.value; // safe - no conversion needed
    const picked = new Date(dateStr + 'T12:00:00'); // add noon to avoid timezone shift
    setCurrentWeekDate(picked);
    fetchWeekPlan(picked, dateStr);
  };

  const handleLogMeal = async (entry, date) => {
    const tempLogId = `optimistic-${entry.entry_id || entry.recipe_id || 'meal'}`;
    const logDateIso = typeof date === 'string' ? date : new Date().toISOString();

    // 1. Optimistic UI update on meal card (0ms)
    setWeekPlan((prevPlan) => {
      if (!prevPlan) return prevPlan;
      const updated = {
        ...prevPlan,
        days: prevPlan.days.map((day) => ({
          ...day,
          entries: day.entries.map((e) =>
            e.entry_id === entry.entry_id ? { ...e, isLogged: true } : e
          ),
        })),
      };
      writeCachedWeekPlan(accountId, currentWeekDate, updated);
      return updated;
    });

    // 2. Optimistic update on macro circles & sidebar ring (0ms)
    notifyNutritionUpdated({
      deltaCalories: entry.slotCalories || 0,
      optimisticLog: {
        log_id: tempLogId,
        recipe_id: entry.recipe_id,
        mealType: entry.mealSlot,
        quantity: 1,
        logDate: logDateIso,
        totalCalories: entry.slotCalories || 0,
        totalProtein: entry.slotProtein || 0,
        totalCarbs: entry.slotCarbs || 0,
        totalFat: entry.slotFat || 0,
        totalFiber: entry.slotFiber || null,
      },
    });
    toast.success('Đã lưu vào nhật ký ăn uống!');

    try {
      const payload = {
        recipeId: entry.recipe_id,
        recipeName: entry.recipeName,
        mealType: entry.mealSlot,
        servings: 1,
        calories: entry.slotCalories,
        carbs: entry.slotCarbs || 0,
        protein: entry.slotProtein || 0,
        fat: entry.slotFat || 0,
        date: date,
      };

      await api.post('/nutrition-diary', payload);
      notifyNutritionUpdated({ syncOnly: true });
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu vào nhật ký.');
      // Rollback on failure
      setWeekPlan((prevPlan) => {
        if (!prevPlan) return prevPlan;
        const rolledBack = {
          ...prevPlan,
          days: prevPlan.days.map((day) => ({
            ...day,
            entries: day.entries.map((e) =>
              e.entry_id === entry.entry_id ? { ...e, isLogged: false } : e
            ),
          })),
        };
        writeCachedWeekPlan(accountId, currentWeekDate, rolledBack);
        return rolledBack;
      });
      notifyNutritionUpdated({ rollbackLogId: tempLogId, syncOnly: true });
    }
  };

  const handleRemoveMeal = async () => {
    if (!mealToDelete) return;
    try {
      const planId = weekPlan?.mealPlan_id || '00000000-0000-0000-0000-000000000000';
      await api.delete(`/MealPlan/${planId}/entry/${mealToDelete.entry_id}`);
      toast.success('Đã huỷ món thành công!');
      // Keep the currently selected day after deletion
      const keepDate = selectedDay?.dayDate ? safeDate(selectedDay.dayDate) : null;
      fetchWeekPlan(currentWeekDate, keepDate);
      setMealToDelete(null);
    } catch (err) {
      console.error('Error removing meal:', err);
      toast.error(err.response?.data?.message || 'Không thể huỷ món.');
    }
  };

  const days = weekPlan?.days || [];
  const selectedDay = days[selectedDayIdx] || null;

  const getMealsForDay = (day) => {
    if (!day?.entries) return [];
    const slotMap = {};
    day.entries.forEach(e => {
      const key = (e.mealSlot || e.meal_slot || '').toLowerCase();
      const rawImg = e.recipeImage || e.recipe_image || e.RecipeImage || '';
      const resolvedImg = (rawImg && rawImg.startsWith('http')) 
        ? rawImg 
        : resolveRecipeImageUrl(e.recipeName || e.recipe_name || rawImg);
      slotMap[key] = { ...e, _resolvedImg: resolvedImg };
    });
    return SLOT_ORDER.map(slot => slotMap[slot] ? { ...slotMap[slot], slotKey: slot } : { isMissing: true, slotKey: slot });
  };

  const canUsePro = hasProAccess || isPremium;

  const handleQuickGenerate = async (slotKey, date) => {
    if (!canUsePro) {
      setShowPaywall(true);
      return;
    }
    try {
      setQuickGenerating(slotKey);
      const dateParam = safeDate(date);
      const res = await api.post(`/MealPlan/suggest-for-date?date=${dateParam}&meals=${slotKey}${focusQueryParam()}`);
      toast.success(`Đã tạo gợi ý cho ${SLOT_LABELS[slotKey]} thành công!`);
      if (res.data?.data) {
        applyPlanState(res.data.data, currentWeekDate, dateParam);
      } else {
        await fetchWeekPlan(currentWeekDate, dateParam);
      }
    } catch (err) {
      console.error('Error quick generate:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo gợi ý.');
    } finally {
      setQuickGenerating(null);
    }
  };

  const handleQuickGenerateAll = async (date) => {
    if (!canUsePro) {
      setShowPaywall(true);
      return;
    }
    const dayEntries = getMealsForDay(selectedDay);
    const missingSlots = dayEntries.filter(m => m.isMissing).map(m => m.slotKey);
    if (missingSlots.length === 0) {
      toast.success('Ngày này đã có đủ 3 bữa ăn!');
      return;
    }
    try {
      setQuickGenerating('all');
      const dateParam = safeDate(date);
      const mealsParam = missingSlots.join(',');
      const res = await api.post(`/MealPlan/suggest-for-date?date=${dateParam}&meals=${mealsParam}${focusQueryParam()}`);
      toast.success(`Đã tạo gợi ý ${missingSlots.length} bữa còn thiếu cho ngày này!`);
      if (res.data?.data) {
        applyPlanState(res.data.data, currentWeekDate, dateParam);
      } else {
        await fetchWeekPlan(currentWeekDate, dateParam);
      }
    } catch (err) {
      console.error('Error quick generate all:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo gợi ý.');
    } finally {
      setQuickGenerating(null);
    }
  };

  const meals = getMealsForDay(selectedDay);

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    // Split string directly to avoid UTC shift: "2026-08-08T00:00:00" → ["2026","08","08"]
    const datePart = safeDate(dateStr);
    const [, month, day] = datePart.split('-');
    return `${day}/${month}`;
  };

  const formatDateInput = (dateObj) => {
    if (!dateObj) return '';
    return safeDate(dateObj);
  };

  const renderRightHeaderActions = () => {
    return (
      <button 
        className="mps-btn-create"
        onClick={() => {
          if (!canUsePro) {
            setShowPaywall(true);
            return;
          }
          setShowPopup(true);
        }}
        style={{ padding: '8px 16px', fontSize: '14px', height: '40px' }}
      >
        {!canUsePro && <FiLock size={16} style={{ marginRight: '6px' }} />}
        <FiPlus size={16} /> Tạo thực đơn
      </button>
    );
  };

  return (
    <div className="mps-page">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="mps-container">
        {/* ── Alert banner ── */}
        {alertMsg && (
          <div className={`mps-alert mps-alert-${alertMsg.type}`}>
            {alertMsg.type === 'warning' ? <FiAlertTriangle /> : <FiCheck />}
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* ── Page header ── */}
        <div className="mps-header">
          <div className="mps-header-left">
            <h1 className="mps-title">Gợi ý món ăn</h1>
            <p className="mps-subtitle">Lịch ăn uống cá nhân hoá theo tuần (Thứ 2 – Chủ Nhật)</p>
          </div>

          <div className="mps-header-right">
            {renderRightHeaderActions()}
          </div>
        </div>

        {nutrientFocus && nutrientFocus.length > 0 && (
          <div className="mps-focus-chip" role="status">
            <span className="mps-focus-dot" />
            <span>
              Đang tập trung: <strong>
                {nutrientFocus.map(k => NUTRIENT_FOCUS_LABELS[k]).join(', ')}
              </strong> — các gợi ý tiếp theo sẽ ưu tiên chất này
            </span>
            <button className="mps-focus-clear" onClick={() => setNutrientFocus(null)}>Bỏ chọn</button>
          </div>
        )}
        <div className="mps-week-nav">
          {/* Arrow left */}
          <button className="mps-week-arrow-btn" onClick={handlePrevWeek} title="Tuần trước" aria-label="Tuần trước">
            <FiChevronLeft size={20} />
          </button>

          {/* Center: date range + today btn */}
          <div className="mps-week-center">
            <div className="mps-week-title">
              <FiCalendar size={15} />
              <span>{formatDateShort(weekPlan?.startDate)} – {formatDateShort(weekPlan?.endDate)}</span>
            </div>
            <button className="mps-today-btn" onClick={handleGoToday}>Hôm nay</button>
          </div>

          {/* Arrow right */}
          <button className="mps-week-arrow-btn" onClick={handleNextWeek} title="Tuần sau" aria-label="Tuần sau">
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* ── Main content ── */}
        {loadingPlans ? (
          <div className="mps-loading">
            <div className="mps-spinner" />
            <p>Đang tải lịch ăn trong tuần...</p>
          </div>
        ) : !weekPlan || days.length === 0 ? (
          <div className="mps-empty">
            <div className="mps-empty-icon">📅</div>
            <h2>Chưa có thực đơn cho tuần này</h2>
            <p>Nhấn <strong>Tạo thực đơn tuần mới</strong> hoặc chọn một ngày bên dưới để bắt đầu gợi ý món ăn.</p>
            <button className="mps-btn-create mps-btn-lg" onClick={() => {
              if (!canUsePro) {
                setShowPaywall(true);
                return;
              }
              setShowPopup(true);
            }}>
              {!canUsePro && <FiLock size={18} style={{ marginRight: '8px' }} />}
              <FiPlus size={18} /> Tạo thực đơn ngay
            </button>
          </div>
        ) : (
          <div className="mps-body" style={{ animation: 'fadeUp 0.4s ease' }}>

            {/* ── Day tab selector ── */}
            <div className="mps-day-tabs">
              {days.map((day, i) => {
                const isActive = i === selectedDayIdx;
                const isToday = isTodayDate(day.dayDate);
                const dateShort = formatDateShort(day.dayDate);
                const weekdayShort = ['T2','T3','T4','T5','T6','T7','CN'][i] || `T${i+2}`;

                return (
                  <button
                    key={day.day_id || i}
                    className={`mps-day-tab ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => setSelectedDayIdx(i)}
                  >
                    <span className="mps-day-num">{weekdayShort}</span>
                    {dateShort && <span className="mps-day-date">{dateShort}</span>}
                    {isToday && <span className="mps-day-today-badge">●</span>}
                  </button>
                );
              })}
            </div>

            {/* ── Day summary strip ── */}
            {selectedDay && (
              <div className="mps-day-summary">
                <div className="mps-day-summary-title">
                  {WEEKDAY_LABELS[selectedDayIdx]} · {new Date(selectedDay.dayDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="mps-day-summary-stats">
                    <span><FiZap size={13}/> {Math.round(selectedDay.totalCalories)} kcal</span>
                    {selectedDay.totalProtein > 0 && <span>🥩 {Math.round(selectedDay.totalProtein)}g đạm</span>}
                    {selectedDay.totalCarbs   > 0 && <span>🍚 {Math.round(selectedDay.totalCarbs)}g tinh bột</span>}
                    {selectedDay.totalFat     > 0 && <span>🫒 {Math.round(selectedDay.totalFat)}g chất béo</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ── 3-column meal cards ── */}
            <div className="mps-meals-grid">
              {meals.length === 0 && (
                <div className="mps-no-meals">Không có dữ liệu bữa ăn cho ngày này.</div>
              )}
              {meals.map((meal, i) => {
                const slotKey = meal.slotKey;
                const colors  = SLOT_COLORS[slotKey] || SLOT_COLORS.lunch;
                const isToday = isTodayDate(selectedDay?.dayDate);
                const isPastDay = isPastDateStr(selectedDay?.dayDate);
                const isQuickGenerating = quickGenerating === slotKey;

                if (meal.isMissing) {
                  return (
                    <div
                      key={slotKey}
                      className="mps-meal-card mps-missing-card"
                      style={{
                        '--card-bg':     '#f8fafc',
                        '--card-border': '#e2e8f0',
                        animation: `slideInRight 0.35s ease ${i * 0.08}s both`,
                      }}
                    >
                      <div className="mps-missing-icon">{SLOT_ICONS[slotKey]}</div>
                      <div className="mps-missing-label">{SLOT_LABELS[slotKey]}</div>
                      {!isPastDay && (
                        <button
                          className="mps-quick-gen-btn"
                          onClick={() => handleQuickGenerate(slotKey, selectedDay.dayDate)}
                          disabled={isQuickGenerating}
                        >
                          {isQuickGenerating
                            ? <div className="mps-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                            : <FiPlus size={12} />}
                          <span>Tạo gợi ý</span>
                        </button>
                      )}
                      {isPastDay && (
                        <span className="mps-past-label">Ngày đã qua</span>
                      )}
                    </div>
                  );
                }

                const imgSrc = meal._resolvedImg || resolveRecipeImageUrl(meal.recipeName || meal.recipe_name || '');

                return (
                  <div
                    key={meal.entry_id || i}
                    className="mps-meal-card"
                    style={{
                      '--card-bg':     colors.bg,
                      '--card-border': colors.border,
                      '--badge-bg':    colors.soft,
                      '--badge-color': colors.text,
                      animation: `slideInRight 0.35s ease ${i * 0.08}s both`,
                    }}
                  >
                    {/* Slot header */}
                    <div className="mps-card-slot-header">
                      <span className="mps-card-slot-icon">{SLOT_ICONS[slotKey]}</span>
                      <span className="mps-card-slot-label" style={{ color: colors.badge }}>
                        {SLOT_LABELS[slotKey]}
                      </span>
                      {meal.slotCalories > 0 && (
                        <span className="mps-card-kcal-inline">
                          <FiZap size={11} /> {Math.round(meal.slotCalories)}
                        </span>
                      )}
                    </div>

                    {/* Food image */}
                    <div
                      className="mps-card-img-wrap"
                      onClick={() => meal.recipe_id && navigate(`/recipe/${meal.recipe_id}`)}
                    >
                      <img
                        src={imgSrc}
                        alt={meal.recipeName}
                        className="mps-card-img"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      <div className="mps-card-img-overlay" />
                      {/* Dish name overlaid on image */}
                      <div className="mps-card-name-overlay">{meal.recipeName}</div>
                    </div>

                    {/* Actions */}
                    <div className="mps-card-actions">
                      {isToday && !meal.isLogged && (
                        <button
                          className="mps-card-action-btn mps-card-log-btn"
                          onClick={(e) => { e.stopPropagation(); handleLogMeal(meal, selectedDay.dayDate); }}
                        >
                          🍽️ Đã ăn
                        </button>
                      )}
                      {isToday && meal.isLogged && (
                        <span className="mps-card-logged-tag">✓ Đã ghi nhận</span>
                      )}
                      {!meal.isLogged && (
                        <button
                          className="mps-card-action-btn mps-card-del-btn"
                          onClick={(e) => { e.stopPropagation(); setMealToDelete(meal); }}
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showPopup && <SuggestNextPlanPopup onClose={handlePopupClose} />}

      {/* Delete Confirmation Modal */}
      {mealToDelete && (
        <div className="popup-overlay" onClick={() => setMealToDelete(null)}>
          <div className="popup-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '24px' }}>
            <div className="popup-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}>
                <FiAlertTriangle /> Xác nhận huỷ món
              </h2>
            </div>
            <div className="popup-body" style={{ padding: '16px 0 24px 0' }}>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                Bạn có chắc chắn muốn huỷ <strong>{SLOT_LABELS[mealToDelete.slotKey]}</strong> ({mealToDelete.recipeName}) này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="popup-actions" style={{ marginTop: 0 }}>
              <button 
                className="popup-btn-cancel" 
                onClick={() => setMealToDelete(null)}
              >
                Trở lại
              </button>
              <button 
                className="popup-btn-primary" 
                style={{ background: '#ef4444', color: 'white' }}
                onClick={handleRemoveMeal}
              >
                Xác nhận huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradePaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        featureName="Chức năng gợi ý thực đơn"
      />
    </div>
  );
}

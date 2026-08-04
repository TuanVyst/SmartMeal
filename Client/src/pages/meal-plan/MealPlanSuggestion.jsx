import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { resolveRecipeImageUrl } from '../../utils/recipeImages';
import SuggestNextPlanPopup from '../../components/forms/SuggestNextPlanPopup';
import { FiCalendar, FiPlus, FiCheck, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiClock, FiZap, FiLock } from 'react-icons/fi';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import { toast } from 'react-hot-toast';
import { subscriptionService } from '../../services/subscriptionService';
import UpgradePaywallModal from '../../components/common/UpgradePaywallModal';
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

export default function MealPlanSuggestion() {
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;

  const [weekPlan, setWeekPlan] = useState(null);
  const [currentWeekDate, setCurrentWeekDate] = useState(() => new Date());
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [mealToDelete, setMealToDelete] = useState(null);

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Pro features
  const [hasPro, setHasPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const fetchHasPro = useCallback(async () => {
    try {
      const res = await subscriptionService.checkFeature('meal_plan');
      if (res.data && res.data.success) {
        setHasPro(res.data.data);
      }
    } catch (err) {
      console.error('Failed to check pro status:', err);
    }
  }, []);

  const isTodayDate = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const fetchWeekPlan = useCallback(async (dateToFetch, targetDateStr = null) => {
    if (!accountId) return;
    setLoadingPlans(true);
    try {
      const dateStr = new Date(dateToFetch || new Date()).toISOString().split('T')[0];
      const res = await api.get(`/MealPlan/week?date=${dateStr}`);
      const plan = res.data.data;
      setWeekPlan(plan);

      if (plan?.days?.length === 7) {
        if (targetDateStr) {
          const idx = plan.days.findIndex(d => d.dayDate && d.dayDate.split('T')[0] === targetDateStr);
          setSelectedDayIdx(idx >= 0 ? idx : 0);
        } else {
          const todayIdx = plan.days.findIndex(d => isTodayDate(d.dayDate));
          setSelectedDayIdx(todayIdx >= 0 ? todayIdx : 0);
        }
      }
    } catch (err) {
      console.error('Lỗi tải thực đơn tuần:', err);
    } finally {
      setLoadingPlans(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchWeekPlan(new Date());
    fetchHasPro();
  }, [fetchWeekPlan, fetchHasPro]);

  const handlePopupClose = (msg) => {
    setShowPopup(false);
    if (msg) {
      setAlertMsg(msg);
      setTimeout(() => setAlertMsg(null), 3000);
    }
    fetchWeekPlan(currentWeekDate);
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
    const picked = new Date(e.target.value);
    const dateStr = picked.toISOString().split('T')[0];
    setCurrentWeekDate(picked);
    fetchWeekPlan(picked, dateStr);
  };

  const handleLogMeal = async (entry, date) => {
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
      toast.success('Đã lưu vào nhật ký ăn uống!');

      setWeekPlan((prevPlan) => {
        if (!prevPlan) return prevPlan;
        return {
          ...prevPlan,
          days: prevPlan.days.map((day) => {
            return {
              ...day,
              entries: day.entries.map((e) => {
                if (e.entry_id === entry.entry_id) {
                  return { ...e, isLogged: true };
                }
                return e;
              }),
            };
          }),
        };
      });
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu vào nhật ký.');
    }
  };

  const handleRemoveMeal = async () => {
    if (!mealToDelete) return;
    try {
      const planId = weekPlan?.mealPlan_id || '00000000-0000-0000-0000-000000000000';
      await api.delete(`/MealPlan/${planId}/entry/${mealToDelete.entry_id}`);
      toast.success('Đã huỷ món thành công!');
      fetchWeekPlan(currentWeekDate);
      setMealToDelete(null);
    } catch (err) {
      console.error('Error removing meal:', err);
      toast.error(err.response?.data?.message || 'Không thể huỷ món.');
    }
  };

  const [quickGenerating, setQuickGenerating] = useState(null);

  const handleQuickGenerate = async (slotKey, date) => {
    if (!hasPro) {
      setShowPaywall(true);
      return;
    }
    try {
      setQuickGenerating(slotKey);
      const dateParam = new Date(date).toISOString().split('T')[0];
      const res = await api.post(`/MealPlan/suggest-for-date?date=${dateParam}&meals=${slotKey}`);
      toast.success(`Đã tạo gợi ý cho ${SLOT_LABELS[slotKey]} thành công!`);
      if (res.data && res.data.data) {
        setWeekPlan(res.data.data);
      } else {
        fetchWeekPlan(currentWeekDate);
      }
    } catch (err) {
      console.error('Error quick generate:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo gợi ý.');
    } finally {
      setQuickGenerating(null);
    }
  };

  const handleQuickGenerateAll = async (date) => {
    if (!hasPro) {
      setShowPaywall(true);
      return;
    }
    try {
      setQuickGenerating('all');
      const dateParam = new Date(date).toISOString().split('T')[0];
      const res = await api.post(`/MealPlan/suggest-for-date?date=${dateParam}`);
      toast.success('Đã tạo gợi ý các bữa cho ngày này!');
      if (res.data && res.data.data) {
        setWeekPlan(res.data.data);
      } else {
        fetchWeekPlan(currentWeekDate);
      }
    } catch (err) {
      console.error('Error quick generate all:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo gợi ý.');
    } finally {
      setQuickGenerating(null);
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

  const meals = getMealsForDay(selectedDay);

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const formatDateInput = (dateObj) => {
    if (!dateObj) return '';
    return new Date(dateObj).toISOString().split('T')[0];
  };

  const renderRightHeaderActions = () => {
    return (
      <button 
        className="mps-btn-create"
        onClick={() => {
          if (!hasPro) {
            setShowPaywall(true);
            return;
          }
          setShowPopup(true);
        }}
        style={{ padding: '8px 16px', fontSize: '14px', height: '40px' }}
      >
        {!hasPro && <FiLock size={16} style={{ marginRight: '6px' }} />}
        <FiPlus size={16} /> Tạo thực đơn tuần mới
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

        {/* ── Week Navigator ── */}
        <div className="mps-week-nav">
          <button className="mps-week-btn" onClick={handlePrevWeek} title="Xem tuần trước">
            <FiChevronLeft size={16} /> Tuần trước
          </button>

          <div className="mps-week-title">
            <FiCalendar size={18} />
            <span>Tuần từ {formatDateShort(weekPlan?.startDate)} – {formatDateShort(weekPlan?.endDate)}</span>
            <button className="mps-today-btn" onClick={handleGoToday}>Hôm nay</button>
          </div>

          <div className="mps-week-actions">
            <input
              type="date"
              className="mps-date-picker"
              value={formatDateInput(currentWeekDate)}
              onChange={handleDateChange}
              title="Chọn ngày để xem tuần chứa ngày đó"
            />
            <button className="mps-week-btn" onClick={handleNextWeek} title="Xem tuần sau">
              Tuần sau <FiChevronRight size={16} />
            </button>
          </div>
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
              if (!hasPro) {
                setShowPaywall(true);
                return;
              }
              setShowPopup(true);
            }}>
              {!hasPro && <FiLock size={18} style={{ marginRight: '8px' }} />}
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
                const weekdayName = WEEKDAY_LABELS[i] || `Thứ ${i + 2}`;

                return (
                  <button
                    key={day.day_id || i}
                    className={`mps-day-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedDayIdx(i)}
                  >
                    <span className="mps-day-num">{weekdayName}</span>
                    {dateShort && <span className="mps-day-date">{dateShort}</span>}
                    {isToday && <span className="mps-day-today-badge">Hôm nay</span>}
                    {day.totalCalories > 0 ? (
                      <span className="mps-day-kcal">{Math.round(day.totalCalories)} kcal</span>
                    ) : (
                      <span className="mps-day-date" style={{ opacity: 0.7 }}>Trống</span>
                    )}
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
                  {meals.some(m => m.isMissing) && (
                    <button
                      onClick={() => handleQuickGenerateAll(selectedDay.dayDate)}
                      disabled={quickGenerating === 'all'}
                      className="mps-btn-create"
                      style={{ padding: '7px 14px', fontSize: '13px', height: '34px' }}
                    >
                      {quickGenerating === 'all' ? 'Đang tạo...' : '+ Gợi ý các bữa còn lại'}
                    </button>
                  )}
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
                const isToday = toDateKey(selectedDay?.dayDate) === getTodayDateKey();
                const isQuickGenerating = quickGenerating === slotKey;

                if (meal.isMissing) {
                  return (
                    <div
                      key={slotKey}
                      className="mps-meal-card"
                      style={{
                        '--card-bg':     '#f8fafc',
                        '--card-border': '#e2e8f0',
                        '--badge-bg':    '#f1f5f9',
                        '--badge-color': '#64748b',
                        animation: `slideInRight 0.35s ease ${i * 0.08}s both`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '16px',
                        minHeight: '300px',
                        borderStyle: 'dashed'
                      }}
                    >
                      <div style={{ fontSize: '48px', opacity: 0.4 }}>{SLOT_ICONS[slotKey]}</div>
                      <div style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>Chưa có {SLOT_LABELS[slotKey].toLowerCase()}</div>
                      <button
                        onClick={() => handleQuickGenerate(slotKey, selectedDay.dayDate)}
                        disabled={isQuickGenerating}
                        style={{
                          marginTop: '8px',
                          padding: '10px 20px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'white',
                          color: '#22c55e',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: isQuickGenerating ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 0 0 1px #e2e8f0',
                          transition: 'all 0.2s',
                          opacity: isQuickGenerating ? 0.7 : 1
                        }}
                        onMouseOver={btn => { if(!isQuickGenerating) btn.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05), 0 0 0 1px #cbd5e1' }}
                        onMouseOut={btn => { if(!isQuickGenerating) btn.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05), 0 0 0 1px #e2e8f0' }}
                      >
                        {isQuickGenerating ? <div className="mps-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <FiPlus />}
                        {isQuickGenerating ? 'Đang tạo...' : 'Tạo gợi ý nhanh'}
                      </button>
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
                    </div>

                    {/* Dish name */}
                    <div className="mps-card-name" title={meal.recipeName}>
                      {meal.recipeName}
                    </div>

                    {/* Food image */}
                    <div className="mps-card-img-wrap">
                      <img
                        src={imgSrc}
                        alt={meal.recipeName}
                        className="mps-card-img"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop';
                        }}
                      />
                      <div className="mps-card-img-overlay" />
                    </div>

                    {/* Meta badges */}
                    <div className="mps-card-meta">
                      <span
                        className="mps-meta-badge"
                        style={{ background: colors.soft, color: colors.text }}
                      >
                        {SLOT_ICONS[slotKey]} {SLOT_LABELS[slotKey]}
                      </span>
                      <span className="mps-meta-kcal">
                        <FiZap size={12} /> {Math.round(meal.slotCalories)} kcal
                      </span>
                      {meal.cookTime > 0 && (
                        <span className="mps-meta-time">
                          <FiClock size={11} /> {meal.cookTime}p
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 12, width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {isToday && (
                        meal.isLogged ? (
                          <button
                            disabled
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: '1px solid #bbf7d0',
                              background: '#f0fdf4',
                              color: '#16a34a',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6
                            }}
                          >
                            ✓ Đã ghi nhận nhật ký
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLogMeal(meal, selectedDay.dayDate);
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: 12,
                              border: 'none',
                              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                              color: 'white',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              boxShadow: '0 4px 6px rgba(34,197,94,0.15)',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={btn => btn.currentTarget.style.opacity = 0.9}
                            onMouseOut={btn => btn.currentTarget.style.opacity = 1}
                          >
                            🍽️ Xác nhận đã ăn
                          </button>
                        )
                      )}

                      {!meal.isLogged && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMealToDelete(meal);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 12,
                            border: '1px solid #fee2e2',
                            background: '#fef2f2',
                            color: '#ef4444',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={btn => btn.currentTarget.style.background = '#fee2e2'}
                          onMouseOut={btn => btn.currentTarget.style.background = '#fef2f2'}
                        >
                          ❌ Huỷ bữa ăn này
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

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { resolveRecipeImageUrl } from '../../utils/recipeImages';
import SuggestNextPlanPopup from '../../components/forms/SuggestNextPlanPopup';
import { FiCalendar, FiPlus, FiCheck, FiAlertTriangle, FiChevronDown, FiClock, FiZap, FiLock } from 'react-icons/fi';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import { toast } from 'react-hot-toast';
import { subscriptionService } from '../../services/subscriptionService';
import UpgradePaywallModal from '../../components/common/UpgradePaywallModal';
import './MealPlanSuggestion.css';

const SLOT_LABELS = { breakfast: 'Bữa Sáng', lunch: 'Bữa Trưa', dinner: 'Bữa Tối' };
const SLOT_ICONS  = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };
const SLOT_ORDER  = ['breakfast', 'lunch', 'dinner'];

const SLOT_COLORS = {
  breakfast: { bg: '#fef9ec', border: '#fde68a', badge: '#f59e0b', text: '#92400e', soft: '#fef3c7' },
  lunch:     { bg: '#eff6ff', border: '#bfdbfe', badge: '#3b82f6', text: '#1e40af', soft: '#dbeafe' },
  dinner:    { bg: '#f5f3ff', border: '#ddd6fe', badge: '#8b5cf6', text: '#5b21b6', soft: '#ede9fe' },
};

export default function MealPlanSuggestion() {
  const { user } = useAuth();
  const accountId = user?.accountId || user?.account_id;

  // allPlans: list of MealPlanResponseDto
  const [allPlans, setAllPlans]       = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showPopup, setShowPopup]     = useState(false);
  const [alertMsg, setAlertMsg]       = useState(null);
  const [mealToDelete, setMealToDelete] = useState(null);

  // For day selector: which plan and which day index is selected
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);

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

  const fetchAllPlans = useCallback(async () => {
    if (!accountId) return;
    setLoadingPlans(true);
    try {
      const res = await api.get('/MealPlan/all');
      const plans = res.data.data || [];
      setAllPlans(plans);
      if (plans.length > 0) {
        setSelectedPlanId(plans[0].mealPlan_id);
        setSelectedDayIdx(0);
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử:', err);
    } finally {
      setLoadingPlans(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchAllPlans();
    fetchHasPro();
  }, [fetchAllPlans, fetchHasPro]);

  const handlePopupClose = (msg) => {
    setShowPopup(false);
    if (msg) {
      setAlertMsg(msg);
      setTimeout(() => setAlertMsg(null), 3000);
    }
    fetchAllPlans();
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

      setAllPlans((prevPlans) => {
        return prevPlans.map((plan) => {
          return {
            ...plan,
            days: plan.days.map((day) => {
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
      });
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu vào nhật ký.');
    }
  };

  const handleRemoveMeal = async () => {
    if (!mealToDelete) return;
    try {
      await api.delete(`/MealPlan/${selectedPlanId}/entry/${mealToDelete.entry_id}`);
      toast.success('Đã huỷ món thành công!');
      fetchAllPlans();
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
      await api.post(`/MealPlan/suggest-for-date?date=${dateParam}&meals=${slotKey}`);
      toast.success(`Đã tạo gợi ý cho ${SLOT_LABELS[slotKey]} thành công!`);
      fetchAllPlans();
    } catch (err) {
      console.error('Error quick generate:', err);
      toast.error(err.response?.data?.message || 'Không thể tạo gợi ý.');
    } finally {
      setQuickGenerating(null);
    }
  };


  // Derived: currently selected plan & day
  const selectedPlan = allPlans.find(p => p.mealPlan_id === selectedPlanId) || allPlans[0] || null;
  const days = selectedPlan?.days || [];
  const selectedDay = days[selectedDayIdx] || null;

  // Build ordered meal slots for selected day
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

  const formatPlanLabel = (plan, index) => {
    if (!plan) return 'Chọn thực đơn';
    const start = plan.startDate ? new Date(plan.startDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '';
    const end   = plan.endDate   ? new Date(plan.endDate).toLocaleDateString('vi-VN',   { day: '2-digit', month: '2-digit' }) : '';
    const totalDays = plan.totalDays || (plan.days?.length) || '?';
    const genAt = plan.generatedAt
      ? new Date(plan.generatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })
      : '';
    const prefix = index !== undefined ? `#${index + 1} · ` : '';
    const dateRange = (start && end) ? `${start} – ${end}` : '';
    const suffix = genAt ? ` (tạo ${genAt})` : ` (${totalDays} ngày)`;
    return `${prefix}${dateRange}${suffix}`;
  };

  const formatDayLabel = (day) => {
    if (!day) return '';
    const date = day.dayDate ? new Date(day.dayDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }) : '';
    return `Ngày ${day.dayIndex}${date ? ' · ' + date : ''}`;
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
        <FiPlus size={16} /> Tạo gợi ý
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
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
          70%  { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
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
            <p className="mps-subtitle">Thực đơn cá nhân hoá theo dinh dưỡng của bạn</p>
          </div>

          <div className="mps-header-right">
            {/* Plan selector dropdown */}
            {allPlans.length > 1 && (
              <div
                className="mps-dropdown-wrap"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setPlanDropdownOpen(false);
                  }
                }}
                tabIndex={-1}
              >
                <button
                  className="mps-dropdown-btn"
                  onClick={() => setPlanDropdownOpen(v => !v)}
                >
                  <FiCalendar size={15} />
                  <span>{formatPlanLabel(selectedPlan, allPlans.findIndex(p => p.mealPlan_id === selectedPlanId))}</span>
                  <FiChevronDown size={14} className={planDropdownOpen ? 'rot180' : ''} />
                </button>
                {planDropdownOpen && (
                  <div className="mps-dropdown-menu">
                    {allPlans.map((p, i) => (
                      <button
                        key={p.mealPlan_id}
                        className={`mps-dropdown-item ${p.mealPlan_id === selectedPlanId ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPlanId(p.mealPlan_id);
                          setSelectedDayIdx(0);
                          setPlanDropdownOpen(false);
                        }}
                      >
                        {formatPlanLabel(p, i)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {renderRightHeaderActions()}
          </div>
        </div>

        {/* ── Main content ── */}
        {loadingPlans ? (
          <div className="mps-loading">
            <div className="mps-spinner" />
            <p>Đang tải thực đơn...</p>
          </div>
        ) : allPlans.length === 0 ? (
          <div className="mps-empty">
            <div className="mps-empty-icon">🍽️</div>
            <h2>Chưa có thực đơn nào</h2>
            <p>Nhấn <strong>Tạo gợi ý</strong> để tạo thực đơn dinh dưỡng đầu tiên của bạn.</p>
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
                const date = day.dayDate
                  ? new Date(day.dayDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
                  : '';
                return (
                  <button
                    key={day.day_id || i}
                    className={`mps-day-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedDayIdx(i)}
                  >
                    <span className="mps-day-num">Ngày {day.dayIndex}</span>
                    {date && <span className="mps-day-date">{date}</span>}
                    {isActive && (
                      <span className="mps-day-kcal">{Math.round(day.totalCalories)} kcal</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Day summary strip ── */}
            {selectedDay && (
              <div className="mps-day-summary">
                <div className="mps-day-summary-title">
                  {formatDayLabel(selectedDay)}
                </div>
                <div className="mps-day-summary-stats">
                  <span><FiZap size={13}/> {Math.round(selectedDay.totalCalories)} kcal</span>
                  {selectedDay.totalProtein > 0 && <span>🥩 {Math.round(selectedDay.totalProtein)}g đạm</span>}
                  {selectedDay.totalCarbs   > 0 && <span>🍚 {Math.round(selectedDay.totalCarbs)}g tinh bột</span>}
                  {selectedDay.totalFat     > 0 && <span>🫒 {Math.round(selectedDay.totalFat)}g chất béo</span>}
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

                const imgSrc  = meal._resolvedImg || resolveRecipeImageUrl(meal.recipeName || meal.recipe_name || '');

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

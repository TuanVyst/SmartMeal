import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import { resolveRecipeImageUrl } from '../../utils/recipeImages';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)', color: '#1E293B', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, borderBottom: '1px solid #e2e8f0', paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: '#16a34a', margin: 0 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 6 },
  tabRow: { display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4, border: '1px solid #e2e8f0' },
  tab: (active) => ({ padding: '8px 24px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', background: active ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent', color: active ? 'white' : '#64748b', boxShadow: active ? '0 0 15px rgba(34,197,94,0.3)' : 'none' }),
  loadingBox: { minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 56, height: 56, border: '4px solid #e2e8f0', borderTop: '4px solid #22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  dayCard: { background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, marginBottom: 24, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  dayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dayTitle: { fontSize: 18, fontWeight: 700, color: '#1E293B' },
  dayDate: { fontSize: 13, color: '#64748b', fontWeight: 400, marginLeft: 10 },
  calorieTag: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 99, padding: '6px 16px', fontSize: 14 },
  calorieNum: { color: '#16a34a', fontWeight: 700 },
  entriesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  entryCard: { background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  entryImage: { height: 130, background: '#f8fafc', position: 'relative', overflow: 'hidden' },
  slotTag: { position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, textTransform: 'capitalize', color: '#1E293B', border: '1px solid #e2e8f0' },
  entryBody: { padding: '12px 14px' },
  entryName: { fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  entryMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 13 },
  entryKcal: { background: '#dcfce7', color: '#16a34a', padding: '2px 10px', borderRadius: 99, fontWeight: 600, fontSize: 12 },
  entryTime: { color: '#64748b' },
  groceryCard: { background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 32, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  groceryHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  groceryTitle: { fontSize: 20, fontWeight: 700, color: '#1E293B' },
  groceryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  groceryItem: (owned) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, border: `1px solid ${owned ? '#bbf7d0' : '#e2e8f0'}`, background: owned ? '#f0fdf4' : '#f8fafc' }),
  groceryAvatar: { width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
  groceryName: (owned) => ({ fontSize: 14, fontWeight: 600, color: owned ? '#16a34a' : '#1E293B', textDecoration: owned ? 'line-through' : 'none', opacity: owned ? 0.7 : 1 }),
  groceryQty: { fontSize: 12, color: '#64748b', marginTop: 2 },
  emptyState: { textAlign: 'center', padding: '48px 24px', color: '#64748b' },
};

const MealPlanPage = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('plan');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get('/MealPlan/active');
        if (response.data.data) {
          setPlan(response.data.data);
        } else {
          navigate('/meal-plan/report');
        }
      } catch (error) {
        console.error('Error:', error);
        // If no active plan, redirect to get one
        if (error?.status === 404 || !plan) {
          navigate('/meal-plan/report');
        } else {
          toast.error('Không thể tải dữ liệu thực đơn.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [navigate]);

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

      setPlan((prevPlan) => {
        if (!prevPlan) return prevPlan;
        return {
          ...prevPlan,
          days: prevPlan.days.map((day) => ({
            ...day,
            entries: day.entries.map((e) => {
              if (e.entry_id === entry.entry_id) {
                return { ...e, isLogged: true };
              }
              return e;
            }),
          })),
        };
      });
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu vào nhật ký.');
    }
  };

  if (loading) {
    return (
      <div style={s.loadingBox}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={s.spinner} />
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Header />
      <div style={s.container}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Thực Đơn Của Bạn</h1>
            {plan.startDate && (
              <p style={s.subtitle}>
                {new Date(plan.startDate).toLocaleDateString('vi-VN')} – {new Date(plan.endDate).toLocaleDateString('vi-VN')}
              </p>
            )}
          </div>
          <div style={s.tabRow}>
            <button style={s.tab(activeTab === 'plan')} onClick={() => setActiveTab('plan')}>📋 Thực Đơn</button>
            <button style={s.tab(activeTab === 'grocery')} onClick={() => setActiveTab('grocery')}>🛒 Danh Sách Đi Chợ</button>
          </div>
        </div>

        {activeTab === 'plan' && (
          <div>
            {plan.days?.map((day) => (
              <div key={day.day_id || day.dayIndex} style={s.dayCard}>
                <div style={s.dayHeader}>
                  <h2 style={s.dayTitle}>
                    Ngày {day.dayIndex}
                    {day.dayDate && (
                      <span style={s.dayDate}>
                        ({new Date(day.dayDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })})
                      </span>
                    )}
                  </h2>
                  <div style={s.calorieTag}>
                    <span style={s.calorieNum}>{day.totalCalories}</span>
                    <span style={{ color: '#64748b', marginLeft: 4 }}>kcal</span>
                  </div>
                </div>

                <div style={s.entriesGrid}>
                  {day.entries?.map((entry) => {
                    const isToday = toDateKey(day.dayDate) === getTodayDateKey();
                    return (
                      <div
                        key={entry.entry_id}
                        style={s.entryCard}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; }}
                        onClick={() => entry.recipe_id && navigate(`/recipe/${entry.recipe_id}`)}
                      >
                        <div style={s.entryImage}>
                          <img 
                            src={resolveRecipeImageUrl(entry.recipeName)} 
                            alt={entry.recipeName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop'; }}
                          />
                          <div style={s.slotTag}>{entry.mealSlot}</div>
                        </div>
                        <div style={s.entryBody}>
                          <div style={s.entryName} title={entry.recipeName}>{entry.recipeName}</div>
                          <div style={s.entryMeta}>
                            <span style={s.entryKcal}>{entry.slotCalories} kcal</span>
                            {entry.cookTime > 0 && <span style={s.entryTime}>⏱ {entry.cookTime}p</span>}
                          </div>
                          {isToday && (
                            <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                              {entry.isLogged ? (
                                <button
                                  disabled
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 10,
                                    border: '1px solid #bbf7d0',
                                    background: '#f0fdf4',
                                    color: '#16a34a',
                                    fontSize: 12,
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
                                    handleLogMeal(entry, day.dayDate);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: 'white',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 6,
                                    boxShadow: '0 2px 4px rgba(34,197,94,0.2)',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseOver={btn => btn.currentTarget.style.opacity = 0.9}
                                  onMouseOut={btn => btn.currentTarget.style.opacity = 1}
                                >
                                  🍽️ Xác nhận đã ăn
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'grocery' && (
          <div style={s.groceryCard}>
            <div style={s.groceryHeader}>
              <h2 style={s.groceryTitle}>Nguyên liệu cần chuẩn bị ({plan.days?.length || 7} ngày)</h2>
            </div>
            {plan.requiredIngredients?.length > 0 ? (
              <div style={s.groceryGrid}>
                {plan.requiredIngredients.map((ing, idx) => (
                  <div key={ing.ingredient_id || idx} style={s.groceryItem(ing.isPossessed)}>
                    <div style={s.groceryAvatar}>🥬</div>
                    <div>
                      <div style={s.groceryName(ing.isPossessed)}>{ing.name}</div>
                      <div style={s.groceryQty}>{Math.round(ing.quantity * 10) / 10} {ing.uom}</div>
                    </div>
                    {ing.isPossessed && <span style={{ marginLeft: 'auto', color: '#16a34a', fontSize: 18 }}>✓</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={s.emptyState}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>🛒</p>
                <p>Danh sách nguyên liệu sẽ xuất hiện ở đây sau khi thực đơn được tạo.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanPage;

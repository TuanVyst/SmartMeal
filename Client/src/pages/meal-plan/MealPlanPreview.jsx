import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Header from '../../components/layout/Header';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { resolveRecipeImageUrl } from '../../utils/recipeImages';

const s = {
  page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)', color: '#1E293B', fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, borderBottom: '1px solid #e2e8f0', paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: '#16a34a', margin: 0 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 6 },
  btnGroup: { display: 'flex', gap: 12 },
  outlineBtn: { padding: '10px 24px', borderRadius: 99, border: '2px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontSize: 14, fontWeight: 500 },
  primaryBtn: { padding: '10px 28px', borderRadius: 99, border: 'none', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 700, boxShadow: '0 0 20px rgba(34,197,94,0.3)' },
  loadingBox: { minHeight: '100vh', background: '#f0fdf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  spinner: { width: 56, height: 56, border: '4px solid #e2e8f0', borderTop: '4px solid #22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  dayCard: { background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', padding: 24, marginBottom: 24, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  dayHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  dayTitle: { fontSize: 18, fontWeight: 700, color: '#1E293B' },
  dayDate: { fontSize: 13, color: '#64748b', fontWeight: 400, marginLeft: 10 },
  calorieTag: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 99, padding: '6px 16px', fontSize: 14 },
  calorieNum: { color: '#16a34a', fontWeight: 700 },
  calorieUnit: { color: '#6b7280', marginLeft: 4 },
  entriesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
  entryCard: { background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  entryImage: { height: 140, background: '#f8fafc', position: 'relative', overflow: 'hidden' },
  slotTag: { position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, color: '#1E293B', textTransform: 'capitalize', border: '1px solid #e2e8f0' },
  swapBtn: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 },
  entryBody: { padding: '14px 16px' },
  entryName: { fontSize: 15, fontWeight: 600, color: '#1E293B', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  entryMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 },
  entryKcal: { background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: 99, fontWeight: 600 },
  entryTime: { color: '#64748b' },
  imgPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: '#f8fafc' },
};

const MealPlanPreview = () => {
  const navigate = useNavigate();
  const { planCycleDays } = useHealthProfile();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [swapModal, setSwapModal] = useState({ open: false, entryId: null, dayIndex: null, mealSlot: null });
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => { generatePlan(); }, []);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/MealPlan/generate?days=${planCycleDays || 7}`);
      setPlan(response.data.data);
    } catch (error) {
      console.error('Error generating plan:', error);
      toast.error('Lỗi khi tạo thực đơn: ' + (error?.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!plan?.mealPlan_id) return;
    setConfirming(true);
    try {
      await api.post(`/MealPlan/${plan.mealPlan_id}/confirm`);
      toast.success('Xác nhận thực đơn thành công!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Lỗi khi xác nhận thực đơn.');
    } finally {
      setConfirming(false);
    }
  };

  const handleOpenSwap = async (entry, dayIndex) => {
    setSwapModal({ open: true, entryId: entry.entry_id, dayIndex, mealSlot: entry.mealSlot });
    setLoadingRecipes(true);
    try {
      const res = await api.get('/Recipe');
      const recipes = res.data?.data || res.data || [];
      setAvailableRecipes(recipes.filter(r => r.recipe_id !== entry.recipe_id));
    } catch {
      toast.error('Không thể tải danh sách món ăn');
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleSwapRecipe = async (newRecipeId) => {
    if (!plan?.mealPlan_id || !swapModal.entryId) return;
    try {
      const res = await api.put(`/MealPlan/${plan.mealPlan_id}/swap`, {
        entryId: swapModal.entryId,
        newRecipeId
      });
      setPlan(res.data.data);
      setSwapModal({ open: false, entryId: null, dayIndex: null, mealSlot: null });
      toast.success('Đã đổi món thành công!');
    } catch {
      toast.error('Lỗi khi đổi món');
    }
  };

  if (loading) {
    return (
      <div style={s.loadingBox}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={s.spinner} />
        <p style={{ color: '#16a34a', fontWeight: 600, fontSize: 16 }}>Hệ thống đang thiết kế thực đơn riêng cho bạn...</p>
        <p style={{ color: '#64748b', fontSize: 13 }}>Dựa trên chỉ số BMR và mục tiêu sức khỏe của bạn</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div style={s.loadingBox}>
        <p style={{ color: '#ef4444' }}>⚠️ Không thể tạo thực đơn. Vui lòng thử lại.</p>
        <button style={s.primaryBtn} onClick={generatePlan}>Thử lại</button>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <Header />
      <div style={s.container}>
        <div style={s.topBar}>
          <div>
            <h1 style={s.title}>Bản Xem Trước Thực Đơn {planCycleDays || 7} Ngày</h1>
            <p style={s.subtitle}>Được tạo riêng dựa trên mục tiêu và tình trạng sức khỏe của bạn</p>
          </div>
          <div style={s.btnGroup}>
            <button style={s.outlineBtn} onClick={generatePlan}>🔄 Tạo Lại</button>
            <button
              style={{ ...s.primaryBtn, opacity: confirming ? 0.7 : 1 }}
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? 'Đang xử lý...' : '✓ Chốt Thực Đơn Này'}
            </button>
          </div>
        </div>

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
                <span style={s.calorieUnit}>kcal</span>
              </div>
            </div>

            <div style={s.entriesGrid}>
              {day.entries?.map((entry) => (
                <div
                  key={entry.entry_id}
                  style={s.entryCard}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={s.entryImage}>
                    <img 
                      src={resolveRecipeImageUrl(entry.recipeName)} 
                      alt={entry.recipeName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop'; }}
                    />
                    <div style={s.slotTag}>{entry.mealSlot}</div>
                    <button
                      style={s.swapBtn}
                      title="Đổi món"
                      onClick={(e) => { e.stopPropagation(); handleOpenSwap(entry, day.dayIndex); }}
                    >
                      🔄
                    </button>
                  </div>
                  <div style={s.entryBody}>
                    <div style={s.entryName} title={entry.recipeName}>{entry.recipeName}</div>
                    <div style={s.entryMeta}>
                      <span style={s.entryKcal}>{entry.slotCalories} kcal</span>
                      {entry.cookTime > 0 && <span style={s.entryTime}>⏱ {entry.cookTime} phút</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {swapModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSwapModal({ open: false, entryId: null, dayIndex: null, mealSlot: null })}>
          <div style={{ background: 'white', borderRadius: 16, padding: 24, maxWidth: 600, width: '100%', maxHeight: '70vh', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#1E293B' }}>
              Chọn món thay thế cho {swapModal.mealSlot}
            </h3>
            {loadingRecipes ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tải...</p>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {availableRecipes.map(recipe => (
                  <button key={recipe.recipe_id} onClick={() => handleSwapRecipe(recipe.recipe_id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#22C55E'; e.currentTarget.style.background = '#f0fdf4'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; }}>
                    <img src={resolveRecipeImageUrl(recipe.recipe_name)} alt={recipe.recipe_name}
                      style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop'; }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{recipe.recipe_name}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setSwapModal({ open: false, entryId: null, dayIndex: null, mealSlot: null })}
              style={{ marginTop: 16, width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, color: '#64748b' }}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanPreview;

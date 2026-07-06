import { useState, useEffect, useMemo } from 'react';
import { addDiaryEntry } from '../../services/nutritionDiaryService';
import { getTodayDateKey, toDateKey } from '../../utils/dateTime';
import { notifyNutritionUpdated } from '../../utils/nutritionEvents';
import { FiSunrise, FiSun, FiMoon, FiCoffee } from 'react-icons/fi';

const mealTypes = [
  { key: 'breakfast', label: 'Sáng', icon: <FiSunrise size={18} /> },
  { key: 'lunch', label: 'Trưa', icon: <FiSun size={18} /> },
  { key: 'dinner', label: 'Tối', icon: <FiMoon size={18} /> },
  { key: 'snack', label: 'Phụ', icon: <FiCoffee size={18} /> },
];

export default function DiaryEntryDrawer({ recipe, isOpen, onClose }) {
  const [mealType, setMealType] = useState('lunch');
  const [servings, setServings] = useState(1);
  const [date, setDate] = useState(getTodayDateKey());
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const recipeName = recipe?.title || recipe?.name || '';
  const baseCalories = recipe?.nutrition?.calories || recipe?.calories || 0;
  const baseCarbs = recipe?.nutrition?.carbs || 0;
  const baseProtein = recipe?.nutrition?.protein || 0;
  const baseFat = recipe?.nutrition?.fat || 0;

  const macros = useMemo(() => ({
    calories: Math.round(baseCalories * servings),
    carbs: Math.round(baseCarbs * servings),
    protein: Math.round(baseProtein * servings),
    fat: Math.round(baseFat * servings),
  }), [baseCalories, baseCarbs, baseProtein, baseFat, servings]);

  useEffect(() => {
    if (isOpen) {
      setMealType('lunch');
      setServings(1);
      setDate(getTodayDateKey());
      setNote('');
      setSubmitting(false);
      setToast(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!recipe) return;
    setSubmitting(true);
    try {
      const isMockRecipe = typeof recipe.id === 'string' && /^(1111|2222|3333|4444)/.test(recipe.id);
      
      const payload = {
        recipeName: recipeName,
        mealType,
        servings,
        calories: macros.calories,
        carbs: macros.carbs,
        protein: macros.protein,
        fat: macros.fat,
        date,
        note: note.trim() || undefined,
      };
      
      if (!isMockRecipe) {
        payload.recipeId = recipe.id;
      }
      
      await addDiaryEntry(payload);

      // Notify Sidebar Progress Ring to update immediately
      if (toDateKey(date) === getTodayDateKey()) {
        notifyNutritionUpdated({ deltaCalories: macros.calories });
      }

      setToast({ type: 'success', text: 'Đã thêm vào nhật ký!' });
      setTimeout(() => {
        setToast(null);
        onClose?.();
      }, 1200);
    } catch (err) {
      const backendMsg = err.response?.data?.message || err.response?.data?.title || 'Thêm thất bại, vui lòng thử lại';
      setToast({ type: 'error', text: backendMsg });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', zIndex: 10001, bottom: 100, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 10,
          background: toast.type === 'success' ? '#dcfce7' : '#fef2f2',
          color: toast.type === 'success' ? '#15803d' : '#b91c1c',
          fontSize: 14, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideUpFade 0.3s ease',
        }}>
          {toast.text}
        </div>
      )}

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
              animation: 'fadeIn 0.2s ease',
            }}
          />

          <div style={{
            position: 'relative',
            background: 'white', borderRadius: 16,
            width: '100%', maxWidth: 400,
            maxHeight: '90vh', overflowY: 'auto',
            padding: 20,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            animation: 'scaleIn 0.2s ease',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
              Thêm vào nhật ký
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{recipeName}</p>

            {/* Bữa ăn */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Bữa ăn
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {mealTypes.map(m => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMealType(m.key)}
                    style={{
                      padding: '8px 4px', border: `2px solid ${mealType === m.key ? '#22C55E' : '#e2e8f0'}`,
                      borderRadius: 8, background: mealType === m.key ? '#f0fdf4' : 'white',
                      color: mealType === m.key ? '#16a34a' : '#475569',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Khẩu phần + Ngày */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Khẩu phần
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setServings(s => Math.max(0.5, s - 0.5))}
                    style={{
                      width: 32, height: 32, border: '1px solid #e2e8f0', borderRadius: 8,
                      background: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#475569',
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1E293B', minWidth: 40, textAlign: 'center' }}>
                    {servings}
                  </span>
                  <button
                    type="button"
                    onClick={() => setServings(s => Math.min(10, s + 0.5))}
                    style={{
                      width: 32, height: 32, border: '1px solid #e2e8f0', borderRadius: 8,
                      background: 'white', fontSize: 16, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#475569',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                  Ngày
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    width: '100%', padding: '6px 10px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 13, outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Dinh dưỡng */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14,
              padding: 12, background: '#f8fafc', borderRadius: 10,
            }}>
              {[
                { label: 'Calo', value: `${macros.calories}`, color: '#22C55E' },
                { label: 'Carb', value: `${macros.carbs}g`, color: '#3b82f6' },
                { label: 'Protein', value: `${macros.protein}g`, color: '#ef4444' },
                { label: 'Fat', value: `${macros.fat}g`, color: '#f59e0b' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1 }}>{m.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Ghi chú */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
                Ghi chú <span style={{ fontWeight: 400, color: '#94a3b8' }}>(không bắt buộc)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ví dụ: Ăn trước khi tập gym..."
                rows={2}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                  borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, padding: '10px', border: '2px solid #e2e8f0', borderRadius: 10,
                  background: 'white', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: 10,
                  background: submitting ? '#94a3b8' : '#22C55E', color: 'white',
                  fontSize: 14, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {submitting ? 'Đang thêm...' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
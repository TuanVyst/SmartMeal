import { useNavigate } from 'react-router-dom';
import { useNutritionDiary } from '../../hooks/useNutritionDiary';
import { useHealthProfile } from '../../hooks/useHealthProfile';

const mealSections = [
  { key: 'breakfast', label: 'Bữa sáng', icon: '🌅' },
  { key: 'lunch', label: 'Bữa trưa', icon: '☀️' },
  { key: 'dinner', label: 'Bữa tối', icon: '🌙' },
  { key: 'snack', label: 'Bữa phụ', icon: '🍿' },
];

function MacroBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
        <span>{label}</span>
        <span>{Math.round(value)}g / {max}g</span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ height: 24, width: '40%', background: '#f1f5f9', borderRadius: 6, marginBottom: 12 }} />
          {[1, 2].map(j => (
            <div key={j} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <div style={{ height: 16, width: '60%', background: '#f1f5f9', borderRadius: 4 }} />
              <div style={{ height: 16, width: '20%', background: '#f1f5f9', borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function NutritionDiaryPage() {
  const navigate = useNavigate();
  const {
    entries, loading, totalMacros, selectedDate,
    setSelectedDate, deleteEntry,
  } = useNutritionDiary();
  const { dailyCalorieBudget } = useHealthProfile();

  const budget = dailyCalorieBudget || 2000;
  const calPct = budget > 0 ? Math.min(100, (totalMacros.calories / budget) * 100) : 0;

  const remaining = budget - totalMacros.calories;
  const message = remaining > 200
    ? { text: `✅ Đang đúng hướng! Còn ${Math.round(remaining)} kcal hôm nay`, color: '#16a34a' }
    : remaining >= 0
      ? { text: `⚠️ Sắp đạt giới hạn calo hôm nay (còn ${Math.round(remaining)} kcal)`, color: '#ca8a04' }
      : { text: `❌ Đã vượt ${Math.round(Math.abs(remaining))} kcal so với mục tiêu`, color: '#dc2626' };

  const grouped = {};
  mealSections.forEach(s => { grouped[s.key] = []; });
  entries.forEach(e => {
    const key = e.mealType || 'snack';
    if (grouped[key]) grouped[key].push(e);
    else grouped[key] = [e];
  });

  const totalByMeal = {};
  Object.entries(grouped).forEach(([key, items]) => {
    totalByMeal[key] = items.reduce((sum, e) => sum + (e.calories || 0), 0);
  });

  const handleDelete = async (entryId) => {
    if (!confirm('Xóa mục này?')) return;
    await deleteEntry(entryId);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Nhật ký Dinh dưỡng</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{
            padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
            fontSize: 14, outline: 'none',
          }}
        />
      </div>

      {loading && <SkeletonLoader />}

      {!loading && (
        <>
          <div style={{
            background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginBottom: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1E293B' }}>Tổng lượng calo</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: calPct >= 100 ? '#dc2626' : '#22C55E' }}>
                {Math.round(totalMacros.calories)} / {budget} kcal
              </span>
            </div>
            <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{
                width: `${calPct}%`, height: '100%', borderRadius: 6, transition: 'width 0.5s ease',
                background: calPct >= 100 ? '#dc2626' : calPct >= 80 ? '#ca8a04' : '#22C55E',
              }} />
            </div>

            <p style={{ fontSize: 13, color: message.color, marginBottom: 20, fontWeight: 500 }}>
              {message.text}
            </p>

            <MacroBar label="Carbohydrate" value={totalMacros.carbs} max={Math.round(budget * 0.5 / 4)} color="#3b82f6" />
            <MacroBar label="Protein" value={totalMacros.protein} max={Math.round(budget * 0.2 / 4)} color="#ef4444" />
            <MacroBar label="Chất béo" value={totalMacros.fat} max={Math.round(budget * 0.3 / 9)} color="#f59e0b" />
          </div>

          {entries.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 60, background: 'white', borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>Chưa có bữa ăn nào</h3>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                Hôm nay bạn chưa ghi lại bữa ăn nào. Hãy khám phá các món ăn!
              </p>
              <button
                type="button"
                onClick={() => navigate('/goi-y')}
                style={{
                  padding: '12px 28px', border: 'none', borderRadius: 10,
                  background: '#22C55E', color: 'white', fontSize: 15, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Khám phá món ăn
              </button>
            </div>
          ) : (
            <div>
              {mealSections.map(section => {
                const items = grouped[section.key] || [];
                if (items.length === 0) return null;
                return (
                  <div key={section.key} style={{
                    background: 'white', borderRadius: 12, padding: 20,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 16,
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{section.icon}</span>
                        <span style={{ fontSize: 16, fontWeight: 600, color: '#1E293B' }}>{section.label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#22C55E' }}>
                        {Math.round(totalByMeal[section.key])} kcal
                      </span>
                    </div>
                    {items.map(item => (
                      <div key={item.id || item.recipeId} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 0', borderBottom: '1px solid #f8fafc',
                      }}>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#1E293B', display: 'block' }}>
                            {item.recipeName}
                          </span>
                          {item.servings && (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>Khẩu phần: {item.servings}</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                            {Math.round(item.calories)} kcal
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            style={{
                              background: 'none', border: 'none', color: '#94a3b8',
                              cursor: 'pointer', fontSize: 16, padding: 4,
                            }}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => navigate('/meal-suggestions')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4, marginTop: 12,
                        background: 'none', border: 'none', color: '#22C55E',
                        fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: 0,
                      }}
                    >
                      + Thêm món
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

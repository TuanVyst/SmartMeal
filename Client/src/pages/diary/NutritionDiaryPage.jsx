import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNutritionDiary } from '../../hooks/useNutritionDiary';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { useDialog } from '../../context/DialogContext';
import HealthProfileEditor from '../../components/HealthProfileEditor';
import { FiSunrise, FiSun, FiMoon, FiCoffee, FiTrendingDown, FiActivity, FiMinimize2, FiHeart, FiDroplet, FiFileText, FiLock, FiAlertCircle, FiZap, FiTrash2 } from 'react-icons/fi';

const mealSections = [
  { key: 'breakfast', label: 'Bữa sáng', icon: <FiSunrise size={18} /> },
  { key: 'lunch', label: 'Bữa trưa', icon: <FiSun size={18} /> },
  { key: 'dinner', label: 'Bữa tối', icon: <FiMoon size={18} /> },
  { key: 'snack', label: 'Bữa phụ', icon: <FiCoffee size={18} /> },
];

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

const bmiColors = {
  underweight: { bg: '#dbeafe', text: '#2563eb', label: 'Thiếu cân' },
  normal: { bg: '#dcfce7', text: '#16a34a', label: 'Bình thường' },
  overweight: { bg: '#ffedd5', text: '#ea580c', label: 'Thừa cân' },
  obese: { bg: '#fef2f2', text: '#dc2626', label: 'Béo phì' },
};

function MacroBar({ label, value, max, color, unit = 'g', icon, warning }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const isOver = value > max;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {icon && <span>{icon}</span>}
          {label}
          {warning && (
            <span style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 8,
              background: isOver ? '#fef2f2' : '#fffbeb',
              color: isOver ? '#dc2626' : '#d97706',
              fontWeight: 600,
            }}>
              {warning}
            </span>
          )}
        </span>
        <span style={{ fontWeight: isOver ? 700 : 400, color: isOver ? '#dc2626' : '#64748b' }}>
          {Math.round(value)}{unit} / {max}{unit}
        </span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: isOver ? '#dc2626' : color,
          borderRadius: 4, transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

function HealthProfileCard({ healthProfile, dailyCalorieBudget, lockedIngredients }) {
  const [collapsed, setCollapsed] = useState(false);

  if (!healthProfile) return null;

  const bmiResult = (healthProfile.height && healthProfile.weight)
    ? calculateBMI(Number(healthProfile.weight), Number(healthProfile.height))
    : null;
  const bmiStyle = bmiResult ? bmiColors[bmiResult.level] : null;
  const conditions = healthProfile.conditions || [];
  const goal = healthProfile.goal;
  const goalInfo = goalLabels[goal];

  return (
    <div style={{
      background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: 24, overflow: 'hidden',
      border: '1px solid #e2e8f0',
    }}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setCollapsed(prev => !prev)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: 'none', cursor: 'pointer', borderBottom: collapsed ? 'none' : '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiFileText size={20} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Hồ sơ sức khỏe</span>
          {bmiResult && bmiStyle && (
            <span style={{
              padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
              background: bmiStyle.bg, color: bmiStyle.text,
            }}>
              BMI {bmiResult.bmi} — {bmiStyle.label}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 12, color: '#94a3b8', transition: 'transform 0.2s',
          transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>
          ▲
        </span>
      </button>

      {/* Body — collapsible */}
      <div style={{
        maxHeight: collapsed ? 0 : 500,
        opacity: collapsed ? 0 : 1,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease, opacity 0.3s ease',
        padding: collapsed ? '0 20px' : '16px 20px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {/* BMI */}
          {bmiResult && bmiStyle && (
            <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Chỉ số BMI</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: bmiStyle.text }}>{bmiResult.bmi}</div>
              <div style={{ fontSize: 12, color: bmiStyle.text, fontWeight: 500 }}>{bmiResult.classification}</div>
            </div>
          )}

          {/* Mục tiêu */}
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Mục tiêu</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>
              {goalInfo ? <>{goalInfo.icon} {goalInfo.label}</> : 'Chưa chọn'}
            </div>
            <div style={{ fontSize: 12, color: '#22C55E', fontWeight: 500 }}>{dailyCalorieBudget} kcal/ngày</div>
          </div>
        </div>

        {/* Bệnh lý */}
        {conditions.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Bệnh lý nền</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {conditions.map(c => {
                // Filter out BMI-derived labels like "Thừa cân", "Béo phì"
                const label = conditionLabels[c] || c;
                return (
                  <span key={c} style={{
                    padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                    background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa',
                  }}>
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Nguyên liệu hạn chế */}
        {lockedIngredients.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
              Nguyên liệu bị hạn chế ({lockedIngredients.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {lockedIngredients.slice(0, 8).map(ing => (
                <span key={ing} style={{
                  padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500,
                  background: '#fef2f2', color: '#dc2626',
                }}>
                  <FiLock size={12} /> {ing}
                </span>
              ))}
              {lockedIngredients.length > 8 && (
                <span style={{
                  padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500,
                  background: '#f1f5f9', color: '#64748b',
                }}>
                  +{lockedIngredients.length - 8} khác
                </span>
              )}
            </div>
          </div>
        )}
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
  const dialog = useDialog();
  const navigate = useNavigate();
  const {
    entries, loading, totalMacros, selectedDate,
    setSelectedDate, deleteEntry,
  } = useNutritionDiary();
  const { dailyCalorieBudget, dailyTargets, healthProfile, lockedIngredients } = useHealthProfile();

  const budget = dailyTargets?.calories || dailyCalorieBudget || 2000;
  const calPct = budget > 0 ? Math.min(100, (totalMacros.calories / budget) * 100) : 0;

  const conditions = healthProfile?.conditions || [];
  const hasDiabetes = conditions.includes('diabetes');
  const hasHypertension = conditions.includes('hypertension');
  const hasHeartDisease = conditions.includes('heartDisease');

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
    const ok = await dialog.confirm({ title: 'Xóa mục?', message: 'Xóa mục này?', confirmLabel: 'Xóa', danger: true });
    if (!ok) return;
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
          {/* Health Profile Card */}
          <HealthProfileEditor />

          {/* Calorie & Macro Summary */}
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

            <MacroBar label="Carbohydrate" value={totalMacros.carbs} max={dailyTargets?.carbs || Math.round(budget * 0.5 / 4)} color="#3b82f6" />
            <MacroBar label="Protein" value={totalMacros.protein} max={dailyTargets?.protein || Math.round(budget * 0.2 / 4)} color="#ef4444" />
            <MacroBar label="Chất béo" value={totalMacros.fat} max={dailyTargets?.fat || Math.round(budget * 0.3 / 9)} color="#f59e0b" />

            {/* Divider before dietary restriction bars */}
            <div style={{
              height: 1, background: '#e2e8f0', margin: '16px 0',
            }} />

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

            <MacroBar
              label="Đường"
              value={totalMacros.sugar}
              max={dailyTargets?.sugarLimit || 50}
              color="#a855f7"
              icon={<FiZap size={14} />}
              warning={hasDiabetes ? 'Tiểu đường' : null}
            />
            <MacroBar
              label="Muối"
              value={totalMacros.sodium}
              max={dailyTargets?.saltLimit || 5}
              color="#06b6d4"
              unit="g"
              icon={<FiDroplet size={14} />}
              warning={(hasHypertension || hasHeartDisease) ? 'Huyết áp' : null}
            />
            <MacroBar
              label="Cholesterol"
              value={totalMacros.cholesterol || 0}
              max={300}
              color="#8b5cf6"
              unit="mg"
              icon={<FiHeart size={14} />}
              warning={hasHeartDisease ? 'Tim mạch' : null}
            />
          </div>

          {entries.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: 60, background: 'white', borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, color: '#94a3b8' }}><FiFileText size={48} /></div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>Chưa có bữa ăn nào</h3>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                Hôm nay bạn chưa ghi lại bữa ăn nào. Hãy khám phá các món ăn!
              </p>
              <button
                type="button"
                onClick={() => navigate('/meal-suggestions')}
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
                            <FiTrash2 size={16} />
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

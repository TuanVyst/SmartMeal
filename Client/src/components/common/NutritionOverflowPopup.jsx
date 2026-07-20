import { useState, useEffect, useMemo } from 'react';
import { predictNutritionAfterAdd } from '../../utils/nutritionPredictor';

/**
 * NutritionOverflowPopup
 * Popup hiển thị khi thêm món sẽ vượt mục tiêu dinh dưỡng ngày.
 *
 * Props:
 *   recipe         — object recipe (cần recipe.nutrition)
 *   servings       — số khẩu phần ban đầu
 *   todayTotals    — { calories, protein, carbs, fat, sugar, sodium, cholesterol, fiber }
 *   dailyGoal      — { calories, protein, carbs, fat, sugar, sodium, cholesterol, fiber }
 *   onCancel       — () => void
 *   onConfirm      — (finalServings) => void — thêm vào nhật ký với servings đã chọn
 */
export default function NutritionOverflowPopup({
  recipe,
  servings: initialServings = 1,
  todayTotals = {},
  dailyGoal = {},
  onCancel,
  onConfirm,
}) {
  const [servings, setServings] = useState(initialServings);
  const [adjusting, setAdjusting] = useState(false);

  // Khóa scroll nền khi popup mở
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const recipeName = recipe?.title || recipe?.name || 'Món ăn';
  const recipeNutrition = recipe?.nutrition || {};

  const prediction = useMemo(() =>
    predictNutritionAfterAdd(todayTotals, recipeNutrition, servings, dailyGoal),
    [todayTotals, recipeNutrition, servings, dailyGoal]
  );

  const { overflowFields, hasOverflow } = prediction;

  const handleServingsChange = (delta) => {
    setServings(prev => Math.max(0.5, Math.min(10, parseFloat((prev + delta).toFixed(1)))));
  };

  const handleConfirm = () => {
    onConfirm?.(servings);
  };

  return (
    <div style={overlayStyle}>
      <div onClick={onCancel} style={backdropStyle} />
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 36 }}>⚠️</span>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#d97706', textAlign: 'center', marginBottom: 4 }}>
          Vượt mục tiêu dinh dưỡng hôm nay
        </h3>
        <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 16 }}>
          Sau khi thêm <strong style={{ color: '#1e293b' }}>{recipeName}</strong> ({servings} khẩu phần), bạn sẽ vượt:
        </p>

        {/* Overflow fields */}
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d',
          borderRadius: 10, padding: '10px 14px', marginBottom: 16,
        }}>
          {overflowFields.map(field => (
            <div key={field.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 8, marginBottom: 8,
              borderBottom: '1px solid #fef3c7',
            }}>
              <div style={{ fontSize: 13, color: '#475569', fontWeight: 500, minWidth: 100 }}>
                {field.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {field.current}{field.unit}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>→</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: field.overflow > 0 ? '#dc2626' : '#16a34a',
                }}>
                  {field.projected}{field.unit}
                </span>
                {field.overflow > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#dc2626',
                    background: '#fef2f2', padding: '1px 6px', borderRadius: 8,
                  }}>
                    +{field.overflow}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>
                / {field.goal}{field.unit}
              </div>
            </div>
          ))}
        </div>

        {/* Servings adjuster (inline khi click "Điều chỉnh khẩu phần") */}
        {adjusting && (
          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: 10, padding: '12px 14px', marginBottom: 16,
          }}>
            <p style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 10 }}>
              Điều chỉnh khẩu phần:
            </p>

            {/* Servings stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => handleServingsChange(-0.5)}
                style={stepBtnStyle}
              >−</button>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', minWidth: 40, textAlign: 'center' }}>
                {servings}
              </span>
              <button
                type="button"
                onClick={() => handleServingsChange(0.5)}
                style={stepBtnStyle}
              >+</button>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>khẩu phần</span>
            </div>

            {/* Mini nutrition preview */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6,
            }}>
              {[
                { label: 'Calo', key: 'calories', unit: 'kcal', color: '#16a34a' },
                { label: 'Protein', key: 'protein', unit: 'g', color: '#2563eb' },
                { label: 'Carb', key: 'carbs', unit: 'g', color: '#7c3aed' },
                { label: 'Fat', key: 'fat', unit: 'g', color: '#d97706' },
              ].map(m => {
                const projVal = prediction.projected[m.key] || 0;
                const goalVal = dailyGoal[m.key] || 0;
                const over = goalVal > 0 && projVal > goalVal;
                return (
                  <div key={m.key} style={{
                    background: over ? '#fef2f2' : '#f8fafc',
                    borderRadius: 8, padding: '6px 4px', textAlign: 'center',
                    border: `1px solid ${over ? '#fca5a5' : '#e2e8f0'}`,
                  }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{m.label}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: over ? '#dc2626' : m.color,
                    }}>
                      {Math.round(projVal)}<span style={{ fontSize: 9, fontWeight: 400 }}>{m.unit}</span>
                    </div>
                    {over && (
                      <div style={{ fontSize: 9, color: '#dc2626', fontWeight: 600 }}>
                        Vượt!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!hasOverflow && (
              <p style={{ fontSize: 11, color: '#16a34a', textAlign: 'center', marginTop: 8, fontWeight: 600 }}>
                ✅ Với {servings} khẩu phần, bạn không vượt mục tiêu nữa!
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!adjusting ? (
            <>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={onCancel}
                  style={cancelBtnStyle}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={() => setAdjusting(true)}
                  style={adjustBtnStyle}
                >
                  Điều chỉnh khẩu phần
                </button>
              </div>
              <button
                type="button"
                onClick={handleConfirm}
                style={confirmBtnStyle}
              >
                Vẫn thêm ({servings} khẩu phần)
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={onCancel}
                style={cancelBtnStyle}
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  ...confirmBtnStyle,
                  flex: 1,
                  background: hasOverflow ? '#d97706' : '#16a34a',
                  borderColor: hasOverflow ? '#b45309' : '#15803d',
                }}
              >
                {hasOverflow ? `Vẫn thêm (${servings} khẩu phần)` : `Thêm ${servings} khẩu phần`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 10200,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 16,
};

const backdropStyle = {
  position: 'absolute', inset: 0,
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(4px)',
};

const modalStyle = {
  position: 'relative',
  background: 'white',
  borderRadius: 16,
  width: '100%',
  maxWidth: 440,
  maxHeight: '90vh',
  overflowY: 'auto',
  padding: '24px 20px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  animation: 'scaleIn 0.2s ease',
};

const stepBtnStyle = {
  width: 36, height: 36,
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: 'white', fontSize: 20, fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#475569', transition: 'all 0.15s',
};

const cancelBtnStyle = {
  flex: 1, padding: '10px', border: '2px solid #e2e8f0', borderRadius: 10,
  background: 'white', color: '#475569',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const adjustBtnStyle = {
  flex: 2, padding: '10px', border: '2px solid #3b82f6', borderRadius: 10,
  background: '#eff6ff', color: '#2563eb',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const confirmBtnStyle = {
  width: '100%', padding: '10px', border: '2px solid #d97706', borderRadius: 10,
  background: '#d97706', color: 'white',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

import { useReducer, useMemo, useState } from 'react';
import { calculateBMI } from '../../utils/bmiCalculator';
import { getLockedIngredientsForProfile, getDailyCalorieBudget } from '../../utils/healthRules';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { FiTrendingDown, FiActivity, FiMinimize2, FiHeart, FiDroplet, FiLock } from 'react-icons/fi';

const TOTAL_STEPS = 5;

const initialState = {
  step: 1,
  formData: {
    height: '', weight: '', age: '', gender: '',
    conditions: [], allergies: [], goal: '',
  },
  error: '',
  submitting: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, formData: { ...state.formData, [action.field]: action.value }, error: '' };
    case 'TOGGLE_CONDITION': {
      const { conditions } = state.formData;
      let next;
      if (action.value === 'none') {
        next = [];
      } else {
        const noNone = conditions.filter(c => c !== 'none');
        next = noNone.includes(action.value)
          ? noNone.filter(c => c !== action.value)
          : [...noNone, action.value];
      }
      return { ...state, formData: { ...state.formData, conditions: next }, error: '' };
    }
    case 'TOGGLE_ALLERGY': {
      const { allergies } = state.formData;
      const next = allergies.includes(action.value)
        ? allergies.filter(a => a !== action.value)
        : [...allergies, action.value];
      return { ...state, formData: { ...state.formData, allergies: next }, error: '' };
    }
    case 'SET_GOAL':
      return { ...state, formData: { ...state.formData, goal: action.value }, error: '' };
    case 'NEXT':
      return state.step < TOTAL_STEPS ? { ...state, step: state.step + 1, error: '' } : state;
    case 'BACK':
      return state.step > 1 ? { ...state, step: state.step - 1, error: '' } : state;
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value };
    default:
      return state;
  }
}

// Remove manual obesity checkbox. BMI will be calculated automatically from height/weight.
const conditionsList = [
  { value: 'diabetes', label: 'Tiểu đường type 2' },
  { value: 'hypertension', label: 'Huyết áp cao' },
  { value: 'cholesterol', label: 'Cholesterol cao' },
  { value: 'heartDisease', label: 'Bệnh tim mạch' },
  { value: 'gerd', label: 'Dạ dày / Trào ngược axit' },
  { value: 'gout', label: 'Gout' },
  { value: 'none', label: 'Không có vấn đề gì' },
];

const allergyTags = ['Gluten', 'Lactose', 'Hải sản', 'Đậu phộng', 'Trứng', 'Đậu nành', 'Hạt cây', 'Fructose'];

const goalCards = [
  { value: 'lose', icon: <FiTrendingDown size={28} />, label: 'Giảm cân', desc: 'Giảm mỡ và kiểm soát cân nặng' },
  { value: 'gain', icon: <FiActivity size={28} />, label: 'Tăng cơ', desc: 'Xây dựng cơ bắp và sức mạnh' },
  { value: 'maintain', icon: <FiMinimize2 size={28} />, label: 'Duy trì', desc: 'Giữ vóc dáng hiện tại' },
  { value: 'heart', icon: <FiHeart size={28} />, label: 'Cải thiện tim mạch', desc: 'Tốt cho sức khoẻ tim' },
  { value: 'diabetes', icon: <FiDroplet size={28} />, label: 'Kiểm soát đường huyết', desc: 'Ổn định đường trong máu' },
];

const bmiColors = {
  underweight: { bg: '#dbeafe', text: '#2563eb', label: 'Thiếu cân' },
  normal: { bg: '#dcfce7', text: '#16a34a', label: 'Bình thường' },
  overweight: { bg: '#ffedd5', text: '#ea580c', label: 'Thừa cân' },
  obese: { bg: '#fef2f2', text: '#dc2626', label: 'Béo phì' },
};

function validateStep(step, formData) {
  switch (step) {
    case 1: {
      if (!formData.height || !formData.weight || !formData.age || !formData.gender)
        return 'Vui lòng điền đầy đủ thông tin';
      if (isNaN(formData.height) || Number(formData.height) <= 0) return 'Chiều cao không hợp lệ';
      if (isNaN(formData.weight) || Number(formData.weight) <= 0) return 'Cân nặng không hợp lệ';
      if (isNaN(formData.age) || Number(formData.age) <= 0 || Number(formData.age) > 150) return 'Tuổi không hợp lệ';
      return '';
    }
    case 4:
      if (!formData.goal) return 'Vui lòng chọn mục tiêu dinh dưỡng';
      return '';
    default:
      return '';
  }
}

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, justifyContent: 'center' }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 600, transition: 'all 0.3s',
            background: i + 1 <= current ? '#22C55E' : '#e2e8f0',
            color: i + 1 <= current ? 'white' : '#94a3b8',
          }}>
            {i + 1}
          </div>
          {i < TOTAL_STEPS - 1 && (
            <div style={{
              width: 40, height: 3, borderRadius: 2, transition: 'all 0.3s',
              background: i + 1 < current ? '#22C55E' : '#e2e8f0',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder, suffix }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
            fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#22C55E'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#94a3b8' }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HealthSurveyModal({ onComplete, mode = 'modal' }) {
  const { completeSurvey } = useHealthProfile();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, formData, error, submitting } = state;
  const { height, weight, age, gender, conditions, allergies, goal } = formData;
  const [customInput, setCustomInput] = useState('');

  const bmiResult = useMemo(() => {
    if (height && weight && Number(height) > 0 && Number(weight) > 0) {
      return calculateBMI(Number(weight), Number(height));
    }
    return null;
  }, [height, weight]);

  const summaryBudget = useMemo(() => {
    if (!bmiResult) return 2000;
    const g = ['lose', 'maintain', 'gain'].includes(goal) ? goal : 'maintain';
    return getDailyCalorieBudget(bmiResult.level, g);
  }, [bmiResult, goal]);

  const summaryLocked = useMemo(() => {
    return getLockedIngredientsForProfile(conditions);
  }, [conditions]);

  const handleNext = () => {
    const err = validateStep(step, formData);
    if (err) { dispatch({ type: 'SET_ERROR', value: err }); return; }
    dispatch({ type: 'NEXT' });
  };

  const handleSubmit = async () => {
    dispatch({ type: 'SET_SUBMITTING', value: true });
    dispatch({ type: 'SET_ERROR', value: '' });
    try {
      // Auto-add BMI-derived condition (e.g., Thiếu cân / Thừa cân / Béo phì) instead of manual checkbox
      const inferred = bmiResult ? (
        bmiResult.level === 'underweight' ? 'Thiếu cân' :
        bmiResult.level === 'overweight' ? 'Thừa cân' :
        bmiResult.level === 'obese' ? 'Béo phì' : null
      ) : null;

      const nextConditions = Array.isArray(conditions) ? [...conditions] : [];
      // remove 'none' if present
      const filtered = nextConditions.filter(c => c !== 'none');
      if (inferred && !filtered.includes(inferred)) filtered.push(inferred);

      const payload = {
        height: Number(height), weight: Number(weight), age: Number(age),
        gender, conditions: filtered, allergies, goal,
        bmiLevel: bmiResult?.level || 'normal',
      };
      const result = await completeSurvey(payload);
      if (result.success) {
        onComplete?.(result);
      } else {
        dispatch({ type: 'SET_ERROR', value: result.message || 'Có lỗi xảy ra, vui lòng thử lại' });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', value: err.message || 'Có lỗi xảy ra, vui lòng thử lại' });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', value: false });
    }
  };

  const handleAddCustomAllergy = () => {
    const val = customInput.trim();
    if (!val || allergies.includes(val)) return;
    dispatch({ type: 'TOGGLE_ALLERGY', value: val });
    setCustomInput('');
  };

  const stepTitles = ['Thông tin cơ bản', 'Tình trạng sức khoẻ', 'Dị ứng & Không dung nạp', 'Mục tiêu dinh dưỡng', 'Tổng kết'];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
              Thông tin cơ bản
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Nhập thông tin để chúng tôi tính toán chỉ số sức khoẻ của bạn
            </p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <InputField label="Chiều cao" value={height} onChange={v => dispatch({ type: 'SET_FIELD', field: 'height', value: v })} type="number" placeholder="170" suffix="cm" />
              <InputField label="Cân nặng" value={weight} onChange={v => dispatch({ type: 'SET_FIELD', field: 'weight', value: v })} type="number" placeholder="65" suffix="kg" />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <InputField label="Tuổi" value={age} onChange={v => dispatch({ type: 'SET_FIELD', field: 'age', value: v })} type="number" placeholder="25" suffix="tuổi" />
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Giới tính</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Nam', 'Nữ', 'Khác'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_FIELD', field: 'gender', value: g })}
                      style={{
                        flex: 1, padding: '10px', border: `2px solid ${gender === g ? '#22C55E' : '#e2e8f0'}`,
                        borderRadius: 8, background: gender === g ? '#f0fdf4' : 'white',
                        color: gender === g ? '#16a34a' : '#475569', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {bmiResult && (
              <div style={{
                textAlign: 'center', padding: 16, borderRadius: 12, marginTop: 8,
                background: bmiStyle.bg,
              }}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Chỉ số BMI của bạn</p>
                <p style={{ fontSize: 32, fontWeight: 700, color: bmiStyle.text }}>{bmiResult.bmi}</p>
                <span style={{
                  display: 'inline-block', padding: '4px 16px', borderRadius: 20,
                  background: bmiStyle.bg, color: bmiStyle.text, fontSize: 14, fontWeight: 600,
                  marginTop: 4,
                }}>
                  {bmiStyle.label}
                </span>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
              Tình trạng sức khoẻ
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Chọn tình trạng sức khoẻ của bạn (nếu có)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {conditionsList.map(c => {
                const isSelected = c.value === 'none' ? conditions.length === 0 : conditions.includes(c.value);
                return (
                  <label
                    key={c.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                      borderRadius: 10, border: `2px solid ${isSelected ? '#22C55E' : '#e2e8f0'}`,
                      background: isSelected ? '#f0fdf4' : 'white', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => dispatch({ type: 'TOGGLE_CONDITION', value: c.value })}
                      style={{ width: 18, height: 18, accentColor: '#22C55E' }}
                    />
                    <span style={{ fontSize: 14, color: '#1E293B', fontWeight: isSelected ? 600 : 400 }}>{c.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
              Dị ứng & Không dung nạp
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Chọn thực phẩm bạn bị dị ứng hoặc không dung nạp
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {allergyTags.map(tag => {
                const selected = allergies.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => dispatch({ type: 'TOGGLE_ALLERGY', value: tag })}
                    style={{
                      padding: '8px 16px', borderRadius: 20, border: `2px solid ${selected ? '#ef4444' : '#e2e8f0'}`,
                      background: selected ? '#fef2f2' : 'transparent',
                      color: selected ? '#dc2626' : '#475569', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomAllergy(); } }}
                placeholder="Thêm nguyên liệu khác..."
                style={{
                  flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8,
                  fontSize: 14, outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#22C55E'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button
                type="button"
                onClick={handleAddCustomAllergy}
                style={{
                  padding: '10px 20px', background: '#22C55E', color: 'white', border: 'none',
                  borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                Thêm
              </button>
            </div>
            {allergies.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>Đã chọn ({allergies.length}):</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {allergies.map(a => (
                    <span key={a} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', background: '#fef2f2', color: '#dc2626',
                      borderRadius: 16, fontSize: 12, fontWeight: 500,
                    }}>
                      {a}
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_ALLERGY', value: a })}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
              Mục tiêu dinh dưỡng
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Chọn mục tiêu chính của bạn
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {goalCards.map(card => (
                <button
                  key={card.value}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_GOAL', value: card.value })}
                  style={{
                    padding: 20, borderRadius: 12, border: `2px solid ${goal === card.value ? '#22C55E' : '#e2e8f0'}`,
                    background: goal === card.value ? '#f0fdf4' : 'white', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ marginBottom: 8 }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>{card.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{card.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>
              Tổng kết
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Kiểm tra lại thông tin trước khi bắt đầu
            </p>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Chỉ số BMI</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                  {bmiResult ? `${bmiResult.bmi} - ${bmiResult.classification}` : 'Chưa tính'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Mục tiêu</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                  {goalCards.find(c => c.value === goal)?.label || 'Chưa chọn'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Khuyến nghị calo/ngày</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#22C55E' }}>
                  {summaryBudget} kcal
                </span>
              </div>
              {conditions.length > 0 && (
                <div>
                  <span style={{ fontSize: 14, color: '#64748b', display: 'block', marginBottom: 8 }}>
                    Nguyên liệu bị khoá ({summaryLocked.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {summaryLocked.map(ing => (
                      <span key={ing} style={{
                        padding: '4px 10px', background: '#fef2f2', color: '#dc2626',
                        borderRadius: 12, fontSize: 12, fontWeight: 500,
                      }}>
                        <FiLock size={12} /> {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {allergies.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 14, color: '#64748b', display: 'block', marginBottom: 8 }}>
                    Dị ứng ({allergies.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {allergies.map(a => (
                      <span key={a} style={{
                        padding: '4px 10px', background: '#fef2f2', color: '#dc2626',
                        borderRadius: 12, fontSize: 12, fontWeight: 500,
                      }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const bmiStyle = bmiResult ? bmiColors[bmiResult.level] : null;

  if (mode === 'page') {
    return (
      <div style={{
        minHeight: '100vh', background: '#f8fafc', padding: '40px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: 'white', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          width: '100%', maxWidth: 560, padding: 32,
        }}>
          <StepIndicator current={step} />

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{
              display: 'inline-block', padding: '4px 14px', background: '#f0fdf4',
              color: '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 600,
            }}>
              Bước {step}/{TOTAL_STEPS} - {stepTitles[step - 1]}
            </span>
          </div>

          {renderStep()}

          {error && (
            <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', marginTop: 28, gap: 12 }}>
            {mode === 'page' && step === 1 && (
              <button
                type="button"
                onClick={() => window.history.back()}
                style={{
                  padding: '12px 24px', border: '2px solid #e2e8f0', borderRadius: 10,
                  background: 'white', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                ← Quay lại
              </button>
            )}
            {step > 1 && (
              <button
                type="button"
                onClick={() => dispatch({ type: 'BACK' })}
                disabled={submitting}
                style={{
                  padding: '12px 24px', border: '2px solid #e2e8f0', borderRadius: 10,
                  background: 'white', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ← Quay lại
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '12px 32px', border: 'none', borderRadius: 10,
                  background: '#22C55E', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = '#16A34A'}
                onMouseLeave={e => e.target.style.background = '#22C55E'}
              >
                Tiếp theo →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  padding: '12px 32px', border: 'none', borderRadius: 10,
                  background: submitting ? '#94a3b8' : '#22C55E', color: 'white',
                  fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {submitting ? 'Đang xử lý...' : 'Bắt đầu hành trình →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        width: '100%', maxWidth: 560, padding: 32, position: 'relative',
      }}>
        <StepIndicator current={step} />

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            display: 'inline-block', padding: '4px 14px', background: '#f0fdf4',
            color: '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>
            Bước {step}/{TOTAL_STEPS} - {stepTitles[step - 1]}
          </span>
        </div>

        {renderStep()}

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 16 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: step === 1 ? 'flex-end' : 'space-between', marginTop: 28, gap: 12 }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'BACK' })}
              disabled={submitting}
              style={{
                padding: '12px 24px', border: '2px solid #e2e8f0', borderRadius: 10,
                background: 'white', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ← Quay lại
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '12px 32px', border: 'none', borderRadius: 10,
                background: '#22C55E', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = '#16A34A'}
              onMouseLeave={e => e.target.style.background = '#22C55E'}
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '12px 32px', border: 'none', borderRadius: 10,
                background: submitting ? '#94a3b8' : '#22C55E', color: 'white',
                fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? 'Đang xử lý...' : 'Bắt đầu hành trình →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useReducer, useMemo } from 'react';
import { calculateBMI } from '../../utils/bmiCalculator';
import { getLockedIngredientsForProfile, getDailyCalorieBudget } from '../../utils/healthRules';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { FiTrendingDown, FiActivity, FiMinimize2, FiHeart, FiDroplet, FiLock } from 'react-icons/fi';

const TOTAL_STEPS = 5;

const initialState = {
  step: 1,
  formData: {
    height: '', weight: '', age: '', gender: '',
    activityLevel: '',
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
    case 2:
      if (!formData.activityLevel) return 'Vui lòng chọn mức độ vận động của bạn';
      return '';
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

function InputField({ label, value, onChange, type = 'text', placeholder, suffix, min = "1" }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          min={type === 'number' ? min : undefined}
          value={value}
          onChange={e => {
            let val = e.target.value;
            if (type === 'number' && Number(val) < 0) {
              val = '1';
            }
            onChange(val);
          }}
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

  const bmiResult = useMemo(() => {
    if (height && weight && Number(height) > 0 && Number(weight) > 0) {
      return calculateBMI(Number(weight), Number(height));
    }
    return null;
  }, [height, weight]);

  const summaryBudget = useMemo(() => {
    if (!bmiResult) return { calories: 2000, bmr: 0, tdee: 0 };
    const mockProfile = {
      weight: Number(formData.weight),
      height: Number(formData.height),
      gender: formData.gender,
      activityLevel: formData.activityLevel || 'sedentary',
      goal: formData.goal || 'maintain',
      conditions: formData.conditions || [],
    };
    return getDailyCalorieBudget(mockProfile);
  }, [bmiResult, formData.goal, formData.activityLevel, formData.weight, formData.height, formData.gender]);

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
      const inferred = bmiResult ? (
        bmiResult.level === 'underweight' ? 'Thiếu cân' :
        bmiResult.level === 'overweight' ? 'Thừa cân' :
        bmiResult.level === 'obese' ? 'Béo phì' : null
      ) : null;

      const nextConditions = Array.isArray(conditions) ? [...conditions] : [];
      const filtered = nextConditions.filter(c => c !== 'none');
      if (inferred && !filtered.includes(inferred)) filtered.push(inferred);

      const payload = {
        height: Number(height), weight: Number(weight), age: Number(age),
        gender, conditions: filtered, allergies, goal,
        bmiLevel: bmiResult?.level || 'normal',
        activityLevel: formData.activityLevel || 'sedentary',
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


  const stepTitles = ['Thông tin cơ bản', 'Mức độ vận động', 'Tình trạng sức khoẻ', 'Mục tiêu dinh dưỡng', 'Tổng kết'];

  const ACTIVITY_OPTIONS = [
    {
      value: 'sedentary', emoji: '🪑', label: 'Chủ yếu ngồi hoặc ít vận động',
      factor: 1.2,
      examples: ['Làm việc văn phòng', 'Học tập', 'Ít tập thể dục', 'Đi bộ rất ít']
    },
    {
      value: 'light', emoji: '🚶', label: 'Có vận động nhẹ',
      factor: 1.375,
      examples: ['Đi bộ hằng ngày', 'Tập 1–3 buổi/tuần', 'Thường xuyên di chuyển']
    },
    {
      value: 'moderate', emoji: '🏃', label: 'Vận động khá thường xuyên',
      factor: 1.55,
      examples: ['Gym / chạy bộ', 'Thể thao 3–5 buổi/tuần']
    },
    {
      value: 'active', emoji: '💪', label: 'Vận động nhiều',
      factor: 1.725,
      examples: ['Lao động tay chân', 'Tập gần như mỗi ngày', 'Thể thao cường độ cao']
    },
    {
      value: 'very_active', emoji: '🔥', label: 'Rất năng động',
      factor: 1.9,
      examples: ['Vận động viên', 'Lao động nặng', 'Tập luyện cường độ rất cao']
    },
  ];

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
                  {['Nam', 'Nữ'].map(g => (
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
              Mức độ vận động hằng ngày
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>
              Điều này giúp SmartMeal ước tính chính xác lượng năng lượng cơ thể tiêu hao mỗi ngày.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACTIVITY_OPTIONS.map(opt => {
                const isSelected = formData.activityLevel === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_FIELD', field: 'activityLevel', value: opt.value })}
                    style={{
                      padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${isSelected ? '#22C55E' : '#e2e8f0'}`,
                      background: isSelected ? '#f0fdf4' : 'white',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 22 }}>{opt.emoji}</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: isSelected ? '#16a34a' : '#1E293B' }}>
                        {opt.label}
                      </span>
                      <span style={{
                        marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 10,
                        background: isSelected ? '#dcfce7' : '#f1f5f9',
                        color: isSelected ? '#15803d' : '#64748b',
                      }}>
                        ×{opt.factor}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 32 }}>
                      {opt.examples.map(ex => (
                        <span key={ex} style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 8,
                          background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
                        }}>{ex}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
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
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>Tổng kết</h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>Kiểm tra lại thông tin trước khi bắt đầu</p>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Chỉ số BMI</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                  {bmiResult ? `${bmiResult.bmi} - ${bmiResult.classification}` : 'Chưa tính'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Mức độ vận động</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                  {ACTIVITY_OPTIONS.find(a => a.value === formData.activityLevel)?.emoji} {ACTIVITY_OPTIONS.find(a => a.value === formData.activityLevel)?.label || 'Chưa chọn'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Mục tiêu</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                  {goalCards.find(c => c.value === goal)?.label || 'Chưa chọn'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>TDEE (tiêu hao/ngày)</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>{summaryBudget.tdee} kcal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Mục tiêu calo/ngày</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#22C55E' }}>{summaryBudget.calories} kcal</span>
              </div>
              {summaryLocked.length > 0 && (
                <div>
                  <span style={{ fontSize: 14, color: '#64748b', display: 'block', marginBottom: 8 }}>Nguyên liệu bị khoá ({summaryLocked.length})</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {summaryLocked.map(ing => (
                      <span key={ing} style={{ padding: '4px 10px', background: '#fef2f2', color: '#dc2626', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>
                        <FiLock size={12} /> {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: 12, color: '#16a34a', margin: 0 }}>
                  💡 Bạn có thể cập nhật thông tin dị ứng thực phẩm trong <strong>Hồ sơ sức khoẻ</strong> sau khi hoàn thành.
                </p>
              </div>
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

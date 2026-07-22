import { useReducer, useMemo, useState } from 'react';
import { calculateBMI } from '../../utils/bmiCalculator';
import { getDailyCalorieBudget, getLockedIngredientsForProfile } from '../../utils/healthRules';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { useNavigate } from 'react-router-dom';
import { FiTrendingDown, FiActivity, FiMinimize2, FiArrowLeft } from 'react-icons/fi';
import SafetyValidation from './SafetyValidation';
import bgImage from '../../assets/dark_healthy_meal_party_bg.png';
import {
  SURVEY_DIET_TYPES,
  SURVEY_MEALS_PER_DAY,
  SURVEY_COOKING_TIMES
} from '../../utils/surveyUtils';

const TOTAL_STEPS = 7;

const initialState = {
  step: 1,
  formData: {
    height: '', weight: '', age: '', gender: '',
    goal: '', targetWeight: '',
    activityLevel: '',
    cookingTimeMinutes: 30,
    mealsPerDay: 3,
    dietType: 'normal'
  },
  error: '',
  submitting: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, formData: { ...state.formData, [action.field]: action.value }, error: '' };
    case 'TOGGLE_ARRAY_ITEM': {
      const array = state.formData[action.field] || [];
      const next = array.includes(action.value)
        ? array.filter(v => v !== action.value)
        : [...array, action.value];
      return { ...state, formData: { ...state.formData, [action.field]: next }, error: '' };
    }
    case 'NEXT':
      return state.step < TOTAL_STEPS ? { ...state, step: state.step + 1, error: '' } : state;
    case 'BACK':
      return state.step > 1 ? { ...state, step: state.step - 1, error: '' } : state;
    case 'SET_STEP':
      return { ...state, step: action.value, error: '' };
    case 'SET_ERROR':
      return { ...state, error: action.value };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value };
    default:
      return state;
  }
}

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

export default function OnboardingSurvey({ onComplete }) {
  const { completeSurvey } = useHealthProfile();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, formData, error, submitting } = state;
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);

  const bmiResult = useMemo(() => {
    if (formData.height && formData.weight && Number(formData.height) > 0 && Number(formData.weight) > 0) {
      return calculateBMI(Number(formData.weight), Number(formData.height));
    }
    return null;
  }, [formData.height, formData.weight]);

  const autoTargetDays = useMemo(() => {
    const w = Number(formData.weight);
    const tw = Number(formData.targetWeight);
    if ((formData.goal === 'lose' || formData.goal === 'gain') && w > 0 && tw > 0) {
      return Math.max(14, Math.ceil(Math.abs(tw - w) / 0.5) * 7);
    }
    return 84;
  }, [formData.weight, formData.targetWeight, formData.goal]);

  const effectiveTargetDays = autoTargetDays;

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.height || !formData.weight || !formData.age || !formData.gender) return 'Vui lòng điền đầy đủ thông tin';
        return '';
      case 2:
        if (!formData.goal) return 'Vui lòng chọn mục tiêu';
        if (formData.goal === 'lose' && (!formData.targetWeight || Number(formData.targetWeight) <= 0)) {
          return 'Vui lòng nhập cân nặng mục tiêu hợp lệ';
        }
        if (formData.goal === 'lose' && bmiResult?.level === 'underweight') {
          return 'Chỉ số BMI của bạn đang ở mức thiếu cân. Vui lòng không chọn giảm cân để đảm bảo sức khỏe.';
        }
        return '';
      case 3:
        if (!formData.activityLevel) return 'Vui lòng chọn mức độ vận động';
        return '';
      case 4:
        if (!formData.cookingTimeMinutes) return 'Vui lòng chọn thời gian nấu ăn';
        return '';
      default:
        return '';
    }
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { dispatch({ type: 'SET_ERROR', value: err }); return; }

    if (step === 3 && (formData.goal === 'lose' || formData.goal === 'gain')) {
      setShowSafetyCheck(true);
      return;
    }

    dispatch({ type: 'NEXT' });
  };

  const handleSafetyAccept = () => {
    setShowSafetyCheck(false);
    dispatch({ type: 'NEXT' });
  };

  const handleSafetyContinue = () => {
    setShowSafetyCheck(false);
    dispatch({ type: 'NEXT' });
  };

  const handleSubmit = async () => {
    dispatch({ type: 'SET_SUBMITTING', value: true });
    dispatch({ type: 'SET_ERROR', value: '' });
    try {
      const payload = {
        height: Number(formData.height), weight: Number(formData.weight), age: Number(formData.age),
        gender: formData.gender, conditions: [], allergies: [], 
        goal: formData.goal, bmiLevel: bmiResult?.level || 'normal', activityLevel: formData.activityLevel || 'sedentary',
        targetWeight: formData.targetWeight ? Number(formData.targetWeight) : null,
        targetDays: Number(effectiveTargetDays),
        cookingTimeMinutes: formData.cookingTimeMinutes,
        mealsPerDay: formData.mealsPerDay,
        dietType: formData.dietType
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>Thông tin cơ bản</h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>Cơ sở để cá nhân hóa hành trình của bạn</p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <InputField label="Chiều cao" value={formData.height} onChange={v => dispatch({ type: 'SET_FIELD', field: 'height', value: v })} type="number" placeholder="170" suffix="cm" />
              <InputField label="Cân nặng hiện tại" value={formData.weight} onChange={v => dispatch({ type: 'SET_FIELD', field: 'weight', value: v })} type="number" placeholder="65" suffix="kg" />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <InputField label="Tuổi" value={formData.age} onChange={v => dispatch({ type: 'SET_FIELD', field: 'age', value: v })} type="number" placeholder="25" suffix="tuổi" />
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#475569', marginBottom: 6 }}>Giới tính</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Nam', 'Nữ'].map(g => (
                    <button
                      key={g} type="button" onClick={() => dispatch({ type: 'SET_FIELD', field: 'gender', value: g })}
                      style={{
                        flex: 1, padding: '10px', border: `2px solid ${formData.gender === g ? '#22C55E' : '#e2e8f0'}`,
                        borderRadius: 8, background: formData.gender === g ? '#f0fdf4' : 'white',
                        color: formData.gender === g ? '#16a34a' : '#475569', fontSize: 14, fontWeight: 500, cursor: 'pointer'
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>Mục tiêu cân nặng</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
              {goalCards.map(card => (
                <button
                  key={card.value} type="button" onClick={() => dispatch({ type: 'SET_FIELD', field: 'goal', value: card.value })}
                  style={{
                    padding: 16, borderRadius: 12, border: `2px solid ${formData.goal === card.value ? '#22C55E' : '#e2e8f0'}`,
                    background: formData.goal === card.value ? '#f0fdf4' : 'white', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16
                  }}
                >
                  <div style={{ color: formData.goal === card.value ? '#16a34a' : '#94a3b8' }}>{card.icon}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', marginBottom: 2 }}>{card.label}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{card.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 24, marginTop: 20 }}>
            </div>
            {(formData.goal === 'lose' || formData.goal === 'gain') && (
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                <InputField 
                  label="Cân nặng mục tiêu" 
                  value={formData.targetWeight} 
                  onChange={v => dispatch({ type: 'SET_FIELD', field: 'targetWeight', value: v })} 
                  type="number" placeholder={formData.goal === 'lose' ? 'Ví dụ: 60' : 'Ví dụ: 80'} suffix="kg" 
                />
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>Vận động hằng ngày</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'sedentary', label: 'Ít vận động', desc: 'Làm việc văn phòng, ít đi lại' },
                { value: 'light', label: 'Vận động nhẹ', desc: 'Đi bộ, làm việc nhà nhẹ nhàng' },
                { value: 'moderate', label: 'Vận động vừa', desc: 'Tập thể dục 3-5 ngày/tuần' },
                { value: 'active', label: 'Vận động nhiều', desc: 'Chơi thể thao, lao động chân tay' },
              ].map(opt => (
                <button
                  key={opt.value} type="button" onClick={() => dispatch({ type: 'SET_FIELD', field: 'activityLevel', value: opt.value })}
                  style={{
                    padding: 16, borderRadius: 12, border: `2px solid ${formData.activityLevel === opt.value ? '#22C55E' : '#e2e8f0'}`,
                    background: formData.activityLevel === opt.value ? '#f0fdf4' : 'white', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>{opt.label}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
            {showSafetyCheck && (
              <SafetyValidation 
                  profile={{ 
                    ...formData, 
                    weight: Number(formData.weight), 
                    targetWeight: Number(formData.targetWeight), 
                    bmiLevel: bmiResult?.level,
                    targetDays: Number(effectiveTargetDays)
                  }} 
                onAccept={handleSafetyAccept}
                onContinue={handleSafetyContinue}
              />
            )}
          </div>
        );
      case 4:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>Sở thích nấu nướng</h3>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Thời gian nấu ăn mỗi bữa</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {SURVEY_COOKING_TIMES.map(opt => (
                  <button
                    key={opt.value} type="button" onClick={() => dispatch({ type: 'SET_FIELD', field: 'cookingTimeMinutes', value: opt.value })}
                    style={{
                      flex: 1, padding: '12px 8px', borderRadius: 8, border: `2px solid ${formData.cookingTimeMinutes === opt.value ? '#22C55E' : '#e2e8f0'}`,
                      background: formData.cookingTimeMinutes === opt.value ? '#f0fdf4' : 'white', cursor: 'pointer',
                      fontSize: 13, fontWeight: 500, color: formData.cookingTimeMinutes === opt.value ? '#16a34a' : '#475569'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>Thói quen ăn uống</h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>Bạn thường ăn bao nhiêu bữa mỗi ngày?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SURVEY_MEALS_PER_DAY.map(opt => (
                <button
                  key={opt.value} type="button" onClick={() => dispatch({ type: 'SET_FIELD', field: 'mealsPerDay', value: opt.value })}
                  style={{
                    padding: 16, borderRadius: 12, border: `2px solid ${formData.mealsPerDay === opt.value ? '#22C55E' : '#e2e8f0'}`,
                    background: formData.mealsPerDay === opt.value ? '#f0fdf4' : 'white', cursor: 'pointer', textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1E293B' }}>{opt.label} {opt.recommended && <span style={{ fontSize: 12, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 12, marginLeft: 8 }}>Khuyên dùng</span>}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>Chế độ ăn</h3>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24 }}>Lựa chọn phù hợp nhất với bạn</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {SURVEY_DIET_TYPES.map(opt => (
                <button
                  key={opt.value} type="button" onClick={() => dispatch({ type: 'SET_FIELD', field: 'dietType', value: opt.value })}
                  style={{
                    padding: 16, borderRadius: 12, border: `2px solid ${formData.dietType === opt.value ? '#22C55E' : '#e2e8f0'}`,
                    background: formData.dietType === opt.value ? '#f0fdf4' : 'white', cursor: 'pointer', textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{opt.emoji}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', marginBottom: 4 }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1E293B', marginBottom: 8, textAlign: 'center' }}>Hoàn tất</h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Tóm tắt hồ sơ:</div>
              <ul style={{ fontSize: 13, color: '#475569', paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                <li>Mục tiêu: <strong>{goalCards.find(c => c.value === formData.goal)?.label}</strong></li>
                <li>Năng lượng ước tính: <strong>~{(() => {
                  const days = Number(effectiveTargetDays);
                  return getDailyCalorieBudget({ ...formData, targetDays: days }).calories;
                })()} kcal/ngày</strong></li>
                <li>Chế độ: <strong>{SURVEY_DIET_TYPES.find(d => d.value === formData.dietType)?.label}</strong>, <strong>{formData.mealsPerDay} bữa/ngày</strong></li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      minHeight: '100vh', 
      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '40px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative'
    }}>
      <button 
        type="button" 
        onClick={() => navigate('/')} 
        style={{ 
          position: 'absolute', top: 20, left: 20, display: 'flex', alignItems: 'center', gap: 8, 
          padding: '10px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, 
          cursor: 'pointer', fontWeight: 600, color: '#475569', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          transition: 'all 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
        onMouseOut={e => e.currentTarget.style.background = 'white'}
      >
        <FiArrowLeft size={18} />
        Về trang chủ
      </button>

      <div style={{
        background: 'white', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        width: '100%', maxWidth: 560, padding: 32,
      }}>
        
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 2,
              background: i + 1 <= step ? '#22C55E' : '#e2e8f0',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {renderStep()}

        {error && (
          <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 16, background: '#fef2f2', padding: 8, borderRadius: 8 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
          {step === 1 ? (
            <button type="button" onClick={() => window.history.back()} style={{ padding: '12px 24px', border: '2px solid #e2e8f0', borderRadius: 10, background: 'white', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Bỏ qua
            </button>
          ) : (
            <button type="button" onClick={() => dispatch({ type: 'BACK' })} disabled={submitting || showSafetyCheck} style={{ padding: '12px 24px', border: '2px solid #e2e8f0', borderRadius: 10, background: 'white', color: '#475569', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: showSafetyCheck ? 0.5 : 1 }}>
              Quay lại
            </button>
          )}

          {!showSafetyCheck && (
            step < TOTAL_STEPS ? (
              <button type="button" onClick={handleNext} style={{ padding: '12px 32px', border: 'none', borderRadius: 10, background: '#22C55E', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Tiếp theo
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting} style={{ padding: '12px 32px', border: 'none', borderRadius: 10, background: submitting ? '#94a3b8' : '#22C55E', color: 'white', fontSize: 15, fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Đang lưu...' : 'Hoàn thành'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

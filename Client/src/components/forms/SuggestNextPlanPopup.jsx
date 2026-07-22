import { useState } from 'react';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { healthSurveyService } from '../../services/healthSurveyService';
import api from '../../services/api';
import { getTodayDateKey } from '../../utils/dateTime';
import { FiTrendingDown, FiTrendingUp, FiMinus, FiActivity, FiCalendar, FiX, FiSunrise, FiSun, FiMoon } from 'react-icons/fi';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Ít vận động', desc: 'Làm việc văn phòng, ít đi lại', factor: 1.2 },
  { value: 'light', label: 'Vận động nhẹ', desc: 'Đi bộ, làm việc nhà nhẹ nhàng', factor: 1.375 },
  { value: 'moderate', label: 'Vận động vừa', desc: 'Tập thể dục 3-5 ngày/tuần', factor: 1.55 },
  { value: 'active', label: 'Vận động nhiều', desc: 'Chơi thể thao, lao động chân tay', factor: 1.725 },
];

const MEAL_OPTIONS = [
  { value: 'breakfast', label: 'Sáng', icon: <FiSunrise size={18} /> },
  { value: 'lunch', label: 'Trưa', icon: <FiSun size={18} /> },
  { value: 'dinner', label: 'Tối', icon: <FiMoon size={18} /> },
];

export default function SuggestNextPlanPopup({ onClose }) {
  const { healthProfile } = useHealthProfile();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 0: Date + meals
  const [selectedDate, setSelectedDate] = useState(getTodayDateKey());
  const [selectedMeals, setSelectedMeals] = useState(['breakfast', 'lunch', 'dinner']);

  // Step 1: Weight goal
  const [goal, setGoal] = useState(healthProfile?.goal || 'maintain');
  const [targetWeight, setTargetWeight] = useState(healthProfile?.targetWeight || '');

  // Step 2: Activity
  const [activityLevel, setActivityLevel] = useState(healthProfile?.activityLevel || 'sedentary');

  const currentWeight = healthProfile?.weight || 0;
  const currentGoal = healthProfile?.goal || 'maintain';
  const currentActivity = healthProfile?.activityLevel || 'sedentary';

  const toggleMeal = (meal) => {
    setSelectedMeals(prev =>
      prev.includes(meal)
        ? prev.filter(m => m !== meal)
        : [...prev, meal]
    );
  };

  const isStep1Changed = goal !== currentGoal || (goal !== 'maintain' && targetWeight && Number(targetWeight) !== healthProfile?.targetWeight);
  const isStep2Changed = activityLevel !== currentActivity;

  const handleGenerate = async () => {
    if (selectedMeals.length === 0) {
      setError('Vui lòng chọn ít nhất một bữa ăn.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isStep1Changed || isStep2Changed) {
        const updateData = {};
        if (isStep1Changed) {
          updateData.goal = goal;
          if (goal !== 'maintain' && targetWeight) {
            updateData.targetWeight = Number(targetWeight);
            const currentW = healthProfile?.weight || 0;
            const diffKg = Math.abs(Number(targetWeight) - currentW);
            updateData.targetDays = Math.max(14, Math.ceil(diffKg / 0.5) * 7);
          }
        }
        if (isStep2Changed) {
          updateData.activityLevel = activityLevel;
        }
        await healthSurveyService.updateHealthProfile(updateData);
      }

      const mealsParam = selectedMeals.join(',');
      const res = await api.post(`/MealPlan/suggest-for-date?date=${selectedDate}&meals=${mealsParam}`);

      if (res.data.data) {
        onClose({ type: 'success', text: 'Đã tạo gợi ý thành công!' });
      }
    } catch (err) {
      console.error('Lỗi tạo thực đơn:', err);
      setError(err?.response?.data?.message || 'Không thể tạo thực đơn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // If no profile, show redirect screen
  if (!healthProfile || !healthProfile.height || !healthProfile.weight) {
    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-container" onClick={e => e.stopPropagation()}>
          <div className="popup-header">
            <h2>Tạo gợi ý bữa ăn</h2>
            <button className="popup-close" onClick={() => onClose(null)}><FiX size={22} /></button>
          </div>
          <div className="popup-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1E293B', marginBottom: 8 }}>
              Cần hoàn thành khảo sát sức khỏe
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
              Bạn cần hoàn thành bài khảo sát sức khỏe để hệ thống có thể gợi ý thực đơn phù hợp.
            </p>
            <button
              className="popup-btn-primary"
              style={{ maxWidth: 280, margin: '0 auto' }}
              onClick={() => { window.location.href = '/survey'; onClose(null); }}
            >
              Làm khảo sát ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay" onClick={() => onClose(null)}>
      <div className="popup-container" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Tạo gợi ý bữa ăn</h2>
          <button className="popup-close" onClick={() => onClose(null)}><FiX size={22} /></button>
        </div>

        <div className="popup-body">
          <div className="popup-step-dots">
            {[0, 1, 2].map(i => (
              <div key={i} className={`popup-step-dot ${step === i ? 'active' : ''}`} />
            ))}
          </div>

          {/* Step 0: Date + Meals */}
          {step === 0 && (
            <div>
              <h3 className="popup-section-title">
                <FiCalendar style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Chọn ngày và bữa ăn
              </h3>
              <p className="popup-section-desc">Chọn ngày và các bữa ăn bạn muốn gợi ý</p>

              <div className="popup-form-group">
                <label className="popup-label">Ngày</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={getTodayDateKey()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="popup-date-input"
                />
              </div>

              <div className="popup-form-group">
                <label className="popup-label">Bữa ăn</label>
                <div className="popup-meal-options">
                  {MEAL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`popup-meal-btn ${selectedMeals.includes(opt.value) ? 'active' : ''}`}
                      onClick={() => toggleMeal(opt.value)}
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="popup-error">{error}</div>}

              <div className="popup-actions">
                <button className="popup-btn-cancel" onClick={() => onClose(null)}>Hủy</button>
                <button
                  className="popup-btn-primary"
                  onClick={() => {
                    if (selectedMeals.length === 0) {
                      setError('Vui lòng chọn ít nhất một bữa ăn.');
                      return;
                    }
                    setError('');
                    setStep(1);
                  }}
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Weight goal */}
          {step === 1 && (
            <div>
              <h3 className="popup-section-title">Mục tiêu cân nặng</h3>
              <p className="popup-section-desc">Bạn có muốn thay đổi mục tiêu cân nặng không? Có thể bỏ qua để giữ nguyên.</p>

              <div className="popup-goal-options">
                {[
                  { value: 'lose', icon: <FiTrendingDown size={22} />, label: 'Giảm cân' },
                  { value: 'maintain', icon: <FiMinus size={22} />, label: 'Duy trì' },
                  { value: 'gain', icon: <FiTrendingUp size={22} />, label: 'Tăng cân' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    className={`popup-goal-btn ${goal === opt.value ? 'active' : ''}`}
                    onClick={() => setGoal(opt.value)}
                  >
                    <div className="popup-goal-icon">{opt.icon}</div>
                    <div className="popup-goal-label">{opt.label}</div>
                  </button>
                ))}
              </div>

              {goal !== 'maintain' && (
                <div className="popup-form-group">
                  <label className="popup-label">Cân nặng mục tiêu</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number"
                      value={targetWeight}
                      onChange={e => setTargetWeight(e.target.value)}
                      placeholder={currentWeight ? `Hiện tại: ${currentWeight}kg` : 'Nhập cân nặng mục tiêu'}
                      className="popup-text-input"
                    />
                    <span style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>kg</span>
                  </div>
                </div>
              )}

              <div className="popup-actions">
                <button className="popup-btn-cancel" onClick={() => setStep(0)}>← Quay lại</button>
                <button className="popup-btn-primary" onClick={() => setStep(2)}>
                  {isStep1Changed ? 'Tiếp tục' : 'Bỏ qua, dùng chỉ số hiện tại →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Activity level */}
          {step === 2 && (
            <div>
              <h3 className="popup-section-title">
                <FiActivity style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Mức độ vận động
              </h3>
              <p className="popup-section-desc">Chọn mức vận động phù hợp với bạn</p>

              <div className="popup-activity-options">
                {ACTIVITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`popup-activity-btn ${activityLevel === opt.value ? 'active' : ''}`}
                    onClick={() => setActivityLevel(opt.value)}
                  >
                    <div className="popup-activity-label">{opt.label}</div>
                    <div className="popup-activity-desc">{opt.desc}</div>
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="popup-summary">
                <div className="popup-summary-row">
                  <span>Ngày:</span>
                  <span className="popup-summary-val">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                <div className="popup-summary-row">
                  <span>Bữa ăn:</span>
                  <span className="popup-summary-val">{selectedMeals.map(m => MEAL_OPTIONS.find(o => o.value === m)?.label).join(', ')}</span>
                </div>
                <div className="popup-summary-row">
                  <span>Mục tiêu:</span>
                  <span className="popup-summary-val">
                    {goal === 'lose' ? 'Giảm cân' : goal === 'gain' ? 'Tăng cân' : 'Duy trì'}
                    {goal !== 'maintain' && targetWeight ? ` → ${targetWeight}kg` : ''}
                  </span>
                </div>
                <div className="popup-summary-row">
                  <span>Vận động:</span>
                  <span className="popup-summary-val">{ACTIVITY_OPTIONS.find(a => a.value === activityLevel)?.label || activityLevel}</span>
                </div>
              </div>

              {error && <div className="popup-error">{error}</div>}

              <div className="popup-actions">
                <button className="popup-btn-cancel" onClick={() => setStep(1)}>← Quay lại</button>
                <button className="popup-btn-primary popup-btn-generate" onClick={handleGenerate} disabled={loading}>
                  {loading ? '⏳ Đang tạo...' : '✨ Tạo thực đơn'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

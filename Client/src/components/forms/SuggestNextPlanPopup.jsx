import { useState, useMemo } from 'react';
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

const VIET_MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'
];

// Helper: parse YYYY-MM-DD into {day, month, year} as numbers
function parseDateStr(str) {
  const [y, m, d] = (str || '').split('-').map(Number);
  return { year: y || new Date().getFullYear(), month: m || new Date().getMonth() + 1, day: d || new Date().getDate() };
}
// Helper: days in a month
function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}
// Helper: zero-pad
function pad2(n) { return String(n).padStart(2, '0'); }

export default function SuggestNextPlanPopup({ onClose }) {
  const { healthProfile } = useHealthProfile();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = getTodayDateKey(); // YYYY-MM-DD
  const todayParsed = parseDateStr(today);

  // Step 0: Date parts stored separately for DD/MM/YYYY dropdowns
  const [selDay,   setSelDay]   = useState(todayParsed.day);
  const [selMonth, setSelMonth] = useState(todayParsed.month);
  const [selYear,  setSelYear]  = useState(todayParsed.year);

  // Derived YYYY-MM-DD for API — always in sync
  const selectedDate = `${selYear}-${pad2(selMonth)}-${pad2(selDay)}`;

  const [selectedMeals, setSelectedMeals] = useState(['breakfast', 'lunch', 'dinner']);

  // Clamp day to valid range when month/year change
  const maxDay = daysInMonth(selYear, selMonth);
  const clampedDay = Math.min(selDay, maxDay);
  if (clampedDay !== selDay) setSelDay(clampedDay);

  // Min date = today — prevent past dates
  const todayStr = today;

  // Year options: current year + next 2 years
  const yearOptions = useMemo(() => {
    const y = todayParsed.year;
    return [y, y + 1, y + 2];
  }, [todayParsed.year]);

  // Change handlers — validate min date
  const handleDayChange = (d) => {
    const newDate = `${selYear}-${pad2(selMonth)}-${pad2(d)}`;
    if (newDate >= todayStr) setSelDay(d);
  };
  const handleMonthChange = (m) => {
    const maxD = daysInMonth(selYear, m);
    const newD = Math.min(selDay, maxD);
    const newDate = `${selYear}-${pad2(m)}-${pad2(newD)}`;
    if (newDate >= todayStr) { setSelMonth(m); setSelDay(newD); }
  };
  const handleYearChange = (y) => {
    const maxD = daysInMonth(y, selMonth);
    const newD = Math.min(selDay, maxD);
    const newDate = `${y}-${pad2(selMonth)}-${pad2(newD)}`;
    if (newDate >= todayStr) { setSelYear(y); setSelDay(newD); }
  };

  const selectStyle = {
    padding: '8px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 14, background: 'white', color: '#1e293b', cursor: 'pointer',
    outline: 'none', appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', paddingRight: 28,
  };

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
        // Pass selectedDate so the parent can navigate to the correct week
        onClose({ type: 'success', text: 'Đã tạo gợi ý thành công!', date: selectedDate });
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Day input */}
                  <input
                    type="number"
                    value={selDay}
                    min={1}
                    max={maxDay}
                    onChange={e => handleDayChange(Number(e.target.value))}
                    style={{ ...selectStyle, width: 70, textAlign: 'center' }}
                  />
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>/</span>
                  {/* Month dropdown */}
                  <select
                    value={selMonth}
                    onChange={e => handleMonthChange(Number(e.target.value))}
                    style={{ ...selectStyle, flex: 1 }}
                  >
                    {VIET_MONTHS.map((label, idx) => (
                      <option key={idx + 1} value={idx + 1}>{label}</option>
                    ))}
                  </select>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>/</span>
                  {/* Year input */}
                  <input
                    type="number"
                    value={selYear}
                    min={yearOptions[0]}
                    max={yearOptions[yearOptions.length - 1]}
                    onChange={e => handleYearChange(Number(e.target.value))}
                    style={{ ...selectStyle, width: 80, textAlign: 'center' }}
                  />
                </div>
                {/* Weekday confirmation */}
                <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                  📅 {new Date(selectedDate + 'T12:00:00').toLocaleDateString('vi-VN', { weekday: 'long' })}, ngày {pad2(selDay)}/{pad2(selMonth)}/{selYear}
                </div>
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

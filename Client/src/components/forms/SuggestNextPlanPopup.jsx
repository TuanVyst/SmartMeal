import { useState, useMemo } from 'react';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { healthSurveyService } from '../../services/healthSurveyService';
import api from '../../services/api';
import { getTodayDateKey } from '../../utils/dateTime';
import { focusQueryParam } from '../../utils/nutrientFocus';
import {
  FiTrendingDown,
  FiTrendingUp,
  FiMinus,
  FiActivity,
  FiCalendar,
  FiX,
  FiSunrise,
  FiSun,
  FiMoon,
  FiPlus,
  FiCheck,
} from 'react-icons/fi';

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

const DAY_PRESETS = [
  { days: 1, label: '1 ngày' },
  { days: 3, label: '3 ngày' },
  { days: 5, label: '5 ngày' },
  { days: 7, label: '7 ngày (1 tuần)' },
  { days: 14, label: '14 ngày (2 tuần)' },
];

// Helper: format Date object to YYYY-MM-DD
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper: add N calendar days to YYYY-MM-DD string
function addDays(dateStr, n) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  dt.setDate(dt.getDate() + n);
  return toDateStr(dt);
}

// Helper: calculate inclusive difference in days between two YYYY-MM-DD strings
function diffDays(startStr, endStr) {
  if (!startStr || !endStr) return 1;
  const [y1, m1, d1] = startStr.split('-').map(Number);
  const [y2, m2, d2] = endStr.split('-').map(Number);
  const dt1 = new Date(y1, m1 - 1, d1, 12, 0, 0);
  const dt2 = new Date(y2, m2 - 1, d2, 12, 0, 0);
  const ms = dt2.getTime() - dt1.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

// Helper: format Vietnamese date e.g. "Thứ Hai, ngày 12/10/2026"
function formatVietnameseDate(dateStr) {
  if (!dateStr) return '';
  const dt = new Date(dateStr + 'T12:00:00');
  return dt.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Helper: short date DD/MM
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export default function SuggestNextPlanPopup({ onClose }) {
  const { healthProfile } = useHealthProfile();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Constraint: Today is the minimum allowed date (cannot pick past dates)
  const today = getTodayDateKey(); // YYYY-MM-DD

  // 3 synchronized indicators: startDate, numDays, endDate
  const [startDate, setStartDate] = useState(today);
  const [numDays, setNumDays] = useState(1);
  const endDate = useMemo(() => addDays(startDate, numDays - 1), [startDate, numDays]);

  const [selectedMeals, setSelectedMeals] = useState(['breakfast', 'lunch', 'dinner']);

  // Handle changes to startDate: keep numDays, recalculate endDate automatically
  const handleStartDateChange = (newStart) => {
    if (!newStart) return;
    if (newStart < today) {
      setError('Không thể chọn ngày bắt đầu trong quá khứ.');
      return;
    }
    setError('');
    setStartDate(newStart);
  };

  // Handle changes to numDays: recalculate endDate automatically
  const handleNumDaysChange = (val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) {
      setNumDays(1);
      setError('');
      return;
    }
    if (parsed > 30) {
      setNumDays(30);
      setError('Tối đa lên kế hoạch 30 ngày một lần.');
      return;
    }
    setError('');
    setNumDays(parsed);
  };

  // Handle changes to endDate: recalculate numDays automatically
  const handleEndDateChange = (newEnd) => {
    if (!newEnd) return;
    if (newEnd < today) {
      setError('Không thể chọn ngày kết thúc trong quá khứ.');
      return;
    }
    if (newEnd < startDate) {
      setError('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.');
      return;
    }
    const days = diffDays(startDate, newEnd);
    if (days > 30) {
      setError('Khoảng thời gian tối đa là 30 ngày.');
      setNumDays(30);
      return;
    }
    setError('');
    setNumDays(days);
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
    setSelectedMeals((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    );
  };

  const isStep1Changed =
    goal !== currentGoal ||
    (goal !== 'maintain' && targetWeight && Number(targetWeight) !== healthProfile?.targetWeight);
  const isStep2Changed = activityLevel !== currentActivity;

  const handleGenerate = async () => {
    if (selectedMeals.length === 0) {
      setError('Vui lòng chọn ít nhất một bữa ăn.');
      return;
    }
    if (startDate < today) {
      setError('Không thể chọn ngày bắt đầu trong quá khứ.');
      return;
    }
    if (endDate < startDate) {
      setError('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.');
      return;
    }
    if (numDays < 1 || numDays > 30) {
      setError('Số ngày lên kế hoạch phải từ 1 đến 30 ngày.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if ((isStep1Changed || isStep2Changed) && healthProfile) {
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
        try {
          await healthSurveyService.updateHealthProfile(updateData);
        } catch (profileErr) {
          console.warn('Could not update health profile:', profileErr);
        }
      }

      const mealsParam = selectedMeals.join(',');
      let res;
      if (numDays > 1) {
        res = await api.post(
          `/MealPlan/suggest-for-date-range?startDate=${startDate}&endDate=${endDate}&meals=${mealsParam}${focusQueryParam()}`
        );
      } else {
        res = await api.post(
          `/MealPlan/suggest-for-date?date=${startDate}&meals=${mealsParam}${focusQueryParam()}`
        );
      }

      if (res.data?.data) {
        onClose({
          type: 'success',
          text:
            numDays > 1
              ? `Đã tạo gợi ý thành công cho ${numDays} ngày (${formatShortDate(startDate)} – ${formatShortDate(endDate)})!`
              : 'Đã tạo gợi ý thành công!',
          date: startDate,
          endDate: endDate,
          numDays: numDays,
        });
      }
    } catch (err) {
      console.error('Lỗi tạo thực đơn:', err);
      setError(err?.response?.data?.message || 'Không thể tạo thực đơn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={() => onClose(null)}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{numDays > 1 ? `Tạo gợi ý thực đơn (${numDays} ngày)` : 'Tạo gợi ý bữa ăn'}</h2>
          <button className="popup-close" onClick={() => onClose(null)}>
            <FiX size={22} />
          </button>
        </div>

        <div className="popup-body">
          <div className="popup-step-dots">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`popup-step-dot ${step === i ? 'active' : ''}`} />
            ))}
          </div>

          {/* Step 0: Date Range + Meals */}
          {step === 0 && (
            <div>
              <h3 className="popup-section-title">
                <FiCalendar style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {numDays > 1 ? 'Chọn khoảng thời gian và bữa ăn' : 'Chọn ngày và bữa ăn'}
              </h3>
              <p className="popup-section-desc">
                Thiết lập ngày bắt đầu, số ngày cần tạo hoặc chọn ngày kết thúc
              </p>

              {/* 1. Ngày bắt đầu */}
              <div className="popup-form-group">
                <label className="popup-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="popup-date-input"
                  value={startDate}
                  min={today}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
                <div className="popup-date-subtext">
                  📅 {formatVietnameseDate(startDate)}
                </div>
              </div>

              {/* 2. Số ngày lên kế hoạch */}
              <div className="popup-form-group">
                <label className="popup-label">Số ngày tạo thực đơn (1 – 30 ngày)</label>
                <div className="popup-days-stepper">
                  <button
                    type="button"
                    className="popup-stepper-btn"
                    disabled={numDays <= 1}
                    onClick={() => handleNumDaysChange(numDays - 1)}
                    title="Giảm 1 ngày"
                  >
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    className="popup-days-input"
                    value={numDays}
                    min={1}
                    max={30}
                    onChange={(e) => handleNumDaysChange(e.target.value)}
                  />
                  <button
                    type="button"
                    className="popup-stepper-btn"
                    disabled={numDays >= 30}
                    onClick={() => handleNumDaysChange(numDays + 1)}
                    title="Tăng 1 ngày"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {/* Preset pills */}
                <div className="popup-presets-row">
                  {DAY_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      className={`popup-preset-pill ${numDays === preset.days ? 'active' : ''}`}
                      onClick={() => handleNumDaysChange(preset.days)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Ngày kết thúc */}
              <div className="popup-form-group">
                <label className="popup-label">Ngày kết thúc</label>
                <input
                  type="date"
                  className="popup-date-input"
                  value={endDate}
                  min={startDate}
                  max={addDays(startDate, 29)}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
                <div className="popup-date-subtext">
                  📅 {formatVietnameseDate(endDate)} ({numDays} ngày)
                </div>
              </div>

              {/* Summary card for range */}
              <div className="popup-plan-range-card">
                <FiCalendar size={18} style={{ flexShrink: 0 }} />
                <span>
                  Kế hoạch <strong>{numDays} ngày</strong>: từ{' '}
                  <strong>{formatShortDate(startDate)}</strong> đến{' '}
                  <strong>{formatShortDate(endDate)}</strong>
                </span>
              </div>

              {/* 4. Chọn bữa ăn */}
              <div className="popup-form-group">
                <label className="popup-label">Các bữa ăn áp dụng mỗi ngày</label>
                <div className="popup-meal-options">
                  {MEAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
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
                <button type="button" className="popup-btn-cancel" onClick={() => onClose(null)}>
                  Hủy
                </button>
                <button
                  type="button"
                  className="popup-btn-primary"
                  onClick={() => {
                    if (selectedMeals.length === 0) {
                      setError('Vui lòng chọn ít nhất một bữa ăn.');
                      return;
                    }
                    if (startDate < today) {
                      setError('Không thể chọn ngày bắt đầu trong quá khứ.');
                      return;
                    }
                    if (endDate < startDate) {
                      setError('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.');
                      return;
                    }
                    if (numDays < 1 || numDays > 30) {
                      setError('Số ngày lên kế hoạch phải từ 1 đến 30 ngày.');
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
              <p className="popup-section-desc">
                Bạn có muốn thay đổi mục tiêu cân nặng không? Có thể bỏ qua để giữ nguyên.
              </p>

              <div className="popup-goal-options">
                {[
                  { value: 'lose', icon: <FiTrendingDown size={22} />, label: 'Giảm cân' },
                  { value: 'maintain', icon: <FiMinus size={22} />, label: 'Duy trì' },
                  { value: 'gain', icon: <FiTrendingUp size={22} />, label: 'Tăng cân' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
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
                      onChange={(e) => setTargetWeight(e.target.value)}
                      placeholder={currentWeight ? `Hiện tại: ${currentWeight}kg` : 'Nhập cân nặng mục tiêu'}
                      className="popup-text-input"
                    />
                    <span style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>kg</span>
                  </div>
                </div>
              )}

              <div className="popup-actions">
                <button type="button" className="popup-btn-cancel" onClick={() => setStep(0)}>
                  ← Quay lại
                </button>
                <button type="button" className="popup-btn-primary" onClick={() => setStep(2)}>
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
                {ACTIVITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
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
                  <span>Khoảng thời gian:</span>
                  <span className="popup-summary-val">
                    {numDays > 1
                      ? `${numDays} ngày (${formatShortDate(startDate)} – ${formatShortDate(endDate)})`
                      : formatVietnameseDate(startDate)}
                  </span>
                </div>
                <div className="popup-summary-row">
                  <span>Bữa ăn:</span>
                  <span className="popup-summary-val">
                    {selectedMeals.map((m) => MEAL_OPTIONS.find((o) => o.value === m)?.label).join(', ')}
                  </span>
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
                  <span className="popup-summary-val">
                    {ACTIVITY_OPTIONS.find((a) => a.value === activityLevel)?.label || activityLevel}
                  </span>
                </div>
              </div>

              {error && <div className="popup-error">{error}</div>}

              <div className="popup-actions">
                <button type="button" className="popup-btn-cancel" onClick={() => setStep(1)}>
                  ← Quay lại
                </button>
                <button
                  type="button"
                  className="popup-btn-primary popup-btn-generate"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? '⏳ Đang tạo...' : numDays > 1 ? `✨ Tạo thực đơn (${numDays} ngày)` : '✨ Tạo thực đơn'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { calculateBMI } from '../utils/bmiCalculator';
import { getLockedIngredientsForProfile, getActivityFactor, calculateDailyTargets, computeCalorieDelta } from '../utils/healthRules';
import { useHealthProfile } from '../hooks/useHealthProfile';
import { healthSurveyService } from '../services/healthSurveyService';
import { formatDateVi } from '../utils/dateTime';
import { FiTrendingDown, FiActivity, FiMinimize2, FiHeart, FiDroplet, FiFileText, FiLock, FiEdit2, FiSave, FiInfo, FiZap, FiAlertTriangle } from 'react-icons/fi';

const conditionsList = [
  { value: 'diabetes', label: 'Tiểu đường type 2' },
  { value: 'hypertension', label: 'Huyết áp cao' },
  { value: 'cholesterol', label: 'Cholesterol cao' },
  { value: 'heartDisease', label: 'Bệnh tim mạch' },
  { value: 'gerd', label: 'Dạ dày / Trào ngược' },
  { value: 'gout', label: 'Gout' },
];

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

const ACTIVITY_LEVELS = [
  { value: 'sedentary',   emoji: '🪑', label: 'Ít vận động',    factor: 1.2,    desc: 'Văn phòng, học tập' },
  { value: 'light',       emoji: '🚶', label: 'Vận động nhẹ',  factor: 1.375,  desc: 'Đi bộ, tập 1-3 buổi/tuần' },
  { value: 'moderate',    emoji: '🏃', label: 'Vận động vừa',   factor: 1.55,   desc: 'Gym, chạy bộ 3-5 buổi/tuần' },
  { value: 'active',      emoji: '💪', label: 'Vận động nhiều',  factor: 1.725,  desc: 'Lao động, tập mỗi ngày' },
  { value: 'very_active', emoji: '🔥', label: 'Rất năng động', factor: 1.9,    desc: 'Vận động viên, lao động nặng' },
];

export default function HealthProfileEditor() {
  const { healthProfile, updateProfile, dailyCalorieBudget, lockedIngredients } = useHealthProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bmiHistory, setBmiHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    height: '', weight: '', targetWeight: '', goal: '',
    conditions: [],
  });

  useEffect(() => {
    if (healthProfile) {
      setFormData({
        height: healthProfile.height || '',
        weight: healthProfile.weight || '',
        targetWeight: healthProfile.targetWeight || '',
        targetWeeks: healthProfile.targetWeeks || '',
        goal: healthProfile.goal || '',
        activityLevel: healthProfile.activityLevel || 'sedentary',
        conditions: healthProfile.conditions || [],
      });
    }
  }, [healthProfile]);

  useEffect(() => {
    if (formData.goal && !['lose', 'gain'].includes(formData.goal)) {
      setFormData(prev => ({
        ...prev,
        targetWeight: '',
        targetWeeks: ''
      }));
    }
  }, [formData.goal]);

  const bmiResult = useMemo(() => {
    if (formData.height && formData.weight && Number(formData.height) > 0 && Number(formData.weight) > 0) {
      return calculateBMI(Number(formData.weight), Number(formData.height));
    }
    return null;
  }, [formData.height, formData.weight]);

  const editPreviewBudget = useMemo(() => {
    const mockProfile = {
      weight: Number(formData.weight),
      height: Number(formData.height),
      gender: healthProfile?.gender || 'Khác',
      dateOfBirth: healthProfile?.dateOfBirth,
      activityLevel: formData.activityLevel || 'sedentary',
      goal: formData.goal || 'maintain',
      targetWeight: Number(formData.targetWeight),
      targetWeeks: Number(formData.targetWeeks) || 12,
      conditions: formData.conditions || [],
    };
    return calculateDailyTargets(mockProfile);
  }, [formData, healthProfile]);

  const currentBmi = useMemo(() => {
    if (healthProfile?.height && healthProfile?.weight) {
      return calculateBMI(Number(healthProfile.weight), Number(healthProfile.height));
    }
    return null;
  }, [healthProfile]);

  const handleLoadHistory = async () => {
    try {
      const result = await healthSurveyService.getBmiHistory();
      if (result.success) {
        setBmiHistory(result.data || []);
      }
    } catch (e) {
      console.error('Failed to load BMI history:', e);
    }
  };

  const handleToggleHistory = () => {
    if (!showHistory && bmiHistory.length === 0) {
      handleLoadHistory();
    }
    setShowHistory(!showHistory);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        height: Number(formData.height) || null,
        weight: Number(formData.weight) || null,
        targetWeight: formData.targetWeight ? Number(formData.targetWeight) : null,
        targetWeeks: formData.targetWeeks ? Number(formData.targetWeeks) : null,
        goal: formData.goal || 'maintain',
        activityLevel: formData.activityLevel || 'sedentary',
        conditions: formData.conditions,
      };
      const result = await updateProfile(payload);
      if (result.success) {
        setIsEditing(false);
        handleLoadHistory();
      }
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setSaving(false);
    }
  };

  const toggleCondition = (value) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(value)
        ? prev.conditions.filter(c => c !== value)
        : [...prev.conditions, value],
    }));
  };



  if (!healthProfile) return null;

  const bmiStyle = currentBmi ? bmiColors[currentBmi.level] : null;
  const goalInfo = healthProfile.goal ? goalLabels[healthProfile.goal] : null;
  const activityInfo = ACTIVITY_LEVELS.find(a => a.value === (healthProfile.activityLevel || 'sedentary'));

  // Tính toán dinh dưỡng dựa trên hồ sơ hiện tại (chỉ hiển thị, không phải form)
  const nutritionAnalysis = healthProfile ? calculateDailyTargets(healthProfile) : null;

  return (
    <div style={{
      background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: 24, overflow: 'hidden', border: '1px solid #e2e8f0',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        borderBottom: isEditing ? '1px solid #e2e8f0' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FiFileText size={20} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Hồ sơ sức khỏe</span>
          {currentBmi && bmiStyle && (
            <span style={{
              padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
              background: bmiStyle.bg, color: bmiStyle.text,
            }}>
              BMI {currentBmi.bmi} — {bmiStyle.label}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={handleToggleHistory}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: 'white', color: '#64748b', fontSize: 12, fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Lịch sử BMI
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none',
                background: '#22C55E', color: 'white', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <FiEdit2 size={14} /> Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {/* BMI History Panel */}
      {showHistory && (
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc', maxHeight: 300, overflow: 'auto',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 10 }}>
            Lịch sử BMI
          </div>
          {bmiHistory.length === 0 ? (
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Chưa có dữ liệu BMI</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bmiHistory.map((log) => {
                const logBmi = log.bmiLevel ? bmiColors[log.bmiLevel] : null;
                return (
                  <div key={log.log_id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: 'white', borderRadius: 8,
                    border: '1px solid #e2e8f0', fontSize: 12,
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#64748b' }}>
                          {formatDateVi(log.recordedAt)}
                        </span>
                        <span style={{ color: '#1E293B', fontWeight: 500 }}>
                          {log.weight}kg / {log.height}cm
                        </span>
                      </div>
                      {(healthProfile?.conditions || []).length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {healthProfile.conditions.map(c => (
                            <span key={c} style={{
                              padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 500,
                              background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa',
                            }}>
                              {conditionsList.find(cl => cl.value === c)?.label || c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{log.bmi}</span>
                      {logBmi && (
                        <span style={{
                          padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600,
                          background: logBmi.bg, color: logBmi.text,
                        }}>
                          {logBmi.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '16px 20px' }}>
        {isEditing ? (
          /* EDIT MODE */
          <div>
            {/* Height & Weight */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.height}
                  onChange={e => {
                    let val = e.target.value;
                    if (Number(val) < 0) val = '1';
                    setFormData(prev => ({ ...prev, height: val }));
                  }}
                  placeholder="170"
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, outline: 'none',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                  Cân nặng (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.weight}
                  onChange={e => {
                    let val = e.target.value;
                    if (Number(val) < 0) val = '1';
                    setFormData(prev => ({ ...prev, weight: val }));
                  }}
                  placeholder="65"
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, outline: 'none',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                  Mục tiêu (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.targetWeight}
                  onChange={e => {
                    let val = e.target.value;
                    if (Number(val) < 0) val = '1';
                    setFormData(prev => ({ ...prev, targetWeight: val }));
                  }}
                  placeholder="Ví dụ: 60"
                  disabled={!['lose', 'gain'].includes(formData.goal)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, outline: 'none',
                    backgroundColor: !['lose', 'gain'].includes(formData.goal) ? '#f8fafc' : 'white',
                    color: !['lose', 'gain'].includes(formData.goal) ? '#94a3b8' : 'inherit'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
                  Thời gian (tuần)
                </label>
                <input
                  type="number"
                  value={formData.targetWeeks}
                  onChange={e => {
                    let val = e.target.value;
                    if (Number(val) < 0) val = '1';
                    setFormData(prev => ({ ...prev, targetWeeks: val }));
                  }}
                  placeholder="Ví dụ: 12"
                  min="1"
                  max="52"
                  disabled={!['lose', 'gain'].includes(formData.goal)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, outline: 'none',
                    backgroundColor: !['lose', 'gain'].includes(formData.goal) ? '#f8fafc' : 'white',
                    color: !['lose', 'gain'].includes(formData.goal) ? '#94a3b8' : 'inherit'
                  }}
                />
              </div>
            </div>

            {/* Target Weight Delta Preview */}
            {(formData.goal === 'lose' || formData.goal === 'gain') && formData.weight && formData.targetWeight && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, marginBottom: 16,
                background: '#f8fafc', border: '1px solid #e2e8f0'
              }}>
                <FiInfo size={16} color="#3b82f6" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                  {formData.goal === 'lose' && formData.weight > formData.targetWeight ? (
                    <>Mục tiêu giảm <strong>{(formData.weight - formData.targetWeight).toFixed(1)}kg</strong> trong {formData.targetWeeks || 12} tuần tới. Cần giảm ~<strong>{Math.abs(Math.round(computeCalorieDelta(formData.weight, formData.targetWeight, formData.targetWeeks || 12)))} kcal/ngày</strong>.</>
                  ) : formData.goal === 'gain' && formData.targetWeight > formData.weight ? (
                    <>Mục tiêu tăng <strong>{(formData.targetWeight - formData.weight).toFixed(1)}kg</strong> trong {formData.targetWeeks || 12} tuần tới. Cần nạp thêm ~<strong>{Math.abs(Math.round(computeCalorieDelta(formData.weight, formData.targetWeight, formData.targetWeeks || 12)))} kcal/ngày</strong>.</>
                  ) : (
                    <span style={{ color: '#ef4444' }}>Vui lòng điều chỉnh lại cân nặng mục tiêu cho hợp lý với mục tiêu {formData.goal === 'lose' ? 'giảm cân' : 'tăng cơ'}.</span>
                  )}
                </div>
              </div>
            )}

            {/* Live Calorie Preview Panel */}
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
              border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 14px', marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Xem trước kết quả năng lượng</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>BMR (Nền tảng)</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>{editPreviewBudget.bmr} kcal</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>TDEE (Vận động)</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7' }}>{editPreviewBudget.tdee} kcal</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Mục tiêu</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{editPreviewBudget.calories} kcal</div>
                </div>
              </div>
              {editPreviewBudget.goalTooAggressive && (
                <div style={{ fontSize: 11, color: '#92400e', marginTop: 8, padding: '6px 8px', background: '#fff7ed', borderRadius: 6, border: '1px solid #fed7aa' }}>
                  <strong>Cảnh báo:</strong> Mục tiêu vượt ngưỡng an toàn. Đã tự động điều chỉnh calo. Thời gian dự kiến mới: ~{editPreviewBudget.estimatedWeeks} tuần.
                </div>
              )}
            </div>

            {/* Live BMI preview */}
            {bmiResult && (
              <div style={{
                textAlign: 'center', padding: 12, borderRadius: 10, marginBottom: 16,
                background: bmiColors[bmiResult.level]?.bg || '#f1f5f9',
              }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>BMI mới: </span>
                <span style={{ fontSize: 20, fontWeight: 700, color: bmiColors[bmiResult.level]?.text || '#1E293B' }}>
                  {bmiResult.bmi}
                </span>
                <span style={{ fontSize: 12, color: bmiColors[bmiResult.level]?.text || '#1E293B', marginLeft: 8 }}>
                  {bmiResult.classification}
                </span>
              </div>
            )}

            {/* Goal */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                Mục tiêu
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {Object.entries(goalLabels).map(([key, info]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, goal: key }))}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                      border: `2px solid ${formData.goal === key ? '#22C55E' : '#e2e8f0'}`,
                      background: formData.goal === key ? '#f0fdf4' : 'white',
                      color: formData.goal === key ? '#16a34a' : '#475569',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {info.icon} {info.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                Mức độ vận động
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ACTIVITY_LEVELS.map(a => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, activityLevel: a.value }))}
                    title={a.desc}
                    style={{
                      padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      border: `2px solid ${formData.activityLevel === a.value ? '#22C55E' : '#e2e8f0'}`,
                      background: formData.activityLevel === a.value ? '#f0fdf4' : 'white',
                      color: formData.activityLevel === a.value ? '#16a34a' : '#475569',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    {a.emoji} {a.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                Hệ số đang chọn: ×{ACTIVITY_LEVELS.find(a => a.value === formData.activityLevel)?.factor || 1.2}
              </p>
            </div>

            {/* Conditions */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 }}>
                Bệnh lý nền
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {conditionsList.map(c => {
                  const isSelected = formData.conditions.includes(c.value);
                  return (
                    <label
                      key={c.value}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        borderRadius: 8, border: `2px solid ${isSelected ? '#22C55E' : '#e2e8f0'}`,
                        background: isSelected ? '#f0fdf4' : 'white', cursor: 'pointer',
                        transition: 'all 0.2s', fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCondition(c.value)}
                        style={{ width: 16, height: 16, accentColor: '#22C55E' }}
                      />
                      <span style={{ color: '#1E293B', fontWeight: isSelected ? 600 : 400 }}>{c.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Save/Cancel */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    height: healthProfile.height || '',
                    weight: healthProfile.weight || '',
                    targetWeight: healthProfile.targetWeight || '',
                    targetWeeks: healthProfile.targetWeeks || '',
                    goal: healthProfile.goal || '',
                    activityLevel: healthProfile.activityLevel || 'sedentary',
                    conditions: healthProfile.conditions || [],
                  });
                }}
                style={{
                  padding: '8px 16px', border: '2px solid #e2e8f0', borderRadius: 8,
                  background: 'white', color: '#475569', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '8px 20px', border: 'none', borderRadius: 8,
                  background: saving ? '#94a3b8' : '#22C55E', color: 'white',
                  fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Đang lưu...' : <><FiSave size={14} /> Lưu</>}
              </button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
              {currentBmi && bmiStyle && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Chỉ số BMI</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: bmiStyle.text }}>{currentBmi.bmi}</div>
                  <div style={{ fontSize: 11, color: bmiStyle.text, fontWeight: 500 }}>{currentBmi.classification}</div>
                </div>
              )}
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Mục tiêu</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>
                  {goalInfo ? <>{goalInfo.icon} {goalInfo.label}</> : 'Chưa chọn'}
                </div>
              </div>
              {activityInfo && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Vận động</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{activityInfo.emoji} {activityInfo.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>×{activityInfo.factor}</div>
                </div>
              )}
              {healthProfile.targetWeight && healthProfile.weight && (healthProfile.goal === 'lose' || healthProfile.goal === 'gain') && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Cân nặng mục tiêu</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>{healthProfile.targetWeight} kg</div>
                  <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 500 }}>
                    {healthProfile.goal === 'lose' && healthProfile.weight > healthProfile.targetWeight
                      ? `Giảm ${(healthProfile.weight - healthProfile.targetWeight).toFixed(1)}kg`
                      : healthProfile.goal === 'gain' && healthProfile.targetWeight > healthProfile.weight
                        ? `Tăng ${(healthProfile.targetWeight - healthProfile.weight).toFixed(1)}kg`
                        : 'Mục tiêu chưa hợp lý'}
                  </div>
                </div>
              )}
            </div>

            {/* Nutrition Analysis Panel */}
            {nutritionAnalysis && (
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)',
                border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 16px', marginBottom: 14
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <FiZap size={14} color="#16a34a" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Phân tích năng lượng</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { label: 'BMR', value: nutritionAnalysis.bmr, unit: 'kcal', color: '#475569' },
                    { label: 'TDEE', value: nutritionAnalysis.tdee, unit: 'kcal', color: '#0284c7' },
                    { label: 'Mục tiêu', value: nutritionAnalysis.calories, unit: 'kcal', color: '#16a34a' },
                    { label: nutritionAnalysis.deficit >= 0 ? 'Thâm hụt' : 'Thừa dư', value: Math.abs(nutritionAnalysis.deficit), unit: 'kcal', color: nutritionAnalysis.deficit >= 0 ? '#ea580c' : '#7c3aed' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.value}</div>
                      <div style={{ fontSize: 9, color: '#94a3b8' }}>{item.unit}</div>
                    </div>
                  ))}
                </div>
                {nutritionAnalysis.goalTooAggressive && (
                  <div style={{
                    marginTop: 10, padding: '8px 12px', background: '#fff7ed',
                    border: '1px solid #fed7aa', borderRadius: 8,
                    display: 'flex', alignItems: 'flex-start', gap: 6
                  }}>
                    <FiAlertTriangle size={13} color="#ea580c" style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ fontSize: 11, color: '#92400e', lineHeight: 1.4 }}>
                      <strong>Mục tiêu hiện tại vượt ngưỡng an toàn.</strong> SmartMeal đã tự động điều chỉnh về {nutritionAnalysis.calories} kcal/ngày.
                      {nutritionAnalysis.estimatedWeeks && <> Thời gian thực tế dự kiến: <strong>~{nutritionAnalysis.estimatedWeeks} tuần</strong>.</>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {(healthProfile.conditions || []).length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Bệnh lý nền</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {healthProfile.conditions.map(c => (
                    <span key={c} style={{
                      padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500,
                      background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa',
                    }}>
                      {conditionsList.find(cl => cl.value === c)?.label || c}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
        )}
      </div>
    </div>
  );
}

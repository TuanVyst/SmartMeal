import { useState, useMemo, useEffect } from 'react';
import { calculateBMI } from '../utils/bmiCalculator';
import { getLockedIngredientsForProfile } from '../utils/healthRules';
import { useHealthProfile } from '../hooks/useHealthProfile';
import { healthSurveyService } from '../services/healthSurveyService';
import { formatDateVi } from '../utils/dateTime';
import { FiTrendingDown, FiActivity, FiMinimize2, FiHeart, FiDroplet, FiFileText, FiLock, FiEdit2, FiSave } from 'react-icons/fi';

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

export default function HealthProfileEditor() {
  const { healthProfile, updateProfile, dailyCalorieBudget, lockedIngredients } = useHealthProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bmiHistory, setBmiHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    height: '', weight: '', goal: '',
    conditions: [],
  });

  useEffect(() => {
    if (healthProfile) {
      setFormData({
        height: healthProfile.height || '',
        weight: healthProfile.weight || '',
        goal: healthProfile.goal || '',
        conditions: healthProfile.conditions || [],
      });
    }
  }, [healthProfile]);

  const bmiResult = useMemo(() => {
    if (formData.height && formData.weight && Number(formData.height) > 0 && Number(formData.weight) > 0) {
      return calculateBMI(Number(formData.weight), Number(formData.height));
    }
    return null;
  }, [formData.height, formData.weight]);

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
        goal: formData.goal || 'maintain',
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
                  value={formData.height}
                  onChange={e => setFormData(prev => ({ ...prev, height: e.target.value }))}
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
                  value={formData.weight}
                  onChange={e => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="65"
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 14, outline: 'none',
                  }}
                />
              </div>
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
                    goal: healthProfile.goal || '',
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {currentBmi && bmiStyle && (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Chỉ số BMI</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: bmiStyle.text }}>{currentBmi.bmi}</div>
                  <div style={{ fontSize: 12, color: bmiStyle.text, fontWeight: 500 }}>{currentBmi.classification}</div>
                </div>
              )}
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Mục tiêu</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>
                  {goalInfo ? <>{goalInfo.icon} {goalInfo.label}</> : 'Chưa chọn'}
                </div>
                <div style={{ fontSize: 12, color: '#22C55E', fontWeight: 500 }}>{dailyCalorieBudget} kcal/ngày</div>
              </div>
            </div>

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

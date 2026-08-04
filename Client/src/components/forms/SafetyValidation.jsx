import { useMemo } from 'react';
import { getDailyCalorieBudget } from '../../utils/healthRules';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function SafetyValidation({ profile, onAccept, onContinue }) {
  const assessment = useMemo(() => {
    return getDailyCalorieBudget(profile);
  }, [profile]);

  if (!assessment.goalTooAggressive && assessment.deficit === 0) {
    return null; // Return null if nothing to warn about. But wait, we show this inline.
  }

  const isAggressive = assessment.goalTooAggressive;

  return (
    <div style={{ background: isAggressive ? '#fff7ed' : '#f0fdf4', border: `1px solid ${isAggressive ? '#fed7aa' : '#bbf7d0'}`, borderRadius: 12, padding: 20, marginTop: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ color: isAggressive ? '#ea580c' : '#16a34a', marginTop: 2 }}>
          {isAggressive ? <FiAlertCircle size={24} /> : <FiCheckCircle size={24} />}
        </div>
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 16, color: isAggressive ? '#9a3412' : '#166534' }}>
            {isAggressive ? 'Mục tiêu của bạn hơi tham vọng!' : 'Mục tiêu tuyệt vời!'}
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: 14, color: isAggressive ? '#9a3412' : '#15803d', lineHeight: 1.5 }}>
            {isAggressive 
              ? 'Để đảm bảo sức khỏe và không bị mệt mỏi, hệ thống khuyến nghị bạn giảm cân với tốc độ an toàn hơn.'
              : 'Mục tiêu của bạn nằm trong giới hạn an toàn, có thể đạt được một cách khỏe mạnh mà không ảnh hưởng tới sức khỏe.'}
          </p>
          
            <div style={{ background: 'white', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: '#64748b' }}>Năng lượng mục tiêu (an toàn):</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{assessment.calories} kcal/ngày</span>
              </div>
            </div>

          <button
            type="button"
            onClick={isAggressive ? onAccept : onContinue}
            style={{
              padding: '8px 16px', background: isAggressive ? '#ea580c' : '#16a34a', color: 'white', 
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}
          >
            {isAggressive ? 'Đồng ý với lịch trình an toàn' : 'Tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  );
}

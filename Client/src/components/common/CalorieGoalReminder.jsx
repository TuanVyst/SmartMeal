import React, { useMemo } from 'react';
import { FiTrendingDown, FiActivity, FiInfo } from 'react-icons/fi';
import { computeCalorieDelta } from '../../utils/healthRules';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { useTodayCalorieProgress } from '../../hooks/useTodayCalorieProgress';

export default function CalorieGoalReminder() {
  const { healthProfile, dailyTargets } = useHealthProfile();
  const { caloriesToday, targetCalories } = useTodayCalorieProgress();

  const reminderInfo = useMemo(() => {
    if (!healthProfile || !healthProfile.goal) {
      return {
        type: 'missing',
        calRemaining: Math.max(0, targetCalories - caloriesToday),
        targetCalories
      };
    }

    const goal = healthProfile.goal;
    const currentWeight = healthProfile.weight;
    const targetWeight = healthProfile.targetWeight;
    const targetDays = healthProfile.targetDays || 84;
    const { goalTooAggressive, estimatedDays, deficit, maintenance } = dailyTargets || {};

    if (goal === 'maintain') {
      const goalNames = {
        maintain: 'Duy trì cân nặng',
      };
      return {
        type: 'health_goal',
        goalText: goalNames[goal],
        calRemaining: Math.max(0, targetCalories - caloriesToday),
        targetCalories
      };
    }
    
    if (!currentWeight || !targetWeight) {
      return {
        type: 'missing',
        calRemaining: Math.max(0, targetCalories - caloriesToday),
        targetCalories
      };
    }
    
    if (goal === 'lose' && currentWeight <= targetWeight) {
      return { type: 'achieved', calRemaining: Math.max(0, targetCalories - caloriesToday), targetCalories, message: 'Bạn đã đạt hoặc vượt mục tiêu giảm cân!' };
    }
    if (goal === 'gain' && currentWeight >= targetWeight) {
      return { type: 'achieved', calRemaining: Math.max(0, targetCalories - caloriesToday), targetCalories, message: 'Bạn đã đạt hoặc vượt mục tiêu tăng cân!' };
    }

    const diff = Math.abs(currentWeight - targetWeight);
    const dailyDeltaAbs = Math.abs(deficit || computeCalorieDelta(currentWeight, targetWeight, targetDays));

    const calRemaining = Math.max(0, targetCalories - caloriesToday);
    
    return {
      type: 'weight_goal',
      goalText: goal === 'lose' ? 'Giảm cân' : 'Tăng cơ',
      diffStr: diff.toFixed(1),
      targetDays,
      dailyDeltaAbs,
      calRemaining,
      targetCalories,
      isLose: goal === 'lose',
      goalTooAggressive,
      estimatedDays,
    };
  }, [healthProfile, dailyTargets, caloriesToday, targetCalories]);

  if (!reminderInfo) return null;

  if (reminderInfo.type === 'missing' || reminderInfo.type === 'achieved') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px dashed #cbd5e1',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#64748b'
          }}>
            <FiInfo size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#334155' }}>
            {reminderInfo.type === 'achieved' ? 'Hoàn thành mục tiêu!' : 'Chưa thiết lập mục tiêu cân nặng'}
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
          {reminderInfo.message || 'Hãy vào mục "Nhật ký ăn uống" -> "Hồ sơ sức khoẻ" để cập nhật cân nặng mục tiêu (Tăng/Giảm cân) để hệ thống nhắc nhở lượng Calo chính xác nhé!'}
        </p>
        <div style={{
          marginTop: '8px', padding: '12px', background: 'white', borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0'
        }}>
          <FiActivity size={16} color="#0284c7" />
          <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
            Hôm nay bạn còn có thể nạp thêm <strong>{reminderInfo.calRemaining} kcal</strong>.
          </span>
        </div>
      </div>
    );
  }

  if (reminderInfo.type === 'health_goal') {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.1)',
        border: '1px solid #bbf7d0',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#16a34a'
          }}>
            <FiActivity size={18} />
          </div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#14532d' }}>
            Mục tiêu: {reminderInfo.goalText}
          </h3>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#166534', lineHeight: 1.5 }}>
          Duy trì chế độ ăn uống lành mạnh và cân bằng. Mức calo mục tiêu của bạn là <strong>{reminderInfo.targetCalories} kcal/ngày</strong>.
        </p>
        <div style={{
          marginTop: '8px', padding: '12px', background: 'white', borderRadius: '12px',
          display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #bbf7d0'
        }}>
          <FiInfo size={16} color="#16a34a" />
          <span style={{ fontSize: '13px', color: '#14532d', fontWeight: 500 }}>
            Hôm nay bạn còn có thể nạp thêm <strong>{reminderInfo.calRemaining} kcal</strong>.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
      border: '1px solid #bae6fd',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: '#2563eb'
        }}>
          {reminderInfo.isLose ? <FiTrendingDown size={18} /> : <FiActivity size={18} />}
        </div>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e3a8a' }}>
          Mục tiêu {reminderInfo.goalText}: {reminderInfo.diffStr} kg
        </h3>
      </div>
      
      <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', lineHeight: 1.5 }}>
        Để đạt được mục tiêu trong {reminderInfo.targetDays} ngày tới, bạn cần {reminderInfo.isLose ? 'giảm bớt' : 'nạp thêm'} khoảng <strong>{reminderInfo.dailyDeltaAbs} kcal/ngày</strong> so với mức giữ cân.
        Mức calo mục tiêu của bạn là <strong>{reminderInfo.targetCalories} kcal</strong>.
      </p>

      {reminderInfo.goalTooAggressive && (
        <div style={{
          marginTop: '4px', padding: '10px 12px', background: '#fff7ed', borderRadius: '10px',
          display: 'flex', alignItems: 'flex-start', gap: '8px', border: '1px solid #fed7aa'
        }}>
          <FiInfo size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '13px', color: '#9a3412', lineHeight: 1.4 }}>
            Mục tiêu <strong>{reminderInfo.targetDays} ngày</strong> quá khắc nghiệt và không an toàn. Hệ thống đã tự động điều chỉnh calo về ngưỡng an toàn. Thời gian dự kiến mới: <strong>~{reminderInfo.estimatedDays || ''} ngày</strong>.
          </span>
        </div>
      )}

      <div style={{
        marginTop: '8px', padding: '12px', background: 'white', borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0'
      }}>
        <FiInfo size={16} color="#0284c7" />
        <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
          Hôm nay bạn còn có thể nạp thêm <strong>{reminderInfo.calRemaining} kcal</strong>.
        </span>
      </div>
    </div>
  );
}

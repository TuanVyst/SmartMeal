import React, { useMemo } from 'react';
import { FiTrendingDown, FiActivity, FiInfo } from 'react-icons/fi';
import { computeCalorieDelta } from '../../utils/healthRules';
import { useHealthProfile } from '../../hooks/useHealthProfile';
import { useTodayCalorieProgress } from '../../hooks/useTodayCalorieProgress';

export default function CalorieGoalReminder() {
  const { healthProfile } = useHealthProfile();
  const { caloriesToday, targetCalories } = useTodayCalorieProgress();

  const reminderInfo = useMemo(() => {
    if (!healthProfile || !healthProfile.goal || !healthProfile.weight || !healthProfile.targetWeight || (healthProfile.goal !== 'lose' && healthProfile.goal !== 'gain')) {
      return {
        missingSetup: true,
        calRemaining: Math.max(0, targetCalories - caloriesToday),
        targetCalories
      };
    }

    const goal = healthProfile.goal;
    const currentWeight = healthProfile.weight;
    const targetWeight = healthProfile.targetWeight;
    const targetWeeks = healthProfile.targetWeeks || 12;
    
    if (goal === 'lose' && currentWeight <= targetWeight) {
      return { missingSetup: true, calRemaining: Math.max(0, targetCalories - caloriesToday), targetCalories, message: 'Bạn đã đạt hoặc vượt mục tiêu giảm cân!' };
    }
    if (goal === 'gain' && currentWeight >= targetWeight) {
      return { missingSetup: true, calRemaining: Math.max(0, targetCalories - caloriesToday), targetCalories, message: 'Bạn đã đạt hoặc vượt mục tiêu tăng cân!' };
    }

    const diff = Math.abs(currentWeight - targetWeight);
    const delta = computeCalorieDelta(currentWeight, targetWeight, targetWeeks);
    const dailyDeltaAbs = Math.abs(Math.round(delta));

    const calRemaining = Math.max(0, targetCalories - caloriesToday);
    
    return {
      missingSetup: false,
      goalText: goal === 'lose' ? 'Giảm cân' : 'Tăng cơ',
      diffStr: diff.toFixed(1),
      targetWeeks,
      dailyDeltaAbs,
      calRemaining,
      targetCalories,
      isLose: goal === 'lose',
    };
  }, [healthProfile, caloriesToday, targetCalories]);

  if (!reminderInfo) return null;

  if (reminderInfo.missingSetup) {
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
            Chưa thiết lập mục tiêu cân nặng
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
        Để đạt được mục tiêu trong {reminderInfo.targetWeeks} tuần tới, bạn cần {reminderInfo.isLose ? 'giảm bớt' : 'nạp thêm'} khoảng <strong>{reminderInfo.dailyDeltaAbs} kcal/ngày</strong> so với mức giữ cân.
        Mức calo mục tiêu của bạn là <strong>{reminderInfo.targetCalories} kcal</strong>.
      </p>

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

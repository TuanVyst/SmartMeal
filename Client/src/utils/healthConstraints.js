/**
 * Single source of truth for health metric constraints.
 * Keep these bounds in sync with ClientMobile/lib/core/validators/health_validators.dart
 * and Server/BusinessObject/Helpers/HealthProfileValidator.cs.
 */
export const HEALTH_LIMITS = Object.freeze({
  age: { min: 10, max: 120 },
  height: { min: 100, max: 250, step: 0.1 },
  weight: { min: 20, max: 300, step: 0.1 },
  targetWeight: { min: 20, max: 300, step: 0.1 },
  targetDays: { min: 14, max: 730 },
  bmi: { min: 10, max: 80 },
});

export function getBasicMetricErrors({ age, height, weight }) {
  const errors = {};
  const ageValue = Number(age);
  const heightValue = Number(height);
  const weightValue = Number(weight);
  const hasAge = age !== undefined && age !== null && String(age).trim() !== '';

  if (hasAge && (!Number.isFinite(ageValue) || !Number.isInteger(ageValue)
      || ageValue < HEALTH_LIMITS.age.min || ageValue > HEALTH_LIMITS.age.max)) {
    errors.age = `Tuổi phải là số nguyên từ ${HEALTH_LIMITS.age.min} đến ${HEALTH_LIMITS.age.max}`;
  }

  if (!Number.isFinite(heightValue)
      || heightValue < HEALTH_LIMITS.height.min || heightValue > HEALTH_LIMITS.height.max) {
    errors.height = `Chiều cao phải từ ${HEALTH_LIMITS.height.min} đến ${HEALTH_LIMITS.height.max} cm`;
  }

  if (!Number.isFinite(weightValue)
      || weightValue < HEALTH_LIMITS.weight.min || weightValue > HEALTH_LIMITS.weight.max) {
    errors.weight = `Cân nặng phải từ ${HEALTH_LIMITS.weight.min} đến ${HEALTH_LIMITS.weight.max} kg`;
  }

  // Cross-field sanity check: ranges alone still allow impossible height/weight pairs.
  if (!errors.height && !errors.weight) {
    const bmi = weightValue / ((heightValue / 100) ** 2);
    if (!Number.isFinite(bmi) || bmi < HEALTH_LIMITS.bmi.min || bmi > HEALTH_LIMITS.bmi.max) {
      errors.bmi = 'Chiều cao và cân nặng không khớp nhau, vui lòng kiểm tra lại';
    }
  }

  return errors;
}

export function validateBasicMetrics(values) {
  return Object.values(getBasicMetricErrors(values))[0] || '';
}

export function getTargetWeightError({ goal, targetWeight, weight }) {
  if (goal !== 'lose' && goal !== 'gain') return '';

  const target = Number(targetWeight);
  const current = Number(weight);
  if (!Number.isFinite(target) || target < HEALTH_LIMITS.targetWeight.min || target > HEALTH_LIMITS.targetWeight.max) {
    return `Cân nặng mục tiêu phải từ ${HEALTH_LIMITS.targetWeight.min} đến ${HEALTH_LIMITS.targetWeight.max} kg`;
  }

  if (!Number.isFinite(current)) return '';

  if (goal === 'lose' && target >= current) {
    return 'Cân nặng mục tiêu khi giảm cân phải nhỏ hơn cân nặng hiện tại';
  }
  if (goal === 'gain' && target <= current) {
    return 'Cân nặng mục tiêu khi tăng cơ phải lớn hơn cân nặng hiện tại';
  }
  return '';
}

export function validateTargetWeight(values) {
  return getTargetWeightError(values);
}

export function getTargetDaysError(targetDays) {
  const days = Number(targetDays);
  if (!Number.isFinite(days) || !Number.isInteger(days)
      || days < HEALTH_LIMITS.targetDays.min || days > HEALTH_LIMITS.targetDays.max) {
    return `Số ngày mục tiêu phải là số nguyên từ ${HEALTH_LIMITS.targetDays.min} đến ${HEALTH_LIMITS.targetDays.max}`;
  }
  return '';
}

export function validateTargetDays(targetDays) {
  return getTargetDaysError(targetDays);
}

/** Drop scientific notation and sign keys so a numeric input cannot smuggle 1e999. */
export function isForbiddenNumberKey(key) {
  return ['e', 'E', '+', '-'].includes(key);
}

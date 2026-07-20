/**
 * nutritionPredictor.js
 * Module giả lập tổng dinh dưỡng sau khi thêm một món ăn vào nhật ký.
 * Không ghi DB — chỉ tính toán client-side để preview trước khi submit.
 */

const NUTRIENT_CONFIG = [
  { key: 'calories', label: 'Năng lượng', unit: 'kcal', goalKey: 'calories' },
  { key: 'protein',  label: 'Protein',    unit: 'g',    goalKey: 'protein' },
  { key: 'carbs',    label: 'Carb',       unit: 'g',    goalKey: 'carbs' },
  { key: 'fat',      label: 'Chất béo',   unit: 'g',    goalKey: 'fat' },
  { key: 'sugar',    label: 'Đường',      unit: 'g',    goalKey: 'sugar' },
  { key: 'sodium',   label: 'Natri',      unit: 'mg',   goalKey: 'sodium' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', goalKey: 'cholesterol' },
  { key: 'fiber',    label: 'Chất xơ',   unit: 'g',    goalKey: 'fiber' },
];

/**
 * Giả lập tổng dinh dưỡng sau khi thêm món ăn.
 *
 * @param {Object} currentTotals
 *   Tổng dinh dưỡng hiện tại hôm nay.
 *   { calories, protein, carbs, fat, sugar, sodium, cholesterol, fiber }
 *
 * @param {Object} recipeNutrition
 *   Dinh dưỡng của 1 khẩu phần recipe.
 *   { calories, protein, carbs, fat, sugar, sodium, cholesterol, fiber }
 *
 * @param {number} servings
 *   Số khẩu phần sẽ thêm.
 *
 * @param {Object} dailyGoal
 *   Mục tiêu dinh dưỡng ngày.
 *   { calories, protein, carbs, fat, sugar, sodium, cholesterol, fiber }
 *
 * @returns {{
 *   projected: Object,        // tổng dự kiến sau khi thêm
 *   overflowFields: Array,    // các chỉ số vượt ngưỡng
 *   hasOverflow: boolean,
 *   added: Object,            // lượng sẽ thêm
 * }}
 */
export function predictNutritionAfterAdd(currentTotals = {}, recipeNutrition = {}, servings = 1, dailyGoal = {}) {
  const projected = {};
  const added = {};

  // Tính lượng thêm vào và tổng dự kiến
  NUTRIENT_CONFIG.forEach(({ key }) => {
    const current = currentTotals[key] || 0;
    const perServing = recipeNutrition[key] || 0;
    const addedAmount = perServing * servings;
    added[key] = addedAmount;
    projected[key] = current + addedAmount;
  });

  // Xác định các chỉ số vượt mục tiêu
  const overflowFields = NUTRIENT_CONFIG
    .filter(({ key, goalKey }) => {
      const goal = dailyGoal[goalKey] || dailyGoal[key];
      if (!goal || goal <= 0) return false;
      const currentVal = currentTotals[key] || 0;
      // Chỉ cảnh báo nếu TRƯỚC khi thêm chưa vượt, nhưng SAU khi thêm sẽ vượt
      // (hoặc đã vượt nhưng sẽ thêm nhiều hơn)
      return projected[key] > goal && (added[key] || 0) > 0;
    })
    .map(({ key, label, unit, goalKey }) => {
      const goal = dailyGoal[goalKey] || dailyGoal[key] || 0;
      const current = currentTotals[key] || 0;
      const proj = projected[key];
      const overflow = proj - goal;

      return {
        key,
        label,
        unit,
        current: Math.round(current),
        projected: Math.round(proj),
        goal: Math.round(goal),
        overflow: Math.round(overflow),
        added: Math.round(added[key] || 0),
      };
    });

  return {
    projected,
    added,
    overflowFields,
    hasOverflow: overflowFields.length > 0,
  };
}

/**
 * Lấy danh sách nutrient config (để render UI).
 */
export function getNutrientConfig() {
  return NUTRIENT_CONFIG;
}

/**
 * Tính nhanh projected cho một servings mới (dùng khi user điều chỉnh khẩu phần trong popup).
 */
export function recalcWithNewServings(currentTotals, recipeNutrition, newServings, dailyGoal) {
  return predictNutritionAfterAdd(currentTotals, recipeNutrition, newServings, dailyGoal);
}

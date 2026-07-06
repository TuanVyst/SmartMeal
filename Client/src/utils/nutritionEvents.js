export const NUTRITION_UPDATED_EVENT = 'smartmeal:nutrition-updated';

/**
 * @param {{ deltaCalories?: number, caloriesToday?: number }} [detail]
 */
export function notifyNutritionUpdated(detail) {
  window.dispatchEvent(new CustomEvent(NUTRITION_UPDATED_EVENT, { detail }));
}

// Shared "nutrient focus" state: chosen on the nutrition circles bar,
// consumed by meal-plan suggestion requests (sent as ?focus=a,b,c).
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'smartmeal:nutrientFocus';
const EVENT_NAME = 'smartmeal:nutrient-focus-changed';

export const MAX_NUTRIENT_FOCUS = 6;


export const NUTRIENT_FOCUS_LABELS = {
  protein: 'Đạm',
  sugar: 'Đường',
  sodium: 'Muối',
  fat: 'Chất béo',
  carbs: 'Chất bột đường',
  fiber: 'Chất xơ',
  cholesterol: 'Cholesterol',
};

// Nutrients that should be LIMITED (focus = prefer low amounts)
export const LIMIT_NUTRIENTS = ['sugar', 'sodium', 'cholesterol'];

export function getNutrientFocus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    return raw.split(',').filter(k => NUTRIENT_FOCUS_LABELS[k]).slice(0, MAX_NUTRIENT_FOCUS);
  } catch {
    return [];
  }
}

export function setNutrientFocus(keys) {
  const list = (keys || []).slice(0, MAX_NUTRIENT_FOCUS);
  try {
    if (list.length) localStorage.setItem(STORAGE_KEY, list.join(','));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: list }));
}

/** Toggle one nutrient. Returns false if the limit was reached. */
export function toggleNutrientFocus(key) {
  const current = getNutrientFocus();
  if (current.includes(key)) {
    setNutrientFocus(current.filter(k => k !== key));
    return true;
  }
  if (current.length >= MAX_NUTRIENT_FOCUS) return false;
  setNutrientFocus([...current, key]);
  return true;
}

export function focusQueryParam() {
  const f = getNutrientFocus();
  return f.length ? `&focus=${encodeURIComponent(f.join(','))}` : '';
}

export function useNutrientFocus() {
  const [focus, setFocus] = useState(getNutrientFocus);
  useEffect(() => {
    const handler = (e) => setFocus(e.detail || []);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);
  return [focus, setNutrientFocus];
}

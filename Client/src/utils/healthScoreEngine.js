/**
 * healthScoreEngine.js
 * Module tính Health Score (0–100) cho recipe dựa trên rule-based logic.
 * Không có AI — chỉ dùng rules từ healthRules.js.
 * 
 * Có thể mở rộng dễ dàng bằng cách thêm conditions vào CONDITION_SCORERS.
 */

import { HEALTH_CONDITION_RULES } from './healthRules';

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Normalize text: lowercase, bỏ dấu, bỏ khoảng trắng thừa.
 */
function normalize(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/**
 * Kiểm tra xem `text` có chứa bất kỳ keyword nào không.
 */
function containsAny(text, keywords = []) {
  const n = normalize(text);
  return keywords.some(kw => n.includes(normalize(kw)));
}

/**
 * Kiểm tra danh sách ingredients có chứa keyword nào không.
 */
function ingredientsContainAny(ingredients = [], keywords = []) {
  return ingredients.some(ing => containsAny(ing, keywords));
}

// ─── Condition Scorers ─────────────────────────────────────────────────────
// Mỗi scorer nhận: { nutrition, ingredientNames, recipeTitle }
// Trả về: { penalty: number, bonus: number, reasons: string[] }

const CONDITION_SCORERS = {
  diabetes({ nutrition, ingredientNames, recipeTitle }) {
    const rules = HEALTH_CONDITION_RULES.diabetes?.scoreRules || {};
    let penalty = 0;
    let bonus = 0;
    const reasons = [];

    const sugar = nutrition.sugar || 0;
    const carbs = nutrition.carbs || 0;
    const protein = nutrition.protein || 0;
    const fiber = nutrition.fiber || 0;

    if (sugar > (rules.highSugarThreshold ?? 10)) {
      penalty += rules.highSugarPenalty ?? 20;
      reasons.push(`Đường cao (${sugar}g) — không phù hợp Tiểu đường`);
    }

    if (carbs > (rules.highCarbsThreshold ?? 60)) {
      penalty += rules.highCarbsPenalty ?? 15;
      reasons.push(`Carb cao (${carbs}g) — không phù hợp Tiểu đường`);
    }

    // Tinh bột tinh chế
    const refinedKeywords = ['cơm trắng', 'bánh mì trắng', 'mì ống', 'bún', 'phở', 'bánh cuốn'];
    if (ingredientsContainAny(ingredientNames, refinedKeywords)) {
      penalty += 10;
      reasons.push('Chứa tinh bột tinh chế — không phù hợp Tiểu đường');
    }

    if (protein > 20) bonus += rules.highProteinBonus ?? 5;
    if (fiber > 5) bonus += rules.highFiberBonus ?? 5;

    return { penalty, bonus, reasons };
  },

  hypertension({ nutrition, ingredientNames, recipeTitle }) {
    const rules = HEALTH_CONDITION_RULES.hypertension?.scoreRules || {};
    let penalty = 0;
    let bonus = 0;
    const reasons = [];

    const sodium = nutrition.sodium || 0;

    if (sodium > (rules.highSodiumThreshold ?? 600)) {
      penalty += rules.highSodiumPenalty ?? 25;
      reasons.push(`Natri cao (${sodium}mg) — không phù hợp Huyết áp cao`);
    }

    // Muối/nước mắm keywords
    const saltKeywords = ['muối nhiều', 'nước mắm nhiều', 'đồ hộp', 'xúc xích', 'giăm bông', 'dưa muối'];
    if (ingredientsContainAny(ingredientNames, saltKeywords)) {
      penalty += 15;
      reasons.push('Chứa thực phẩm mặn — không phù hợp Huyết áp cao');
    }

    if (sodium < 300) bonus += rules.lowSodiumBonus ?? 5;

    return { penalty, bonus, reasons };
  },

  cholesterol({ nutrition, ingredientNames, recipeTitle }) {
    const rules = HEALTH_CONDITION_RULES.cholesterol?.scoreRules || {};
    let penalty = 0;
    let bonus = 0;
    const reasons = [];

    const cholesterol = nutrition.cholesterol || 0;
    const fat = nutrition.fat || 0;

    if (cholesterol > (rules.highCholesterolThreshold ?? 100)) {
      penalty += rules.highCholesterolPenalty ?? 20;
      reasons.push(`Cholesterol cao (${cholesterol}mg) — không phù hợp`);
    }

    if (fat > (rules.highFatThreshold ?? 20)) {
      penalty += rules.highFatPenalty ?? 15;
      reasons.push(`Chất béo cao (${fat}g) — không phù hợp Cholesterol cao`);
    }

    // Đồ chiên
    if (containsAny(recipeTitle, ['chiên', 'rán', 'deep fry'])) {
      penalty += rules.friedKeywordPenalty ?? 10;
      reasons.push('Món chiên/rán — không phù hợp Cholesterol cao');
    }

    // Omega-3 / cá
    const fishKeywords = ['cá hồi', 'cá thu', 'cá ngừ', 'cá'];
    const vegKeywords = ['rau', 'cải', 'súp lơ', 'bông cải'];
    if (ingredientsContainAny(ingredientNames, fishKeywords)) bonus += rules.fishBonus ?? 5;
    if (ingredientsContainAny(ingredientNames, vegKeywords)) bonus += rules.vegetableBonus ?? 5;

    return { penalty, bonus, reasons };
  },

  heartDisease({ nutrition, ingredientNames, recipeTitle }) {
    const rules = HEALTH_CONDITION_RULES.heartDisease?.scoreRules || {};
    let penalty = 0;
    let bonus = 0;
    const reasons = [];

    const cholesterol = nutrition.cholesterol || 0;
    const fat = nutrition.fat || 0;

    if (cholesterol > (rules.highCholesterolThreshold ?? 100)) {
      penalty += rules.highCholesterolPenalty ?? 20;
      reasons.push(`Cholesterol cao (${cholesterol}mg) — không phù hợp Tim mạch`);
    }

    if (fat > (rules.highFatThreshold ?? 20)) {
      penalty += rules.highFatPenalty ?? 15;
      reasons.push(`Chất béo bão hòa cao (${fat}g) — không phù hợp Tim mạch`);
    }

    if (containsAny(recipeTitle, ['chiên', 'rán'])) {
      penalty += rules.friedKeywordPenalty ?? 10;
      reasons.push('Món chiên/rán — không phù hợp Tim mạch');
    }

    // Omega-3 bonus
    const omega3Keywords = ['cá hồi', 'cá thu', 'cá ngừ', 'hạt óc chó', 'hạt chia'];
    const steamKeywords = ['hấp', 'luộc', 'hầm'];
    if (ingredientsContainAny(ingredientNames, omega3Keywords)) bonus += rules.omega3Bonus ?? 10;
    if (containsAny(recipeTitle, steamKeywords)) bonus += rules.steamedKeywordBonus ?? 5;

    return { penalty, bonus, reasons };
  },

  gout({ nutrition, ingredientNames, recipeTitle }) {
    const rules = HEALTH_CONDITION_RULES.gout?.scoreRules || {};
    let penalty = 0;
    let bonus = 0;
    const reasons = [];

    const protein = nutrition.protein || 0;
    const seafoodKw = rules.seafoodKeywords || ['hải sản', 'tôm', 'cua', 'mực', 'sò', 'ốc', 'ngao', 'hàu'];
    const organKw = rules.organKeywords || ['nội tạng', 'gan', 'tim', 'thận', 'lòng'];

    // Hải sản
    if (ingredientsContainAny(ingredientNames, seafoodKw) || containsAny(recipeTitle, seafoodKw)) {
      penalty += rules.seafoodPenalty ?? 30;
      reasons.push('Chứa hải sản — không phù hợp Gout');
    }

    // Nội tạng
    if (ingredientsContainAny(ingredientNames, organKw) || containsAny(recipeTitle, organKw)) {
      penalty += rules.organPenalty ?? 30;
      reasons.push('Chứa nội tạng — không phù hợp Gout');
    }

    // Protein quá cao
    if (protein > (rules.highProteinThreshold ?? 30)) {
      penalty += rules.highProteinPenalty ?? 10;
      reasons.push(`Protein cao (${protein}g) — cần hạn chế với Gout`);
    }

    // Rau xanh bonus
    const vegKeywords = ['rau', 'cải', 'cà rốt', 'bông cải', 'dưa leo'];
    if (ingredientsContainAny(ingredientNames, vegKeywords)) bonus += rules.vegetableBonus ?? 5;

    return { penalty, bonus, reasons };
  },

  gerd({ nutrition, ingredientNames, recipeTitle }) {
    const rules = HEALTH_CONDITION_RULES.gerd?.scoreRules || {};
    let penalty = 0;
    let bonus = 0;
    const reasons = [];

    const fat = nutrition.fat || 0;
    const spicyKw = rules.spicyKeywords || ['cay', 'ớt', 'tiêu', 'sa tế'];
    const sourKw = rules.sourKeywords || ['chua', 'giấm', 'chanh', 'me'];
    const coffeeKw = rules.coffeeKeywords || ['cà phê', 'cafe'];
    const friedKw = rules.friedKeywords || ['chiên', 'rán'];

    // Cay
    const allText = [...ingredientNames, recipeTitle];
    if (allText.some(t => containsAny(t, spicyKw))) {
      penalty += rules.spicyPenalty ?? 20;
      reasons.push('Món cay — không phù hợp Dạ dày');
    }

    // Chua
    if (allText.some(t => containsAny(t, sourKw))) {
      penalty += rules.sourPenalty ?? 15;
      reasons.push('Thức ăn chua — không phù hợp Dạ dày');
    }

    // Cà phê
    if (allText.some(t => containsAny(t, coffeeKw))) {
      penalty += rules.coffeePenalty ?? 20;
      reasons.push('Cà phê — không phù hợp Dạ dày');
    }

    // Chiên/rán
    if (containsAny(recipeTitle, friedKw) || ingredientsContainAny(ingredientNames, friedKw)) {
      penalty += rules.friedPenalty ?? 15;
      reasons.push('Món chiên/rán — không phù hợp Dạ dày');
    }

    // Fat cao
    if (fat > (rules.highFatThreshold ?? 25)) {
      penalty += rules.highFatPenalty ?? 10;
      reasons.push(`Nhiều dầu mỡ (${fat}g) — không phù hợp Dạ dày`);
    }

    // Hấp/luộc bonus
    const steamKw = ['hấp', 'luộc'];
    if (containsAny(recipeTitle, steamKw)) bonus += rules.steamedBonus ?? 5;

    return { penalty, bonus, reasons };
  },
};

// ─── Allergy Checker ───────────────────────────────────────────────────────

/**
 * Kiểm tra recipe có chứa ingredient bị dị ứng không.
 * @param {string[]} ingredientNames - tên các ingredient trong recipe
 * @param {string[]} userAllergies - danh sách dị ứng từ healthProfile.allergies
 * @returns {{ blocked: boolean, matchedAllergies: string[] }}
 */
export function checkAllergyBlock(ingredientNames = [], userAllergies = []) {
  if (!userAllergies || userAllergies.length === 0) return { blocked: false, matchedAllergies: [] };

  const matched = [];
  userAllergies.forEach(allergy => {
    const normalizedAllergy = normalize(allergy);
    const hasMatch = ingredientNames.some(ing => {
      const n = normalize(ing);
      return n.includes(normalizedAllergy) || normalizedAllergy.includes(n);
    });
    if (hasMatch) matched.push(allergy);
  });

  return { blocked: matched.length > 0, matchedAllergies: matched };
}

// ─── Main Scorer ───────────────────────────────────────────────────────────

/**
 * Tính Health Score cho một recipe dựa trên health profile người dùng.
 *
 * @param {Object} recipe
 *   @param {Object} recipe.nutrition - { calories, protein, carbs, fat, fiber, sugar, sodium, cholesterol }
 *   @param {Array}  recipe.ingredients - [{ name: string }, ...]
 *   @param {string} recipe.title - tên món
 *
 * @param {Object} healthProfile
 *   @param {string[]} healthProfile.conditions - danh sách bệnh lý (e.g., ['diabetes', 'gout'])
 *   @param {string[]} healthProfile.allergies - danh sách dị ứng text (e.g., ['Hải sản', 'Gluten'])
 *   @param {string}   healthProfile.goal - mục tiêu (lose/gain/maintain/heart/diabetes)
 *
 * @param {number} dailyCalorieBudget - ngân sách calo mỗi ngày
 *
 * @returns {{
 *   score: number,           // 0-100
 *   reasons: string[],       // lý do giảm điểm
 *   allergyBlock: boolean,   // có bị block do dị ứng không
 *   matchedAllergies: string[],
 *   badge: { level: 'green'|'yellow'|'red', label: string, percent: string }
 * }}
 */
export function calculateHealthScore(recipe, healthProfile, dailyCalorieBudget = 2000) {
  if (!healthProfile) {
    return {
      score: 100,
      reasons: [],
      allergyBlock: false,
      matchedAllergies: [],
      badge: { level: 'green', label: 'Rất phù hợp', percent: '100%' },
    };
  }

  const nutrition = recipe.nutrition || {};
  const ingredientNames = (recipe.ingredients || []).map(i => i.name || '');
  const recipeTitle = recipe.title || recipe.name || '';
  const conditions = healthProfile.conditions || [];
  const userAllergies = healthProfile.allergies || [];

  // 1. Kiểm tra dị ứng — block ngay nếu có
  const { blocked: allergyBlock, matchedAllergies } = checkAllergyBlock(ingredientNames, userAllergies);

  let score = 100;
  const reasons = [];

  // 2. Tính penalty/bonus theo từng bệnh lý
  conditions.forEach(condition => {
    const scorer = CONDITION_SCORERS[condition];
    if (!scorer) return;

    const { penalty, bonus, reasons: condReasons } = scorer({
      nutrition,
      ingredientNames,
      recipeTitle,
    });

    score -= penalty;
    score += bonus;
    reasons.push(...condReasons);
  });

  // 3. Penalty dựa trên calorie so với budget/3 (per-meal estimate)
  const mealCalorieLimit = dailyCalorieBudget / 3;
  const recipeCalories = nutrition.calories || 0;
  if (recipeCalories > mealCalorieLimit && mealCalorieLimit > 0) {
    const excessRatio = (recipeCalories - mealCalorieLimit) / mealCalorieLimit;
    const calPenalty = Math.min(20, Math.round(excessRatio * 20));
    if (calPenalty > 0) {
      score -= calPenalty;
      reasons.push(`Calo cao hơn khuyến nghị/bữa (${Math.round(recipeCalories)} kcal)`);
    }
  }

  // 4. Goal-based bonus
  const goal = healthProfile.goal;
  if (goal === 'lose') {
    const fat = nutrition.fat || 0;
    const calories = nutrition.calories || 0;
    if (fat < 10) score += 5;
    if (calories < 400) score += 5;
  } else if (goal === 'gain') {
    const protein = nutrition.protein || 0;
    if (protein > 25) score += 5;
  }

  // Clamp 0-100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // 5. Badge
  const badge = scoreToBadge(finalScore);

  return {
    score: finalScore,
    reasons,
    allergyBlock,
    matchedAllergies,
    badge,
  };
}

/**
 * Chuyển score thành badge metadata.
 * @param {number} score
 * @returns {{ level: 'green'|'yellow'|'red', label: string, percent: string }}
 */
export function scoreToBadge(score) {
  if (score >= 80) {
    return { level: 'green', label: 'Rất phù hợp', percent: `${score}%` };
  } else if (score >= 60) {
    return { level: 'yellow', label: 'Cần cân nhắc', percent: `${score}%` };
  } else {
    return { level: 'red', label: 'Không khuyến nghị', percent: `${score}%` };
  }
}

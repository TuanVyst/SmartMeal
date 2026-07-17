export const HEALTH_CONDITION_RULES = {
  obesity: {
    lockedIngredients: [
      "Mỡ heo",
      "Bơ",
      "Dầu cọ",
      "Đường trắng",
      "Nước cốt dừa"
    ],
    reducedIngredients: [
      "Dầu ăn",
      "Muối",
      "Đường"
    ],
    preferredIngredients: [
      "Dầu olive",
      "Dầu thực vật",
      "Rau xanh"
    ],
    maxCaloriesPerMeal: 500,
    dailyCalorieBudget: 1500
  },
  diabetes: {
    lockedIngredients: [
      "Đường trắng",
      "Mật ong",
      "Cơm trắng nhiều"
    ],
    reducedIngredients: [
      "Cơm trắng",
      "Bánh mì trắng",
      "Mì ống trắng",
      "Khoai tây",
      "Sữa có đường"
    ],
    preferredIngredients: [
      "Gạo lứt",
      "Yến mạch",
      "Đậu các loại",
      "Rau xanh lá",
      "Cá hồi",
      "Trứng",
      "Táo",
      "Quả mọng"
    ],
    maxCarbsPerMeal: 45,
    maxCaloriesPerMeal: 500,
    dailyCalorieBudget: 1600,
    scoreRules: {
      highSugarThreshold: 10,
      highCarbsThreshold: 60,
      highSugarPenalty: 20,
      highCarbsPenalty: 15,
      highProteinBonus: 5,
      highFiberBonus: 5,
    }
  },
  hypertension: {
    lockedIngredients: [
      "Muối nhiều",
      "Nước mắm nhiều",
      "Đồ hộp",
      "Xúc xích",
      "Giăm bông",
      "Chả lụa",
      "Dưa muối",
      "Cà muối"
    ],
    reducedIngredients: [
      "Muối",
      "Nước mắm",
      "Xì dầu",
      "Tương ớt",
      "Bột nêm",
      "Phô mai",
      "Đồ ăn vặt mặn"
    ],
    preferredIngredients: [
      "Rau xanh đậm",
      "Chuối",
      "Cam",
      "Bí ngô",
      "Khoai lang",
      "Đậu nành",
      "Cá hồi",
      "Quinoa"
    ],
    maxSodiumPerMeal: 600,
    maxCaloriesPerMeal: 550,
    dailyCalorieBudget: 1800,
    scoreRules: {
      highSodiumThreshold: 600,
      highSodiumPenalty: 25,
      lowSodiumBonus: 5,
    }
  },
  cholesterol: {
    lockedIngredients: [
      "Lòng đỏ trứng",
      "Nội tạng động vật",
      "Thịt mỡ",
      "Da gà",
      "Bơ",
      "Phô mai béo",
      "Kem tươi"
    ],
    reducedIngredients: [
      "Thịt bò",
      "Thịt heo",
      "Trứng",
      "Dầu ăn",
      "Mỡ heo"
    ],
    preferredIngredients: [
      "Cá hồi",
      "Cá thu",
      "Cá ngừ",
      "Rau xanh",
      "Bơ (avocado)",
      "Hạt chia",
      "Yến mạch",
      "Đậu nành",
      "Dầu olive"
    ],
    maxCholesterolPerMeal: 100,
    maxFatPerMeal: 20,
    dailyCalorieBudget: 1800,
    scoreRules: {
      highCholesterolThreshold: 100,
      highCholesterolPenalty: 20,
      highFatThreshold: 20,
      highFatPenalty: 15,
      friedKeywordPenalty: 10,
      fishBonus: 5,
      vegetableBonus: 5,
    }
  },
  heartDisease: {
    lockedIngredients: [
      "Mỡ heo",
      "Nội tạng",
      "Thịt mỡ",
      "Da gà",
      "Bơ (động vật)",
      "Dầu cọ",
      "Dầu dừa"
    ],
    reducedIngredients: [
      "Thịt đỏ",
      "Trứng",
      "Phô mai",
      "Muối",
      "Nước mắm",
      "Đồ chiên"
    ],
    preferredIngredients: [
      "Cá hồi",
      "Cá thu",
      "Hạt óc chó",
      "Hạt hạnh nhân",
      "Dầu olive",
      "Rau xanh đậm",
      "Quả mọng",
      "Yến mạch",
      "Đậu các loại"
    ],
    maxSodiumPerMeal: 500,
    maxFatPerMeal: 20,
    dailyCalorieBudget: 1800,
    scoreRules: {
      highCholesterolThreshold: 100,
      highCholesterolPenalty: 20,
      highFatThreshold: 20,
      highFatPenalty: 15,
      friedKeywordPenalty: 10,
      omega3Bonus: 10,
      steamedKeywordBonus: 5,
    }
  },
  gout: {
    lockedIngredients: [
      "Nội tạng",
      "Hải sản",
      "Thịt đỏ nhiều",
      "Nấm",
      "Đậu nành khô",
      "Mực",
      "Tôm",
      "Cua",
      "Sò",
      "Gà chiên",
      "Rượu bia"
    ],
    reducedIngredients: [
      "Thịt gà",
      "Thịt bò nạc",
      "Cá biển",
      "Đậu phộng",
      "Hạt hướng dương",
      "Trứng (lòng đỏ)"
    ],
    preferredIngredients: [
      "Sữa tách béo",
      "Trứng (chỉ lòng trắng)",
      "Tỏi",
      "Gừng",
      "Cà chua",
      "Dưa leo",
      "Cà rốt",
      "Bông cải xanh",
      "Yến mạch",
      "Gạo lứt"
    ],
    maxCaloriesPerMeal: 500,
    dailyCalorieBudget: 1800,
    scoreRules: {
      seafoodKeywords: ["hải sản", "tôm", "cua", "mực", "sò", "ốc", "ngao", "hàu"],
      organKeywords: ["nội tạng", "gan", "tim", "thận", "lòng"],
      seafoodPenalty: 30,
      organPenalty: 30,
      highProteinThreshold: 30,
      highProteinPenalty: 10,
      vegetableBonus: 5,
    }
  },
  gerd: {
    lockedIngredients: [
      "Ớt",
      "Tiêu",
      "Cà phê",
      "Sô cô la",
      "Rượu",
      "Đồ cay"
    ],
    reducedIngredients: [
      "Tỏi",
      "Hành",
      "Cà chua",
      "Nước cam",
      "Chanh",
      "Giấm",
      "Dầu ăn",
      "Đồ chiên"
    ],
    preferredIngredients: [
      "Gừng",
      "Chuối",
      "Táo",
      "Rau xanh",
      "Gạo",
      "Bánh mì trắng",
      "Sữa không béo",
      "Thịt nạc hấp"
    ],
    maxFatPerMeal: 15,
    dailyCalorieBudget: 1800,
    scoreRules: {
      spicyKeywords: ["cay", "ớt", "tiêu", "sa tế"],
      sourKeywords: ["chua", "giấm", "chanh", "me"],
      coffeeKeywords: ["cà phê", "cafe"],
      friedKeywords: ["chiên", "rán", "xào nhiều dầu"],
      spicyPenalty: 20,
      sourPenalty: 15,
      coffeePenalty: 20,
      friedPenalty: 15,
      highFatThreshold: 25,
      highFatPenalty: 10,
      steamedBonus: 5,
    }
  }
};

export function getLockedIngredientsForProfile(healthConditions) {
  if (!healthConditions || healthConditions.length === 0) {
    return [];
  }

  const lockedSet = new Set();

  healthConditions.forEach(condition => {
    const rules = HEALTH_CONDITION_RULES[condition];
    if (rules && rules.lockedIngredients) {
      rules.lockedIngredients.forEach(ingredient => lockedSet.add(ingredient));
    }
  });

  return Array.from(lockedSet);
}

export function getDailyLimits(conditions = []) {
  let sugarLimit = 50;    // g/ngày – khuyến nghị WHO
  let saltLimit = 5;      // g/ngày – khuyến nghị FDA (2300mg ≈ 5g)

  if (conditions.includes('diabetes')) sugarLimit = 25;
  if (conditions.includes('hypertension')) saltLimit = 1.5;
  // Bệnh tim mạch cũng nên hạn chế muối
  if (conditions.includes('heartDisease') && saltLimit > 1.5) saltLimit = 1.5;

  return { sugarLimit, saltLimit };
}

export function computeCalorieDelta(currentWeight, targetWeight, weeks = 12) {
  if (!currentWeight || !targetWeight || weeks <= 0) return 0;
  const weightDiff = targetWeight - currentWeight;
  // 1 kg = 7700 kcal
  const weeklyDeficit = (weightDiff * 7700) / weeks;
  // Clamp to safe limits: max -1000 kcal to +1000 kcal per day
  return Math.max(-1000, Math.min(1000, weeklyDeficit / 7));
}

export function getDailyCalorieBudget(profile) {
  const {
    weight, height, goal, targetWeight,
    targetWeeks = 12, dateOfBirth, gender, activityLevel, bmiLevel
  } = profile || {};

  let tdee = 2000;

  if (weight && height) {
    let age = 30; // Default age if missing
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
      if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
      }
    }

    // Mifflin-St Jeor Formula
    let bmr;
    const g = (gender || '').toLowerCase();
    if (g === 'male' || g === 'nam') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (g === 'female' || g === 'nữ') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 78; // Average fallback
    }

    // Activity Multiplier
    let activityMultiplier = 1.2;
    if (activityLevel) {
      const level = activityLevel.toLowerCase();
      if (level.includes('nhẹ') || level === 'light') activityMultiplier = 1.375;
      else if (level.includes('vừa') || level.includes('trung bình') || level === 'moderate') activityMultiplier = 1.55;
      else if (level.includes('nặng') || level === 'active') activityMultiplier = 1.725;
      else if (level.includes('rất nặng') || level === 'very active') activityMultiplier = 1.9;
    }

    tdee = bmr * activityMultiplier;
  } else {
    // Fallback if height or weight is missing
    const baseCalories = {
      underweight: 2200,
      normal: 2000,
      overweight: 1800,
      obese: 1500
    };
    tdee = baseCalories[bmiLevel] || baseCalories.normal;
  }

  if (weight && targetWeight && (goal === 'lose' || goal === 'gain')) {
    const delta = computeCalorieDelta(weight, targetWeight, targetWeeks);
    return tdee + delta;
  }

  const goalAdjustment = {
    lose: -500,
    maintain: 0,
    gain: 500
  };

  const adjustment = goalAdjustment[goal] || goalAdjustment.maintain;
  return tdee + adjustment;
}

export function calculateDailyTargets(profile) {
  const conditions = profile?.conditions || [];
  let kcal = getDailyCalorieBudget(profile);

  let targetProteinPct = 0.20;
  let targetCarbsPct = 0.50;
  let targetFatPct = 0.30;

  const hasDiabetes = conditions.includes('diabetes');
  const hasGout = conditions.includes('gout');
  const hasHypertension = conditions.includes('hypertension');

  // Prioritize strictest conditions
  if (hasDiabetes) {
    targetCarbsPct = 0.40; // Strict limit for carbs
    targetProteinPct = 0.25;
    targetFatPct = 0.35;
  }

  if (hasGout) {
    if (!hasDiabetes) targetCarbsPct = 0.55; // Only if diabetes is not present
    targetProteinPct = Math.min(targetProteinPct, 0.15); // Strict limit for protein
    targetFatPct = 1.0 - targetCarbsPct - targetProteinPct;
  }

  if (hasHypertension && !hasDiabetes && !hasGout) {
    targetCarbsPct = 0.52;
    targetProteinPct = 0.18;
    targetFatPct = 0.30;
  }

  // Normalize to 1.0
  const total = targetCarbsPct + targetProteinPct + targetFatPct;
  const proteinPct = targetProteinPct / total;
  const carbsPct = targetCarbsPct / total;
  const fatPct = targetFatPct / total;

  const { sugarLimit, saltLimit } = getDailyLimits(conditions);

  return {
    calories: Math.round(kcal),
    protein: Math.round(kcal * proteinPct / 4),
    carbs: Math.round(kcal * carbsPct / 4),
    fat: Math.round(kcal * fatPct / 9),
    fiber: 25,
    sugarLimit,
    saltLimit,
  };
}
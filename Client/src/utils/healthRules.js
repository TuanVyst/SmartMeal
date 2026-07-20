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
    maxCaloriesPerMeal: 500
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

export const GOAL_RULES = {
  lose: {
    reducedIngredients: [
      "Dầu ăn",
      "Mỡ",
      "Bơ",
      "Đồ chiên",
      "Đường trắng",
      "Đồ ngọt"
    ],
    scoreRules: {
      highFatPenalty: 15,
      friedKeywords: ["chiên", "rán", "xào nhiều dầu"],
      friedPenalty: 20
    }
  },
  gain: {
    reducedIngredients: [
      "Đồ chiên",
      "Mỡ"
    ],
    preferredIngredients: [
      "Thịt bò",
      "Thịt gà",
      "Cá",
      "Trứng",
      "Sữa",
      "Đậu nành",
      "Bơ đậu phộng"
    ],
    scoreRules: {
      highProteinBonus: 20,
      friedKeywords: ["chiên", "rán", "xào nhiều dầu"],
      friedPenalty: 15
    }
  },
  heart: {
    reducedIngredients: [
      "Muối",
      "Nước mắm",
      "Thịt mỡ",
      "Nội tạng",
      "Đồ chiên",
      "Mỡ heo"
    ],
    preferredIngredients: [
      "Rau xanh",
      "Trái cây",
      "Cá hồi",
      "Cá thu",
      "Dầu olive",
      "Yến mạch"
    ],
    scoreRules: {
      highSodiumPenalty: 25,
      highFatPenalty: 20,
      vegetableBonus: 15
    }
  },
  diabetes: {
    reducedIngredients: [
      "Đường trắng",
      "Mật ong",
      "Bánh ngọt",
      "Cơm trắng",
      "Đồ chiên",
      "Dầu mỡ"
    ],
    preferredIngredients: [
      "Gạo lứt",
      "Yến mạch",
      "Rau xanh lá",
      "Đậu các loại"
    ],
    scoreRules: {
      highSugarPenalty: 25,
      highCarbsPenalty: 20,
      highFatPenalty: 15
    }
  },
  maintain: {}
};

export function getLockedIngredientsForProfile(healthConditions, goal = null) {
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

  if (goal && GOAL_RULES[goal]) {
    const gRules = GOAL_RULES[goal];
    if (gRules.lockedIngredients) {
      gRules.lockedIngredients.forEach(ingredient => lockedSet.add(ingredient));
    }
  }

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

// ─── Safety Constants ──────────────────────────────────────────────────────
const SAFE_DEFICIT_MAX = 1000;          // kcal/ngày — không vượt quá mức này
const SAFE_MIN_CALORIES_MALE = 1500;    // kcal/ngày tối thiểu cho nam
const SAFE_MIN_CALORIES_FEMALE = 1200;  // kcal/ngày tối thiểu cho nữ
const BMR_FLOOR_RATIO = 0.9;            // calories >= 90% BMR

// ─── Activity Factor Lookup ────────────────────────────────────────────────
/**
 * Chuyển activityLevel string → hệ số nhân TDEE chuẩn hóa.
 * Hỗ trợ các giá trị từ DB cũ ('moderate', 'light'...) và mới ('sedentary', 'very_active'...).
 */
export function getActivityFactor(activityLevel) {
  if (!activityLevel) return 1.2; // default: sedentary
  const level = activityLevel.toLowerCase().replace(/-/g, '_');
  if (level === 'sedentary' || level === 'ít vận động') return 1.2;
  if (level === 'light' || level === 'vận động nhẹ' || level.includes('nhẹ')) return 1.375;
  if (level === 'moderate' || level === 'vận động vừa' || level.includes('vừa') || level.includes('trung bình')) return 1.55;
  if (level === 'active' || level === 'vận động nhiều' || level.includes('nặng')) return 1.725;
  if (level === 'very_active' || level === 'rất năng động' || level.includes('rất nặng') || level.includes('very')) return 1.9;
  return 1.2;
}

// ─── Calorie Delta (for lose/gain goals) ──────────────────────────────────
export function computeCalorieDelta(currentWeight, targetWeight, weeks = 12) {
  if (!currentWeight || !targetWeight || weeks <= 0) return 0;
  const weightDiff = targetWeight - currentWeight; // âm = giảm cân, dương = tăng cân
  // 1 kg mỡ ≈ 7700 kcal
  const totalKcal = weightDiff * 7700;
  const dailyDelta = totalKcal / (weeks * 7);
  // Clamp về giới hạn an toàn ±SAFE_DEFICIT_MAX
  return Math.max(-SAFE_DEFICIT_MAX, Math.min(SAFE_DEFICIT_MAX, dailyDelta));
}

// ─── Main Calorie Budget Calculator ───────────────────────────────────────
/**
 * Tính lượng calories mục tiêu theo thứ tự:
 *   Health Profile → BMR → TDEE → Goal Adjustment → Safety Validation
 *
 * Trả về object:
 *   { calories, bmr, tdee, maintenance, deficit, goalTooAggressive, estimatedWeeks, safeMinCalories }
 *
 * Bệnh lý nền KHÔNG thay đổi calories — chỉ thay đổi cơ cấu dinh dưỡng (xem calculateDailyTargets).
 */
export function getDailyCalorieBudget(profile) {
  const {
    weight, height, goal, targetWeight,
    targetWeeks = 12, dateOfBirth, gender, activityLevel, bmiLevel, age: directAge
  } = profile || {};

  // ── Bước 1-2: BMR (Mifflin-St Jeor) ──────────────────────────────────────
  let bmr = 0;
  let tdee = 2000;

  if (weight && height) {
    let age = 30;
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - dob.getFullYear();
      if (today.getMonth() < dob.getMonth() ||
         (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) {
        age--;
      }
    } else if (directAge) {
      age = Number(directAge) || 30;
    }

    const g = (gender || '').toLowerCase();
    if (g === 'male' || g === 'nam') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (g === 'female' || g === 'nữ') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 78; // trung bình
    }

    // ── Bước 3: TDEE = BMR × Activity Factor ──────────────────────────────
    const activityFactor = getActivityFactor(activityLevel);
    tdee = bmr * activityFactor;
  } else {
    // Fallback khi chưa đủ dữ liệu
    const fallbackTdee = { underweight: 2200, normal: 2000, overweight: 1800, obese: 1700 };
    tdee = fallbackTdee[bmiLevel] || 2000;
    bmr = tdee / 1.2; // ước tính ngược
  }

  // ── Bước 4: Maintenance Calories = TDEE ───────────────────────────────────
  const maintenance = tdee;

  // ── Xác định safe minimum theo giới tính ──────────────────────────────────
  const g = (gender || '').toLowerCase();
  const isFemale = g === 'female' || g === 'nữ';
  const safeMinCalories = isFemale ? SAFE_MIN_CALORIES_FEMALE : SAFE_MIN_CALORIES_MALE;
  const bmrFloor = bmr > 0 ? bmr * BMR_FLOOR_RATIO : safeMinCalories;
  const absoluteFloor = Math.max(safeMinCalories, bmrFloor);

  // ── Bước 5: Áp dụng Goal ──────────────────────────────────────────────────
  let rawTargetCalories = maintenance;
  let rawDeficit = 0;
  let goalTooAggressive = false;
  let estimatedWeeks = null;

  if (goal === 'lose' || goal === 'gain') {
    if (weight && targetWeight) {
      // Tính dựa trên cân nặng mục tiêu cụ thể
      const weeks = Math.max(1, targetWeeks || 12);
      rawDeficit = computeCalorieDelta(weight, targetWeight, weeks);
    } else {
      // Không có targetWeight → áp dụng deficit/surplus mặc định an toàn (tăng cơ không nhất thiết tăng calo)
      rawDeficit = goal === 'lose' ? -500 : 0;
    }
    rawTargetCalories = maintenance + rawDeficit;
  }
  // maintain / heart / diabetes → rawDeficit = 0, calories = TDEE

  // ── Bước 6: Safety Validation ─────────────────────────────────────────────
  let finalCalories = rawTargetCalories;

  if (finalCalories < absoluteFloor) {
    goalTooAggressive = true;
    finalCalories = absoluteFloor;

    // Tính lại thời gian thực tế với deficit an toàn
    if (weight && targetWeight && (goal === 'lose' || goal === 'gain')) {
      const actualDeficit = Math.abs(maintenance - finalCalories);
      if (actualDeficit > 0) {
        const totalKcal = Math.abs(targetWeight - weight) * 7700;
        estimatedWeeks = Math.ceil(totalKcal / (actualDeficit * 7));
      }
    }
  }

  // Không cho vượt quá TDEE + 1000 (tăng cân quá nhanh cũng không tốt)
  if (goal === 'gain' && finalCalories > maintenance + SAFE_DEFICIT_MAX) {
    finalCalories = maintenance + SAFE_DEFICIT_MAX;
  }

  const actualDeficit = maintenance - finalCalories; // dương = deficit (giảm cân), âm = surplus

  return {
    calories: Math.round(finalCalories),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    maintenance: Math.round(maintenance),
    deficit: Math.round(actualDeficit),
    goalTooAggressive,
    estimatedWeeks,
    safeMinCalories,
  };
}

// ─── Daily Nutrition Targets ───────────────────────────────────────────────
/**
 * Tính toàn bộ mục tiêu dinh dưỡng cho một ngày.
 * Bệnh lý nền KHÔNG thay đổi calories, chỉ thay đổi tỷ lệ Protein/Carbs/Fat và giới hạn đặc biệt.
 */
export function calculateDailyTargets(profile) {
  const conditions = profile?.conditions || [];
  const budgetResult = getDailyCalorieBudget(profile);
  const kcal = budgetResult.calories;

  // ── Tỷ lệ macro mặc định (AMDR chuẩn) ────────────────────────────────────
  let targetProteinPct = 0.20; // 20%
  let targetCarbsPct   = 0.50; // 50%
  let targetFatPct     = 0.30; // 30%

  // ── Điều chỉnh theo bệnh lý nền (KHÔNG thay đổi kcal, chỉ thay tỷ lệ) ──
  const hasDiabetes    = conditions.includes('diabetes');
  const hasGout        = conditions.includes('gout');
  const hasHypertension = conditions.includes('hypertension');
  const hasHeartDisease = conditions.includes('heartDisease');
  const hasCholesterol  = conditions.includes('cholesterol');

  if (hasDiabetes) {
    // Giảm carb, tăng protein & fat
    targetCarbsPct   = 0.40;
    targetProteinPct = 0.25;
    targetFatPct     = 0.35;
  }

  if (hasGout) {
    // Hạn chế protein (nguồn purine), tăng carb
    if (!hasDiabetes) targetCarbsPct = 0.55;
    targetProteinPct = Math.min(targetProteinPct, 0.15);
    targetFatPct = 1.0 - targetCarbsPct - targetProteinPct;
  }

  if ((hasHypertension || hasHeartDisease || hasCholesterol) && !hasDiabetes && !hasGout) {
    // Giảm fat bão hòa, tăng protein thực vật
    targetCarbsPct   = 0.52;
    targetProteinPct = 0.20;
    targetFatPct     = 0.28;
  }

  // Normalize về tổng 1.0
  const total = targetCarbsPct + targetProteinPct + targetFatPct;
  const proteinPct = targetProteinPct / total;
  const carbsPct   = targetCarbsPct / total;
  const fatPct     = targetFatPct / total;

  const { sugarLimit, saltLimit } = getDailyLimits(conditions);

  return {
    calories: kcal,
    protein:  Math.round(kcal * proteinPct / 4),
    carbs:    Math.round(kcal * carbsPct / 4),
    fat:      Math.round(kcal * fatPct / 9),
    fiber: 25,
    sugarLimit,
    saltLimit,
    // Metadata để hiển thị trên UI
    bmr:      budgetResult.bmr,
    tdee:     budgetResult.tdee,
    maintenance: budgetResult.maintenance,
    deficit:  budgetResult.deficit,
    goalTooAggressive: budgetResult.goalTooAggressive,
    estimatedWeeks:    budgetResult.estimatedWeeks,
  };
}
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

export function getDailyCalorieBudget(bmiLevel, goal) {
  const baseCalories = {
    underweight: 2200,
    normal: 2000,
    overweight: 1800,
    obese: 1500
  };

  const goalAdjustment = {
    lose: -500,
    maintain: 0,
    gain: 500
  };

  const base = baseCalories[bmiLevel] || baseCalories.normal;
  const adjustment = goalAdjustment[goal] || goalAdjustment.maintain;

  return base + adjustment;
}

export function calculateDailyTargets(bmiLevel, goal, conditions = []) {
  let kcal = getDailyCalorieBudget(bmiLevel, goal);

  if (conditions.includes('gout')) {
    kcal -= 100;
  }

  let proteinPct = 0.20;
  let carbsPct = 0.50;
  let fatPct = 0.30;

  if (conditions.includes('diabetes')) {
    carbsPct = 0.40;
    proteinPct = 0.25;
    fatPct = 0.35;
  }

  if (conditions.includes('gout')) {
    proteinPct = 0.15;
    carbsPct = 0.55;
    fatPct = 0.30;
  }

  if (conditions.includes('hypertension')) {
    proteinPct = 0.18;
    carbsPct = 0.52;
    fatPct = 0.30;
  }

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
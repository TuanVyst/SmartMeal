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
    dailyCalorieBudget: 1600
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
    dailyCalorieBudget: 1800
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
    dailyCalorieBudget: 1800
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
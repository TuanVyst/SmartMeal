/// Nutrition goal model
class NutritionGoal {
  final String? id;
  final String? accountId;
  final double? calories;
  final double? protein;
  final double? carbs;
  final double? fat;
  final double? fiber;
  final double? sugarLimit;
  final double? saltLimit;
  final double? cholesterolLimit;

  NutritionGoal({
    this.id,
    this.accountId,
    this.calories,
    this.protein,
    this.carbs,
    this.fat,
    this.fiber,
    this.sugarLimit,
    this.saltLimit,
    this.cholesterolLimit,
  });

  factory NutritionGoal.fromJson(Map<String, dynamic> json) {
    return NutritionGoal(
      id: json['goal_id']?.toString() ??
          json['Goal_id']?.toString() ??
          json['goalId']?.toString() ??
          json['GoalId']?.toString() ??
          json['nutrition_goal_id']?.toString() ??
          json['id']?.toString(),
      accountId: json['account_id']?.toString() ??
          json['Account_id']?.toString() ??
          json['accountId']?.toString() ??
          json['AccountId']?.toString(),
      calories: _toDouble(json['targetCalories'] ?? json['TargetCalories'] ?? json['target_calories'] ?? json['calories'] ?? json['Calories']),
      protein: _toDouble(json['targetProtein'] ?? json['TargetProtein'] ?? json['target_protein'] ?? json['protein'] ?? json['Protein']),
      carbs: _toDouble(json['targetCarbs'] ?? json['TargetCarbs'] ?? json['target_carbs'] ?? json['carbs'] ?? json['Carbs'] ?? json['carbohydrates'] ?? json['Carbohydrates']),
      fat: _toDouble(json['targetFat'] ?? json['TargetFat'] ?? json['target_fat'] ?? json['fat'] ?? json['Fat']),
      fiber: _toDouble(json['targetFiber'] ?? json['TargetFiber'] ?? json['target_fiber'] ?? json['fiber'] ?? json['Fiber']),
      sugarLimit: _toDouble(json['targetSugar'] ?? json['TargetSugar'] ?? json['target_sugar'] ?? json['sugarLimit'] ?? json['sugar_limit'] ?? json['sugar'] ?? json['Sugar']),
      saltLimit: _toDouble(json['targetSalt'] ?? json['TargetSalt'] ?? json['target_salt'] ?? json['saltLimit'] ?? json['salt_limit'] ?? json['salt'] ?? json['Salt'] ?? json['sodium'] ?? json['Sodium']),
      cholesterolLimit: _toDouble(json['targetCholesterol'] ?? json['TargetCholesterol'] ?? json['target_cholesterol'] ?? json['cholesterolLimit'] ?? json['cholesterol_limit'] ?? json['cholesterol'] ?? json['Cholesterol']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accountId': accountId,
      'targetCalories': calories,
      'targetProtein': protein,
      'targetCarbs': carbs,
      'targetFat': fat,
      'targetFiber': fiber,
      'targetSugar': sugarLimit,
      'targetSalt': saltLimit,
      'targetCholesterol': cholesterolLimit,
    };
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

/// Daily nutrition targets (with defaults matching web)
class DailyTargets {
  final double calories;
  final double protein;
  final double carbs;
  final double fat;
  final double fiber;
  final double sugarLimit;
  final double saltLimit;
  final double cholesterolLimit;

  const DailyTargets({
    this.calories = 2000,
    this.protein = 75,
    this.carbs = 250,
    this.fat = 65,
    this.fiber = 25,
    this.sugarLimit = 50,
    this.saltLimit = 5,
    this.cholesterolLimit = 300,
  });

  double get sugar => sugarLimit;
  double get sodium => saltLimit;
  double get cholesterol => cholesterolLimit;

  factory DailyTargets.fromGoal(NutritionGoal goal) {
    return DailyTargets(
      calories: (goal.calories != null && goal.calories! > 0) ? goal.calories! : 2000,
      protein: (goal.protein != null && goal.protein! > 0) ? goal.protein! : 75,
      carbs: (goal.carbs != null && goal.carbs! > 0) ? goal.carbs! : 250,
      fat: (goal.fat != null && goal.fat! > 0) ? goal.fat! : 65,
      fiber: (goal.fiber != null && goal.fiber! > 0) ? goal.fiber! : 25,
      sugarLimit: (goal.sugarLimit != null && goal.sugarLimit! > 0) ? goal.sugarLimit! : 50,
      saltLimit: (goal.saltLimit != null && goal.saltLimit! > 0) ? goal.saltLimit! : 5,
      cholesterolLimit: (goal.cholesterolLimit != null && goal.cholesterolLimit! > 0) ? goal.cholesterolLimit! : 300,
    );
  }
}

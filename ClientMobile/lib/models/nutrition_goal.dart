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
  });

  factory NutritionGoal.fromJson(Map<String, dynamic> json) {
    return NutritionGoal(
      id: json['nutrition_goal_id']?.toString() ?? json['id']?.toString(),
      accountId: json['account_id']?.toString() ?? json['accountId']?.toString(),
      calories: _toDouble(json['calories']),
      protein: _toDouble(json['protein']),
      carbs: _toDouble(json['carbs']),
      fat: _toDouble(json['fat']),
      fiber: _toDouble(json['fiber']),
      sugarLimit: _toDouble(json['sugarLimit'] ?? json['sugar_limit']),
      saltLimit: _toDouble(json['saltLimit'] ?? json['salt_limit']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accountId': accountId,
      'calories': calories,
      'protein': protein,
      'carbs': carbs,
      'fat': fat,
      'fiber': fiber,
      'sugarLimit': sugarLimit,
      'saltLimit': saltLimit,
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

  factory DailyTargets.fromGoal(NutritionGoal goal) {
    return DailyTargets(
      calories: goal.calories ?? 2000,
      protein: goal.protein ?? 75,
      carbs: goal.carbs ?? 250,
      fat: goal.fat ?? 65,
      fiber: goal.fiber ?? 25,
      sugarLimit: goal.sugarLimit ?? 50,
      saltLimit: goal.saltLimit ?? 5,
    );
  }
}

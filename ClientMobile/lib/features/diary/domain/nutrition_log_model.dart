/// Nutrition log entry – mapped from web's nutritionLogService
class NutritionLog {
  final String? id;
  final String? accountId;
  final String? recipeId;
  final String? ingredientId;
  final DateTime? logDate;
  final String? mealType;
  final double? quantity;
  final double? totalCalories;
  final double? totalProtein;
  final double? totalCarbs;
  final double? totalFat;
  final double? totalFiber;
  final double? totalSugar;
  final double? totalSalt;
  final double? totalCholesterol;

  NutritionLog({
    this.id,
    this.accountId,
    this.recipeId,
    this.ingredientId,
    this.logDate,
    this.mealType,
    this.quantity,
    this.totalCalories,
    this.totalProtein,
    this.totalCarbs,
    this.totalFat,
    this.totalFiber,
    this.totalSugar,
    this.totalSalt,
    this.totalCholesterol,
  });

  factory NutritionLog.fromJson(Map<String, dynamic> json) {
    return NutritionLog(
      id: json['nutrition_log_id']?.toString() ?? json['nutritionLogId']?.toString() ?? json['id']?.toString(),
      accountId: json['account_id']?.toString() ?? json['accountId']?.toString(),
      recipeId: json['recipe_id']?.toString() ?? json['recipeId']?.toString(),
      ingredientId: json['ingredient_id']?.toString() ?? json['ingredientId']?.toString(),
      logDate: _parseDate(json['logDate'] ?? json['log_date']),
      mealType: json['mealType'] as String? ?? json['meal_type'] as String?,
      quantity: _toDouble(json['quantity']),
      totalCalories: _toDouble(json['totalCalories']),
      totalProtein: _toDouble(json['totalProtein']),
      totalCarbs: _toDouble(json['totalCarbs']),
      totalFat: _toDouble(json['totalFat']),
      totalFiber: _toDouble(json['totalFiber']),
      totalSugar: _toDouble(json['totalSugar']),
      totalSalt: _toDouble(json['totalSalt'] ?? json['totalSodium']),
      totalCholesterol: _toDouble(json['totalCholesterol']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accountId': accountId,
      'recipe_id': recipeId,
      'ingredient_id': ingredientId,
      'logDate': logDate?.toIso8601String(),
      'mealType': mealType,
      'quantity': quantity,
      'totalCalories': totalCalories,
      'totalProtein': totalProtein,
      'totalCarbs': totalCarbs,
      'totalFat': totalFat,
      'totalFiber': totalFiber,
      'totalSugar': totalSugar,
      'totalSalt': totalSalt,
      'totalCholesterol': totalCholesterol,
    };
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is String) return DateTime.tryParse(value);
    return null;
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

/// Today's nutrition totals (aggregated)
class NutritionTotals {
  final double calories;
  final double protein;
  final double carbs;
  final double fat;
  final double fiber;
  final double sugar;
  final double sodium;
  final double cholesterol;

  const NutritionTotals({
    this.calories = 0,
    this.protein = 0,
    this.carbs = 0,
    this.fat = 0,
    this.fiber = 0,
    this.sugar = 0,
    this.sodium = 0,
    this.cholesterol = 0,
  });
}

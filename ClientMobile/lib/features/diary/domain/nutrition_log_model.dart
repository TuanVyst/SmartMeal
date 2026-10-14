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
      id: json['log_id']?.toString() ??
          json['logId']?.toString() ??
          json['Log_id']?.toString() ??
          json['nutrition_log_id']?.toString() ??
          json['nutritionLogId']?.toString() ??
          json['id']?.toString(),
      accountId: json['account_id']?.toString() ??
          json['accountId']?.toString() ??
          json['Account_id']?.toString(),
      recipeId: json['recipe_id']?.toString() ??
          json['recipeId']?.toString() ??
          json['Recipe_id']?.toString(),
      ingredientId: json['ingredient_id']?.toString() ??
          json['ingredientId']?.toString() ??
          json['Ingredient_id']?.toString(),
      logDate: _parseDate(json['logDate'] ?? json['log_date'] ?? json['LogDate']),
      mealType: (json['mealType'] ?? json['meal_type'] ?? json['MealType']) as String?,
      quantity: _toDouble(json['quantity'] ?? json['Quantity']),
      totalCalories: _toDouble(json['totalCalories'] ?? json['total_calories'] ?? json['TotalCalories']),
      totalProtein: _toDouble(json['totalProtein'] ?? json['total_protein'] ?? json['TotalProtein']),
      totalCarbs: _toDouble(json['totalCarbs'] ?? json['total_carbs'] ?? json['TotalCarbs']),
      totalFat: _toDouble(json['totalFat'] ?? json['total_fat'] ?? json['TotalFat']),
      totalFiber: _toDouble(json['totalFiber'] ?? json['total_fiber'] ?? json['TotalFiber']),
      totalSugar: _toDouble(json['totalSugar'] ?? json['total_sugar'] ?? json['TotalSugar']),
      totalSalt: _toDouble(json['totalSalt'] ?? json['total_salt'] ?? json['TotalSalt'] ?? json['totalSodium'] ?? json['total_sodium'] ?? json['TotalSodium']),
      totalCholesterol: _toDouble(json['totalCholesterol'] ?? json['total_cholesterol'] ?? json['TotalCholesterol']),
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
    if (value is DateTime) return value.toLocal();
    if (value is String) {
      final dt = DateTime.tryParse(value);
      return dt?.toLocal();
    }
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

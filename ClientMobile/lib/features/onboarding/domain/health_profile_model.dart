class HealthProfile {
  final String? accountId;
  final double? height;
  final double? weight;
  final double? targetWeight;
  final int? targetDays;
  final String? goal;
  final String? gender;
  final DateTime? dateOfBirth;
  final String? activityLevel;
  final String? bmiLevel;
  final List<String>? conditions;
  final List<String>? allergies;
  final int? cookingTimeMinutes;
  final String? budgetLevel;
  final int? mealsPerDay;
  final String? dietType;
  final int? planCycleDays;
  final DailyTargets? dailyTargets;

  HealthProfile({
    this.accountId,
    this.height,
    this.weight,
    this.targetWeight,
    this.targetDays,
    this.goal,
    this.gender,
    this.dateOfBirth,
    this.activityLevel,
    this.bmiLevel,
    this.conditions,
    this.allergies,
    this.cookingTimeMinutes,
    this.budgetLevel,
    this.mealsPerDay,
    this.dietType,
    this.planCycleDays,
    this.dailyTargets,
  });

  factory HealthProfile.fromJson(Map<String, dynamic> json) {
    return HealthProfile(
      accountId: json['account_id']?.toString() ?? json['accountId']?.toString() ?? json['Account_id']?.toString(),
      height: (json['height'] ?? json['Height'] as num?)?.toDouble(),
      weight: (json['weight'] ?? json['Weight'] as num?)?.toDouble(),
      targetWeight: (json['targetWeight'] ?? json['TargetWeight'] as num?)?.toDouble(),
      targetDays: (json['targetDays'] ?? json['TargetDays'] as num?)?.toInt(),
      goal: (json['goal'] ?? json['Goal']) as String?,
      gender: (json['gender'] ?? json['Gender']) as String?,
      dateOfBirth: (json['dateOfBirth'] ?? json['DateOfBirth']) != null
          ? DateTime.tryParse((json['dateOfBirth'] ?? json['DateOfBirth']).toString())
          : null,
      activityLevel: (json['activityLevel'] ?? json['ActivityLevel']) as String?,
      bmiLevel: (json['bmiLevel'] ?? json['BmiLevel']) as String?,
      conditions: (json['conditions'] ?? json['Conditions'] as List<dynamic>?)?.map((e) => e.toString()).toList(),
      allergies: (json['allergies'] ?? json['Allergies'] as List<dynamic>?)?.map((e) => e.toString()).toList(),
      cookingTimeMinutes: (json['cookingTimeMinutes'] ?? json['CookingTimeMinutes'] as num?)?.toInt(),
      budgetLevel: (json['budgetLevel'] ?? json['BudgetLevel']) as String?,
      mealsPerDay: (json['mealsPerDay'] ?? json['MealsPerDay'] as num?)?.toInt(),
      dietType: (json['dietType'] ?? json['DietType']) as String?,
      planCycleDays: (json['planCycleDays'] ?? json['PlanCycleDays'] as num?)?.toInt(),
      dailyTargets: (json['dailyTargets'] ?? json['DailyTargets']) != null
          ? DailyTargets.fromJson((json['dailyTargets'] ?? json['DailyTargets']) as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'accountId': accountId,
      'height': height,
      'weight': weight,
      'targetWeight': targetWeight,
      'targetDays': targetDays,
      'goal': goal,
      'gender': gender,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'activityLevel': activityLevel,
      'bmiLevel': bmiLevel,
      'conditions': conditions,
      'allergies': allergies,
      'cookingTimeMinutes': cookingTimeMinutes,
      'budgetLevel': budgetLevel,
      'mealsPerDay': mealsPerDay,
      'dietType': dietType,
      'planCycleDays': planCycleDays,
      'dailyTargets': dailyTargets != null
          ? {
              'calories': dailyTargets!.calories,
              'protein': dailyTargets!.protein,
              'carbs': dailyTargets!.carbs,
              'fat': dailyTargets!.fat,
              'fiber': dailyTargets!.fiber,
              'sugarLimit': dailyTargets!.sugarLimit,
              'saltLimit': dailyTargets!.saltLimit,
            }
          : null,
    };
  }
}

class DailyTargets {
  final double calories;
  final double protein;
  final double carbs;
  final double fat;
  final double fiber;
  final double sugarLimit;
  final double saltLimit;

  DailyTargets({
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.fiber,
    required this.sugarLimit,
    required this.saltLimit,
  });

  factory DailyTargets.fromJson(Map<String, dynamic> json) {
    return DailyTargets(
      calories: (json['calories'] as num?)?.toDouble() ?? 0.0,
      protein: (json['protein'] as num?)?.toDouble() ?? 0.0,
      carbs: (json['carbs'] as num?)?.toDouble() ?? 0.0,
      fat: (json['fat'] as num?)?.toDouble() ?? 0.0,
      fiber: (json['fiber'] as num?)?.toDouble() ?? 0.0,
      sugarLimit: (json['sugarLimit'] as num?)?.toDouble() ?? 0.0,
      saltLimit: (json['saltLimit'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

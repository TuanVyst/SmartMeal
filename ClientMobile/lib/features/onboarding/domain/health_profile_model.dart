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
      accountId: json['account_id']?.toString(),
      height: (json['height'] as num?)?.toDouble(),
      weight: (json['weight'] as num?)?.toDouble(),
      targetWeight: (json['targetWeight'] as num?)?.toDouble(),
      targetDays: json['targetDays'] as int?,
      goal: json['goal'] as String?,
      gender: json['gender'] as String?,
      dateOfBirth: json['dateOfBirth'] != null ? DateTime.parse(json['dateOfBirth'].toString()) : null,
      activityLevel: json['activityLevel'] as String?,
      bmiLevel: json['bmiLevel'] as String?,
      conditions: (json['conditions'] as List<dynamic>?)?.map((e) => e.toString()).toList(),
      allergies: (json['allergies'] as List<dynamic>?)?.map((e) => e.toString()).toList(),
      cookingTimeMinutes: json['cookingTimeMinutes'] as int?,
      budgetLevel: json['budgetLevel'] as String?,
      mealsPerDay: json['mealsPerDay'] as int?,
      dietType: json['dietType'] as String?,
      planCycleDays: json['planCycleDays'] as int?,
      dailyTargets: json['dailyTargets'] != null ? DailyTargets.fromJson(json['dailyTargets'] as Map<String, dynamic>) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'height': height,
      'weight': weight,
      'targetWeight': targetWeight,
      'targetDays': targetDays,
      'goal': goal,
      'gender': gender,
      'dateOfBirth': dateOfBirth?.toIso8601String(),
      'activityLevel': activityLevel,
      'conditions': conditions,
      'allergies': allergies,
      'cookingTimeMinutes': cookingTimeMinutes,
      'budgetLevel': budgetLevel,
      'mealsPerDay': mealsPerDay,
      'dietType': dietType,
      'planCycleDays': planCycleDays,
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

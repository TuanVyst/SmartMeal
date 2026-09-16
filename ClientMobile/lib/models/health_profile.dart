/// Health profile – mapped from web's HealthProfileContext / health-survey
class HealthProfile {
  final double? weight;
  final double? height;
  final double? bmi;
  final String? goal; // lose, gain, maintain
  final int? age;
  final String? gender;
  final String? activityLevel;
  final List<String> conditions;
  final List<String> allergies;
  final List<String> lockedIngredients;
  final List<String> reducedIngredients;
  final List<String> preferredIngredients;

  HealthProfile({
    this.weight,
    this.height,
    this.bmi,
    this.goal,
    this.age,
    this.gender,
    this.activityLevel,
    this.conditions = const [],
    this.allergies = const [],
    this.lockedIngredients = const [],
    this.reducedIngredients = const [],
    this.preferredIngredients = const [],
  });

  factory HealthProfile.fromJson(Map<String, dynamic> json) {
    return HealthProfile(
      weight: _toDouble(json['weight']),
      height: _toDouble(json['height']),
      bmi: _toDouble(json['bmi']),
      goal: json['goal'] as String?,
      age: json['age'] as int?,
      gender: json['gender'] as String?,
      activityLevel: json['activityLevel'] as String? ?? json['activity_level'] as String?,
      conditions: _toStringList(json['conditions'] ?? json['healthConditions']),
      allergies: _toStringList(json['allergies']),
      lockedIngredients: _toStringList(json['lockedIngredients']),
      reducedIngredients: _toStringList(json['reducedIngredients']),
      preferredIngredients: _toStringList(json['preferredIngredients']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'weight': weight,
      'height': height,
      'goal': goal,
      'age': age,
      'gender': gender,
      'activityLevel': activityLevel,
      'conditions': conditions,
      'allergies': allergies,
    };
  }

  String get bmiCategory {
    final b = bmi ?? 0;
    if (b < 18.5) return 'underweight';
    if (b < 25) return 'normal';
    if (b < 30) return 'overweight';
    return 'obese';
  }

  String get bmiCategoryLabel {
    switch (bmiCategory) {
      case 'underweight':
        return 'Thiếu cân';
      case 'normal':
        return 'Bình thường';
      case 'overweight':
        return 'Thừa cân';
      case 'obese':
        return 'Béo phì';
      default:
        return '';
    }
  }

  String get goalLabel {
    switch (goal) {
      case 'lose':
        return 'Giảm cân';
      case 'gain':
        return 'Tăng cơ';
      case 'maintain':
        return 'Duy trì';
      default:
        return '';
    }
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  static List<String> _toStringList(dynamic value) {
    if (value == null) return [];
    if (value is List) return value.map((e) => e.toString()).toList();
    return [];
  }
}

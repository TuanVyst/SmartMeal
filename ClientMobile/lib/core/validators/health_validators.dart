import 'dart:math';
import 'package:flutter/services.dart';

/// Shared bounds for health metrics.
/// Keep in sync with Client/src/utils/healthConstraints.js and
/// Server/BusinessObject/Helpers/HealthProfileValidator.cs.
class HealthLimits {
  static const int minAge = 10;
  static const int maxAge = 120;

  static const double minHeight = 100;
  static const double maxHeight = 250;

  static const double minWeight = 20;
  static const double maxWeight = 300;

  static const double minTargetWeight = 20;
  static const double maxTargetWeight = 300;

  static const int minTargetDays = 14;
  static const int maxTargetDays = 730;

  static const double minBmi = 10;
  static const double maxBmi = 80;
}

class HealthValidation {
  HealthValidation._();

  static double? _parseDouble(String raw) {
    final parsed = double.tryParse(raw.trim().replaceAll(',', '.'));
    if (parsed == null || !parsed.isFinite) return null;
    return parsed;
  }

  static int? _parseInt(String raw) => int.tryParse(raw.trim());

  static String? validateAge(String raw) {
    final age = _parseInt(raw);
    if (age == null || age < HealthLimits.minAge || age > HealthLimits.maxAge) {
      return 'Tuổi phải là số nguyên từ ${HealthLimits.minAge} đến ${HealthLimits.maxAge}';
    }
    return null;
  }

  static String? validateHeight(String raw) {
    final height = _parseDouble(raw);
    if (height == null || height < HealthLimits.minHeight || height > HealthLimits.maxHeight) {
      return 'Chiều cao phải từ ${HealthLimits.minHeight.toInt()} đến ${HealthLimits.maxHeight.toInt()} cm';
    }
    return null;
  }

  static String? validateWeight(String raw) {
    final weight = _parseDouble(raw);
    if (weight == null || weight < HealthLimits.minWeight || weight > HealthLimits.maxWeight) {
      return 'Cân nặng phải từ ${HealthLimits.minWeight.toInt()} đến ${HealthLimits.maxWeight.toInt()} kg';
    }
    return null;
  }

  static String? validateBasicMetrics({
    required String age,
    required String height,
    required String weight,
  }) {
    final ageError = validateAge(age);
    if (ageError != null) return ageError;

    final heightError = validateHeight(height);
    if (heightError != null) return heightError;

    final weightError = validateWeight(weight);
    if (weightError != null) return weightError;

    final heightValue = _parseDouble(height)!;
    final weightValue = _parseDouble(weight)!;
    final bmi = weightValue / pow(heightValue / 100, 2);
    if (!bmi.isFinite || bmi < HealthLimits.minBmi || bmi > HealthLimits.maxBmi) {
      return 'Chiều cao và cân nặng không khớp nhau, vui lòng kiểm tra lại';
    }
    return null;
  }

  static String? validateTargetWeight({
    required String targetWeight,
    required String weight,
    required String goal,
  }) {
    if (goal != 'lose' && goal != 'gain') return null;

    final target = _parseDouble(targetWeight);
    if (target == null ||
        target < HealthLimits.minTargetWeight ||
        target > HealthLimits.maxTargetWeight) {
      return 'Cân nặng mục tiêu phải từ ${HealthLimits.minTargetWeight.toInt()} đến ${HealthLimits.maxTargetWeight.toInt()} kg';
    }

    final current = _parseDouble(weight);
    if (current == null) return null;

    if (goal == 'lose' && target >= current) {
      return 'Cân nặng mục tiêu khi giảm cân phải nhỏ hơn cân nặng hiện tại';
    }
    if (goal == 'gain' && target <= current) {
      return 'Cân nặng mục tiêu khi tăng cơ phải lớn hơn cân nặng hiện tại';
    }
    return null;
  }

  static String? validateTargetDays(String raw) {
    final days = _parseInt(raw);
    if (days == null || days < HealthLimits.minTargetDays || days > HealthLimits.maxTargetDays) {
      return 'Số ngày mục tiêu phải là số nguyên từ ${HealthLimits.minTargetDays} đến ${HealthLimits.maxTargetDays}';
    }
    return null;
  }
}

/// Allows digits plus at most [decimalDigits] decimals, capped at [maxIntegerDigits].
class HealthDecimalInputFormatter extends TextInputFormatter {
  HealthDecimalInputFormatter({this.maxIntegerDigits = 3, this.decimalDigits = 1});

  final int maxIntegerDigits;
  final int decimalDigits;

  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final text = newValue.text;
    if (text.isEmpty) return newValue;
    final pattern = RegExp('^\\d{0,$maxIntegerDigits}([.,]\\d{0,$decimalDigits})?\$');
    return pattern.hasMatch(text) ? newValue : oldValue;
  }
}

/// Allows digits only, capped at [maxDigits].
class HealthIntegerInputFormatter extends TextInputFormatter {
  HealthIntegerInputFormatter({this.maxDigits = 3});

  final int maxDigits;

  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    final text = newValue.text;
    if (text.isEmpty) return newValue;
    final pattern = RegExp('^\\d{0,$maxDigits}\$');
    return pattern.hasMatch(text) ? newValue : oldValue;
  }
}

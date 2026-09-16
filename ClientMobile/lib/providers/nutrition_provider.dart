import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/nutrition_log.dart';
import '../models/nutrition_goal.dart';
import '../services/nutrition_log_service.dart';
import '../services/nutrition_goal_service.dart';

/// Nutrition provider – manages nutrition logs, goals, and daily totals
class NutritionProvider extends ChangeNotifier {
  final NutritionLogService _logService = NutritionLogService();
  final NutritionGoalService _goalService = NutritionGoalService();

  List<NutritionLog> _logs = [];
  DailyTargets _dailyTargets = const DailyTargets();
  bool _loading = false;
  String? _error;

  List<NutritionLog> get logs => _logs;
  DailyTargets get dailyTargets => _dailyTargets;
  bool get loading => _loading;
  String? get error => _error;

  /// Today's date key (yyyy-MM-dd)
  String get todayKey => DateFormat('yyyy-MM-dd').format(DateTime.now());

  /// Filter logs for today
  List<NutritionLog> get todayLogs {
    return _logs.where((log) {
      if (log.logDate == null) return false;
      return DateFormat('yyyy-MM-dd').format(log.logDate!) == todayKey;
    }).toList();
  }

  /// Calculate today's totals (matching web's Dashboard reduce logic)
  NutritionTotals get todayTotals {
    double calories = 0, protein = 0, carbs = 0, fat = 0;
    double fiber = 0, sugar = 0, sodium = 0, cholesterol = 0;

    for (final log in todayLogs) {
      calories += log.totalCalories ?? 0;
      protein += log.totalProtein ?? 0;
      carbs += log.totalCarbs ?? 0;
      fat += log.totalFat ?? 0;
      fiber += log.totalFiber ?? 0;
      sugar += log.totalSugar ?? 0;
      sodium += log.totalSalt ?? 0;
      cholesterol += log.totalCholesterol ?? 0;
    }

    return NutritionTotals(
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat,
      fiber: fiber,
      sugar: sugar,
      sodium: sodium,
      cholesterol: cholesterol,
    );
  }

  /// Calorie progress for today (used by sidebar avatar ring)
  double get caloriesToday => todayTotals.calories;
  double get targetCalories => dailyTargets.calories;

  /// Fetch all logs for an account
  Future<void> fetchLogs(String accountId) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _logs = await _logService.getAll(accountId);
    } catch (e) {
      _error = 'Lỗi khi tải nhật ký dinh dưỡng: $e';
      debugPrint(_error);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Fetch nutrition goals
  Future<void> fetchGoals(String accountId) async {
    try {
      final goals = await _goalService.getAll(accountId);
      if (goals.isNotEmpty) {
        _dailyTargets = DailyTargets.fromGoal(goals.first);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching nutrition goals: $e');
    }
  }

  /// Add a nutrition log
  Future<void> addLog(Map<String, dynamic> data) async {
    try {
      final newLog = await _logService.create(data);
      _logs.add(newLog);
      notifyListeners();
    } catch (e) {
      debugPrint('Error adding log: $e');
      rethrow;
    }
  }

  /// Delete a nutrition log
  Future<void> deleteLog(String id) async {
    try {
      await _logService.delete(id);
      _logs.removeWhere((log) => log.id == id);
      notifyListeners();
    } catch (e) {
      debugPrint('Error deleting log: $e');
      rethrow;
    }
  }

  /// Calculate streak days (matching web's Sidebar logic)
  int get streakDays {
    final uniqueDates = <String>{};
    for (final log in _logs) {
      if (log.logDate != null) {
        uniqueDates.add(DateFormat('yyyy-MM-dd').format(log.logDate!));
      }
    }

    if (uniqueDates.isEmpty) return 0;

    int streak = 0;
    DateTime cursor = DateTime.now();

    // Check today first, then yesterday
    String cursorKey = DateFormat('yyyy-MM-dd').format(cursor);
    if (!uniqueDates.contains(cursorKey)) {
      cursor = cursor.subtract(const Duration(days: 1));
      cursorKey = DateFormat('yyyy-MM-dd').format(cursor);
      if (!uniqueDates.contains(cursorKey)) return 0;
    }

    while (uniqueDates.contains(cursorKey)) {
      streak++;
      cursor = cursor.subtract(const Duration(days: 1));
      cursorKey = DateFormat('yyyy-MM-dd').format(cursor);
    }

    return streak;
  }
}

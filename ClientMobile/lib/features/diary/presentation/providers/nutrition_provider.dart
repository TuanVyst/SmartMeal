import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:smart_meal/features/diary/domain/nutrition_log_model.dart';
import 'package:smart_meal/features/nutrition/domain/nutrition_goal_model.dart';
import 'package:smart_meal/features/diary/data/nutrition_log_service.dart';
import 'package:smart_meal/features/nutrition/data/nutrition_goal_service.dart';
import 'package:smart_meal/features/recipes/domain/recipe_model.dart';
import 'package:smart_meal/features/recipes/data/recipe_service.dart';

/// Nutrition provider – manages nutrition logs, goals, and daily totals
class NutritionProvider extends ChangeNotifier {
  final NutritionLogService _logService = NutritionLogService();
  final NutritionGoalService _goalService = NutritionGoalService();
  final RecipeService _recipeService = RecipeService();

  List<NutritionLog> _logs = [];
  Map<String, Recipe> _recipesMap = {};
  DailyTargets _dailyTargets = const DailyTargets();
  bool _loading = false;
  String? _error;

  List<NutritionLog> get logs => _logs;
  DailyTargets get dailyTargets => _dailyTargets;
  bool get loading => _loading;
  String? get error => _error;
  Map<String, Recipe> get recipesMap => _recipesMap;
  String? getRecipeName(String? recipeId) => recipeId != null ? _recipesMap[recipeId]?.recipeName : null;

  /// Today's date key (yyyy-MM-dd)
  String get todayKey => DateFormat('yyyy-MM-dd').format(DateTime.now());

  String _selectedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String get selectedDate => _selectedDate;

  void setSelectedDate(String date) {
    _selectedDate = date;
    notifyListeners();
  }

  void setDailyTargets(DailyTargets targets) {
    _dailyTargets = targets;
    notifyListeners();
  }

  void setRecipes(List<Recipe> recipes) {
    _recipesMap = {for (final r in recipes) r.recipeId: r};
    notifyListeners();
  }

  String _formatLogDate(DateTime dt) {
    final local = dt.isUtc ? dt.toLocal() : dt;
    return DateFormat('yyyy-MM-dd').format(local);
  }

  /// Filter logs for today
  List<NutritionLog> get todayLogs {
    return _logs.where((log) {
      if (log.logDate == null) return false;
      return _formatLogDate(log.logDate!) == todayKey;
    }).toList();
  }

  List<NutritionLog> get selectedDateLogs {
    return _logs.where((log) {
      if (log.logDate == null) return false;
      return _formatLogDate(log.logDate!) == _selectedDate;
    }).toList();
  }

  /// Calculate today's totals (matching web's Dashboard reduce & derive logic)
  NutritionTotals get todayTotals {
    double calories = 0, protein = 0, carbs = 0, fat = 0;
    double fiber = 0, sugar = 0, sodium = 0, cholesterol = 0;

    for (final log in selectedDateLogs) {
      final cal = log.totalCalories ?? 0;
      final pro = log.totalProtein ?? 0;
      final carb = log.totalCarbs ?? 0;
      final fatVal = log.totalFat ?? 0;
      final fib = log.totalFiber ?? 0;
      final sug = log.totalSugar ?? 0;
      final sod = log.totalSalt ?? 0;
      final chol = log.totalCholesterol ?? 0;

      // Has direct macros in log
      if (cal > 0 || pro > 0 || carb > 0 || fatVal > 0) {
        calories += cal;
        protein += pro;
        carbs += carb;
        fat += fatVal;
        fiber += fib;
        sugar += sug;
        sodium += sod;
        cholesterol += chol;
      } else if (log.recipeId != null && _recipesMap.containsKey(log.recipeId)) {
        // Derive from recipe (mirroring web deriveLogNutrients)
        final recipe = _recipesMap[log.recipeId]!;
        final portion = (log.quantity ?? 1.0) / (recipe.servings > 0 ? recipe.servings : 1.0);
        calories += recipe.calories * portion;
        protein += recipe.protein * portion;
        carbs += recipe.carbs * portion;
        fat += recipe.fat * portion;
        fiber += fib > 0 ? fib : (recipe.fiber * portion);
        sugar += sug > 0 ? sug : (recipe.sugar * portion);
        sodium += sod > 0 ? sod : (recipe.sodium * portion);
        cholesterol += chol > 0 ? chol : (recipe.cholesterol * portion);
      } else {
        calories += cal;
        protein += pro;
        carbs += carb;
        fat += fatVal;
        fiber += fib;
        sugar += sug;
        sodium += sod;
        cholesterol += chol;
      }
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
      // Ensure recipes cache is available for nutrition derivation
      if (_recipesMap.isEmpty) {
        try {
          final allRecipes = await _recipeService.getAll();
          _recipesMap = {for (final r in allRecipes) r.recipeId: r};
        } catch (_) {}
      }

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
      final resolvedName = (newLog.recipeName != null && newLog.recipeName!.isNotEmpty)
          ? newLog.recipeName
          : (data['recipeName']?.toString() ??
              data['recipe_name']?.toString() ??
              (newLog.recipeId != null ? _recipesMap[newLog.recipeId]?.recipeName : null));

      final logToStore = (resolvedName != null && resolvedName.isNotEmpty && (newLog.recipeName == null || newLog.recipeName!.isEmpty))
          ? NutritionLog(
              id: newLog.id,
              accountId: newLog.accountId,
              recipeId: newLog.recipeId,
              ingredientId: newLog.ingredientId,
              logDate: newLog.logDate,
              mealType: newLog.mealType,
              quantity: newLog.quantity,
              totalCalories: newLog.totalCalories,
              totalProtein: newLog.totalProtein,
              totalCarbs: newLog.totalCarbs,
              totalFat: newLog.totalFat,
              totalFiber: newLog.totalFiber,
              totalSugar: newLog.totalSugar,
              totalSalt: newLog.totalSalt,
              totalCholesterol: newLog.totalCholesterol,
              recipeName: resolvedName,
              unit: newLog.unit,
            )
          : newLog;

      _logs.add(logToStore);
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
        uniqueDates.add(_formatLogDate(log.logDate!));
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

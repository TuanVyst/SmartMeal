import 'package:flutter/material.dart';
import 'package:smart_meal/features/meal_plan/data/meal_plan_service.dart';

class MealPlanProvider extends ChangeNotifier {
  final MealPlanService _service = MealPlanService();

  Map<String, dynamic>? _activePlan;
  Map<String, dynamic>? _previewPlan;
  
  bool _loading = false;
  bool _generating = false;
  String? _error;

  Map<String, dynamic>? get activePlan => _activePlan;
  Map<String, dynamic>? get previewPlan => _previewPlan;
  bool get loading => _loading;
  bool get generating => _generating;
  String? get error => _error;

  Future<void> fetchActivePlan() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _service.getActivePlan();
      _activePlan = res['data'];
    } catch (e) {
      _error = 'Không có thực đơn hiện tại.';
      _activePlan = null;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> generatePlan(int days) async {
    _generating = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _service.generatePlan(days);
      _previewPlan = res['data'];
    } catch (e) {
      _error = 'Lỗi khi tạo thực đơn: $e';
    } finally {
      _generating = false;
      notifyListeners();
    }
  }

  String? get _previewPlanId =>
      (_previewPlan?['mealPlan_id'] ??
              _previewPlan?['MealPlan_id'] ??
              _previewPlan?['mealPlanId'] ??
              _previewPlan?['MealPlanId'] ??
              _previewPlan?['id'] ??
              _previewPlan?['Id'])
          ?.toString();

  Future<void> confirmPlan() async {
    final planId = _previewPlanId;
    if (planId == null) return;
    
    _loading = true;
    notifyListeners();
    try {
      await _service.confirmPlan(planId);
      await fetchActivePlan(); // Refresh active plan
      _previewPlan = null; // Clear preview
    } catch (e) {
      _error = 'Lỗi xác nhận: $e';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> swapRecipe(String entryId, String newRecipeId) async {
    final planId = _previewPlanId;
    if (planId == null) return;
    try {
      final res = await _service.swapRecipe(planId, entryId, newRecipeId);
      _previewPlan = res['data'];
      notifyListeners();
    } catch (e) {
      debugPrint('Swap error: $e');
      rethrow;
    }
  }
}

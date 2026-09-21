import 'package:smart_meal/core/network/api_client.dart';
import 'package:smart_meal/core/constants/api_constants.dart';

class MealPlanService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getActivePlan() async {
    final response = await _api.get('${ApiConstants.mealPlan}/active');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> generatePlan(int days) async {
    final response = await _api.post('${ApiConstants.mealPlan}/generate?days=$days');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> confirmPlan(String id) async {
    final response = await _api.post('${ApiConstants.mealPlan}/$id/confirm');
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> swapRecipe(String planId, String entryId, String newRecipeId) async {
    final response = await _api.put('${ApiConstants.mealPlan}/$planId/swap', data: {
      'entryId': entryId,
      'newRecipeId': newRecipeId,
    });
    return response.data as Map<String, dynamic>;
  }
}

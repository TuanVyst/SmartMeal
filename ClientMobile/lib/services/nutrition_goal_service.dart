import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../models/nutrition_goal.dart';

/// Nutrition goal service – mapped from web's nutritionGoalService.js
class NutritionGoalService {
  final ApiClient _api = ApiClient();

  Future<List<NutritionGoal>> getAll(String accountId) async {
    final response = await _api.get(ApiConstants.nutritionGoal, queryParameters: {
      'accountId': accountId,
    });
    final data = response.data['data'] as List? ?? [];
    return data.map((e) => NutritionGoal.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<NutritionGoal> create(Map<String, dynamic> data) async {
    final response = await _api.post(ApiConstants.nutritionGoal, data: data);
    return NutritionGoal.fromJson(response.data['data'] ?? response.data);
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    await _api.put('${ApiConstants.nutritionGoal}/$id', data: data);
  }

  Future<void> delete(String id) async {
    await _api.delete('${ApiConstants.nutritionGoal}/$id');
  }
}

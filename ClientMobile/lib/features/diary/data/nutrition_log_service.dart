import 'package:smart_meal/core/network/api_client.dart';
import 'package:smart_meal/core/constants/api_constants.dart';
import '../domain/nutrition_log_model.dart';

/// Nutrition log service – mapped from web's nutritionLogService.js
class NutritionLogService {
  final ApiClient _api = ApiClient();

  Future<List<NutritionLog>> getAll(String accountId) async {
    final response = await _api.get(ApiConstants.nutritionLog, queryParameters: {
      'accountId': accountId,
    });
    final data = response.data['data'] as List? ?? [];
    return data.map((e) => NutritionLog.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<NutritionLog> create(Map<String, dynamic> data) async {
    final response = await _api.post(ApiConstants.nutritionLog, data: data);
    return NutritionLog.fromJson(response.data['data'] ?? response.data);
  }

  Future<void> update(String id, Map<String, dynamic> data) async {
    await _api.put('${ApiConstants.nutritionLog}/$id', data: data);
  }

  Future<void> delete(String id) async {
    await _api.delete('${ApiConstants.nutritionLog}/$id');
  }
}

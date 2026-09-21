import 'package:smart_meal/core/network/api_client.dart';
import 'package:smart_meal/core/constants/api_constants.dart';

/// Saved recipe / favorites service – mapped from web's savedRecipeService.js
class SavedRecipeService {
  final ApiClient _api = ApiClient();

  Future<List<Map<String, dynamic>>> getAll() async {
    final response = await _api.get(ApiConstants.savedRecipe);
    return (response.data['data'] as List? ?? []).cast<Map<String, dynamic>>();
  }

  Future<Map<String, dynamic>> toggle(Map<String, dynamic> data) async {
    final response = await _api.post(ApiConstants.savedRecipeToggle, data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getDefaultCollection(String accountId) async {
    final response = await _api.get('${ApiConstants.collection}/account/$accountId/default');
    return response.data as Map<String, dynamic>;
  }

  Future<List<Map<String, dynamic>>> getAllCollections() async {
    final response = await _api.get(ApiConstants.collection);
    return (response.data['data'] as List? ?? []).cast<Map<String, dynamic>>();
  }
}

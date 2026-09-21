import 'package:smart_meal/core/network/api_client.dart';
import 'package:smart_meal/core/constants/api_constants.dart';

class RecipeRemoteDataSource {
  final ApiClient _api;

  RecipeRemoteDataSource({ApiClient? api}) : _api = api ?? ApiClient();

  Future<Map<String, dynamic>> getAllRecipes() async {
    final response = await _api.get(ApiConstants.recipes);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getRecommendedForMe() async {
    final response = await _api.get(ApiConstants.recipesRecommended);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getRecipeById(String id) async {
    final response = await _api.get('${ApiConstants.recipes}/$id');
    return response.data as Map<String, dynamic>;
  }
}

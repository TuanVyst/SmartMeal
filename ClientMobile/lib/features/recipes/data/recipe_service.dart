import 'package:smart_meal/core/network/api_client.dart';
import 'package:smart_meal/core/constants/api_constants.dart';
import 'package:smart_meal/features/recipes/domain/recipe_model.dart';

/// Recipe service – mapped from web's recipeService.js
class RecipeService {
  final ApiClient _api = ApiClient();

  Future<List<Recipe>> getAll() async {
    final response = await _api.get(ApiConstants.recipes);
    final data = response.data['data'] as List? ?? [];
    return data.map((e) => Recipe.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Recipe> getById(String id) async {
    final response = await _api.get('${ApiConstants.recipes}/$id');
    final data = response.data['data'] ?? response.data;
    return Recipe.fromJson(data as Map<String, dynamic>);
  }

  Future<List<Recipe>> suggestByCalories(double targetCalories, {int tolerancePercent = 20}) async {
    final response = await _api.get(ApiConstants.suggestByCalories, queryParameters: {
      'targetCalories': targetCalories,
      'tolerancePercent': tolerancePercent,
    });
    final data = response.data['data'] as List? ?? [];
    return data.map((e) => Recipe.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Map<String, dynamic>>> getTags() async {
    final response = await _api.get(ApiConstants.recipeTags);
    return (response.data['data'] as List? ?? []).cast<Map<String, dynamic>>();
  }
}

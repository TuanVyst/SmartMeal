import 'package:smart_meal/core/network/api_client.dart';
import 'package:smart_meal/core/constants/api_constants.dart';
import '../domain/ingredient_model.dart';

/// Ingredient service – mapped from web's foodService.js
class IngredientService {
  final ApiClient _api = ApiClient();

  Future<List<Ingredient>> getAll() async {
    final response = await _api.get(ApiConstants.ingredients);
    final data = response.data['data'] as List? ?? [];
    return data.map((e) => Ingredient.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Ingredient> getById(String id) async {
    final response = await _api.get('${ApiConstants.ingredients}/$id');
    final data = response.data['data'] ?? response.data;
    return Ingredient.fromJson(data as Map<String, dynamic>);
  }

  Future<List<IngredientTag>> getTags() async {
    final response = await _api.get(ApiConstants.ingredientTags);
    final data = response.data['data'] as List? ?? [];
    return data.map((e) => IngredientTag.fromJson(e as Map<String, dynamic>)).toList();
  }
}

import 'recipe_model.dart';
import '../data/recipe_remote_data_source.dart';

class RecipeRepository {
  final RecipeRemoteDataSource _remoteDataSource;

  RecipeRepository({RecipeRemoteDataSource? remoteDataSource}) 
      : _remoteDataSource = remoteDataSource ?? RecipeRemoteDataSource();

  Future<List<Recipe>> getAllRecipes() async {
    final data = await _remoteDataSource.getAllRecipes();
    if (data['success'] == true && data['data'] != null) {
      final items = data['data'] as List;
      return items.map((e) => Recipe.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<Recipe>> getRecommendedForMe() async {
    final data = await _remoteDataSource.getRecommendedForMe();
    if (data['success'] == true && data['data'] != null) {
      final items = data['data'] as List;
      return items.map((e) => Recipe.fromJson(e)).toList();
    }
    return [];
  }

  Future<Recipe?> getRecipeById(String id) async {
    final data = await _remoteDataSource.getRecipeById(id);
    if (data['success'] == true && data['data'] != null) {
      return Recipe.fromJson(data['data']);
    }
    return null;
  }
}

import 'package:flutter/material.dart';
import '../models/recipe.dart';
import '../services/saved_recipe_service.dart';

/// Favorite provider – ported from web's FavoriteContext.jsx
class FavoriteProvider extends ChangeNotifier {
  final SavedRecipeService _service = SavedRecipeService();

  List<Recipe> _favorites = [];
  bool _loading = false;

  List<Recipe> get favorites => _favorites;
  bool get loading => _loading;
  int get count => _favorites.length;

  /// Check if a recipe is in favorites
  bool isFavorite(String? recipeId) {
    if (recipeId == null) return false;
    return _favorites.any((r) => r.recipeId == recipeId);
  }

  /// Toggle favorite status
  Future<void> toggleFavorite(Recipe recipe, String accountId, String collectionId) async {
    try {
      await _service.toggle({
        'recipe_id': recipe.recipeId,
        'account_id': accountId,
        'collection_id': collectionId,
      });

      if (isFavorite(recipe.recipeId)) {
        _favorites.removeWhere((r) => r.recipeId == recipe.recipeId);
      } else {
        _favorites.add(recipe);
      }
      notifyListeners();
    } catch (e) {
      debugPrint('Error toggling favorite: $e');
      rethrow;
    }
  }

  /// Fetch all favorites
  Future<void> fetchFavorites() async {
    _loading = true;
    notifyListeners();

    try {
      final data = await _service.getAll();
      _favorites = data.map((item) {
        final recipeData = item['recipe'] as Map<String, dynamic>?;
        if (recipeData != null) {
          return Recipe.fromJson(recipeData);
        }
        return Recipe.fromJson(item);
      }).toList();
    } catch (e) {
      debugPrint('Error fetching favorites: $e');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}

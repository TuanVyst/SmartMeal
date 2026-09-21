import 'package:flutter/material.dart';
import 'package:smart_meal/features/recipes/domain/recipe_model.dart';
import 'package:smart_meal/features/favorites/data/saved_recipe_service.dart';

class FavoriteProvider extends ChangeNotifier {
  final SavedRecipeService _service = SavedRecipeService();

  List<Recipe> _favorites = [];
  bool _loading = false;
  String? _defaultCollectionId;

  List<Recipe> get favorites => _favorites;
  bool get loading => _loading;
  int get count => _favorites.length;

  bool isFavorite(String? recipeId) {
    if (recipeId == null) return false;
    return _favorites.any((r) => r.recipeId == recipeId);
  }

  Future<void> fetchFavorites(String accountId) async {
    _loading = true;
    notifyListeners();

    try {
      if (_defaultCollectionId == null) {
        final col = await _service.getDefaultCollection(accountId);
        if (col['data'] != null && col['data']['collection_id'] != null) {
          _defaultCollectionId = col['data']['collection_id'].toString();
        }
      }

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

  Future<void> toggleFavorite(Recipe recipe, String accountId) async {
    try {
      if (_defaultCollectionId == null) {
        final col = await _service.getDefaultCollection(accountId);
        if (col['data'] != null && col['data']['collection_id'] != null) {
          _defaultCollectionId = col['data']['collection_id'].toString();
        }
      }

      if (_defaultCollectionId == null) {
        throw Exception('Không tìm thấy bộ sưu tập mặc định.');
      }

      await _service.toggle({
        'recipe_id': recipe.recipeId,
        'account_id': accountId,
        'collection_id': _defaultCollectionId,
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
}

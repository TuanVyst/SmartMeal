import 'package:flutter/material.dart';
import 'package:smart_meal/features/recipes/domain/recipe_model.dart';
import 'package:smart_meal/features/recipes/data/recipe_service.dart';

class RecipeProvider extends ChangeNotifier {
  final RecipeService _service = RecipeService();

  List<Recipe> _recipes = [];
  List<Recipe> _mealSuggestions = [];
  bool _loading = false;
  String? _error;

  // Filter state
  String _searchQuery = '';
  String? _selectedCookingMethod;

  List<Recipe> get recipes => _recipes;
  List<Recipe> get mealSuggestions => _mealSuggestions;
  bool get loading => _loading;
  String? get error => _error;
  
  String get searchQuery => _searchQuery;
  String? get selectedCookingMethod => _selectedCookingMethod;

  Future<void> fetchAll() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _recipes = await _service.getAll();
      _mealSuggestions = _recipes.take(8).toList();
    } catch (e) {
      _error = 'Lỗi khi tải dữ liệu: $e';
      debugPrint(_error);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void setCookingMethod(String? method) {
    _selectedCookingMethod = method;
    notifyListeners();
  }

  List<Recipe> get filteredRecipes {
    return _recipes.where((r) {
      // Filter by search
      if (_searchQuery.isNotEmpty) {
        final name = (r.recipeName).toLowerCase();
        if (!name.contains(_searchQuery.toLowerCase())) return false;
      }
      // Filter by cooking method
      if (_selectedCookingMethod != null) {
        // Simplified cooking method matching (we can map keywords later, but checking labels/tags usually suffices for parity)
        final hasMethod = _detectCookingMethod(r) == _selectedCookingMethod;
        if (!hasMethod) return false;
      }
      return true;
    }).toList();
  }

  String? _detectCookingMethod(Recipe r) {
    // Basic detection mirroring Web's COOKING_METHODS
    final methods = {
      'xao': ['xào'],
      'chien': ['chiên', 'rán'],
      'nuong': ['nướng'],
      'luoc': ['luộc', 'hấp'],
      'canh': ['canh', 'súp', 'lẩu', 'nước'],
      'kho': ['kho', 'rim'],
      'salad': ['salad', 'gỏi', 'trộn'],
      'ham': ['hầm', 'ninh', 'om'],
      'banh': ['bánh'],
    };

    final title = r.recipeName.toLowerCase();
    for (var entry in methods.entries) {
      if (entry.value.any((kw) => title.contains(kw))) {
        return entry.key;
      }
    }
    return null;
  }

  List<Recipe> search(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) return _recipes;
    return _recipes.where((r) => r.recipeName.toLowerCase().contains(q)).toList();
  }

  Future<Recipe?> getById(String id) async {
    try {
      return await _service.getById(id);
    } catch (e) {
      debugPrint('Error fetching recipe: $e');
      return null;
    }
  }
}

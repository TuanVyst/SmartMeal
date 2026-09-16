import 'package:flutter/material.dart';
import '../models/recipe.dart';
import '../services/recipe_service.dart';

/// Recipe provider – manages recipe list, search, and suggestions
class RecipeProvider extends ChangeNotifier {
  final RecipeService _service = RecipeService();

  List<Recipe> _recipes = [];
  List<Recipe> _mealSuggestions = [];
  bool _loading = false;
  String? _error;

  List<Recipe> get recipes => _recipes;
  List<Recipe> get mealSuggestions => _mealSuggestions;
  bool get loading => _loading;
  String? get error => _error;

  /// Fetch all recipes
  Future<void> fetchAll() async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _recipes = await _service.getAll();
      // First 8 recipes as suggestions (matching web's Dashboard)
      _mealSuggestions = _recipes.take(8).toList();
    } catch (e) {
      _error = 'Lỗi khi tải dữ liệu: $e';
      debugPrint(_error);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Search recipes by name
  List<Recipe> search(String query) {
    if (query.isEmpty) return _recipes;
    final q = query.toLowerCase();
    return _recipes.where((r) {
      final name = (r.recipeName ?? '').toLowerCase();
      return name.contains(q);
    }).toList();
  }

  /// Get recipe by ID
  Future<Recipe?> getById(String id) async {
    try {
      return await _service.getById(id);
    } catch (e) {
      debugPrint('Error fetching recipe: $e');
      return null;
    }
  }
}

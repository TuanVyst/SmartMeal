import 'ingredient.dart';

/// Recipe ingredient (join table with quantity)
class RecipeIngredient {
  final String? ingredientId;
  final String? ingredientName;
  final double? quantity;
  final String? unit;
  final NutritionalValue? nutritionalValue;
  final Ingredient? ingredient;

  RecipeIngredient({
    this.ingredientId,
    this.ingredientName,
    this.quantity,
    this.unit,
    this.nutritionalValue,
    this.ingredient,
  });

  factory RecipeIngredient.fromJson(Map<String, dynamic> json) {
    final nvJson = json['nutritionalValue'] ?? json['NutritionalValue'];
    final ingJson = json['ingredient'] ?? json['Ingredient'];

    return RecipeIngredient(
      ingredientId: json['ingredient_id']?.toString() ?? json['ingredientId']?.toString(),
      ingredientName: json['ingredient_name'] as String? ?? json['ingredientName'] as String?,
      quantity: _toDouble(json['quantity'] ?? json['Quantity']),
      unit: json['unit'] as String? ?? json['Unit'] as String?,
      nutritionalValue: nvJson != null ? NutritionalValue.fromJson(nvJson as Map<String, dynamic>) : null,
      ingredient: ingJson != null ? Ingredient.fromJson(ingJson as Map<String, dynamic>) : null,
    );
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

/// Recipe label/tag
class RecipeLabel {
  final String? labelId;
  final String? labelName;

  RecipeLabel({this.labelId, this.labelName});

  factory RecipeLabel.fromJson(Map<String, dynamic> json) {
    return RecipeLabel(
      labelId: json['recipe_tag_id']?.toString() ?? json['recipeTagId']?.toString() ?? json['label_id']?.toString(),
      labelName: json['tag_name'] as String? ?? json['tagName'] as String? ?? json['label_name'] as String?,
    );
  }
}

/// Recipe model – mapped from web's recipe data structure
class Recipe {
  final String? recipeId;
  final String? recipeName;
  final String? description;
  final String? instructions;
  final int? servings;
  final int? prepTime;
  final int? cookTime;
  final String? difficulty;
  final String? imageUrl;
  final double? calories;
  final List<RecipeIngredient> recipeIngredients;
  final List<RecipeLabel> recipeLabels;

  Recipe({
    this.recipeId,
    this.recipeName,
    this.description,
    this.instructions,
    this.servings,
    this.prepTime,
    this.cookTime,
    this.difficulty,
    this.imageUrl,
    this.calories,
    this.recipeIngredients = const [],
    this.recipeLabels = const [],
  });

  factory Recipe.fromJson(Map<String, dynamic> json) {
    final riJson = json['recipeIngredients'] ?? json['RecipeIngredients'] ?? [];
    final rlJson = json['recipeLabels'] ?? json['RecipeLabels'] ?? [];

    return Recipe(
      recipeId: json['recipe_id']?.toString() ?? json['recipeId']?.toString() ?? json['id']?.toString(),
      recipeName: json['recipe_name'] as String? ?? json['recipeName'] as String? ?? json['title'] as String?,
      description: json['description'] as String?,
      instructions: json['instructions'] as String?,
      servings: json['servings'] as int? ?? json['Servings'] as int?,
      prepTime: json['prep_time'] as int? ?? json['prepTime'] as int?,
      cookTime: json['cook_time'] as int? ?? json['cookTime'] as int?,
      difficulty: json['difficulty'] as String?,
      imageUrl: json['image_url'] as String? ?? json['imageUrl'] as String?,
      calories: _toDouble(json['calories']),
      recipeIngredients: (riJson as List).map((e) => RecipeIngredient.fromJson(e as Map<String, dynamic>)).toList(),
      recipeLabels: (rlJson as List).map((e) => RecipeLabel.fromJson(e as Map<String, dynamic>)).toList(),
    );
  }

  /// Calculate total calories from ingredients (matching web's mapRecipeToSuggestion logic)
  double get calculatedCalories {
    double total = 0;
    for (final ri in recipeIngredients) {
      final nv = ri.nutritionalValue ?? ri.ingredient?.nutritionalValue;
      if (nv == null) continue;
      final qty = ri.quantity ?? 0;
      final servingSize = nv.servingSize ?? 1;
      final multiplier = servingSize > 0 ? qty / servingSize : 1;
      total += (nv.calories ?? 0) * multiplier;
    }
    final s = servings ?? 1;
    return s > 0 ? total / s : total;
  }

  /// Display calories – use calculated if available, fallback to flat field
  int get displayCalories {
    final calc = calculatedCalories;
    if (calc > 0) return calc.round();
    return (calories ?? 0).round();
  }

  int get totalTime => (prepTime ?? 0) + (cookTime ?? 0);

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

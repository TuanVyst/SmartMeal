/// Nutritional value embedded in an ingredient
class NutritionalValue {
  final double? calories;
  final double? protein;
  final double? carbs;
  final double? fat;
  final double? fiber;
  final double? sugar;
  final double? salt;
  final double? cholesterol;
  final double? servingSize;

  NutritionalValue({
    this.calories,
    this.protein,
    this.carbs,
    this.fat,
    this.fiber,
    this.sugar,
    this.salt,
    this.cholesterol,
    this.servingSize,
  });

  factory NutritionalValue.fromJson(Map<String, dynamic> json) {
    return NutritionalValue(
      calories: _toDouble(json['calories'] ?? json['Calories']),
      protein: _toDouble(json['protein'] ?? json['Protein']),
      carbs: _toDouble(json['carbs'] ?? json['Carbs']),
      fat: _toDouble(json['fat'] ?? json['Fat']),
      fiber: _toDouble(json['fiber'] ?? json['Fiber']),
      sugar: _toDouble(json['sugar'] ?? json['Sugar']),
      salt: _toDouble(json['salt'] ?? json['Salt'] ?? json['sodium'] ?? json['Sodium']),
      cholesterol: _toDouble(json['cholesterol'] ?? json['Cholesterol']),
      servingSize: _toDouble(json['servingSize'] ?? json['ServingSize'] ?? 100),
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

/// Ingredient tag
class IngredientTag {
  final String? tagId;
  final String? tagName;

  IngredientTag({this.tagId, this.tagName});

  factory IngredientTag.fromJson(Map<String, dynamic> json) {
    return IngredientTag(
      tagId: json['ingredient_tag_id']?.toString() ?? json['ingredientTagId']?.toString(),
      tagName: json['tag_name'] as String? ?? json['tagName'] as String?,
    );
  }
}

/// Ingredient model
class Ingredient {
  final String? ingredientId;
  final String? ingredientName;
  final String? description;
  final String? imageUrl;
  final NutritionalValue? nutritionalValue;
  final List<IngredientTag> tags;

  Ingredient({
    this.ingredientId,
    this.ingredientName,
    this.description,
    this.imageUrl,
    this.nutritionalValue,
    this.tags = const [],
  });

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    final nvJson = json['nutritional_value'] ?? json['nutritionalValue'] ?? json['NutritionalValue'];
    final tagsJson = json['ingredientTags'] ?? json['IngredientTags'] ?? [];

    return Ingredient(
      ingredientId: json['ingredient_id']?.toString() ?? json['ingredientId']?.toString(),
      ingredientName: json['ingredient_name'] as String? ?? json['ingredientName'] as String?,
      description: json['description'] as String?,
      imageUrl: json['image_url'] as String? ?? json['imageUrl'] as String?,
      nutritionalValue: nvJson != null ? NutritionalValue.fromJson(nvJson as Map<String, dynamic>) : null,
      tags: (tagsJson as List).map((t) => IngredientTag.fromJson(t as Map<String, dynamic>)).toList(),
    );
  }
}

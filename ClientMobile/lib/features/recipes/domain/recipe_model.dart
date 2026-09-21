class Recipe {
  final String recipeId;
  final String recipeName;
  final String description;
  final String? imageUrl;
  final double calories;
  final double protein;
  final double carbs;
  final double fat;
  final int cookingTime;
  final int servings;
  final List<dynamic>? recipeIngredients;
  final List<dynamic>? recipeLabels;
  final List<dynamic>? recipeTags;
  final String? instructions;

  int get displayCalories => calories.round();
  int get totalTime => cookingTime;

  Recipe({
    required this.recipeId,
    required this.recipeName,
    required this.description,
    this.imageUrl,
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.cookingTime,
    required this.servings,
    this.recipeIngredients,
    this.recipeLabels,
    this.recipeTags,
    this.instructions,
  });

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      recipeId: json['recipe_id']?.toString() ?? '',
      recipeName: json['recipe_name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      imageUrl: json['image_url']?.toString(),
      calories: (json['calories'] as num?)?.toDouble() ?? 0.0,
      protein: (json['protein'] as num?)?.toDouble() ?? 0.0,
      carbs: (json['carbs'] as num?)?.toDouble() ?? 0.0,
      fat: (json['fat'] as num?)?.toDouble() ?? 0.0,
      cookingTime: json['cookingTime'] as int? ?? 0,
      servings: json['servings'] as int? ?? 1,
      recipeIngredients: json['recipeIngredients'] as List<dynamic>?,
      recipeLabels: json['recipeLabels'] as List<dynamic>?,
      recipeTags: json['recipeTags'] as List<dynamic>?,
      instructions: json['instructions'] as String?,
    );
  }
}

import 'package:smart_meal/core/utils/recipe_images.dart';

class Recipe {
  final String recipeId;
  final String recipeName;
  final String description;
  final String? imageUrl;
  final double calories;
  final double protein;
  final double carbs;
  final double fat;
  final double fiber;
  final double sugar;
  final double sodium;
  final double cholesterol;
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
    this.fiber = 0.0,
    this.sugar = 0.0,
    this.sodium = 0.0,
    this.cholesterol = 0.0,
    required this.cookingTime,
    required this.servings,
    this.recipeIngredients,
    this.recipeLabels,
    this.recipeTags,
    this.instructions,
  });

  factory Recipe.fromJson(Map<String, dynamic> json) {
    final name = json['recipe_name']?.toString() ??
        json['recipeName']?.toString() ??
        json['Recipe_name']?.toString() ??
        json['RecipeName']?.toString() ??
        json['name']?.toString() ??
        json['Name']?.toString() ??
        json['title']?.toString() ??
        json['Title']?.toString() ??
        '';

    final id = json['recipe_id']?.toString() ??
        json['recipeId']?.toString() ??
        json['Recipe_id']?.toString() ??
        json['id']?.toString() ??
        '';

    final desc = json['description']?.toString() ??
        json['Description']?.toString() ??
        '';

    final servingsCount = (json['servings'] ?? json['Servings']) as int? ?? 1;
    final validServings = servingsCount > 0 ? servingsCount : 1;

    final cook = (json['cookTime'] ?? json['CookTime'] ?? json['cookingTime']) as int? ?? 0;
    final prep = (json['prepTime'] ?? json['PrepTime']) as int? ?? 0;
    final totalTime = (cook > 0 || prep > 0) ? (cook + prep) : 0;

    final instruction = json['instruction']?.toString() ??
        json['Instruction']?.toString() ??
        json['instructions']?.toString() ??
        json['Instructions']?.toString();

    final ingredients = (json['recipeIngredients'] ?? json['RecipeIngredients']) as List<dynamic>?;

    double cal = (json['calories'] as num?)?.toDouble() ?? (json['Calories'] as num?)?.toDouble() ?? 0.0;
    double pro = (json['protein'] as num?)?.toDouble() ?? (json['Protein'] as num?)?.toDouble() ?? 0.0;
    double carb = (json['carbs'] as num?)?.toDouble() ?? (json['Carbs'] as num?)?.toDouble() ?? 0.0;
    double fatVal = (json['fat'] as num?)?.toDouble() ?? (json['Fat'] as num?)?.toDouble() ?? 0.0;
    double fib = (json['fiber'] as num?)?.toDouble() ?? (json['Fiber'] as num?)?.toDouble() ?? 0.0;
    double sug = (json['sugar'] as num?)?.toDouble() ?? (json['Sugar'] as num?)?.toDouble() ?? 0.0;
    double sod = (json['sodium'] as num?)?.toDouble() ?? (json['Sodium'] as num?)?.toDouble() ?? (json['salt'] as num?)?.toDouble() ?? 0.0;
    double chol = (json['cholesterol'] as num?)?.toDouble() ?? (json['Cholesterol'] as num?)?.toDouble() ?? 0.0;

    // If top-level nutrition is missing/zero, derive from recipeIngredients (matching web logic)
    if (cal == 0.0 && ingredients != null && ingredients.isNotEmpty) {
      double totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0;
      double totalFib = 0, totalSug = 0, totalSod = 0, totalChol = 0;

      for (final ri in ingredients) {
        if (ri is Map<String, dynamic>) {
          final nv = ri['nutritionalValue'] ?? ri['NutritionalValue'];
          if (nv is Map<String, dynamic>) {
            final qty = (ri['quantity'] ?? ri['Quantity'] as num?)?.toDouble() ?? 0.0;
            final sv = (nv['servingSize'] ?? nv['ServingSize'] as num?)?.toDouble() ?? 100.0;
            final mult = sv > 0 ? (qty / sv) : 1.0;

            totalCal += ((nv['calories'] ?? nv['Calories'] as num?)?.toDouble() ?? 0.0) * mult;
            totalPro += ((nv['protein'] ?? nv['Protein'] as num?)?.toDouble() ?? 0.0) * mult;
            totalCarb += ((nv['carbs'] ?? nv['Carbs'] ?? nv['carbohydrates'] ?? nv['Carbohydrates'] as num?)?.toDouble() ?? 0.0) * mult;
            totalFat += ((nv['fat'] ?? nv['Fat'] as num?)?.toDouble() ?? 0.0) * mult;
            totalFib += ((nv['fiber'] ?? nv['Fiber'] as num?)?.toDouble() ?? 0.0) * mult;
            totalSug += ((nv['sugar'] ?? nv['Sugar'] as num?)?.toDouble() ?? 0.0) * mult;
            totalSod += ((nv['salt'] ?? nv['Salt'] ?? nv['sodium'] ?? nv['Sodium'] as num?)?.toDouble() ?? 0.0) * mult;
            totalChol += ((nv['cholesterol'] ?? nv['Cholesterol'] as num?)?.toDouble() ?? 0.0) * mult;
          }
        }
      }

      cal = totalCal / validServings;
      pro = totalPro / validServings;
      carb = totalCarb / validServings;
      fatVal = totalFat / validServings;
      fib = totalFib / validServings;
      sug = totalSug / validServings;
      sod = totalSod / validServings;
      chol = totalChol / validServings;
    }

    final rawImage = json['image_url']?.toString() ??
        json['imageUrl']?.toString() ??
        json['ImageUrl']?.toString() ??
        json['Image_url']?.toString() ??
        json['image']?.toString() ??
        json['Image']?.toString() ??
        json['img']?.toString();

    final resolvedImg = RecipeImages.resolve(name, rawImage);

    return Recipe(
      recipeId: id,
      recipeName: name,
      description: desc,
      imageUrl: resolvedImg,
      calories: cal,
      protein: pro,
      carbs: carb,
      fat: fatVal,
      fiber: fib,
      sugar: sug,
      sodium: sod,
      cholesterol: chol,
      cookingTime: totalTime,
      servings: validServings,
      recipeIngredients: ingredients,
      recipeLabels: (json['recipeLabels'] ?? json['RecipeLabels']) as List<dynamic>?,
      recipeTags: (json['recipeTags'] ?? json['RecipeTags']) as List<dynamic>?,
      instructions: instruction,
    );
  }
}

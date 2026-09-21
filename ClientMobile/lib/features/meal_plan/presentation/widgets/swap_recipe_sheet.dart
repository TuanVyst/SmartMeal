import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/meal_plan/presentation/providers/meal_plan_provider.dart';
import 'package:smart_meal/features/recipes/presentation/providers/recipe_provider.dart';

class SwapRecipeSheet extends StatelessWidget {
  final String entryId;
  const SwapRecipeSheet({super.key, required this.entryId});

  static void show(BuildContext context, String entryId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SwapRecipeSheet(entryId: entryId),
    );
  }

  @override
  Widget build(BuildContext context) {
    final recipeProvider = context.watch<RecipeProvider>();
    final recipes = recipeProvider.recipes;

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Đổi món ăn', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.builder(
              itemCount: recipes.length,
              itemBuilder: (context, index) {
                final recipe = recipes[index];
                return ListTile(
                  leading: const Icon(Icons.fastfood, color: AppColors.primary),
                  title: Text(recipe.recipeName),
                  subtitle: Text('${recipe.calories} kcal'),
                  trailing: TextButton(
                    child: const Text('Chọn'),
                    onPressed: () async {
                      try {
                        await context.read<MealPlanProvider>().swapRecipe(entryId, recipe.recipeId);
                        if (context.mounted) {
                          Navigator.pop(context);
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Đổi món thành công!'))
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Lỗi khi đổi món'))
                          );
                        }
                      }
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

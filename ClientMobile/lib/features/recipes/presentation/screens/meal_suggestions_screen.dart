import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_spacing.dart';
import 'package:smart_meal/core/ui/smart_text_field.dart';
import 'package:smart_meal/core/ui/smart_card.dart';
import 'package:smart_meal/features/recipes/presentation/providers/recipe_provider.dart';

class MealSuggestionsScreen extends StatefulWidget {
  const MealSuggestionsScreen({super.key});

  @override
  State<MealSuggestionsScreen> createState() => _MealSuggestionsScreenState();
}

class _MealSuggestionsScreenState extends State<MealSuggestionsScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    final provider = context.read<RecipeProvider>();
    _searchCtrl.text = provider.searchQuery;
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _onSearchChanged(String value) {
    context.read<RecipeProvider>().setSearchQuery(value);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<RecipeProvider>();

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: AppSpacing.edgeInsetsAllLg,
              child: SmartTextField(
                controller: _searchCtrl,
                label: 'Tìm kiếm món ăn...',
                onChanged: _onSearchChanged,
              ),
            ),
            _buildCookingMethodFilter(provider),
            Expanded(
              child: provider.loading
                  ? const Center(child: CircularProgressIndicator())
                  : _buildRecipeList(provider),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCookingMethodFilter(RecipeProvider provider) {
    final methods = [
      {'key': null, 'label': 'Tất cả'},
      {'key': 'xao', 'label': 'Xào'},
      {'key': 'chien', 'label': 'Chiên/Rán'},
      {'key': 'nuong', 'label': 'Nướng'},
      {'key': 'luoc', 'label': 'Luộc/Hấp'},
      {'key': 'canh', 'label': 'Canh/Súp'},
      {'key': 'salad', 'label': 'Salad'},
    ];

    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        itemCount: methods.length,
        separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
        itemBuilder: (context, index) {
          final m = methods[index];
          final isActive = provider.selectedCookingMethod == m['key'];
          return GestureDetector(
            onTap: () => provider.setCookingMethod(m['key']),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : Colors.grey[200],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                m['label'] as String,
                style: TextStyle(
                  color: isActive ? Colors.white : Colors.black87,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRecipeList(RecipeProvider provider) {
    final recipes = provider.filteredRecipes;

    if (recipes.isEmpty) {
      return const Center(child: Text('Không tìm thấy công thức nào.'));
    }

    return ListView.builder(
      padding: AppSpacing.edgeInsetsAllLg,
      itemCount: recipes.length,
      itemBuilder: (context, index) {
        final recipe = recipes[index];
        return GestureDetector(
          onTap: () => Navigator.of(context).pushNamed('/recipe-detail/${recipe.recipeId}'),
          child: SmartCard(
            margin: const EdgeInsets.only(bottom: AppSpacing.md),
            padding: EdgeInsets.zero,
            child: Row(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                  ),
                  child: recipe.imageUrl != null
                      ? ClipRRect(
                          borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                          child: Image.network(recipe.imageUrl!, fit: BoxFit.cover, errorBuilder: (_, _, _) => const Icon(Icons.fastfood, color: Colors.grey)),
                        )
                      : const Icon(Icons.fastfood, color: Colors.grey),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          recipe.recipeName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.local_fire_department, size: 14, color: Colors.orange),
                            const SizedBox(width: 4),
                            Text('${recipe.calories.round()} kcal', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            const SizedBox(width: 12),
                            const Icon(Icons.timer, size: 14, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text('${recipe.cookingTime} phút', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

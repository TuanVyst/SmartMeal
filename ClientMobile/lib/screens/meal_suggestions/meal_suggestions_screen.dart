import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/recipe_provider.dart';
import '../../providers/favorite_provider.dart';
import '../../widgets/recipe_card.dart';

/// Meal suggestions screen – matching web's MealSuggestion.jsx
class MealSuggestionsScreen extends StatefulWidget {
  const MealSuggestionsScreen({super.key});

  @override
  State<MealSuggestionsScreen> createState() => _MealSuggestionsScreenState();
}

class _MealSuggestionsScreenState extends State<MealSuggestionsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<RecipeProvider>();
      if (provider.recipes.isEmpty) provider.fetchAll();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final recipeProvider = context.watch<RecipeProvider>();
    final favoriteProvider = context.watch<FavoriteProvider>();
    final filteredRecipes = _searchQuery.isEmpty
        ? recipeProvider.recipes
        : recipeProvider.search(_searchQuery);

    return Column(
      children: [
        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: TextField(
            controller: _searchController,
            onChanged: (v) => setState(() => _searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Tìm kiếm món ăn...',
              prefixIcon: const Icon(Icons.search, color: AppColors.textHint),
              suffixIcon: _searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        setState(() => _searchQuery = '');
                      },
                    )
                  : null,
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: AppColors.divider),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide(color: AppColors.divider),
              ),
            ),
          ),
        ),

        // Results
        Expanded(
          child: recipeProvider.loading
              ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
              : filteredRecipes.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.search_off, size: 64, color: AppColors.textHint),
                          const SizedBox(height: 12),
                          Text('Không tìm thấy món ăn', style: AppTextStyles.bodyMedium),
                        ],
                      ),
                    )
                  : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 0.72,
                      ),
                      itemCount: filteredRecipes.length,
                      itemBuilder: (context, index) {
                        final recipe = filteredRecipes[index];
                        return RecipeCard(
                          recipe: recipe,
                          isFavorite: favoriteProvider.isFavorite(recipe.recipeId),
                          onTap: () {
                            Navigator.of(context).pushNamed('/recipe-detail', arguments: recipe.recipeId);
                          },
                        );
                      },
                    ),
        ),
      ],
    );
  }
}

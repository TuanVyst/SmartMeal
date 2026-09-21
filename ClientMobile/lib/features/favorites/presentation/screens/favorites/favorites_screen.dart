import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_typography.dart';
import 'package:smart_meal/features/favorites/presentation/providers/favorite_provider.dart';
import 'package:smart_meal/widgets/recipe_card.dart';

/// Favorites screen – matching web's Favorites.jsx
class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final favoriteProvider = context.watch<FavoriteProvider>();
    final favorites = favoriteProvider.favorites;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Bộ sưu tập', style: AppTypography.pageTitle),
          const SizedBox(height: 4),
          Text('${favorites.length} món ăn yêu thích', style: AppTypography.bodySmall),
          const SizedBox(height: 20),

          Expanded(
            child: favorites.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.favorite_border, size: 64, color: AppColors.textHint),
                        const SizedBox(height: 16),
                        Text('Chưa có món ăn yêu thích', style: AppTypography.bodyMedium),
                        const SizedBox(height: 8),
                        Text('Nhấn ♥ trên món ăn để lưu vào đây', style: AppTypography.bodySmall),
                      ],
                    ),
                  )
                : GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.72,
                    ),
                    itemCount: favorites.length,
                    itemBuilder: (context, index) {
                      final recipe = favorites[index];
                      return RecipeCard(
                        recipe: recipe,
                        isFavorite: true,
                        onTap: () {
                          Navigator.of(context).pushNamed('/recipe-detail', arguments: recipe.recipeId);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

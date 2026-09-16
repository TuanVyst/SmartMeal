import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/favorite_provider.dart';
import '../../widgets/recipe_card.dart';

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
          Text('Bộ sưu tập', style: AppTextStyles.pageTitle),
          const SizedBox(height: 4),
          Text('${favorites.length} món ăn yêu thích', style: AppTextStyles.bodySmall),
          const SizedBox(height: 20),

          Expanded(
            child: favorites.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.favorite_border, size: 64, color: AppColors.textHint),
                        const SizedBox(height: 16),
                        Text('Chưa có món ăn yêu thích', style: AppTextStyles.bodyMedium),
                        const SizedBox(height: 8),
                        Text('Nhấn ♥ trên món ăn để lưu vào đây', style: AppTextStyles.bodySmall),
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

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_spacing.dart';
import 'package:smart_meal/core/ui/smart_card.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/favorites/presentation/providers/favorite_provider.dart';

class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

class _FavoritesScreenState extends State<FavoritesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final accountId = context.read<AuthProvider>().accountId;
      if (accountId != null) {
        context.read<FavoriteProvider>().fetchFavorites(accountId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<FavoriteProvider>();

    return Scaffold(
      body: provider.loading
          ? const Center(child: CircularProgressIndicator())
          : provider.favorites.isEmpty
              ? _buildEmptyState()
              : _buildList(provider),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.favorite_border, size: 80, color: Colors.grey),
          SizedBox(height: 16),
          Text('Bạn chưa lưu món ăn nào', style: TextStyle(color: Colors.grey, fontSize: 16)),
        ],
      ),
    );
  }

  Widget _buildList(FavoriteProvider provider) {
    final favorites = provider.favorites;

    return ListView.builder(
      padding: AppSpacing.edgeInsetsAllLg,
      itemCount: favorites.length,
      itemBuilder: (context, index) {
        final recipe = favorites[index];
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
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.favorite, color: AppColors.primary),
                  onPressed: () {
                    final accountId = context.read<AuthProvider>().accountId;
                    if (accountId != null) {
                      provider.toggleFavorite(recipe, accountId);
                    }
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

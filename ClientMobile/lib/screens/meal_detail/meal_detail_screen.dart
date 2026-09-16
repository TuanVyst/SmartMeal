import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/recipe.dart';
import '../../providers/recipe_provider.dart';

/// Meal detail screen – matching web's MealDetail.jsx
class MealDetailScreen extends StatefulWidget {
  final String recipeId;
  const MealDetailScreen({super.key, required this.recipeId});

  @override
  State<MealDetailScreen> createState() => _MealDetailScreenState();
}

class _MealDetailScreenState extends State<MealDetailScreen> {
  Recipe? _recipe;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadRecipe();
  }

  Future<void> _loadRecipe() async {
    final recipe = await context.read<RecipeProvider>().getById(widget.recipeId);
    if (mounted) setState(() { _recipe = recipe; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    if (_recipe == null) {
      return Scaffold(
        appBar: AppBar(),
        body: const Center(child: Text('Không tìm thấy công thức')),
      );
    }

    final recipe = _recipe!;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Hero image
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              background: recipe.imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: recipe.imageUrl!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        color: AppColors.heroGradientMid,
                        child: const Icon(Icons.restaurant, size: 80, color: Colors.white54),
                      ),
                    )
                  : Container(
                      color: AppColors.heroGradientMid,
                      child: const Icon(Icons.restaurant, size: 80, color: Colors.white54),
                    ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.favorite_border, color: Colors.white),
                onPressed: () {},
              ),
            ],
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Recipe name
                  Text(recipe.recipeName ?? '', style: AppTextStyles.heroTitle.copyWith(fontSize: 24)),
                  const SizedBox(height: 12),

                  // Stats row
                  Row(
                    children: [
                      _buildStatChip(Icons.bolt, '${recipe.displayCalories} kcal', AppColors.calorieBadgeBg, AppColors.calorieBadgeText),
                      const SizedBox(width: 8),
                      if (recipe.totalTime > 0)
                        _buildStatChip(Icons.timer, '${recipe.totalTime} phút', const Color(0xFFE3F2FD), const Color(0xFF2196F3)),
                      const SizedBox(width: 8),
                      if (recipe.servings != null)
                        _buildStatChip(Icons.people, '${recipe.servings} người', const Color(0xFFF3E5F5), const Color(0xFF9C27B0)),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Tags
                  if (recipe.recipeLabels.isNotEmpty) ...[
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: recipe.recipeLabels.map((label) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.premiumBg,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(label.labelName ?? '', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.premiumText)),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Description
                  if (recipe.description != null && recipe.description!.isNotEmpty) ...[
                    Text('Mô tả', style: AppTextStyles.sectionTitle),
                    const SizedBox(height: 8),
                    Text(recipe.description!, style: AppTextStyles.bodyMedium.copyWith(height: 1.6)),
                    const SizedBox(height: 20),
                  ],

                  // Ingredients
                  if (recipe.recipeIngredients.isNotEmpty) ...[
                    Text('Nguyên liệu', style: AppTextStyles.sectionTitle),
                    const SizedBox(height: 12),
                    ...recipe.recipeIngredients.map((ri) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFBBF7D0)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                ri.ingredientName ?? ri.ingredient?.ingredientName ?? 'Nguyên liệu',
                                style: AppTextStyles.bodyMedium,
                              ),
                            ),
                            if (ri.quantity != null)
                              Text(
                                '${ri.quantity}${ri.unit != null ? ' ${ri.unit}' : ' g'}',
                                style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.w600),
                              ),
                          ],
                        ),
                      );
                    }),
                    const SizedBox(height: 20),
                  ],

                  // Instructions
                  if (recipe.instructions != null && recipe.instructions!.isNotEmpty) ...[
                    Text('Cách chế biến', style: AppTextStyles.sectionTitle),
                    const SizedBox(height: 12),
                    Text(recipe.instructions!, style: AppTextStyles.bodyMedium.copyWith(height: 1.8)),
                  ],

                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),

      // Floating action button – Log meal
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('Ghi nhật ký', style: AppTextStyles.buttonText.copyWith(fontSize: 14)),
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String text, Color bg, Color textColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: textColor),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: textColor)),
        ],
      ),
    );
  }
}

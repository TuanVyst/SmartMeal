import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_typography.dart';
import 'package:smart_meal/features/recipes/domain/recipe_model.dart';
import 'package:smart_meal/features/recipes/presentation/providers/recipe_provider.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';

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
                      errorWidget: (_, _, _) => Container(
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
                  Text(recipe.recipeName, style: AppTypography.h1.copyWith(fontSize: 24)),
                  const SizedBox(height: 12),

                  // Stats row
                  Row(
                    children: [
                      _buildStatChip(Icons.bolt, '${recipe.displayCalories} kcal', AppColors.calorieBadgeBg, AppColors.calorieBadgeText),
                      const SizedBox(width: 8),
                      if (recipe.totalTime > 0)
                        _buildStatChip(Icons.timer, '${recipe.totalTime} phút', const Color(0xFFE3F2FD), const Color(0xFF2196F3)),
                      const SizedBox(width: 8),
                      if (recipe.servings > 0)
                        _buildStatChip(Icons.people, '${recipe.servings} người', const Color(0xFFF3E5F5), const Color(0xFF9C27B0)),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Tags
                  if (recipe.recipeLabels?.isNotEmpty == true) ...[
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: recipe.recipeLabels!.map((label) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.premiumBg,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(_dynamicLabelName(label), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.premiumText)),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Description
                  if (recipe.description.isNotEmpty) ...[
                    Text('Mô tả', style: AppTypography.sectionTitle),
                    const SizedBox(height: 8),
                    Text(recipe.description, style: AppTypography.bodyMedium.copyWith(height: 1.6)),
                    const SizedBox(height: 20),
                  ],

                  // Ingredients
                  if (recipe.recipeIngredients?.isNotEmpty == true) ...[
                    Text('Nguyên liệu', style: AppTypography.sectionTitle),
                    const SizedBox(height: 12),
                    ...recipe.recipeIngredients!.map((ri) {
                      final ingredient = _ingredientView(ri);
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
                                ingredient.$1,
                                style: AppTypography.bodyMedium,
                              ),
                            ),
                            if (ingredient.$2 != null)
                              Text(
                                '${ingredient.$2}${ingredient.$3 != null ? ' ${ingredient.$3}' : ' g'}',
                                style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600),
                              ),
                          ],
                        ),
                      );
                    }),
                    const SizedBox(height: 20),
                  ],

                  // Instructions
                  if (recipe.instructions != null && recipe.instructions!.isNotEmpty) ...[
                    Text('Cách chế biến', style: AppTypography.sectionTitle),
                    const SizedBox(height: 12),
                    Text(recipe.instructions!, style: AppTypography.bodyMedium.copyWith(height: 1.8)),
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
        onPressed: () => _showMealSlotPicker(recipe),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text('Ghi nhật ký', style: AppTypography.button.copyWith(fontSize: 14)),
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

  String _dynamicLabelName(dynamic label) {
    if (label is Map) {
      return (label['labelName'] ?? label['label_name'] ?? '').toString();
    }
    return label?.toString() ?? '';
  }

  (String, dynamic, dynamic) _ingredientView(dynamic ri) {
    if (ri is Map) {
      final ingredient = ri['ingredient'] ?? ri['Ingredient'];
      final nestedName = ingredient is Map
          ? (ingredient['name'] ??
              ingredient['Name'] ??
              ingredient['ingredientName'] ??
              ingredient['ingredient_name'] ??
              ingredient['IngredientName'])
          : null;
      final ingName = (ri['name'] ??
              ri['Name'] ??
              ri['ingredientName'] ??
              ri['ingredient_name'] ??
              nestedName ??
              'Nguyên liệu')
          .toString();
      final qty = ri['quantity'] ?? ri['Quantity'];
      final unit = ri['unit'] ?? ri['Unit'] ?? ri['servingUnit'] ?? ri['ServingUnit'];
      return (ingName, qty, unit);
    }
    return ('Nguyên liệu', null, null);
  }

  void _showMealSlotPicker(Recipe recipe) {
    final auth = context.read<AuthProvider>();
    final accountId = auth.accountId;
    if (accountId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để lưu vào nhật ký!'), backgroundColor: AppColors.error),
      );
      return;
    }

    final hour = DateTime.now().hour;
    String suggestedSlot = 'breakfast';
    if (hour >= 10 && hour < 14) {
      suggestedSlot = 'lunch';
    } else if (hour >= 14 && hour < 17) {
      suggestedSlot = 'snack';
    } else if (hour >= 17) {
      suggestedSlot = 'dinner';
    }

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  const Icon(Icons.menu_book, color: AppColors.primaryDark),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Ghi "${recipe.recipeName}" vào nhật ký',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text('Chọn bữa ăn hôm nay:', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 12),
              _buildMealSlotChoice(ctx, recipe, 'breakfast', 'Bữa sáng', Icons.wb_sunny_outlined, suggestedSlot == 'breakfast'),
              const SizedBox(height: 8),
              _buildMealSlotChoice(ctx, recipe, 'lunch', 'Bữa trưa', Icons.wb_cloudy_outlined, suggestedSlot == 'lunch'),
              const SizedBox(height: 8),
              _buildMealSlotChoice(ctx, recipe, 'dinner', 'Bữa tối', Icons.nights_stay_outlined, suggestedSlot == 'dinner'),
              const SizedBox(height: 8),
              _buildMealSlotChoice(ctx, recipe, 'snack', 'Bữa phụ / Ăn xế', Icons.cookie_outlined, suggestedSlot == 'snack'),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMealSlotChoice(BuildContext ctx, Recipe recipe, String slot, String label, IconData icon, bool isSuggested) {
    return InkWell(
      onTap: () {
        Navigator.of(ctx).pop();
        _executeAddLog(recipe, slot);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: isSuggested ? AppColors.primaryLight.withValues(alpha: 0.15) : AppColors.background,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSuggested ? AppColors.primary : AppColors.border),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSuggested ? AppColors.primaryDark : AppColors.textSecondary, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontWeight: isSuggested ? FontWeight.bold : FontWeight.w500,
                  color: isSuggested ? AppColors.primaryDark : AppColors.textPrimary,
                  fontSize: 14,
                ),
              ),
            ),
            if (isSuggested)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                child: const Text('Hiện tại', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _executeAddLog(Recipe recipe, String slot) async {
    final auth = context.read<AuthProvider>();
    final accountId = auth.accountId;
    if (accountId == null) return;

    final slotLabels = {
      'breakfast': 'Bữa sáng',
      'lunch': 'Bữa trưa',
      'dinner': 'Bữa tối',
      'snack': 'Bữa phụ',
    };

    try {
      await context.read<NutritionProvider>().addLog({
        'account_id': accountId,
        'recipe_id': recipe.recipeId,
        'recipe_name': recipe.recipeName,
        'recipeName': recipe.recipeName,
        'logDate': DateTime.now().toUtc().toIso8601String(),
        'mealType': slot,
        'quantity': 1,
        'unit': 'phần',
        'totalCalories': recipe.calories,
        'totalProtein': recipe.protein,
        'totalCarbs': recipe.carbs,
        'totalFat': recipe.fat,
        'totalFiber': recipe.fiber,
        'totalSugar': recipe.sugar,
        'totalSalt': recipe.sodium,
        'totalCholesterol': recipe.cholesterol,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã ghi "${recipe.recipeName}" vào ${slotLabels[slot] ?? slot} hôm nay!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi khi ghi nhật ký: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }
}

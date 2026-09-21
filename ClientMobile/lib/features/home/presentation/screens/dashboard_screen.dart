import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_typography.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/recipes/presentation/providers/recipe_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/core/ui/smart_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      final accountId = auth.accountId;

      context.read<RecipeProvider>().fetchAll();
      if (accountId != null) {
        context.read<NutritionProvider>().fetchLogs(accountId);
        context.read<NutritionProvider>().fetchGoals(accountId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final recipeProvider = context.watch<RecipeProvider>();
    final nutritionProvider = context.watch<NutritionProvider>();
    final displayName = auth.user?.name ?? auth.user?.username ?? 'Bạn';
    final totals = nutritionProvider.todayTotals;
    final targets = nutritionProvider.dailyTargets;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeroSection(displayName),
          const SizedBox(height: 24),
          _buildSectionHeader('Tổng quan hôm nay', 'Nhật ký', onAction: () {
            Navigator.of(context).pushNamed('/diary');
          }),
          const SizedBox(height: 16),
          _buildNutritionGrid(totals, targets),
          const SizedBox(height: 24),
          _buildSectionHeader('Gợi ý cho bạn', 'Xem tất cả', onAction: () {
            // Usually switch tab via MainShell, here we can just show message or rely on router if needed.
          }),
          const SizedBox(height: 16),
          _buildMealCarousel(recipeProvider),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildHeroSection(String displayName) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, AppColors.primaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('Chào mừng trở lại', style: TextStyle(color: Colors.white, fontSize: 12)),
                ),
                const SizedBox(height: 12),
                Text(
                  'Xin chào,\n$displayName!',
                  style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, height: 1.2),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Hôm nay là một ngày tuyệt vời để chăm sóc bản thân.',
                  style: TextStyle(color: Colors.white70, fontSize: 14),
                ),
              ],
            ),
          ),
          const Icon(Icons.spa, size: 80, color: Colors.white54),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, String trailing, {VoidCallback? onAction}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: AppTypography.headline3),
        GestureDetector(
          onTap: onAction,
          child: Text(trailing, style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildNutritionGrid(dynamic totals, dynamic targets) {
    final items = [
      {'label': 'Calorie', 'value': totals.calories, 'target': targets.calories, 'unit': 'kcal', 'color': Colors.orange},
      {'label': 'Protein', 'value': totals.protein, 'target': targets.protein, 'unit': 'g', 'color': Colors.red},
      {'label': 'Carbs', 'value': totals.carbs, 'target': targets.carbs, 'unit': 'g', 'color': Colors.blue},
      {'label': 'Chất béo', 'value': totals.fat, 'target': targets.fat, 'unit': 'g', 'color': Colors.amber},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.5,
      ),
      itemCount: items.length,
      itemBuilder: (context, index) {
        final item = items[index];
        final val = (item['value'] as num).toDouble();
        final tgt = (item['target'] as num).toDouble();
        final pct = tgt > 0 ? (val / tgt).clamp(0.0, 1.0) : 0.0;
        final color = item['color'] as Color;

        return SmartCard(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(item['label'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('${val.round()}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
                  Text(' / ${tgt.round()} ${item['unit']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
              const SizedBox(height: 8),
              LinearProgressIndicator(value: pct, backgroundColor: color.withValues(alpha: 0.2), color: color, borderRadius: BorderRadius.circular(4)),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMealCarousel(RecipeProvider provider) {
    if (provider.loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (provider.mealSuggestions.isEmpty) {
      return const SmartCard(
        padding: EdgeInsets.all(24),
        child: Center(child: Text('Chưa có gợi ý')),
      );
    }

    return SizedBox(
      height: 220,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: provider.mealSuggestions.length,
        separatorBuilder: (_, _) => const SizedBox(width: 16),
        itemBuilder: (context, index) {
          final recipe = provider.mealSuggestions[index];
          return GestureDetector(
            onTap: () => Navigator.of(context).pushNamed('/recipe-detail/${recipe.recipeId}'),
            child: SizedBox(
              width: 160,
              child: SmartCard(
                padding: EdgeInsets.zero,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 3,
                      child: Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                        ),
                        child: recipe.imageUrl != null
                            ? ClipRRect(
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                                child: Image.network(recipe.imageUrl!, fit: BoxFit.cover, errorBuilder: (_, _, _) => const Icon(Icons.fastfood, color: Colors.grey)),
                              )
                            : const Icon(Icons.fastfood, color: Colors.grey),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              recipe.recipeName,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const Spacer(),
                            Text('${recipe.calories.round()} kcal', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../models/nutrition_log.dart';
import '../../models/nutrition_goal.dart';
import '../../providers/auth_provider.dart';
import '../../providers/recipe_provider.dart';
import '../../providers/nutrition_provider.dart';
import '../../providers/favorite_provider.dart';
import '../../widgets/nutrition_card.dart';
import '../../widgets/recipe_card.dart';

/// Dashboard screen – matching web's Dashboard.jsx
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with SingleTickerProviderStateMixin {
  late AnimationController _heroAnimController;
  late Animation<double> _heroFloatAnimation;

  @override
  void initState() {
    super.initState();
    _heroAnimController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    )..repeat(reverse: true);

    _heroFloatAnimation = Tween<double>(begin: 0, end: -12).animate(
      CurvedAnimation(parent: _heroAnimController, curve: Curves.easeInOut),
    );

    // Fetch data
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
  void dispose() {
    _heroAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final recipeProvider = context.watch<RecipeProvider>();
    final nutritionProvider = context.watch<NutritionProvider>();
    final displayName = auth.user?.displayName ?? 'Bạn';
    final totals = nutritionProvider.todayTotals;
    final targets = nutritionProvider.dailyTargets;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // ══════ HERO SECTION ══════
          _buildHeroSection(displayName),
          const SizedBox(height: 20),

          // ══════ NUTRITION OVERVIEW ══════
          _buildSectionHeader('Tổng quan hôm nay', trailing: 'Hôm nay'),
          const SizedBox(height: 12),
          _buildNutritionGrid(totals, targets),
          const SizedBox(height: 20),

          // ══════ MEAL RECOMMENDATIONS ══════
          _buildSectionHeader(
            'Gợi ý cho bạn',
            actionText: 'Xem tất cả →',
            onAction: () {
              // Navigate to meal suggestions tab (index 1)
              final shell = context.findAncestorStateOfType<State>();
            },
          ),
          const SizedBox(height: 12),
          _buildMealCarousel(recipeProvider),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  /// Hero section – gradient green banner with floating food image
  Widget _buildHeroSection(String displayName) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.heroGradientStart,
            AppColors.heroGradientMid,
            AppColors.heroGradientEnd,
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(color: AppColors.heroShadow, blurRadius: 40, offset: Offset(0, 8)),
        ],
      ),
      child: Stack(
        children: [
          // Decorative circles (matching web's ::before / ::after)
          Positioned(
            top: -40, right: -40,
            child: Container(
              width: 160, height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [const Color(0xFF6CCB63).withOpacity(0.25), Colors.transparent],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -30, left: 80,
            child: Container(
              width: 120, height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [const Color(0xFFA8E6A1).withOpacity(0.3), Colors.transparent],
                ),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(24),
            child: Row(
              children: [
                // Left: Text content
                Expanded(
                  flex: 3,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Tag chip
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.heroTagBg,
                          borderRadius: BorderRadius.circular(50),
                          border: Border.all(color: AppColors.heroTagBorder),
                        ),
                        child: Text('Chào mừng trở lại', style: AppTextStyles.heroTag),
                      ),
                      const SizedBox(height: 12),

                      Text(
                        'Xin chào,\n$displayName!',
                        style: AppTextStyles.heroTitle,
                      ),
                      const SizedBox(height: 8),

                      Text(
                        'Hôm nay là một ngày tuyệt vời\nđể chăm sóc bản thân.',
                        style: AppTextStyles.heroSubtitle,
                      ),
                      const SizedBox(height: 16),

                      // CTA Button
                      Container(
                        decoration: BoxDecoration(
                          gradient: AppColors.ctaGradient,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF6CCB63).withOpacity(0.45),
                              blurRadius: 24,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () {},
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              child: Text('Khám phá món ăn', style: AppTextStyles.buttonText),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Right: Floating food image
                Expanded(
                  flex: 2,
                  child: AnimatedBuilder(
                    animation: _heroFloatAnimation,
                    builder: (context, child) {
                      return Transform.translate(
                        offset: Offset(0, _heroFloatAnimation.value),
                        child: child,
                      );
                    },
                    child: Image.asset(
                      'assets/images/hero_salad_bowl.png',
                      fit: BoxFit.contain,
                      height: 160,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.lunch_dining,
                        size: 80,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Section header – matching web's .dashboard-section-header
  Widget _buildSectionHeader(String title, {String? trailing, String? actionText, VoidCallback? onAction}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: AppTextStyles.sectionTitle),
        if (actionText != null)
          GestureDetector(
            onTap: onAction,
            child: Text(actionText, style: AppTextStyles.sectionSeeAll),
          )
        else if (trailing != null)
          Text(trailing, style: AppTextStyles.bodySmall),
      ],
    );
  }

  /// Nutrition overview grid – 2 columns on mobile
  Widget _buildNutritionGrid(NutritionTotals totals, DailyTargets targets) {
    final nutritionItems = [
      _NutritionItem(Icons.bolt, 'Calorie', totals.calories, 'kcal', targets.calories, AppColors.caloriesIconGradient, AppColors.caloriesBarGradient),
      _NutritionItem(Icons.fitness_center, 'Protein', totals.protein, 'g', targets.protein, AppColors.proteinIconGradient, AppColors.proteinBarGradient),
      _NutritionItem(Icons.bar_chart, 'Carbs', totals.carbs, 'g', targets.carbs, AppColors.carbsIconGradient, AppColors.carbsBarGradient),
      _NutritionItem(Icons.water_drop, 'Chất béo', totals.fat, 'g', targets.fat, AppColors.fatIconGradient, AppColors.fatBarGradient),
      _NutritionItem(Icons.grass, 'Chất xơ', totals.fiber, 'g', targets.fiber, AppColors.fiberIconGradient, AppColors.fiberBarGradient),
      _NutritionItem(Icons.cake, 'Đường', totals.sugar, 'g', targets.sugarLimit, AppColors.sugarIconGradient, AppColors.sugarBarGradient),
      _NutritionItem(Icons.science, 'Muối', totals.sodium, 'g', targets.saltLimit, AppColors.sodiumIconGradient, AppColors.sodiumBarGradient),
      _NutritionItem(Icons.favorite, 'Cholesterol', totals.cholesterol, 'mg', targets.cholesterolLimit, AppColors.cholesterolIconGradient, AppColors.cholesterolBarGradient),
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
      itemCount: nutritionItems.length,
      itemBuilder: (context, index) {
        final item = nutritionItems[index];
        return NutritionCard(
          icon: item.icon,
          label: item.label,
          value: item.value,
          unit: item.unit,
          target: item.target,
          iconGradient: item.iconGradient,
          barGradient: item.barGradient,
        );
      },
    );
  }

  /// Meal recommendations carousel – horizontal scroll
  Widget _buildMealCarousel(RecipeProvider recipeProvider) {
    final suggestions = recipeProvider.mealSuggestions;

    if (recipeProvider.loading) {
      return SizedBox(
        height: 240,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: 4,
          itemBuilder: (_, __) => _buildShimmerCard(),
        ),
      );
    }

    if (suggestions.isEmpty) {
      return Container(
        height: 200,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.divider),
        ),
        child: const Center(
          child: Text('Chưa có gợi ý nào', style: TextStyle(color: AppColors.textHint)),
        ),
      );
    }

    final favoriteProvider = context.watch<FavoriteProvider>();
    final tags = ['Lành mạnh', 'Giàu protein', 'Ít calo', 'Nhiều chất xơ'];

    return SizedBox(
      height: 260,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(vertical: 4),
        itemCount: suggestions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final recipe = suggestions[index];
          return RecipeCard(
            recipe: recipe,
            isFavorite: favoriteProvider.isFavorite(recipe.recipeId),
            tag: tags[index % tags.length],
            onTap: () {
              Navigator.of(context).pushNamed('/recipe-detail', arguments: recipe.recipeId);
            },
            onFavoriteTap: () {
              // Toggle favorite
            },
          );
        },
      ),
    );
  }

  Widget _buildShimmerCard() {
    return Container(
      width: 180,
      margin: const EdgeInsets.only(right: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        children: [
          Container(
            height: 130,
            decoration: const BoxDecoration(
              color: Color(0xFFF3F4F6),
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(height: 14, width: 120, color: const Color(0xFFF3F4F6)),
                const SizedBox(height: 8),
                Container(height: 12, width: 80, color: const Color(0xFFF3F4F6)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _NutritionItem {
  final IconData icon;
  final String label;
  final double value;
  final String unit;
  final double target;
  final List<Color> iconGradient;
  final List<Color> barGradient;

  _NutritionItem(this.icon, this.label, this.value, this.unit, this.target, this.iconGradient, this.barGradient);
}

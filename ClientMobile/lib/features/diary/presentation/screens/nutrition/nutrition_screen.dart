import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_typography.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/widgets/nutrition_card.dart';

/// Nutrition diary screen – matching web's Nutrition.jsx
class NutritionScreen extends StatefulWidget {
  const NutritionScreen({super.key});

  @override
  State<NutritionScreen> createState() => _NutritionScreenState();
}

class _NutritionScreenState extends State<NutritionScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      final accountId = auth.accountId;
      if (accountId != null) {
        context.read<NutritionProvider>().fetchLogs(accountId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final nutritionProvider = context.watch<NutritionProvider>();
    final totals = nutritionProvider.todayTotals;
    final targets = nutritionProvider.dailyTargets;
    final todayLogs = nutritionProvider.todayLogs;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Text('Nhật ký dinh dưỡng', style: AppTypography.pageTitle),
          const SizedBox(height: 4),
          Text('Theo dõi lượng dinh dưỡng hàng ngày', style: AppTypography.bodySmall),
          const SizedBox(height: 20),

          // Summary cards (2 columns)
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: [
              NutritionCard(
                icon: Icons.bolt,
                label: 'Calorie',
                value: totals.calories,
                unit: 'kcal',
                target: targets.calories,
                iconGradient: AppColors.caloriesIconGradient,
                barGradient: AppColors.caloriesBarGradient,
              ),
              NutritionCard(
                icon: Icons.fitness_center,
                label: 'Protein',
                value: totals.protein,
                unit: 'g',
                target: targets.protein,
                iconGradient: AppColors.proteinIconGradient,
                barGradient: AppColors.proteinBarGradient,
              ),
              NutritionCard(
                icon: Icons.bar_chart,
                label: 'Carbs',
                value: totals.carbs,
                unit: 'g',
                target: targets.carbs,
                iconGradient: AppColors.carbsIconGradient,
                barGradient: AppColors.carbsBarGradient,
              ),
              NutritionCard(
                icon: Icons.water_drop,
                label: 'Chất béo',
                value: totals.fat,
                unit: 'g',
                target: targets.fat,
                iconGradient: AppColors.fatIconGradient,
                barGradient: AppColors.fatBarGradient,
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Today's logs
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Hôm nay', style: AppTypography.sectionTitle),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.premiumBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('${todayLogs.length} bữa', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.premiumText)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          if (todayLogs.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.divider),
              ),
              child: Column(
                children: [
                  Icon(Icons.restaurant_menu, size: 48, color: AppColors.textHint),
                  const SizedBox(height: 12),
                  Text('Chưa có bữa ăn nào', style: AppTypography.bodyMedium),
                  const SizedBox(height: 4),
                  Text('Nhấn + để thêm bữa ăn đầu tiên', style: AppTypography.bodySmall),
                ],
              ),
            )
          else
            ...todayLogs.map((log) => _buildLogEntry(log)),
        ],
      ),
    );
  }

  Widget _buildLogEntry(dynamic log) {
    final mealTypeColors = {
      'breakfast': (AppColors.breakfastBg, AppColors.breakfastText, 'Sáng'),
      'lunch': (AppColors.lunchBg, AppColors.lunchText, 'Trưa'),
      'dinner': (AppColors.dinnerBg, AppColors.dinnerText, 'Tối'),
      'snack': (AppColors.snackBg, AppColors.snackText, 'Phụ'),
    };

    final mealType = log.mealType?.toLowerCase() ?? 'snack';
    final colors = mealTypeColors[mealType] ?? (AppColors.snackBg, AppColors.snackText, 'Khác');

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: AppColors.shadowLight, blurRadius: 10, offset: Offset(0, 2))],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: colors.$1,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(colors.$3, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: colors.$2)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${(log.totalCalories ?? 0).round()} kcal', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
                Text('P: ${(log.totalProtein ?? 0).round()}g  C: ${(log.totalCarbs ?? 0).round()}g  F: ${(log.totalFat ?? 0).round()}g',
                    style: AppTypography.bodySmall),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.favActive, size: 20),
            onPressed: () async {
              if (log.id != null) {
                await context.read<NutritionProvider>().deleteLog(log.id!);
              }
            },
          ),
        ],
      ),
    );
  }
}

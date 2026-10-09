import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';

/// Drawer bên phải hiển thị nhanh các chỉ số dinh dưỡng (Wireframe Page 4)
class NutritionSidebarDrawer extends StatelessWidget {
  const NutritionSidebarDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final nutritionProvider = context.watch<NutritionProvider>();
    final totals = nutritionProvider.todayTotals;
    final targets = nutritionProvider.dailyTargets;

    final nutrients = [
      {
        'label': 'Đạm',
        'current': totals.protein,
        'target': targets.protein > 0 ? targets.protein : 90.0,
        'unit': 'g',
        'color': const Color(0xFF3B82F6),
        'icon': Icons.fitness_center,
      },
      {
        'label': 'Đường',
        'current': totals.sugar,
        'target': targets.sugar > 0 ? targets.sugar : 50.0,
        'unit': 'g',
        'color': const Color(0xFFF59E0B),
        'icon': Icons.cake_outlined,
      },
      {
        'label': 'Muối',
        'current': totals.sodium / 1000.0, // convert mg to g if needed
        'target': targets.sodium > 0 ? (targets.sodium / 1000.0) : 5.0,
        'unit': 'g',
        'color': const Color(0xFF64748B),
        'icon': Icons.grain_outlined,
      },
      {
        'label': 'Chất Béo',
        'current': totals.fat,
        'target': targets.fat > 0 ? targets.fat : 60.0,
        'unit': 'g',
        'color': const Color(0xFFEF4444),
        'icon': Icons.opacity_outlined,
      },
      {
        'label': 'Carb',
        'current': totals.carbs,
        'target': targets.carbs > 0 ? targets.carbs : 226.0,
        'unit': 'g',
        'color': const Color(0xFF10B981),
        'icon': Icons.lunch_dining_outlined,
      },
      {
        'label': 'Chất xơ',
        'current': totals.fiber,
        'target': targets.fiber > 0 ? targets.fiber : 25.0,
        'unit': 'g',
        'color': const Color(0xFF14B8A6),
        'icon': Icons.eco_outlined,
      },
      {
        'label': 'Chol',
        'current': totals.cholesterol,
        'target': targets.cholesterol > 0 ? targets.cholesterol : 300.0,
        'unit': 'mg',
        'color': const Color(0xFF8B5CF6),
        'icon': Icons.favorite_border,
      },
    ];

    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header với nút Ẩn
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Dinh dưỡng nạp',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  TextButton.icon(
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.primaryDark,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.arrow_forward_ios, size: 14),
                    label: const Text('Ẩn', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  ),
                ],
              ),
              const Divider(height: 1, color: AppColors.divider),
              const SizedBox(height: 16),

              Expanded(
                child: ListView.separated(
                  itemCount: nutrients.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final item = nutrients[i];
                    final current = (item['current'] as num).toDouble();
                    final target = (item['target'] as num).toDouble();
                    final unit = item['unit'] as String;
                    final color = item['color'] as Color;
                    final progress = target > 0 ? (current / target).clamp(0.0, 1.0) : 0.0;

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: color.withValues(alpha: 0.15),
                                child: Icon(item['icon'] as IconData, size: 18, color: color),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  item['label'] as String,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 15,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ),
                              Text(
                                '${current.toStringAsFixed(1)}$unit / ${target.toStringAsFixed(0)}$unit',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: LinearProgressIndicator(
                              value: progress,
                              minHeight: 6,
                              backgroundColor: color.withValues(alpha: 0.15),
                              color: color,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';
import '../core/constants/app_text_styles.dart';
import 'animated_progress_bar.dart';

/// Single nutrition stat card – matching web's Dashboard .nutrition-card
class NutritionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final double value;
  final String unit;
  final double target;
  final List<Color> iconGradient;
  final List<Color> barGradient;

  const NutritionCard({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    required this.unit,
    required this.target,
    required this.iconGradient,
    required this.barGradient,
  });

  double get percentage => target > 0 ? (value / target * 100).clamp(0, 100) : 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 20,
            offset: Offset(0, 2),
          ),
        ],
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon + Info
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: iconGradient,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, size: 20, color: barGradient.first),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label.toUpperCase(),
                      style: AppTextStyles.nutritionLabel,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    RichText(
                      text: TextSpan(
                        text: value.round().toString(),
                        style: AppTextStyles.nutritionValue,
                        children: [
                          TextSpan(
                            text: ' $unit',
                            style: AppTextStyles.nutritionUnit,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Progress bar
          AnimatedProgressBar(
            percentage: percentage,
            gradientColors: barGradient,
          ),
          const SizedBox(height: 6),

          // Target text
          Text(
            'Mục tiêu: ${target.round()} $unit',
            style: AppTextStyles.nutritionTarget,
          ),
        ],
      ),
    );
  }
}

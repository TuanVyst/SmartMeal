import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_spacing.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import 'package:smart_meal/core/ui/smart_card.dart';
import '../providers/meal_plan_provider.dart';

class MealPlanScreen extends StatefulWidget {
  const MealPlanScreen({super.key});

  @override
  State<MealPlanScreen> createState() => _MealPlanScreenState();
}

class _MealPlanScreenState extends State<MealPlanScreen> {
  int _selectedDayIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MealPlanProvider>().fetchActivePlan();
    });
  }

  void _showGenerateSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) {
        return Padding(
          padding: AppSpacing.edgeInsetsAllLg,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Thiết kế thực đơn', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              const Text('Bạn muốn tạo thực đơn cho bao nhiêu ngày?', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 24),
              _buildDurationOption(context, 3, '3 Ngày (Nhanh chóng)'),
              const SizedBox(height: 12),
              _buildDurationOption(context, 7, '7 Ngày (Khuyến nghị)'),
              const SizedBox(height: 12),
              _buildDurationOption(context, 14, '14 Ngày (Dài hạn)'),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }

  Widget _buildDurationOption(BuildContext context, int days, String label) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16),
          side: const BorderSide(color: AppColors.primary),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        onPressed: () {
          Navigator.pop(context);
          Navigator.pushNamed(context, '/meal-plan/preview', arguments: days);
        },
        child: Text(label, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MealPlanProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Thực Đơn Của Bạn'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => provider.fetchActivePlan(),
          ),
        ],
      ),
      body: provider.loading
          ? const Center(child: CircularProgressIndicator())
          : provider.activePlan == null
              ? _buildEmptyState()
              : _buildActivePlan(provider.activePlan!),
    );
  }

  Widget _buildEmptyState() {
    return Padding(
      padding: AppSpacing.edgeInsetsAllLg,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Icon(Icons.restaurant_menu, size: 80, color: Colors.grey),
          const SizedBox(height: 24),
          const Text(
            'Bạn chưa có thực đơn nào',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Text(
            'Hãy để SmartMeal thiết kế thực đơn phù hợp với mục tiêu và tình trạng sức khỏe của bạn.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 32),
          SmartButton(
            text: 'Tạo Thực Đơn Ngay',
            icon: Icons.auto_awesome,
            onPressed: _showGenerateSheet,
          ),
        ],
      ),
    );
  }

  Widget _buildActivePlan(Map<String, dynamic> plan) {
    final days = plan['days'] as List<dynamic>? ?? [];
    if (days.isEmpty) return _buildEmptyState();

    if (_selectedDayIndex >= days.length) _selectedDayIndex = 0;
    final currentDay = days[_selectedDayIndex];
    final entries = currentDay['entries'] as List<dynamic>? ?? [];

    return Column(
      children: [
        // Day Selector
        SizedBox(
          height: 80,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            itemCount: days.length,
            itemBuilder: (context, index) {
              final isSelected = index == _selectedDayIndex;
              final d = days[index];
              return GestureDetector(
                onTap: () => setState(() => _selectedDayIndex = index),
                child: Container(
                  width: 60,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isSelected ? AppColors.primary : Colors.grey[300]!),
                    boxShadow: isSelected ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))] : [],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Ngày', style: TextStyle(fontSize: 12, color: isSelected ? Colors.white70 : Colors.grey)),
                      Text('${d['dayIndex'] ?? index + 1}', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.black87)),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: entries.length,
            itemBuilder: (context, index) {
              final entry = entries[index];
              return SmartCard(
                margin: const EdgeInsets.only(bottom: 16),
                padding: EdgeInsets.zero,
                child: Row(
                  children: [
                    Container(
                      width: 100,
                      height: 120,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                      ),
                      child: const Icon(Icons.fastfood, color: Colors.grey),
                    ),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(color: AppColors.primaryLight.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)),
                              child: Text(entry['mealSlot'] ?? '', style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              entry['recipeName'] ?? 'Chưa xác định',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.local_fire_department, size: 14, color: Colors.orange),
                                const SizedBox(width: 4),
                                Text('${entry['slotCalories']} kcal', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

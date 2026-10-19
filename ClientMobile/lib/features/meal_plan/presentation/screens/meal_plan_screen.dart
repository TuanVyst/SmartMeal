import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_spacing.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import 'package:smart_meal/core/ui/smart_card.dart';
import 'package:smart_meal/core/utils/recipe_images.dart';
import '../widgets/swap_recipe_sheet.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
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
          context.push('/meal-plan/preview', extra: days);
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

              DateTime? actualDate;
              if (d['dayDate'] != null) {
                actualDate = DateTime.tryParse(d['dayDate'].toString());
              } else if (d['date'] != null) {
                actualDate = DateTime.tryParse(d['date'].toString());
              }
              if (actualDate == null) {
                final startStr = plan['startDate']?.toString();
                final startDate = startStr != null ? DateTime.tryParse(startStr) : null;
                if (startDate != null) {
                  final dayIdx = (d['dayIndex'] as num?)?.toInt() ?? (index + 1);
                  actualDate = startDate.add(Duration(days: dayIdx - 1));
                } else {
                  actualDate = DateTime.now().add(Duration(days: index));
                }
              }
              final formattedDate = DateFormat('dd/MM').format(actualDate.toLocal());

              return GestureDetector(
                onTap: () => setState(() => _selectedDayIndex = index),
                child: Container(
                  width: 68,
                  margin: const EdgeInsets.only(right: 10),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: isSelected ? AppColors.primary : Colors.grey[300]!),
                    boxShadow: isSelected ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 4))] : [],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Ngày ${d['dayIndex'] ?? index + 1}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        formattedDate,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? Colors.white : AppColors.primaryDark,
                        ),
                      ),
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
              final recipeName = entry['recipeName']?.toString() ?? '';
              final rawImg = (entry['imageUrl'] ?? entry['recipeImage'] ?? entry['image'])?.toString();
              final imgUrl = RecipeImages.resolve(recipeName, rawImg);
              final recipeId = (entry['recipeId'] ?? entry['recipe_id'] ?? entry['Recipe_id'] ?? entry['id'])?.toString();
              final entryId = (entry['entryId'] ?? entry['entry_id'] ?? entry['Entry_id'])?.toString();

              return SmartCard(
                margin: const EdgeInsets.only(bottom: 16),
                padding: EdgeInsets.zero,
                onTap: () {
                  if (recipeId != null && recipeId.isNotEmpty) {
                    context.push('/recipe-detail/$recipeId');
                  }
                },
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
                      child: SizedBox(
                        width: 100,
                        height: 120,
                        child: imgUrl.isNotEmpty
                            ? Image.network(
                                imgUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (_, _, _) => Container(
                                  color: Colors.grey[200],
                                  child: const Icon(Icons.fastfood, color: Colors.grey),
                                ),
                              )
                            : Container(
                                color: Colors.grey[200],
                                child: const Icon(Icons.fastfood, color: Colors.grey),
                              ),
                      ),
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
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (entryId != null)
                          IconButton(
                            icon: const Icon(Icons.swap_horiz, color: Colors.blue, size: 22),
                            tooltip: 'Đổi món',
                            onPressed: () => SwapRecipeSheet.show(context, entryId),
                          ),
                        IconButton(
                          icon: const Icon(Icons.add_task, color: AppColors.primary, size: 22),
                          tooltip: 'Ghi vào nhật ký',
                          onPressed: () => _logEntryToDiary(entry),
                        ),
                      ],
                    ),
                    const SizedBox(width: 6),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Future<void> _logEntryToDiary(Map<String, dynamic> entry) async {
    final auth = context.read<AuthProvider>();
    final accountId = auth.accountId;
    if (accountId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để lưu vào nhật ký!'), backgroundColor: AppColors.error),
      );
      return;
    }

    final recipeName = entry['recipeName']?.toString() ?? 'Món ăn';
    final cal = (entry['slotCalories'] as num?)?.toDouble() ?? 350.0;
    final mealSlot = (entry['mealSlot'] ?? 'breakfast').toString();
    final recipeId = (entry['recipeId'] ?? entry['recipe_id'] ?? entry['Recipe_id'])?.toString();

    try {
      await context.read<NutritionProvider>().addLog({
        'account_id': accountId,
        'recipe_id': recipeId,
        'recipe_name': recipeName,
        'recipeName': recipeName,
        'logDate': DateTime.now().toUtc().toIso8601String(),
        'mealType': mealSlot,
        'quantity': 1,
        'unit': 'phần',
        'totalCalories': cal,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã ghi "$recipeName" vào nhật ký hôm nay!'),
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

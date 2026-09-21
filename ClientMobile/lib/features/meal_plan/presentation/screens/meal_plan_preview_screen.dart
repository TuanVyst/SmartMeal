import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import '../providers/meal_plan_provider.dart';
import '../widgets/swap_recipe_sheet.dart';

class MealPlanPreviewScreen extends StatefulWidget {
  final int days;
  const MealPlanPreviewScreen({super.key, required this.days});

  @override
  State<MealPlanPreviewScreen> createState() => _MealPlanPreviewScreenState();
}

class _MealPlanPreviewScreenState extends State<MealPlanPreviewScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MealPlanProvider>().generatePlan(widget.days);
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MealPlanProvider>();

    return Scaffold(
      appBar: AppBar(
        title: Text('Thực Đơn ${widget.days} Ngày'),
      ),
      body: provider.generating
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 24),
                  Text('Hệ thống đang thiết kế thực đơn\nriêng cho bạn...', textAlign: TextAlign.center, style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16)),
                  SizedBox(height: 8),
                  Text('Dựa trên chỉ số BMR và mục tiêu của bạn', style: TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            )
          : provider.previewPlan == null
              ? Center(child: Text('Lỗi: ${provider.error ?? "Không thể tạo thực đơn"}'))
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: (provider.previewPlan!['days'] as List).length,
                        itemBuilder: (context, index) {
                          final day = (provider.previewPlan!['days'] as List)[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text('Ngày ${day['dayIndex']}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      Text('${day['totalCalories']} kcal', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                  const Divider(),
                                  ...(day['entries'] as List).map<Widget>((entry) {
                                    return ListTile(
                                      contentPadding: EdgeInsets.zero,
                                      title: Text(entry['recipeName'] ?? ''),
                                      subtitle: Text('${entry['mealSlot']} • ${entry['slotCalories']} kcal'),
                                      trailing: IconButton(
                                        icon: const Icon(Icons.swap_horiz, color: Colors.blue),
                                        onPressed: () {
                                          if (entry['entryId'] != null) {
                                            SwapRecipeSheet.show(context, entry['entryId']);
                                          }
                                        },
                                      ),
                                    );
                                  }),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -5))],
                      ),
                      child: SmartButton(
                        text: provider.loading ? 'Đang xử lý...' : '✓ Chốt Thực Đơn Này',
                        onPressed: provider.loading
                            ? null
                            : () async {
                                final navigator = Navigator.of(context);
                                await provider.confirmPlan();
                                if (!mounted) return;
                                if (provider.error == null) {
                                  navigator.pop();
                                }
                              },
                      ),
                    ),
                  ],
                ),
    );
  }
}

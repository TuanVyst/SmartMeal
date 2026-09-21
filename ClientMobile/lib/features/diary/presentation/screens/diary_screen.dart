import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/theme/app_spacing.dart';
import 'package:smart_meal/core/ui/smart_card.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';
import '../providers/nutrition_provider.dart';
import '../widgets/add_log_sheet.dart';

class DiaryScreen extends StatefulWidget {
  const DiaryScreen({super.key});

  @override
  State<DiaryScreen> createState() => _DiaryScreenState();
}

class _DiaryScreenState extends State<DiaryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.accountId != null) {
        context.read<NutritionProvider>().fetchLogs(auth.accountId!);
      }
    });
  }

  void _changeDate(int offset) {
    final provider = context.read<NutritionProvider>();
    final current = DateFormat('yyyy-MM-dd').parse(provider.selectedDate);
    final next = current.add(Duration(days: offset));
    provider.setSelectedDate(DateFormat('yyyy-MM-dd').format(next));
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NutritionProvider>();
    final healthProvider = context.watch<HealthProfileProvider>();
    final hasDiabetes = (healthProvider.profile?.conditions ?? []).contains('diabetes');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nhật ký Dinh dưỡng'),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _showAddLogSheet),
        ],
      ),
      body: Column(
        children: [
          _buildDateNavigator(provider.selectedDate),
          Expanded(
            child: provider.loading
                ? const Center(child: CircularProgressIndicator())
                : SingleChildScrollView(
                    padding: AppSpacing.edgeInsetsAllLg,
                    child: Column(
                      children: [
                        _buildNutritionSummary(provider, hasDiabetes),
                        const SizedBox(height: 24),
                        _buildMealList(provider),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateNavigator(String dateStr) {
    final date = DateFormat('yyyy-MM-dd').parse(dateStr);
    final displayDate = DateFormat('dd/MM/yyyy').format(date);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(icon: const Icon(Icons.chevron_left), onPressed: () => _changeDate(-1)),
          Text(displayDate, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          IconButton(icon: const Icon(Icons.chevron_right), onPressed: () => _changeDate(1)),
        ],
      ),
    );
  }

  Widget _buildNutritionSummary(NutritionProvider provider, bool hasDiabetes) {
    final totals = provider.todayTotals;
    final targets = provider.dailyTargets;

    return SmartCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Tổng quan hôm nay', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _buildMacroBar('Năng lượng (kcal)', totals.calories, targets.calories, AppColors.primary),
          _buildMacroBar('Đạm (g)', totals.protein, targets.protein, Colors.red),
          _buildMacroBar('Carbs (g)', totals.carbs, targets.carbs, Colors.blue),
          _buildMacroBar('Chất béo (g)', totals.fat, targets.fat, Colors.orange),
          _buildMacroBar('Chất xơ (g)', totals.fiber, targets.fiber, Colors.green),
          _buildMacroBar(
            'Đường (g)', 
            totals.sugar, 
            targets.sugarLimit, 
            hasDiabetes && totals.sugar > targets.sugarLimit ? Colors.red : Colors.amber,
            warning: hasDiabetes && totals.sugar > targets.sugarLimit ? 'Chú ý Tiểu đường' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildMacroBar(String label, double value, double target, Color color, {String? warning}) {
    final pct = target > 0 ? (value / target).clamp(0.0, 1.0) : 0.0;
    final isOver = target > 0 && value > target;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
                  if (warning != null) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.red[100], borderRadius: BorderRadius.circular(4)),
                      child: Text(warning, style: const TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ],
              ),
              Text('${value.round()} / ${target.round()}', style: TextStyle(color: isOver ? Colors.red : Colors.black87, fontWeight: isOver ? FontWeight.bold : FontWeight.normal)),
            ],
          ),
          const SizedBox(height: 6),
          LinearProgressIndicator(
            value: pct,
            backgroundColor: color.withValues(alpha: 0.2),
            color: isOver ? Colors.red : color,
            borderRadius: BorderRadius.circular(4),
          ),
        ],
      ),
    );
  }

  Widget _buildMealList(NutritionProvider provider) {
    final logs = provider.selectedDateLogs;
    if (logs.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(32),
        child: Text('Chưa có ghi chép nào trong ngày.', style: TextStyle(color: Colors.grey)),
      );
    }

    // Group logs by meal type
    final grouped = {
      'breakfast': [],
      'lunch': [],
      'dinner': [],
      'snack': [],
    };

    for (final log in logs) {
      final mt = _normalizeMealType(log.mealType ?? '');
      if (grouped.containsKey(mt)) {
        grouped[mt]!.add(log);
      } else {
        grouped['snack']!.add(log);
      }
    }

    return Column(
      children: [
        _buildMealSection('Sáng', grouped['breakfast']!, const Color(0xFFDCFCE7), const Color(0xFF15803D)),
        _buildMealSection('Trưa', grouped['lunch']!, const Color(0xFFFFEDD5), const Color(0xFFC2410C)),
        _buildMealSection('Tối', grouped['dinner']!, const Color(0xFFF3E8FF), const Color(0xFF7C3AED)),
        _buildMealSection('Bữa phụ', grouped['snack']!, const Color(0xFFFEF9C3), const Color(0xFFA16207)),
      ],
    );
  }

  String _normalizeMealType(String raw) {
    final str = raw.toLowerCase();
    if (str.contains('breakfast') || str.contains('sáng')) return 'breakfast';
    if (str.contains('lunch') || str.contains('trưa')) return 'lunch';
    if (str.contains('dinner') || str.contains('tối')) return 'dinner';
    return 'snack';
  }

  Widget _buildMealSection(String title, List<dynamic> logs, Color bg, Color fg) {
    if (logs.isEmpty) return const SizedBox();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(8)),
          child: Text(title, style: TextStyle(color: fg, fontWeight: FontWeight.bold)),
        ),
        const SizedBox(height: 12),
        ...logs.map((log) {
          final name = log.recipe?.recipeName ?? log.ingredient?.name ?? 'Món ăn tùy chỉnh';
          final cal = log.totalCalories?.round() ?? 0;
          return Dismissible(
            key: Key(log.id ?? log.hashCode.toString()),
            direction: DismissDirection.endToStart,
            background: Container(
              alignment: Alignment.centerRight,
              padding: const EdgeInsets.only(right: 20),
              color: Colors.red,
              child: const Icon(Icons.delete, color: Colors.white),
            ),
            onDismissed: (_) {
              if (log.id != null) {
                context.read<NutritionProvider>().deleteLog(log.id!);
              }
            },
            child: ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(name),
              subtitle: Text('${log.quantity} ${log.unit}'),
              trailing: Text('$cal kcal', style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          );
        }),
        const Divider(),
        const SizedBox(height: 16),
      ],
    );
  }

  void _showAddLogSheet() {
    final provider = context.read<NutritionProvider>();
    AddLogSheet.show(context, provider.selectedDate);
  }
}

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/recipes/presentation/screens/ingredients/ingredient_list_screen.dart';
import '../../domain/nutrition_log_model.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';
import '../providers/nutrition_provider.dart';
import '../widgets/add_log_sheet.dart';

/// Màn hình Nhật ký ăn uống & Hồ sơ sức khỏe (Wireframe Page 1)
class DiaryScreen extends StatefulWidget {
  final bool showAppBar;
  const DiaryScreen({super.key, this.showAppBar = true});
  @override
  State<DiaryScreen> createState() => _DiaryScreenState();
}

class _DiaryScreenState extends State<DiaryScreen> {
  int _topTab = 0; // 0: Nhật ký ăn uống, 1: Tra cứu nguyên liệu
  int _subTab = 0; // 0: Nhật ký và mục tiêu, 1: Thống kê và phân tích
  final TextEditingController _ingredientSearchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.accountId != null) {
        context.read<NutritionProvider>().fetchLogs(auth.accountId!);
        context.read<NutritionProvider>().fetchGoals(auth.accountId!);
      }
    });
  }

  @override
  void dispose() {
    _ingredientSearchCtrl.dispose();
    super.dispose();
  }

  void _changeDate(int offset) {
    final provider = context.read<NutritionProvider>();
    final current = DateFormat('yyyy-MM-dd').parse(provider.selectedDate);
    final next = current.add(Duration(days: offset));
    provider.setSelectedDate(DateFormat('yyyy-MM-dd').format(next));
  }

  Future<void> _pickDate() async {
    final provider = context.read<NutritionProvider>();
    final current = DateFormat('yyyy-MM-dd').parse(provider.selectedDate);
    final picked = await showDatePicker(
      context: context,
      initialDate: current,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: AppColors.primary),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      provider.setSelectedDate(DateFormat('yyyy-MM-dd').format(picked));
    }
  }

  void _showAddLogSheet() {
    final date = context.read<NutritionProvider>().selectedDate;
    AddLogSheet.show(context, date);
  }

  @override
  Widget build(BuildContext context) {
    final nutritionProvider = context.watch<NutritionProvider>();
    final healthProvider = context.watch<HealthProfileProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: widget.showAppBar
          ? AppBar(
              title: const Text('Nhật ký ăn uống', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              backgroundColor: Colors.white,
              elevation: 0.5,
              actions: [
                IconButton(
                  icon: const Icon(Icons.add_circle, color: AppColors.primary, size: 28),
                  tooltip: 'Ghi nhận bữa ăn',
                  onPressed: _showAddLogSheet,
                ),
              ],
            )
          : null,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. TABS TRÊN CÙNG: [Nhật ký ăn uống] / [Tra cứu nguyên liệu]
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              padding: const EdgeInsets.all(4),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _topTab = 0),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _topTab == 0 ? AppColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'Nhật ký ăn uống',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: _topTab == 0 ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _topTab = 1),
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _topTab == 1 ? AppColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'Tra cứu nguyên liệu',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: _topTab == 1 ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            if (_topTab == 1) ...[
              const SizedBox(
                height: 600,
                child: IngredientListScreen(),
              ),
            ] else ...[
              // 2. BỘ CHỌN NGÀY (DD/MM/YYYY)
              _buildDateSelector(nutritionProvider),
              const SizedBox(height: 16),

              // 3. HỒ SƠ SỨC KHỎE
              _buildHealthProfileCard(healthProvider, nutritionProvider),
              const SizedBox(height: 16),

              // 4. PHÂN TÍCH NĂNG LƯỢNG
              _buildEnergyAnalysisCard(healthProvider, nutritionProvider),
              const SizedBox(height: 16),

              // 5. SUB-TABS: [Nhật ký và mục tiêu] / [Thống kê và phân tích]
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _subTab = 0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _subTab == 0 ? AppColors.primaryBackground : Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: _subTab == 0 ? AppColors.primary : AppColors.border,
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          'Nhật ký và mục tiêu',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: _subTab == 0 ? AppColors.primaryDark : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _subTab = 1),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _subTab == 1 ? AppColors.primaryBackground : Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: _subTab == 1 ? AppColors.primary : AppColors.border,
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          'Thống kê và phân tích',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: _subTab == 1 ? AppColors.primaryDark : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              if (_subTab == 0) ...[
                // 6. SO SÁNH VỚI MỤC TIÊU HÔM NAY
                _buildGoalsComparisonCard(nutritionProvider),
                const SizedBox(height: 16),

                // 7. BỮA ĂN GHI NHẬN HÔM NAY (Image 2)
                _buildMealsOfDayCard(nutritionProvider),
              ] else ...[
                // 8. THỐNG KÊ VÀ PHÂN TÍCH
                _buildStatsAndAnalysisCard(nutritionProvider),
              ],
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // WIDGET BỘ CHỌN NGÀY
  Widget _buildDateSelector(NutritionProvider provider) {
    final parsed = DateFormat('yyyy-MM-dd').parse(provider.selectedDate);
    final displayDate = DateFormat('dd/MM/yyyy').format(parsed);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left, color: AppColors.textPrimary),
                onPressed: () => _changeDate(-1),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 10),
              InkWell(
                onTap: _pickDate,
                child: Row(
                  children: [
                    const Icon(Icons.calendar_month, color: AppColors.primary, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      displayDate,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              IconButton(
                icon: const Icon(Icons.chevron_right, color: AppColors.textPrimary),
                onPressed: () => _changeDate(1),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              side: const BorderSide(color: AppColors.primary),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              provider.setSelectedDate(DateFormat('yyyy-MM-dd').format(DateTime.now()));
            },
            child: const Text('Hôm nay', style: TextStyle(fontSize: 12, color: AppColors.primaryDark, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // WIDGET HỒ SƠ SỨC KHỎE (4 CHỈ SỐ, LỊCH SỬ BMI, CHỈNH SỬA)
  Widget _buildHealthProfileCard(HealthProfileProvider healthProvider, NutritionProvider nutritionProvider) {
    final profile = healthProvider.profile;
    final height = profile?.height ?? 170.0;
    final weight = profile?.weight ?? 68.0;

    double bmi = 23.0;
    if (height > 0 && weight > 0) {
      final hMeters = height / 100.0;
      bmi = weight / (hMeters * hMeters);
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text(
                  'Hồ sơ sức khoẻ',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                      minimumSize: const Size(60, 28),
                      side: const BorderSide(color: AppColors.border),
                    ),
                    onPressed: () {
                      context.push('/health-profile');
                    },
                    child: const Text('lịch sử BMI', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                  ),
                  const SizedBox(width: 6),
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                      minimumSize: const Size(60, 28),
                      side: const BorderSide(color: AppColors.primary),
                    ),
                    onPressed: () {
                      context.push('/health-profile');
                    },
                    child: const Text('chỉnh sửa', style: TextStyle(fontSize: 11, color: AppColors.primaryDark)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _buildStatMetricBox('Chiều cao', '${height.round()} cm'),
              _buildStatMetricBox('Cân nặng', '${weight.round()} kg'),
              _buildStatMetricBox('BMI', bmi.toStringAsFixed(1)),
              _buildStatMetricBox('Mục tiêu', nutritionProvider.dailyTargets.calories > 0 ? '${nutritionProvider.dailyTargets.calories.round()} kcal' : '2000 kcal'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatMetricBox(String title, String val) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 3),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surfaceHover,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            const SizedBox(height: 6),
            Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary)),
          ],
        ),
      ),
    );
  }

  // WIDGET PHÂN TÍCH NĂNG LƯỢNG (BMR, TDEE, MỤC TIÊU, THÂM HỤT)
  Widget _buildEnergyAnalysisCard(HealthProfileProvider healthProvider, NutritionProvider nutritionProvider) {
    final targets = nutritionProvider.dailyTargets;
    final targetCalo = targets.calories > 0 ? targets.calories.round() : 1805;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Phân tích năng lượng',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildEnergyBadge('1713', 'BMR', const Color(0xFF3B82F6)),
              _buildEnergyBadge('2355', 'TDEE', const Color(0xFF10B981)),
              _buildEnergyBadge('$targetCalo', 'Mục tiêu', const Color(0xFFF59E0B)),
              _buildEnergyBadge('550', 'Thâm hụt', const Color(0xFFEF4444)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEnergyBadge(String value, String label, Color color) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ],
    );
  }

  // WIDGET SO SÁNH VỚI MỤC TIÊU HÔM NAY (CALO VÀ TỪNG CHẤT)
  Widget _buildGoalsComparisonCard(NutritionProvider provider) {
    final totals = provider.todayTotals;
    final targets = provider.dailyTargets;

    final currentCal = totals.calories.round();
    final targetCal = targets.calories > 0 ? targets.calories.round() : 1805;
    final calProgress = targetCal > 0 ? (currentCal / targetCal).clamp(0.0, 1.0) : 0.0;

    final nutrients = [
      {
        'name': 'Đạm',
        'current': '${totals.protein.round()}g',
        'target': '${(targets.protein > 0 ? targets.protein : 90.0).round()}g',
        'color': const Color(0xFF3B82F6),
      },
      {
        'name': 'Carb',
        'current': '${totals.carbs.round()}g',
        'target': '${(targets.carbs > 0 ? targets.carbs : 226.0).round()}g',
        'color': const Color(0xFF10B981),
      },
      {
        'name': 'Chất béo',
        'current': '${totals.fat.round()}g',
        'target': '${(targets.fat > 0 ? targets.fat : 60.0).round()}g',
        'color': const Color(0xFFEF4444),
      },
      {
        'name': 'Chất xơ',
        'current': '${totals.fiber.round()}g',
        'target': '${(targets.fiber > 0 ? targets.fiber : 25.0).round()}g',
        'color': const Color(0xFF14B8A6),
      },
      {
        'name': 'Đường',
        'current': '${totals.sugar.round()}g',
        'target': '${(targets.sugar > 0 ? targets.sugar : 50.0).round()}g',
        'color': const Color(0xFFF59E0B),
      },
      {
        'name': 'Muối',
        'current': '${(totals.sodium > 50 ? (totals.sodium / 1000.0) : totals.sodium).toStringAsFixed(1)}g',
        'target': '${(targets.sodium > 50 ? (targets.sodium / 1000.0) : (targets.sodium > 0 ? targets.sodium : 5.0)).toStringAsFixed(1)}g',
        'color': const Color(0xFF64748B),
      },
      {
        'name': 'Cholesterol',
        'current': '${totals.cholesterol.round()}mg',
        'target': '${(targets.cholesterol > 0 ? targets.cholesterol : 300.0).round()}mg',
        'color': const Color(0xFF8B5CF6),
      },
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text(
                  'So sánh với mục tiêu hôm nay',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                  minimumSize: const Size(60, 28),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: _showAddLogSheet,
                icon: const Icon(Icons.add, size: 14),
                label: const Text('Ghi bữa ăn', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Calorie Banner
          Center(
            child: Text(
              '$currentCal / $targetCal kcal',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: calProgress,
              minHeight: 10,
              backgroundColor: AppColors.surfaceHover,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 6),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              '${(calProgress * 100).round()}%',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
            ),
          ),
          const Divider(height: 20, color: AppColors.divider),

          // Danh sách các chất dinh dưỡng
          ...nutrients.map((n) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 7),
              child: Row(
                children: [
                  Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: n['color'] as Color,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      n['name'] as String,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.textPrimary),
                    ),
                  ),
                  Text(
                    '${n['current']} / ${n['target']}',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  // WIDGET BỮA ĂN NGÀY DD/MM/YYYY (Theo chuẩn Web Image 2)
  Widget _buildMealsOfDayCard(NutritionProvider provider) {
    final parsed = DateFormat('yyyy-MM-dd').parse(provider.selectedDate);
    final displayDate = DateFormat('dd/MM/yyyy').format(parsed);
    final logs = provider.selectedDateLogs;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Bữa ăn ngày $displayDate',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                  minimumSize: const Size(60, 28),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: _showAddLogSheet,
                icon: const Icon(Icons.add, size: 14),
                label: const Text('Ghi bữa ăn', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (logs.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  const Icon(Icons.restaurant_menu_outlined, size: 36, color: AppColors.textHint),
                  const SizedBox(height: 8),
                  const Text(
                    'Không tìm thấy bữa ăn nào được ghi nhận cho ngày này.',
                    style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.primary),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _showAddLogSheet,
                    icon: const Icon(Icons.add, size: 16, color: AppColors.primaryDark),
                    label: const Text('Ghi nhận bữa ăn ngay', style: TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: logs.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final log = logs[index];
                final mealSlot = (log.mealType ?? 'breakfast').toLowerCase();

                String slotLabel = 'Sáng';
                Color slotBg = const Color(0xFFDCFCE7);
                Color slotColor = const Color(0xFF15803D);

                if (mealSlot.contains('lunch') || mealSlot.contains('trưa')) {
                  slotLabel = 'Trưa';
                  slotBg = const Color(0xFFFFEDD5);
                  slotColor = const Color(0xFFC2410C);
                } else if (mealSlot.contains('dinner') || mealSlot.contains('tối')) {
                  slotLabel = 'Tối';
                  slotBg = const Color(0xFFF3E8FF);
                  slotColor = const Color(0xFF7C3AED);
                } else if (mealSlot.contains('snack') || mealSlot.contains('phụ')) {
                  slotLabel = 'Phụ';
                  slotBg = const Color(0xFFFEF9C3);
                  slotColor = const Color(0xFFA16207);
                }

                final resolvedRecipe = log.recipeId != null ? provider.recipesMap[log.recipeId] : null;
                final dishName = (log.recipeName != null && log.recipeName!.trim().isNotEmpty)
                    ? log.recipeName!
                    : (resolvedRecipe?.recipeName ?? 'Món ăn dinh dưỡng');
                final cals = (log.totalCalories ?? 0).round();
                final protein = (log.totalProtein ?? 0).round();
                final carbs = (log.totalCarbs ?? 0).round();
                final fat = (log.totalFat ?? 0).round();

                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: slotBg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          slotLabel,
                          style: TextStyle(color: slotColor, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              dishName,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${log.quantity?.round() ?? 1} ${log.unit ?? "phần"} • $cals kcal',
                              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Đạm: ${protein}g  Carb: ${carbs}g  Béo: ${fat}g',
                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(width: 4),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 20, color: Colors.grey),
                        tooltip: 'Xóa',
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => _confirmDeleteLog(log),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  void _confirmDeleteLog(NutritionLog log) {
    final dishName = log.recipeName?.isNotEmpty == true ? log.recipeName! : 'bữa ăn này';
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          title: const Text('Xác nhận xóa', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          content: Text('Bạn có chắc chắn muốn xóa "$dishName" khỏi nhật ký không?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
              onPressed: () async {
                Navigator.of(ctx).pop();
                if (log.id != null) {
                  try {
                    await context.read<NutritionProvider>().deleteLog(log.id!);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Đã xóa món ăn khỏi nhật ký!'), backgroundColor: AppColors.success),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Lỗi khi xóa: $e'), backgroundColor: AppColors.error),
                      );
                    }
                  }
                }
              },
              child: const Text('Xóa', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  // WIDGET THỐNG KÊ VÀ PHÂN TÍCH (Khi chọn subTab Thống kê và phân tích)
  Widget _buildStatsAndAnalysisCard(NutritionProvider provider) {
    final logs = provider.logs;
    final targets = provider.dailyTargets;
    final targetCal = targets.calories > 0 ? targets.calories : 2000.0;

    final now = DateTime.now();
    final monday = now.subtract(Duration(days: now.weekday - 1));
    final weekDays = List.generate(7, (i) => monday.add(Duration(days: i)));

    final dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    final weekCalMap = <String, double>{};

    for (final l in logs) {
      if (l.logDate != null) {
        final key = DateFormat('yyyy-MM-dd').format(l.logDate!.toLocal());
        weekCalMap[key] = (weekCalMap[key] ?? 0.0) + (l.totalCalories ?? 0.0);
      }
    }

    double totalWeeklyCal = 0.0;
    int daysWithData = 0;
    for (final d in weekDays) {
      final key = DateFormat('yyyy-MM-dd').format(d);
      final cal = weekCalMap[key] ?? 0.0;
      if (cal > 0) {
        totalWeeklyCal += cal;
        daysWithData++;
      }
    }

    final avgDailyCal = daysWithData > 0 ? (totalWeeklyCal / daysWithData) : 0.0;

    final todayTotals = provider.todayTotals;
    final totalMacroGrams = todayTotals.protein + todayTotals.carbs + todayTotals.fat;
    final pPct = totalMacroGrams > 0 ? (todayTotals.protein / totalMacroGrams * 100).round() : 25;
    final cPct = totalMacroGrams > 0 ? (todayTotals.carbs / totalMacroGrams * 100).round() : 50;
    final fPct = totalMacroGrams > 0 ? (todayTotals.fat / totalMacroGrams * 100).round() : 25;

    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.bar_chart, color: AppColors.primaryDark),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Xu hướng năng lượng tuần',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Mục tiêu: ${targetCal.round()} kcal',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              SizedBox(
                height: 150,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: List.generate(7, (i) {
                    final d = weekDays[i];
                    final key = DateFormat('yyyy-MM-dd').format(d);
                    final cal = weekCalMap[key] ?? 0.0;
                    final ratio = targetCal > 0 ? (cal / targetCal).clamp(0.0, 1.2) : 0.0;
                    final isToday = DateFormat('yyyy-MM-dd').format(now) == key;

                    Color barColor = AppColors.primary;
                    if (cal == 0) {
                      barColor = Colors.grey.shade300;
                    } else if (cal > targetCal * 1.1) {
                      barColor = Colors.orange;
                    }

                    return Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          cal > 0 ? cal.round().toString() : '',
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: barColor),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          width: 24,
                          height: (100 * (cal > 0 ? ratio : 0.05)).clamp(6.0, 100.0),
                          decoration: BoxDecoration(
                            color: barColor,
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isToday ? AppColors.primary : Colors.transparent,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            dayNames[i],
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: isToday ? FontWeight.bold : FontWeight.w500,
                              color: isToday ? Colors.white : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Trung bình nạp / ngày', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    const SizedBox(height: 4),
                    Text(
                      '${avgDailyCal.round()} kcal',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      avgDailyCal > targetCal
                          ? '+${(avgDailyCal - targetCal).round()} kcal vs mục tiêu'
                          : '-${(targetCal - avgDailyCal).round()} kcal vs mục tiêu',
                      style: TextStyle(fontSize: 10, color: avgDailyCal > targetCal ? Colors.orange : Colors.green),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Chuỗi ghi nhật ký', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.local_fire_department, color: Colors.orange, size: 20),
                        const SizedBox(width: 4),
                        Text(
                          '${provider.streakDays} ngày',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.orange),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    const Text('Duy trì đều đặn mỗi ngày', style: TextStyle(fontSize: 10, color: AppColors.textHint)),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Phân bổ đa lượng hôm nay (Macro Split)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: SizedBox(
                  height: 10,
                  child: Row(
                    children: [
                      Expanded(flex: pPct, child: Container(color: const Color(0xFF3B82F6))),
                      Expanded(flex: cPct, child: Container(color: const Color(0xFF10B981))),
                      Expanded(flex: fPct, child: Container(color: const Color(0xFFF97316))),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildMacroStatItem('Đạm (Protein)', '${todayTotals.protein.round()}g', '$pPct%', const Color(0xFF3B82F6)),
                  _buildMacroStatItem('Tinh bột (Carb)', '${todayTotals.carbs.round()}g', '$cPct%', const Color(0xFF10B981)),
                  _buildMacroStatItem('Chất béo (Fat)', '${todayTotals.fat.round()}g', '$fPct%', const Color(0xFFF97316)),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMacroStatItem(String label, String grams, String pct, Color color) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 4),
            Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          ],
        ),
        const SizedBox(height: 4),
        Text('$grams ($pct)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
      ],
    );
  }
}

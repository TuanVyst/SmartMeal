import 'package:flutter/material.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/ui/smart_card.dart';
import 'package:smart_meal/core/ui/smart_loading.dart';
import 'package:smart_meal/core/utils/recipe_images.dart';
import '../../../data/ingredient_service.dart';
import '../../../domain/ingredient_model.dart';

class IngredientDetailScreen extends StatefulWidget {
  final String ingredientId;
  const IngredientDetailScreen({super.key, required this.ingredientId});

  @override
  State<IngredientDetailScreen> createState() => _IngredientDetailScreenState();
}

class _IngredientDetailScreenState extends State<IngredientDetailScreen> {
  final IngredientService _ingredientService = IngredientService();
  Ingredient? _ingredient;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadIngredient();
  }

  Future<void> _loadIngredient() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final item = await _ingredientService.getById(widget.ingredientId);
      if (mounted) {
        setState(() {
          _ingredient = item;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết nguyên liệu')),
        body: const Center(child: SmartLoadingSpinner()),
      );
    }

    if (_error != null || _ingredient == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết nguyên liệu')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 50, color: AppColors.error),
              const SizedBox(height: 12),
              Text(_error ?? 'Không tìm thấy nguyên liệu'),
              const SizedBox(height: 16),
              ElevatedButton(onPressed: _loadIngredient, child: const Text('Thử lại')),
            ],
          ),
        ),
      );
    }

    final ingredient = _ingredient!;
    final nv = ingredient.nutritionalValue;
    final cals = nv?.calories ?? 0.0;
    final protein = nv?.protein ?? 0.0;
    final carbs = nv?.carbs ?? 0.0;
    final fat = nv?.fat ?? 0.0;
    final fiber = nv?.fiber ?? 0.0;
    final sugar = nv?.sugar ?? 0.0;
    final salt = nv?.salt ?? 0.0;
    final cholesterol = nv?.cholesterol ?? 0.0;

    // Macro percentages
    final totalMacroGrams = (protein + carbs + fat);
    final proteinPct = totalMacroGrams > 0 ? (protein / totalMacroGrams * 100) : 0.0;
    final carbsPct = totalMacroGrams > 0 ? (carbs / totalMacroGrams * 100) : 0.0;
    final fatPct = totalMacroGrams > 0 ? (fat / totalMacroGrams * 100) : 0.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(ingredient.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFF0FDF4), Color(0xFFDCFCE7)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primaryLight),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Container(
                      width: 84,
                      height: 84,
                      color: Colors.white,
                      child: Image.network(
                        IngredientImages.resolve(ingredient.imageUrl, ingredient.name),
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => const Icon(Icons.restaurant, size: 44, color: AppColors.primaryDark),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    ingredient.name,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Khẩu phần tiêu chuẩn: 100g',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryDark),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        cals.toStringAsFixed(0),
                        style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: AppColors.primaryDark),
                      ),
                      const SizedBox(width: 6),
                      const Text('kcal', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textSecondary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Macro Ratio Bar
            SmartCard(
              padding: const EdgeInsets.all(16),
              backgroundColor: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Tỷ lệ dinh dưỡng đa lượng (Macronutrients)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: SizedBox(
                      height: 12,
                      child: Row(
                        children: [
                          if (proteinPct > 0)
                            Expanded(flex: proteinPct.round(), child: Container(color: const Color(0xFF3B82F6))),
                          if (carbsPct > 0)
                            Expanded(flex: carbsPct.round(), child: Container(color: const Color(0xFF10B981))),
                          if (fatPct > 0)
                            Expanded(flex: fatPct.round(), child: Container(color: const Color(0xFFF97316))),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildMacroLegend('Đạm', '${protein.toStringAsFixed(1)}g', '${proteinPct.toStringAsFixed(0)}%', const Color(0xFF3B82F6)),
                      _buildMacroLegend('Carb', '${carbs.toStringAsFixed(1)}g', '${carbsPct.toStringAsFixed(0)}%', const Color(0xFF10B981)),
                      _buildMacroLegend('Béo', '${fat.toStringAsFixed(1)}g', '${fatPct.toStringAsFixed(0)}%', const Color(0xFFF97316)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Detailed Nutrition Table
            SmartCard(
              padding: const EdgeInsets.all(16),
              backgroundColor: Colors.white,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Thành phần dinh dưỡng chi tiết', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 6),
                  const Text('Hàm lượng trên 100g nguyên liệu thực phẩm:', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  const Divider(height: 20),
                  _buildNutritionRow('Năng lượng (Calories)', '${cals.toStringAsFixed(1)} kcal', Icons.bolt, Colors.amber),
                  _buildNutritionRow('Chất đạm (Protein)', '${protein.toStringAsFixed(1)} g', Icons.fitness_center, const Color(0xFF3B82F6)),
                  _buildNutritionRow('Tinh bột (Carbohydrate)', '${carbs.toStringAsFixed(1)} g', Icons.grain, const Color(0xFF10B981)),
                  _buildNutritionRow('Chất béo (Fat)', '${fat.toStringAsFixed(1)} g', Icons.opacity, const Color(0xFFF97316)),
                  _buildNutritionRow('Chất xơ (Dietary Fiber)', '${fiber.toStringAsFixed(1)} g', Icons.eco, const Color(0xFF14B8A6)),
                  _buildNutritionRow('Đường (Sugars)', '${sugar.toStringAsFixed(1)} g', Icons.cake_outlined, const Color(0xFFEAB308)),
                  _buildNutritionRow('Muối / Natri (Salt / Sodium)', '${salt.toStringAsFixed(1)} mg', Icons.grain_outlined, const Color(0xFF64748B)),
                  _buildNutritionRow('Cholesterol', '${cholesterol.toStringAsFixed(1)} mg', Icons.favorite_border, const Color(0xFF8B5CF6)),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Health Tip
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.tips_and_updates_outlined, color: Color(0xFF2563EB), size: 22),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Lời khuyên dinh dưỡng: Kết hợp nguyên liệu này với nguồn rau xanh và chế biến bằng phương pháp hấp, luộc hoặc áp chảo với ít dầu để giữ trọn vẹn vitamin và khoáng chất tự nhiên.',
                      style: TextStyle(fontSize: 13, color: Color(0xFF1E3A8A), height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildMacroLegend(String label, String grams, String pct, Color color) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('$label ($pct)', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
            Text(grams, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ],
    );
  }

  Widget _buildNutritionRow(String title, String value, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: color.withValues(alpha: 0.15),
            child: Icon(icon, size: 14, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(title, style: const TextStyle(fontSize: 14, color: AppColors.textPrimary))),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}

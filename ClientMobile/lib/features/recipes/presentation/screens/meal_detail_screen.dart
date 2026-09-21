import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import 'package:smart_meal/features/recipes/presentation/providers/recipe_provider.dart';
import 'package:smart_meal/features/recipes/domain/recipe_model.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/favorites/presentation/providers/favorite_provider.dart';
class MealDetailScreen extends StatefulWidget {
  final String recipeId;

  const MealDetailScreen({super.key, required this.recipeId});

  @override
  State<MealDetailScreen> createState() => _MealDetailScreenState();
}

class _MealDetailScreenState extends State<MealDetailScreen> {
  Recipe? _recipe;
  bool _loading = true;
  int _activeTab = 0; // 0 = Hướng dẫn, 1 = Dinh dưỡng

  @override
  void initState() {
    super.initState();
    _fetchRecipe();
  }

  Future<void> _fetchRecipe() async {
    final provider = context.read<RecipeProvider>();
    final recipe = await provider.getById(widget.recipeId);
    if (mounted) {
      setState(() {
        _recipe = recipe;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_recipe == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Lỗi')),
        body: const Center(child: Text('Không tìm thấy công thức.')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết món ăn'),
        actions: [
          Consumer<FavoriteProvider>(
            builder: (context, favProvider, child) {
              final isFav = favProvider.isFavorite(widget.recipeId);
              return IconButton(
                icon: Icon(isFav ? Icons.favorite : Icons.favorite_border, color: isFav ? AppColors.primary : null),
                onPressed: () {
                  final auth = context.read<AuthProvider>();
                  if (auth.accountId != null && _recipe != null) {
                    favProvider.toggleFavorite(_recipe!, auth.accountId!);
                  }
                },
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeroImage(),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_recipe!.recipeName, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(_recipe!.description, style: const TextStyle(color: Colors.grey, fontSize: 14)),
                  const SizedBox(height: 16),
                  _buildMetaInfo(),
                  const SizedBox(height: 24),
                  SmartButton(
                    text: 'Thêm vào nhật ký',
                    icon: Icons.book,
                    onPressed: () {
                      // TODO: show Add to Diary bottom sheet
                    },
                  ),
                  const SizedBox(height: 24),
                  _buildTabs(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroImage() {
    return Container(
      height: 250,
      color: Colors.grey[200],
      child: _recipe!.imageUrl != null
          ? Image.network(_recipe!.imageUrl!, fit: BoxFit.cover, errorBuilder: (_, _, _) => const Icon(Icons.fastfood, size: 64, color: Colors.grey))
          : const Icon(Icons.fastfood, size: 64, color: Colors.grey),
    );
  }

  Widget _buildMetaInfo() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildMetaItem(Icons.timer, '${_recipe!.cookingTime} phút', 'Thời gian'),
        _buildMetaItem(Icons.local_fire_department, '${_recipe!.calories.round()} kcal', 'Năng lượng'),
        _buildMetaItem(Icons.group, '${_recipe!.servings} người', 'Khẩu phần'),
      ],
    );
  }

  Widget _buildMetaItem(IconData icon, String value, String label) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }

  Widget _buildTabs() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _activeTab = 0),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    border: Border(bottom: BorderSide(color: _activeTab == 0 ? AppColors.primary : Colors.grey[300]!, width: 2)),
                  ),
                  child: Text('Hướng dẫn', textAlign: TextAlign.center, style: TextStyle(color: _activeTab == 0 ? AppColors.primary : Colors.grey, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
            Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _activeTab = 1),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    border: Border(bottom: BorderSide(color: _activeTab == 1 ? AppColors.primary : Colors.grey[300]!, width: 2)),
                  ),
                  child: Text('Dinh dưỡng', textAlign: TextAlign.center, style: TextStyle(color: _activeTab == 1 ? AppColors.primary : Colors.grey, fontWeight: FontWeight.bold)),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _activeTab == 0 ? _buildInstructionsTab() : _buildNutritionTab(),
      ],
    );
  }

  Widget _buildInstructionsTab() {
    final instructions = _recipe!.instructions ?? '';
    final steps = instructions.isNotEmpty
        ? instructions.split('\n').where((s) => s.trim().isNotEmpty).toList()
        : [];
        
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Nguyên liệu', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        ...(_recipe!.recipeIngredients ?? []).map((ing) {
          final name = ing['name'] ?? ing['Name'] ?? 'Nguyên liệu';
          final qty = ing['quantity'] ?? ing['Quantity'] ?? '';
          final uom = ing['uom'] ?? ing['UOM'] ?? '';
          return Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                const Icon(Icons.check_circle, size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(child: Text(name)),
                Text('$qty $uom'.trim(), style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          );
        }),
        const SizedBox(height: 24),
        const Text('Cách làm', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (steps.isEmpty) const Text('Chưa có hướng dẫn cụ thể.'),
        ...steps.asMap().entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: AppColors.primaryLight,
                  child: Text('${entry.key + 1}', style: const TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 12),
                Expanded(child: Text(entry.value.replaceFirst(RegExp(r'^\d+\.\s*'), ''))),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildNutritionTab() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(16)),
      child: Column(
        children: [
          _buildNutriRow('Năng lượng', '${_recipe!.calories.round()} kcal', isTotal: true),
          const Divider(),
          _buildNutriRow('Đạm', '${_recipe!.protein.round()} g'),
          _buildNutriRow('Carbs', '${_recipe!.carbs.round()} g'),
          _buildNutriRow('Chất béo', '${_recipe!.fat.round()} g'),
        ],
      ),
    );
  }

  Widget _buildNutriRow(String label, String value, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: isTotal ? 16 : 14, fontWeight: isTotal ? FontWeight.bold : FontWeight.normal)),
          Text(value, style: TextStyle(fontSize: isTotal ? 16 : 14, fontWeight: isTotal ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }
}

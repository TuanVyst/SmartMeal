import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/ui/smart_loading.dart';
import 'package:smart_meal/core/utils/recipe_images.dart';
import '../../../data/ingredient_service.dart';
import '../../../domain/ingredient_model.dart';

class IngredientListScreen extends StatefulWidget {
  final IngredientService? ingredientService;
  const IngredientListScreen({super.key, this.ingredientService});

  @override
  State<IngredientListScreen> createState() => _IngredientListScreenState();
}

class _IngredientListScreenState extends State<IngredientListScreen> {
  late final IngredientService _ingredientService;
  final TextEditingController _searchController = TextEditingController();
  List<Ingredient> _ingredients = [];
  List<IngredientTag> _tags = [];
  bool _loading = true;
  String _selectedTag = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _ingredientService = widget.ingredientService ?? IngredientService();
    _loadData();
    _searchController.addListener(() {
      setState(() {
        _searchQuery = _searchController.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _ingredientService.getAll(),
        _ingredientService.getTags(),
      ]);
      if (mounted) {
        setState(() {
          _ingredients = results[0] as List<Ingredient>;
          _tags = (results[1] as List<IngredientTag>)
              .where((t) => t.tagName != null && t.tagName!.trim().isNotEmpty)
              .toList();
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  List<Ingredient> get _filteredIngredients {
    return _ingredients.where((item) {
      final name = item.name.toLowerCase();
      final matchesSearch = _searchQuery.isEmpty || name.contains(_searchQuery);

      if (!matchesSearch) return false;
      if (_selectedTag == 'all') return true;

      // Filter by tag
      final tagMatch = item.tags.any((t) => t.tagId == _selectedTag || t.tagName == _selectedTag);
      return tagMatch;
    }).toList();
  }

  IconData _getCategoryIcon(String name) {
    final lower = name.toLowerCase();
    if (lower.contains('thịt') || lower.contains('bò') || lower.contains('heo') || lower.contains('gà')) {
      return Icons.kebab_dining;
    }
    if (lower.contains('cá') || lower.contains('tôm') || lower.contains('mực') || lower.contains('cua')) {
      return Icons.set_meal;
    }
    if (lower.contains('rau') || lower.contains('cải') || lower.contains('cà chua') || lower.contains('nấm')) {
      return Icons.eco;
    }
    if (lower.contains('trứng') || lower.contains('sữa') || lower.contains('bơ') || lower.contains('phô mai')) {
      return Icons.egg;
    }
    if (lower.contains('gạo') || lower.contains('mì') || lower.contains('bún') || lower.contains('khoai')) {
      return Icons.grain;
    }
    if (lower.contains('táo') || lower.contains('chuối') || lower.contains('cam') || lower.contains('chanh')) {
      return Icons.apple;
    }
    return Icons.restaurant;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Tra cứu nguyên liệu & Thực phẩm', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Column(
              children: [
                // Search Input
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm nguyên liệu (thịt bò, cá hồi, rau cải...)',
                    hintStyle: const TextStyle(fontSize: 14, color: AppColors.textHint),
                    prefixIcon: const Icon(Icons.search, color: AppColors.primaryDark),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () => _searchController.clear(),
                          )
                        : null,
                    filled: true,
                    fillColor: AppColors.background,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                const SizedBox(height: 10),

                // Tags Horizontal Filter
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      ChoiceChip(
                        label: const Text('Tất cả'),
                        selected: _selectedTag == 'all',
                        selectedColor: AppColors.primary,
                        backgroundColor: AppColors.background,
                        labelStyle: TextStyle(
                          color: _selectedTag == 'all' ? Colors.white : AppColors.textPrimary,
                          fontWeight: _selectedTag == 'all' ? FontWeight.bold : FontWeight.normal,
                          fontSize: 12,
                        ),
                        onSelected: (selected) {
                          if (selected) setState(() => _selectedTag = 'all');
                        },
                      ),
                      const SizedBox(width: 8),
                      ..._tags.map((tag) {
                        final isSelected = _selectedTag == tag.tagId;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ChoiceChip(
                            label: Text(tag.tagName ?? ''),
                            selected: isSelected,
                            selectedColor: AppColors.primary,
                            backgroundColor: AppColors.background,
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.white : AppColors.textPrimary,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              fontSize: 12,
                            ),
                            onSelected: (selected) {
                              setState(() {
                                _selectedTag = selected ? (tag.tagId ?? 'all') : 'all';
                              });
                            },
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Content List
          Expanded(
            child: _loading
                ? const Center(child: SmartLoadingSpinner())
                : _filteredIngredients.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.search_off, size: 60, color: AppColors.textHint),
                            const SizedBox(height: 12),
                            Text(
                              _searchQuery.isNotEmpty
                                  ? 'Không tìm thấy nguyên liệu "$_searchQuery"'
                                  : 'Chưa có dữ liệu nguyên liệu',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 15),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _filteredIngredients.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final ingredient = _filteredIngredients[index];
                          final nv = ingredient.nutritionalValue;
                          final cals = nv?.calories ?? 0.0;
                          final protein = nv?.protein ?? 0.0;
                          final carbs = nv?.carbs ?? 0.0;
                          final fat = nv?.fat ?? 0.0;
                          final icon = _getCategoryIcon(ingredient.name);

                          return InkWell(
                            onTap: () {
                              context.push('/ingredient-detail/${ingredient.ingredientId}');
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppColors.border),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.03),
                                    blurRadius: 10,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  // Image or Icon Avatar
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: Container(
                                      width: 56,
                                      height: 56,
                                      color: AppColors.primaryLight.withValues(alpha: 0.2),
                                      child: Image.network(
                                        IngredientImages.resolve(ingredient.imageUrl, ingredient.name),
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, _, _) => Icon(icon, color: AppColors.primaryDark, size: 28),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 14),

                                  // Name & Macro pills
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          ingredient.name,
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.textPrimary,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Khẩu phần chuẩn: 100g',
                                          style: const TextStyle(fontSize: 12, color: AppColors.textHint),
                                        ),
                                        const SizedBox(height: 6),
                                        Wrap(
                                          spacing: 6,
                                          runSpacing: 4,
                                          children: [
                                            _buildMacroTag('P: ${protein.toStringAsFixed(1)}g', const Color(0xFF3B82F6)),
                                            _buildMacroTag('C: ${carbs.toStringAsFixed(1)}g', const Color(0xFF10B981)),
                                            _buildMacroTag('F: ${fat.toStringAsFixed(1)}g', const Color(0xFFF97316)),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),

                                  // Calories Badge
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        cals.toStringAsFixed(0),
                                        style: const TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w900,
                                          color: AppColors.primaryDark,
                                        ),
                                      ),
                                      const Text(
                                        'kcal / 100g',
                                        style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(width: 6),
                                  const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildMacroTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
      ),
    );
  }
}

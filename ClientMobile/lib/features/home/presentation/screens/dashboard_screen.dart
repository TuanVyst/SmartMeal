import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/recipes/presentation/providers/recipe_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/features/favorites/presentation/providers/favorite_provider.dart';
import 'package:smart_meal/features/recipes/presentation/widgets/ingredient_fridge_sheet.dart';
import 'package:smart_meal/features/recipes/presentation/widgets/recipe_filter_sheet.dart';

/// Màn hình chính Dashboard kết hợp Kế hoạch tuần, Gợi ý món ăn và Khám phá món ăn (Wireframe Page 3 & Page 7)
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _exploreSectionKey = GlobalKey();
  final TextEditingController _searchController = TextEditingController();

  bool _isWeeklyPlanVisible = true;
  int _selectedDayIndex = 0;
  final List<String> _days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      final accountId = auth.accountId;

      context.read<RecipeProvider>().fetchAll();
      if (accountId != null) {
        context.read<NutritionProvider>().fetchLogs(accountId);
        context.read<NutritionProvider>().fetchGoals(accountId);
        context.read<FavoriteProvider>().fetchFavorites(accountId);
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _scrollToExplore() {
    final context = _exploreSectionKey.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOut,
      );
    }
  }

  void _openIngredientsFridgeSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const IngredientFridgeSheet(),
    );
  }

  void _openFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const RecipeFilterSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final recipeProvider = context.watch<RecipeProvider>();
    final favoriteProvider = context.watch<FavoriteProvider>();

    return SingleChildScrollView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. KẾ HOẠCH TUẦN
          _buildWeeklyPlanSection(),
          const SizedBox(height: 20),

          // 2. GỢI Ý MÓN ĂN (Sáng, Trưa, Tối)
          _buildMealSuggestionsSection(recipeProvider),
          const SizedBox(height: 26),

          // 3. PHẦN TIẾP THEO (Chuyển tiếp xuống Khám phá món ăn)
          Center(
            child: InkWell(
              onTap: _scrollToExplore,
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.primaryBackground,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primaryLight),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.12),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Text(
                      'Phần tiếp theo',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    SizedBox(width: 6),
                    Icon(Icons.arrow_downward, size: 18, color: AppColors.primaryDark),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // 4. KHÁM PHÁ MÓN ĂN (Wireframe Page 7)
          Container(
            key: _exploreSectionKey,
            child: _buildExploreSection(recipeProvider, favoriteProvider),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  // WIDGET KẾ HOẠCH TUẦN
  Widget _buildWeeklyPlanSection() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
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
                  'Kế hoạch tuần',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
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
                      minimumSize: const Size(48, 30),
                      side: const BorderSide(color: AppColors.border),
                    ),
                    onPressed: () => setState(() => _isWeeklyPlanVisible = !_isWeeklyPlanVisible),
                    child: Text(
                      _isWeeklyPlanVisible ? 'Ẩn' : 'Hiện',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ),
                  const SizedBox(width: 6),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                      minimumSize: const Size(84, 30),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () => context.push('/meal-plan/preview', extra: 7),
                    child: const Text(
                      'Tạo thực đơn',
                      style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (_isWeeklyPlanVisible) ...[
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    minimumSize: const Size(54, 30),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  onPressed: () {},
                  icon: const Icon(Icons.chevron_left, size: 14, color: AppColors.textSecondary),
                  label: const Text('Trước', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ),
                const Flexible(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 4),
                    child: Text(
                      'Tuần này (12/10 - 18/10)',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppColors.textPrimary),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    minimumSize: const Size(54, 30),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  onPressed: () {},
                  icon: const Icon(Icons.chevron_right, size: 14, color: AppColors.textSecondary),
                  label: const Text('Sau', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: List.generate(_days.length, (index) {
                final isSelected = _selectedDayIndex == index;
                return Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: index == 0 || index == _days.length - 1 ? 1 : 2),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(10),
                      onTap: () => setState(() => _selectedDayIndex = index),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : AppColors.surfaceHover,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? AppColors.primary : Colors.transparent,
                          ),
                        ),
                        child: Column(
                          children: [
                            Text(
                              _days[index],
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                color: isSelected ? Colors.white : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${12 + index}',
                              style: TextStyle(
                                fontSize: 12,
                                color: isSelected ? Colors.white70 : AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ],
        ],
      ),
    );
  }

  // WIDGET GỢI Ý MÓN ĂN
  Widget _buildMealSuggestionsSection(RecipeProvider recipeProvider) {
    final recipes = recipeProvider.recipes;

    final defaultMeals = [
      {'title': 'Sáng', 'fallbackName': 'Phở bò tái nạm', 'fallbackCalo': '450 kcal'},
      {'title': 'Trưa', 'fallbackName': 'Cơm gạo lứt ức gà', 'fallbackCalo': '580 kcal'},
      {'title': 'Tối', 'fallbackName': 'Salad cá hồi quả bơ', 'fallbackCalo': '410 kcal'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Gợi ý món ăn',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: List.generate(3, (index) {
            final mealMeta = defaultMeals[index];
            final recipe = recipes.length > index ? recipes[index] : null;
            final dishName = recipe?.recipeName ?? mealMeta['fallbackName']!;
            final dishCalo = recipe != null ? '${recipe.displayCalories} kcal' : mealMeta['fallbackCalo']!;
            final imageUrl = recipe?.imageUrl;

            return Expanded(
              child: Container(
                margin: EdgeInsets.only(
                  left: index == 0 ? 0 : 4,
                  right: index == 2 ? 0 : 4,
                ),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Text(
                      mealMeta['title']!,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        height: 72,
                        width: double.infinity,
                        color: AppColors.surfaceHover,
                        child: imageUrl != null && imageUrl.isNotEmpty
                            ? Image.network(
                                imageUrl,
                                fit: BoxFit.cover,
                                errorBuilder: (_, __, ___) => const Icon(Icons.restaurant, color: Colors.grey, size: 28),
                              )
                            : const Icon(Icons.restaurant, color: Colors.grey, size: 28),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      dishName,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      dishCalo,
                      style: const TextStyle(fontSize: 11, color: AppColors.warning, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(double.infinity, 28),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                      ),
                      onPressed: () {
                        if (recipe != null) {
                          context.push('/recipe-detail/${recipe.recipeId}');
                        } else {
                          context.push('/meal-plan/preview', extra: 7);
                        }
                      },
                      child: const Text('Tạo thực đơn', style: TextStyle(fontSize: 11, color: Colors.white)),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  // WIDGET KHÁM PHÁ MÓN ĂN
  Widget _buildExploreSection(RecipeProvider recipeProvider, FavoriteProvider favoriteProvider) {
    final filtered = recipeProvider.filteredRecipes;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Khám phá món ăn',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
        ),
        const SizedBox(height: 12),

        // Thanh công cụ: Hiện bảng nguyên liệu | Tìm kiếm | Bộ lọc
        Row(
          children: [
            OutlinedButton(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: _openIngredientsFridgeSheet,
              child: const Text(
                'Hiện bảng\nnguyên liệu',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: SizedBox(
                height: 46,
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) => recipeProvider.setSearchQuery(val),
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm tên món ăn',
                    hintStyle: const TextStyle(fontSize: 13, color: AppColors.textHint),
                    prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.border),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: const BorderSide(color: AppColors.primary),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: _openFilterSheet,
              icon: const Icon(Icons.tune, size: 16, color: Colors.white),
              label: const Text('Bộ lọc', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Danh sách thẻ món ăn
        if (recipeProvider.loading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32),
              child: CircularProgressIndicator(),
            ),
          )
        else if (filtered.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  const Icon(Icons.search_off, size: 48, color: Colors.grey),
                  const SizedBox(height: 8),
                  Text(
                    'Không tìm thấy món ăn phù hợp',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 15),
                  ),
                ],
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: filtered.length,
            itemBuilder: (context, index) {
              final recipe = filtered[index];
              final isFav = favoriteProvider.isFavorite(recipe.recipeId);

              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
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
                child: Material(
                  color: Colors.transparent,
                  borderRadius: BorderRadius.circular(14),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: () => context.push('/recipe-detail/${recipe.recipeId}'),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Container(
                              width: 90,
                              height: 90,
                              color: AppColors.surfaceHover,
                              child: recipe.imageUrl != null && recipe.imageUrl!.isNotEmpty
                                  ? Image.network(
                                      recipe.imageUrl!,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) => const Icon(Icons.fastfood, size: 36, color: Colors.grey),
                                    )
                                  : const Icon(Icons.fastfood, size: 36, color: Colors.grey),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  recipe.recipeName,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${recipe.displayCalories} kcal • ${recipe.totalTime} phút',
                                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryBackground,
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: AppColors.primaryLight),
                                  ),
                                  child: const Text(
                                    'Độ phù hợp 98%',
                                    style: TextStyle(fontSize: 11, color: AppColors.primaryDark, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            children: [
                              IconButton(
                                icon: Icon(
                                  isFav ? Icons.favorite : Icons.favorite_border,
                                  color: isFav ? Colors.redAccent : AppColors.textSecondary,
                                ),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(isFav ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích')),
                                  );
                                },
                              ),
                              IconButton(
                                icon: const Icon(Icons.add_circle, color: AppColors.primary, size: 28),
                                onPressed: () {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('Đã thêm "${recipe.recipeName}" vào thực đơn')),
                                  );
                                },
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}

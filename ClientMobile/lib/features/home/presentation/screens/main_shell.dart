import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/features/recipes/presentation/providers/recipe_provider.dart';
import 'package:smart_meal/features/favorites/presentation/providers/favorite_provider.dart';
import 'dashboard_screen.dart';
import 'package:smart_meal/features/diary/presentation/screens/diary_screen.dart';
import 'package:smart_meal/features/favorites/presentation/screens/favorites_screen.dart';
import 'package:smart_meal/features/profile/presentation/screens/subscription/subscription_plans_screen.dart';
import 'package:smart_meal/features/profile/presentation/screens/profile_screen.dart';
import 'package:smart_meal/features/diary/presentation/widgets/add_log_sheet.dart';
import '../widgets/app_navigation_drawer.dart';
/// Main shell tích hợp Menu Drawer trái và Thanh Dinh Dưỡng phải (Theo Wireframe Draw.io)
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => MainShellState();
}

class MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  String? _initializedAccountId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = context.watch<AuthProvider>();
    final accountId = auth.accountId;

    if (accountId != null && accountId != _initializedAccountId) {
      _initializedAccountId = accountId;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        final recipeProvider = context.read<RecipeProvider>();
        final nutritionProvider = context.read<NutritionProvider>();
        final favoriteProvider = context.read<FavoriteProvider>();

        recipeProvider.fetchAll().then((_) {
          if (mounted) {
            nutritionProvider.setRecipes(recipeProvider.recipes);
          }
        });
        nutritionProvider.fetchLogs(accountId);
        nutritionProvider.fetchGoals(accountId);
        favoriteProvider.fetchFavorites(accountId);
      });
    }
  }

  final List<Widget> _screens = const [
    DashboardScreen(),
    DiaryScreen(showAppBar: false),
    FavoritesScreen(),
    SubscriptionPlansScreen(showAppBar: false),
    ProfileScreen(),
  ];

  void switchTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      drawer: AppNavigationDrawer(
        currentNavIndex: _currentIndex,
        onNavSelect: switchTab,
      ),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: AppColors.textPrimary, size: 26),
            tooltip: 'Mở menu',
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            Consumer<NutritionProvider>(
              builder: (context, nutrition, _) {
                final streak = nutrition.streakDays;
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.orange.shade200),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.local_fire_department, color: Colors.orange, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        '$streak ngày',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _titles[_currentIndex],
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 17,
                  color: AppColors.textPrimary,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          // Thêm nhanh bữa ăn nếu ở tab Nhật ký (index 1)
          if (_currentIndex == 1)
            IconButton(
              icon: const Icon(Icons.add_circle, color: AppColors.primary, size: 26),
              tooltip: 'Ghi nhận bữa ăn',
              onPressed: () {
                final date = context.read<NutritionProvider>().selectedDate;
                AddLogSheet.show(context, date);
              },
            ),
          // Avatar có vòng tròn tiến độ calo trong ngày (chuẩn format Header Web)
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: Consumer<NutritionProvider>(
              builder: (context, nutrition, _) {
                final totals = nutrition.todayTotals;
                final targets = nutrition.dailyTargets;
                final calories = totals.calories;
                final targetCalories = targets.calories > 0 ? targets.calories : 2000.0;
                final progress = (targetCalories > 0 ? (calories / targetCalories) : 0.0).clamp(0.0, 1.0);
                final user = context.watch<AuthProvider>().user;
                final isPremium = context.watch<AuthProvider>().isPremium;
                final initial = (user?.name?.isNotEmpty == true
                        ? user!.name![0]
                        : user?.username?.isNotEmpty == true
                            ? user!.username![0]
                            : 'U')
                    .toUpperCase();

                return InkWell(
                  onTap: () => switchTab(4), // Bấm avatar chuyển sang Cài đặt / Cá nhân
                  borderRadius: BorderRadius.circular(20),
                  child: SizedBox(
                    width: 38,
                    height: 38,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        CircularProgressIndicator(
                          value: progress,
                          strokeWidth: 2.5,
                          backgroundColor: Colors.grey.shade200,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            progress >= 1.0 ? Colors.green : AppColors.primary,
                          ),
                        ),
                        CircleAvatar(
                          radius: 15,
                          backgroundColor: isPremium
                              ? const Color(0xFFFFF7ED)
                              : AppColors.primaryLight.withValues(alpha: 0.4),
                          backgroundImage: user?.avatar != null ? NetworkImage(user!.avatar!) : null,
                          child: user?.avatar == null
                              ? Text(
                                  initial,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: isPremium ? Colors.orange.shade800 : AppColors.primaryDark,
                                  ),
                                )
                              : null,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
    );
  }

  static const _titles = [
    'Khám phá',
    'Nhật ký ăn uống',
    'Bộ sưu tập',
    'Gói SmartMeal Pro',
    'Cài đặt & Cá nhân',
  ];
}

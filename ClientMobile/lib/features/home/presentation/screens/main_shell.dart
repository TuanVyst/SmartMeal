import 'package:flutter/material.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'dashboard_screen.dart';
import 'package:smart_meal/features/recipes/presentation/screens/meal_suggestions_screen.dart';
import 'package:smart_meal/features/meal_plan/presentation/screens/meal_plan_screen.dart';
import 'package:smart_meal/features/favorites/presentation/screens/favorites_screen.dart';
import 'package:smart_meal/features/profile/presentation/screens/profile_screen.dart';
import '../widgets/app_navigation_drawer.dart';
import '../widgets/nutrition_sidebar_drawer.dart';

/// Main shell tích hợp Menu Drawer trái và Thanh Dinh Dưỡng phải (Theo Wireframe Draw.io)
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => MainShellState();
}

class MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    MealSuggestionsScreen(),
    MealPlanScreen(),
    FavoritesScreen(),
    ProfileScreen(),
  ];

  void switchTab(int index) {
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      // Drawer điều hướng bên trái (Page 2 wireframe)
      drawer: AppNavigationDrawer(
        currentNavIndex: _currentIndex,
        onNavSelect: switchTab,
      ),
      // Drawer thanh chỉ số dinh dưỡng bên phải (Page 4 wireframe)
      endDrawer: const NutritionSidebarDrawer(),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: AppColors.textPrimary, size: 26),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
        title: _currentIndex == 0
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.orange.shade200),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.local_fire_department, color: Colors.orange, size: 18),
                    SizedBox(width: 4),
                    Text(
                      '7 Ngày liên tiếp',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.orange,
                      ),
                    ),
                  ],
                ),
              )
            : Text(
                _titles[_currentIndex],
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
        actions: [
          // Nút mở nhanh thanh chỉ số dinh dưỡng bên phải
          Builder(
            builder: (context) => IconButton(
              tooltip: 'Chỉ số dinh dưỡng',
              icon: const Icon(Icons.pie_chart_outline, color: AppColors.primary, size: 24),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
          // Avatar tròn
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: CircleAvatar(
              radius: 17,
              backgroundColor: AppColors.primaryLight.withValues(alpha: 0.4),
              child: const Text(
                'AVT',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
              ),
            ),
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.home_outlined),
              activeIcon: Icon(Icons.home),
              label: 'Trang chủ',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.search),
              activeIcon: Icon(Icons.search),
              label: 'Khám phá',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today_outlined),
              activeIcon: Icon(Icons.calendar_today),
              label: 'Thực đơn',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.favorite_outline),
              activeIcon: Icon(Icons.favorite),
              label: 'Yêu thích',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Cá nhân',
            ),
          ],
        ),
      ),
    );
  }

  static const _titles = [
    'SmartMeal',
    'Khám phá món ăn',
    'Thực đơn',
    'Yêu thích',
    'Cá nhân',
  ];
}

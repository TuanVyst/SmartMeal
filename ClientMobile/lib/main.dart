import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'package:smart_meal/core/theme/app_theme.dart';
import 'core/router/app_router.dart';

import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/recipes/presentation/providers/recipe_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';
import 'package:smart_meal/features/favorites/presentation/providers/favorite_provider.dart';
import 'package:smart_meal/features/meal_plan/presentation/providers/meal_plan_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set status bar style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  runApp(const SmartMealApp());
}

class SmartMealApp extends StatelessWidget {
  const SmartMealApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => RecipeProvider()),
        ChangeNotifierProvider(create: (_) => NutritionProvider()),
        ChangeNotifierProvider(create: (_) => HealthProfileProvider()),
        ChangeNotifierProvider(create: (_) => FavoriteProvider()),
        ChangeNotifierProvider(create: (_) => MealPlanProvider()),
      ],
      child: Consumer2<AuthProvider, HealthProfileProvider>(
        builder: (context, auth, health, child) {
          // While loading stored user, show a splash screen
          if (auth.loading || health.loading) {
            return MaterialApp(
              debugShowCheckedModeBanner: false,
              home: const _SplashScreen(),
            );
          }

          // Once auth is loaded, we pass it to the GoRouter refreshListenable
          return MaterialApp.router(
            title: 'SmartMeal',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            routerConfig: createAppRouter(auth, health),
          );
        },
      ),
    );
  }
}

/// Splash screen shown while loading auth state
class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FBF7),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Logo
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF16A34A), Color(0xFF22C55E)],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFF22C55E),
                    blurRadius: 24,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: const Icon(Icons.eco, size: 40, color: Colors.white),
            ),
            const SizedBox(height: 20),
            const Text(
              'SmartMeal',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: Color(0xFF22C55E),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Ăn uống lành mạnh mỗi ngày',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 32),
            const CircularProgressIndicator(
              color: Color(0xFF22C55E),
              strokeWidth: 3,
            ),
          ],
        ),
      ),
    );
  }
}

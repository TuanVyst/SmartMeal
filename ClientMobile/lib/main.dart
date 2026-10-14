import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
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

class SmartMealApp extends StatefulWidget {
  const SmartMealApp({super.key});

  @override
  State<SmartMealApp> createState() => _SmartMealAppState();
}

class _SmartMealAppState extends State<SmartMealApp> {
  late final AuthProvider _authProvider;
  late final HealthProfileProvider _healthProfileProvider;
  late final RecipeProvider _recipeProvider;
  late final NutritionProvider _nutritionProvider;
  late final FavoriteProvider _favoriteProvider;
  late final MealPlanProvider _mealPlanProvider;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _authProvider = AuthProvider();
    _healthProfileProvider = HealthProfileProvider();
    _recipeProvider = RecipeProvider();
    _nutritionProvider = NutritionProvider();
    _favoriteProvider = FavoriteProvider();
    _mealPlanProvider = MealPlanProvider();

    _router = createAppRouter(_authProvider, _healthProfileProvider);
  }

  @override
  void dispose() {
    _authProvider.dispose();
    _healthProfileProvider.dispose();
    _recipeProvider.dispose();
    _nutritionProvider.dispose();
    _favoriteProvider.dispose();
    _mealPlanProvider.dispose();
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _authProvider),
        ChangeNotifierProvider.value(value: _recipeProvider),
        ChangeNotifierProvider.value(value: _nutritionProvider),
        ChangeNotifierProvider.value(value: _healthProfileProvider),
        ChangeNotifierProvider.value(value: _favoriteProvider),
        ChangeNotifierProvider.value(value: _mealPlanProvider),
      ],
      child: MaterialApp.router(
        title: 'SmartMeal',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        routerConfig: _router,
      ),
    );
  }
}

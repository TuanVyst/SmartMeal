import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/recipe_provider.dart';
import 'providers/nutrition_provider.dart';
import 'providers/health_profile_provider.dart';
import 'providers/favorite_provider.dart';

import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/main_shell.dart';
import 'screens/meal_detail/meal_detail_screen.dart';

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
      ],
      child: MaterialApp(
        title: 'SmartMeal',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,

        // Initial route based on auth state
        home: Consumer<AuthProvider>(
          builder: (context, auth, _) {
            if (auth.loading) {
              return const _SplashScreen();
            }
            if (auth.isLoggedIn) {
              return const MainShell();
            }
            return const LoginScreen();
          },
        ),

        // Named routes
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case '/login':
              return MaterialPageRoute(builder: (_) => const LoginScreen());
            case '/register':
              return MaterialPageRoute(builder: (_) => const RegisterScreen());
            case '/main':
              return MaterialPageRoute(builder: (_) => const MainShell());
            case '/recipe-detail':
              final recipeId = settings.arguments as String;
              return MaterialPageRoute(
                builder: (_) => MealDetailScreen(recipeId: recipeId),
              );
            default:
              return MaterialPageRoute(builder: (_) => const MainShell());
          }
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
                    color: const Color(0xFF22C55E).withOpacity(0.3),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
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

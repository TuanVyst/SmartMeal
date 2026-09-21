import 'package:go_router/go_router.dart';

import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';
import '../../features/auth/presentation/screens/splash_screen.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/onboarding/presentation/screens/survey_screen.dart';
import 'package:smart_meal/features/home/presentation/screens/main_shell.dart';
import '../../features/recipes/presentation/screens/meal_detail_screen.dart';
import '../../features/diary/presentation/screens/diary_screen.dart';
import '../../features/profile/presentation/screens/health_stats_screen.dart';
import '../../features/meal_plan/presentation/screens/meal_plan_preview_screen.dart';

GoRouter createAppRouter(AuthProvider authProvider, HealthProfileProvider healthProvider) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: authProvider,
    redirect: (context, state) {
      final isLoggedIn = authProvider.isLoggedIn;
      final isSurveyCompleted = healthProvider.surveyCompleted;
      
      final isGoingToSplash = state.matchedLocation == '/splash';
      final isGoingToAuth = state.matchedLocation == '/login' || state.matchedLocation == '/register';
      final isGoingToSurvey = state.matchedLocation == '/onboarding';

      if (isGoingToSplash) return null;

      if (!isLoggedIn && !isGoingToAuth) {
        return '/login';
      }

      if (isLoggedIn && !isSurveyCompleted && !isGoingToSurvey) {
        return '/onboarding';
      }

      if (isLoggedIn && isSurveyCompleted && (isGoingToAuth || isGoingToSurvey)) {
        return '/main';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const SurveyScreen(),
      ),
      GoRoute(
        path: '/main',
        builder: (context, state) => const MainShell(),
      ),
      GoRoute(
        path: '/recipe-detail/:id',
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          return MealDetailScreen(recipeId: id);
        },
      ),
      GoRoute(
        path: '/meal-plan/preview',
        builder: (context, state) {
          final days = state.extra as int? ?? 7;
          return MealPlanPreviewScreen(days: days);
        },
      ),
      GoRoute(
        path: '/diary',
        builder: (context, state) => const DiaryScreen(),
      ),
      GoRoute(
        path: '/health-stats',
        builder: (context, state) => const HealthStatsScreen(),
      ),
    ],
  );
}

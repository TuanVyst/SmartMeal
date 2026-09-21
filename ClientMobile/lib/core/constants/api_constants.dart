import 'package:flutter/foundation.dart';

/// API constants for SmartMeal backend
class ApiConstants {
  ApiConstants._();

  /// Web/Windows/iOS: host machine. Android emulator: 10.0.2.2 maps to host localhost.
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:5000/api';
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  }


  /// Request timeout in milliseconds (matching web's 15s)
  static const int connectTimeout = 15000;
  static const int receiveTimeout = 15000;

  // ── Auth endpoints ──
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String verifyOtp = '/auth/verify-otp';
  static const String verifyRegisterOtp = '/auth/verify-register-otp';
  static const String googleLogin = '/auth/google-login';
  static const String updateAvatar = '/auth/avatar';

  // ── Recipe endpoints ──
  static const String recipes = '/recipe';
  static const String recipesRecommended = '/recipe/recommended-for-me';
  static const String recipeTags = '/RecipeTag';
  static const String suggestByCalories = '/recipe/suggest-by-calories';
  static const String mealPlan = '/MealPlan';

  // ── Ingredient endpoints ──
  static const String ingredients = '/ingredient';
  static const String ingredientTags = '/ingredientTag';

  // ── Nutrition endpoints ──
  static const String nutritionLog = '/nutritionlog';
  static const String nutritionGoal = '/nutritiongoal';
  static const String nutritionDiary = '/nutrition-diary';

  // ── Health survey endpoints ──
  static const String healthSurvey = '/health-survey';
  static const String healthProfile = '/health-survey/profile';
  static const String bmiHistory = '/health-survey/bmi-history';

  // ── Subscription endpoints ──
  static const String plans = '/plan';
  static const String subscription = '/subscription';
  static const String paymentCreate = '/payment/create';
  static const String paymentCheckStatus = '/payment/check-status';

  // ── Saved recipe / favorites ──
  static const String savedRecipe = '/SavedRecipe';
  static const String savedRecipeToggle = '/SavedRecipe/toggle';
  static const String collection = '/collection';

  // ── Allergy ──
  static const String allergy = '/allergy';

  // ── Diet plan ──
  static const String dietPlan = '/dietplan';
  static const String userDietPlan = '/userdietplan';

  // ── Pantry ──
  static const String pantry = '/pantry';
}

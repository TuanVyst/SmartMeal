
/// API constants for SmartMeal backend
class ApiConstants {
  ApiConstants._();

  /// Web/Windows/iOS: host machine. Android real device / emulator: 5267
  static String get baseUrl {
    // Cho phép truyền URL qua lệnh build (ví dụ: flutter build apk --dart-define=API_URL=https://api.ocgi.space/api)
    const envUrl = String.fromEnvironment('API_URL');
    if (envUrl.isNotEmpty) return envUrl;

    // Mặc định kết nối Cloud API Production của SmartMeal (api.ocgi.space)
    // Đảm bảo dữ liệu ảnh Cloudinary, công thức, thanh toán PayOS và tài khoản chạy mượt mà cả trên máy ảo, máy thật và APK xuất ra
    return 'https://api.ocgi.space/api';
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
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String changePassword = '/auth/change-password';
  static const String feedback = '/Feedback';

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

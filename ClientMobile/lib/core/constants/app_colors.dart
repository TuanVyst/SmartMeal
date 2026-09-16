import 'package:flutter/material.dart';

/// SmartMeal color palette – mapped 1-1 from web CSS (App.css / Dashboard.css)
class AppColors {
  AppColors._();

  // ── Primary brand ──
  static const Color primary = Color(0xFF22C55E);
  static const Color primaryDark = Color(0xFF16A34A);
  static const Color primaryDeep = Color(0xFF15803D);

  // ── Backgrounds ──
  static const Color background = Color(0xFFF8FBF7);
  static const Color surface = Colors.white;
  static const Color cardBorder = Color(0x0A000000); // rgba(0,0,0,0.04)

  // ── Text ──
  static const Color textDark = Color(0xFF1A2E1A);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF9CA3AF);
  static const Color textHint = Color(0xFF94A3B8);

  // ── Hero gradient ──
  static const Color heroGradientStart = Color(0xFFEDFAE9);
  static const Color heroGradientMid = Color(0xFFD4F1D4);
  static const Color heroGradientEnd = Color(0xFFC5EEBD);
  static const Color heroTagBg = Color(0xA6FFFFFF); // rgba(255,255,255,0.65)
  static const Color heroTagBorder = Color(0x4D6CCB63); // rgba(108,203,99,0.3)
  static const Color heroText = Color(0xFF2D6A29);
  static const Color heroSubtitle = Color(0xFF4A6847);

  // ── CTA button gradient ──
  static const LinearGradient ctaGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryDark, primary],
  );

  // ── Nutrition card icon backgrounds ──
  static const List<Color> caloriesIconGradient = [Color(0xFFFFF3E0), Color(0xFFFFE0B2)];
  static const List<Color> proteinIconGradient = [Color(0xFFE3F2FD), Color(0xFFBBDEFB)];
  static const List<Color> carbsIconGradient = [Color(0xFFE8F5E9), Color(0xFFC8E6C9)];
  static const List<Color> fatIconGradient = [Color(0xFFF3E5F5), Color(0xFFE1BEE7)];
  static const List<Color> fiberIconGradient = [Color(0xFFF0FDF4), Color(0xFFBBF7D0)];
  static const List<Color> sugarIconGradient = [Color(0xFFFFFBEB), Color(0xFFFDE68A)];
  static const List<Color> sodiumIconGradient = [Color(0xFFECFEFF), Color(0xFFA5F3FC)];
  static const List<Color> cholesterolIconGradient = [Color(0xFFFCE7F3), Color(0xFFFBCFE8)];

  // ── Nutrition progress bar gradients ──
  static const List<Color> caloriesBarGradient = [Color(0xFFFF9800), Color(0xFFFFC107)];
  static const List<Color> proteinBarGradient = [Color(0xFF2196F3), Color(0xFF64B5F6)];
  static const List<Color> carbsBarGradient = [Color(0xFF4CAF50), Color(0xFF81C784)];
  static const List<Color> fatBarGradient = [Color(0xFF9C27B0), Color(0xFFCE93D8)];
  static const List<Color> fiberBarGradient = [Color(0xFF22C55E), Color(0xFF86EFAC)];
  static const List<Color> sugarBarGradient = [Color(0xFFEAB308), Color(0xFFFDE68A)];
  static const List<Color> sodiumBarGradient = [Color(0xFF06B6D4), Color(0xFF67E8F9)];
  static const List<Color> cholesterolBarGradient = [Color(0xFFEC4899), Color(0xFFFBCFE8)];

  // ── Calorie badge ──
  static const Color calorieBadgeBg = Color(0xFFFFF8E8);
  static const Color calorieBadgeBorder = Color(0xFFFFD97D);
  static const Color calorieBadgeText = Color(0xFFB45309);

  // ── Meal card tag ──
  static const Color tagBg = Color(0xFFF0FAF0);
  static const Color tagText = Color(0xFF2D6A29);

  // ── Favorite ──
  static const Color favActive = Color(0xFFEF4444);
  static const Color favInactive = Color(0xFF94A3B8);
  static const Color favActiveBg = Color(0xFFFEE2E2);

  // ── Meal type colors ──
  static const Color breakfastBg = Color(0xFFDCFCE7);
  static const Color breakfastText = Color(0xFF15803D);
  static const Color lunchBg = Color(0xFFFFEDD5);
  static const Color lunchText = Color(0xFFC2410C);
  static const Color dinnerBg = Color(0xFFF3E8FF);
  static const Color dinnerText = Color(0xFF7C3AED);
  static const Color snackBg = Color(0xFFFEF9C3);
  static const Color snackText = Color(0xFFA16207);

  // ── Auth ──
  static const Color inputBorder = Color(0xFFDDDDDD);
  static const Color inputFocusBorder = primary;
  static const Color errorText = Color(0xFFE74C3C);
  static const Color linkText = primary;

  // ── Sidebar/Nav ──
  static const Color navInactive = Color(0xFF475569);
  static const Color navHoverBg = Color(0xFFF1F5F9);
  static const Color divider = Color(0xFFE2E8F0);

  // ── Badges ──
  static const Color premiumBg = Color(0xFFDCFCE7);
  static const Color premiumText = Color(0xFF16A34A);

  // ── Shadows ──
  static const Color shadowLight = Color(0x0D000000); // 0.05 opacity
  static const Color shadowMedium = Color(0x1A000000); // 0.1 opacity
  static const Color heroShadow = Color(0x2E6CCB63); // rgba(108,203,99,0.18)

  // ── Bottom nav ──
  static const Color bottomNavBg = Colors.white;
  static const Color bottomNavActive = primary;
  static const Color bottomNavInactive = Color(0xFF9CA3AF);
}

import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary brand
  static const Color primary = Color(0xFF22C55E); // Fresh Green
  static const Color primaryDark = Color(0xFF16A34A);
  static const Color primaryLight = Color(0xFF86EFAC);
  static const Color primaryBackground = Color(0xFFF0FDF4); // Very light green

  // Neutrals / Backgrounds
  static const Color background = Color(0xFFF8FBF7);
  static const Color surface = Colors.white;
  static const Color surfaceHover = Color(0xFFF1F5F9);
  static const Color border = Color(0xFFE2E8F0);
  static const Color divider = Color(0xFFE2E8F0);
  
  // Typography
  static const Color textDark = Color(0xFF0F172A);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textHint = Color(0xFF94A3B8);

  // Semantics
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // UI Components
  static const Color shadowLight = Color(0x0C000000);
  static const Color cardBorder = Color(0xFFF1F5F9);
  
  static const Color favActiveBg = Color(0xFFFEE2E2);
  static const Color favActive = Color(0xFFEF4444);
  static const Color favInactive = Color(0xFF94A3B8);

  static const Color calorieBadgeBg = Color(0xFFFEF3C7);
  static const Color calorieBadgeBorder = Color(0xFFFDE68A);
  static const Color calorieBadgeText = Color(0xFFD97706);

  static const Color tagBg = Color(0xFFF1F5F9);

  static const Color heroGradientStart = Color(0xFFEDFAE9);
  static const Color heroGradientMid = Color(0xFFD4F1D4);
  static const Color heroGradientEnd = Color(0xFFC5EEBD);
  static const Color heroTagBg = Color(0xA6FFFFFF);
  static const Color heroTagBorder = Color(0x4D6CCB63);
  static const Color heroShadow = Color(0x2E6CCB63);

  static const LinearGradient ctaGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryDark, primary],
  );

  static const List<Color> caloriesIconGradient = [Color(0xFFFFF3E0), Color(0xFFFFE0B2)];
  static const List<Color> proteinIconGradient = [Color(0xFFE3F2FD), Color(0xFFBBDEFB)];
  static const List<Color> carbsIconGradient = [Color(0xFFE8F5E9), Color(0xFFC8E6C9)];
  static const List<Color> fatIconGradient = [Color(0xFFF3E5F5), Color(0xFFE1BEE7)];
  static const List<Color> fiberIconGradient = [Color(0xFFF0FDF4), Color(0xFFBBF7D0)];
  static const List<Color> sugarIconGradient = [Color(0xFFFFFBEB), Color(0xFFFDE68A)];
  static const List<Color> sodiumIconGradient = [Color(0xFFECFEFF), Color(0xFFA5F3FC)];
  static const List<Color> cholesterolIconGradient = [Color(0xFFFCE7F3), Color(0xFFFBCFE8)];

  static const List<Color> caloriesBarGradient = [Color(0xFFFF9800), Color(0xFFFFC107)];
  static const List<Color> proteinBarGradient = [Color(0xFF2196F3), Color(0xFF64B5F6)];
  static const List<Color> carbsBarGradient = [Color(0xFF4CAF50), Color(0xFF81C784)];
  static const List<Color> fatBarGradient = [Color(0xFF9C27B0), Color(0xFFCE93D8)];
  static const List<Color> fiberBarGradient = [Color(0xFF22C55E), Color(0xFF86EFAC)];
  static const List<Color> sugarBarGradient = [Color(0xFFEAB308), Color(0xFFFDE68A)];
  static const List<Color> sodiumBarGradient = [Color(0xFF06B6D4), Color(0xFF67E8F9)];
  static const List<Color> cholesterolBarGradient = [Color(0xFFEC4899), Color(0xFFFBCFE8)];

  static const Color breakfastBg = Color(0xFFDCFCE7);
  static const Color breakfastText = Color(0xFF15803D);
  static const Color lunchBg = Color(0xFFFFEDD5);
  static const Color lunchText = Color(0xFFC2410C);
  static const Color dinnerBg = Color(0xFFF3E8FF);
  static const Color dinnerText = Color(0xFF7C3AED);
  static const Color snackBg = Color(0xFFFEF9C3);
  static const Color snackText = Color(0xFFA16207);

  static const Color premiumBg = Color(0xFFDCFCE7);
  static const Color premiumText = Color(0xFF16A34A);
}

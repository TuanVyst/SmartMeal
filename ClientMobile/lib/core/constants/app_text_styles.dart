import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// SmartMeal typography – mapped from web CSS (Inter font family)
class AppTextStyles {
  AppTextStyles._();

  // ── Hero ──
  static TextStyle heroTitle = GoogleFonts.inter(
    fontSize: 28,
    fontWeight: FontWeight.w800,
    color: AppColors.textDark,
    height: 1.2,
    letterSpacing: -0.5,
  );

  static TextStyle heroSubtitle = GoogleFonts.inter(
    fontSize: 15,
    fontWeight: FontWeight.w400,
    color: AppColors.heroSubtitle,
    height: 1.6,
  );

  static TextStyle heroTag = GoogleFonts.inter(
    fontSize: 12.5,
    fontWeight: FontWeight.w600,
    color: AppColors.heroText,
  );

  // ── Section headers ──
  static TextStyle sectionTitle = GoogleFonts.inter(
    fontSize: 18,
    fontWeight: FontWeight.w800,
    color: AppColors.textDark,
    letterSpacing: -0.3,
  );

  static TextStyle sectionSeeAll = GoogleFonts.inter(
    fontSize: 13.5,
    fontWeight: FontWeight.w600,
    color: const Color(0xFF444444),
  );

  // ── Nutrition card ──
  static TextStyle nutritionLabel = GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.textMuted,
    letterSpacing: 0.06 * 12,
  );

  static TextStyle nutritionValue = GoogleFonts.inter(
    fontSize: 22,
    fontWeight: FontWeight.w800,
    color: AppColors.textDark,
    height: 1,
  );

  static TextStyle nutritionUnit = GoogleFonts.inter(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppColors.textMuted,
  );

  static TextStyle nutritionTarget = GoogleFonts.inter(
    fontSize: 11.5,
    fontWeight: FontWeight.w500,
    color: AppColors.textMuted,
  );

  // ── Meal card ──
  static TextStyle mealCardName = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: AppColors.textDark,
    height: 1.3,
  );

  static TextStyle mealCardCalories = GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w700,
    color: AppColors.calorieBadgeText,
  );

  static TextStyle mealCardTag = GoogleFonts.inter(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    color: AppColors.tagText,
  );

  // ── Auth ──
  static TextStyle authTitle = GoogleFonts.inter(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  static TextStyle authSubtitle = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
  );

  // ── General ──
  static TextStyle bodyMedium = GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  static TextStyle bodySmall = GoogleFonts.inter(
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: AppColors.textSecondary,
  );

  static TextStyle labelSmall = GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );

  static TextStyle buttonText = GoogleFonts.inter(
    fontSize: 15,
    fontWeight: FontWeight.w700,
    color: Colors.white,
  );

  // ── Page title ──
  static TextStyle pageTitle = GoogleFonts.inter(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    color: AppColors.textPrimary,
  );

  // ── Nav ──
  static TextStyle navItem = GoogleFonts.inter(
    fontSize: 11,
    fontWeight: FontWeight.w600,
    color: AppColors.bottomNavInactive,
  );

  static TextStyle navItemActive = GoogleFonts.inter(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    color: AppColors.primary,
  );
}

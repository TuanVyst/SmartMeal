import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTypography {
  AppTypography._();

  static TextStyle get h1 => GoogleFonts.inter(
        fontSize: 32,
        fontWeight: FontWeight.w800,
        color: AppColors.textDark,
        letterSpacing: -1.0,
      );

  static TextStyle get h2 => GoogleFonts.inter(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        color: AppColors.textDark,
        letterSpacing: -0.5,
      );

  static TextStyle get h3 => GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: AppColors.textPrimary,
        letterSpacing: -0.3,
      );

  static TextStyle get headline3 => h3;
  static TextStyle get pageTitle => h2;
  static TextStyle get sectionTitle => subtitle1;
  static TextStyle get heroTag => caption.copyWith(
        color: Colors.white70,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.6,
      );
  static TextStyle get heroSubtitle => bodyMedium.copyWith(color: Colors.white70);
  static TextStyle get sectionSeeAll => subtitle2.copyWith(color: AppColors.primary);

  static TextStyle get subtitle1 => GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      );

  static TextStyle get subtitle2 => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      );

  static TextStyle get bodyLarge => GoogleFonts.inter(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodyMedium => GoogleFonts.inter(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: AppColors.textPrimary,
      );

  static TextStyle get bodySmall => GoogleFonts.inter(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: AppColors.textSecondary,
      );

  static TextStyle get button => GoogleFonts.inter(
        fontSize: 15,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      );

  static TextStyle get caption => GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: AppColors.textHint,
      );

  // UI Specific Typography
  static TextStyle get nutritionLabel => bodySmall.copyWith(
        fontWeight: FontWeight.w700,
        color: AppColors.textSecondary,
      );

  static TextStyle get nutritionValue => h2.copyWith(
        color: AppColors.textPrimary,
      );

  static TextStyle get nutritionUnit => bodyMedium.copyWith(
        color: AppColors.textSecondary,
        fontWeight: FontWeight.w600,
      );

  static TextStyle get nutritionTarget => caption.copyWith(
        color: AppColors.textHint,
      );

  static TextStyle get mealCardName => subtitle1.copyWith(
        fontSize: 15,
        height: 1.2,
      );

  static TextStyle get mealCardCalories => caption.copyWith(
        color: AppColors.calorieBadgeText,
        fontWeight: FontWeight.w700,
      );

  static TextStyle get mealCardTag => caption.copyWith(
        color: AppColors.textSecondary,
        fontWeight: FontWeight.w600,
      );
}

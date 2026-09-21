import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';

enum SmartButtonVariant { primary, secondary, outline, text }

class SmartButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final SmartButtonVariant variant;
  final bool isLoading;
  final IconData? icon;
  final bool fullWidth;

  const SmartButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = SmartButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.fullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    Widget child = isLoading
        ? const SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 20),
                const SizedBox(width: AppSpacing.sm),
              ],
              Text(text),
            ],
          );

    Widget button;
    switch (variant) {
      case SmartButtonVariant.primary:
        button = ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          child: child,
        );
        break;
      case SmartButtonVariant.secondary:
        button = ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.secondary,
          ),
          onPressed: isLoading ? null : onPressed,
          child: child,
        );
        break;
      case SmartButtonVariant.outline:
        button = OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          child: child,
        );
        break;
      case SmartButtonVariant.text:
        button = TextButton(
          onPressed: isLoading ? null : onPressed,
          child: child,
        );
        break;
    }

    if (fullWidth) {
      return SizedBox(
        width: double.infinity,
        child: button,
      );
    }
    return button;
  }
}

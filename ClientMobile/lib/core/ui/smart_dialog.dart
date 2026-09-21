import 'package:flutter/material.dart';
import '../theme/app_spacing.dart';
import 'smart_button.dart';

class SmartDialog {
  SmartDialog._();

  static Future<void> showAlert({
    required BuildContext context,
    required String title,
    required String message,
    String buttonText = 'OK',
  }) {
    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppSpacing.borderRadiusLg),
        title: Text(title, style: Theme.of(context).textTheme.displaySmall),
        content: Text(message, style: Theme.of(context).textTheme.bodyMedium),
        actions: [
          SmartButton(
            text: buttonText,
            onPressed: () => Navigator.of(context).pop(),
            fullWidth: false,
          ),
        ],
      ),
    );
  }

  static Future<bool?> showConfirm({
    required BuildContext context,
    required String title,
    required String message,
    String confirmText = 'Xác nhận',
    String cancelText = 'Hủy',
    bool isDestructive = false,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppSpacing.borderRadiusLg),
        title: Text(title, style: Theme.of(context).textTheme.displaySmall),
        content: Text(message, style: Theme.of(context).textTheme.bodyMedium),
        actions: [
          SmartButton(
            text: cancelText,
            variant: SmartButtonVariant.text,
            onPressed: () => Navigator.of(context).pop(false),
            fullWidth: false,
          ),
          SmartButton(
            text: confirmText,
            variant: isDestructive ? SmartButtonVariant.outline : SmartButtonVariant.primary,
            onPressed: () => Navigator.of(context).pop(true),
            fullWidth: false,
          ),
        ],
      ),
    );
  }
}

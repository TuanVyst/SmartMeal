import 'package:flutter/material.dart';
import '../theme/app_shadows.dart';
import '../theme/app_spacing.dart';

class SmartCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final Color? backgroundColor;
  final Color? borderColor;
  final VoidCallback? onTap;

  const SmartCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0),
    this.margin,
    this.backgroundColor,
    this.borderColor,
    this.onTap,
  });

  BorderRadius _cardRadius(BuildContext context) {
    final shape = Theme.of(context).cardTheme.shape;
    if (shape is RoundedRectangleBorder && shape.borderRadius is BorderRadius) {
      return shape.borderRadius as BorderRadius;
    }
    return AppSpacing.borderRadiusLg;
  }

  @override
  Widget build(BuildContext context) {
    final borderRadius = _cardRadius(context);

    Widget cardContent = Padding(
      padding: padding ?? EdgeInsets.zero,
      child: child,
    );

    if (onTap != null) {
      cardContent = InkWell(
        onTap: onTap,
        borderRadius: borderRadius,
        child: cardContent,
      );
    }

    return Container(
      margin: margin,
      decoration: const BoxDecoration(
        boxShadow: AppShadows.light,
      ),
      child: Card(
        color: backgroundColor,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: borderRadius,
          side: BorderSide(
            color: borderColor ?? Theme.of(context).colorScheme.outline,
            width: 1,
          ),
        ),
        child: cardContent,
      ),
    );
  }
}

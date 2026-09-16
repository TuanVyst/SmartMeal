import 'package:flutter/material.dart';
import '../core/constants/app_colors.dart';

/// Animated progress bar matching web's Dashboard.css .nutrition-progress-bar
class AnimatedProgressBar extends StatefulWidget {
  final double percentage;
  final List<Color> gradientColors;
  final double height;

  const AnimatedProgressBar({
    super.key,
    required this.percentage,
    required this.gradientColors,
    this.height = 6,
  });

  @override
  State<AnimatedProgressBar> createState() => _AnimatedProgressBarState();
}

class _AnimatedProgressBarState extends State<AnimatedProgressBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0,
      end: widget.percentage.clamp(0, 100) / 100,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic, // matching web's cubic-bezier(0.4, 0, 0.2, 1)
    ));

    // Delay start to match web's setTimeout behavior
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void didUpdateWidget(AnimatedProgressBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.percentage != widget.percentage) {
      _animation = Tween<double>(
        begin: _animation.value,
        end: widget.percentage.clamp(0, 100) / 100,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
      ));
      _controller
        ..reset()
        ..forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          height: widget.height,
          decoration: BoxDecoration(
            color: const Color(0xFFF3F4F6),
            borderRadius: BorderRadius.circular(99),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: _animation.value,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: widget.gradientColors),
                borderRadius: BorderRadius.circular(99),
              ),
            ),
          ),
        );
      },
    );
  }
}

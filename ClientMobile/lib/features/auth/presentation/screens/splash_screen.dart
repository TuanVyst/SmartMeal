import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuthState();
  }

  Future<void> _checkAuthState() async {
    // Show splash branding for at least 800ms
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;

    final authProvider = context.read<AuthProvider>();
    final healthProvider = context.read<HealthProfileProvider>();

    while (authProvider.loading || healthProvider.loading) {
      await Future.delayed(const Duration(milliseconds: 100));
      if (!mounted) return;
    }

    if (!authProvider.isLoggedIn) {
      context.go('/login');
    } else if (healthProvider.surveyCompleted) {
      context.go('/main');
    } else {
      context.go('/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FBF7),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF16A34A), Color(0xFF22C55E)],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x3322C55E),
                    blurRadius: 24,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: const Icon(Icons.eco, size: 40, color: Colors.white),
            ),
            const SizedBox(height: 20),
            const Text(
              'SmartMeal',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: Color(0xFF22C55E),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Ăn uống lành mạnh mỗi ngày',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF64748B),
              ),
            ),
            const SizedBox(height: 32),
            const CircularProgressIndicator(
              color: Color(0xFF22C55E),
              strokeWidth: 3,
            ),
          ],
        ),
      ),
    );
  }
}

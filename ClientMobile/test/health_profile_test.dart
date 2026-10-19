import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/features/onboarding/domain/health_profile_model.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';
import 'package:smart_meal/features/profile/presentation/screens/health_profile_screen.dart';
import 'package:smart_meal/features/profile/presentation/screens/health_stats_screen.dart';
import 'package:smart_meal/features/onboarding/presentation/screens/survey/health_survey_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final mockProfile = HealthProfile(
    accountId: 'test-account',
    height: 175.0,
    weight: 70.0,
    targetWeight: 65.0,
    targetDays: 84,
    goal: 'lose',
    gender: 'Nam',
    activityLevel: 'moderate',
    dietType: 'normal',
    conditions: ['diabetes'],
    dailyTargets: DailyTargets(
      calories: 1850.0,
      protein: 115.0,
      carbs: 185.0,
      fat: 60.0,
      fiber: 26.0,
      sugarLimit: 25.0,
      saltLimit: 5.0,
    ),
  );

  Widget createWidgetUnderTest({Widget? child}) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => NutritionProvider()),
        ChangeNotifierProvider(
          create: (_) => HealthProfileProvider(initialProfile: mockProfile, loading: false),
        ),
      ],
      child: MaterialApp(
        home: child ?? const HealthProfileScreen(),
      ),
    );
  }

  testWidgets('HealthProfileScreen displays BMI hero and nutrition targets', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());
    await tester.pump();

    // Verify AppBar title
    expect(find.text('Hồ sơ sức khỏe'), findsOneWidget);

    // Verify BMI section title
    expect(find.text('Chỉ số thể hình (BMI)'), findsOneWidget);

    // Verify BMI classification badge: 70kg / (1.75m)^2 = 22.9 -> Normal ("Bình thường")
    expect(find.text('Bình thường'), findsWidgets);

    // Verify Daily Energy title
    expect(find.text('Mục tiêu năng lượng hàng ngày'), findsOneWidget);

    // Verify Goal text
    expect(find.textContaining('Giảm cân lành mạnh'), findsOneWidget);

    // Verify condition card displays diabetes
    expect(find.text('Tiểu đường'), findsWidgets);

    // Verify edit mode toggle button exists
    expect(find.byIcon(Icons.edit_note), findsOneWidget);
  });

  testWidgets('HealthProfileScreen toggles edit mode and shows form fields', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest());
    await tester.pump();

    // Tap edit button in AppBar
    await tester.tap(find.byIcon(Icons.edit_note));
    await tester.pump();

    // Form title should appear
    expect(find.text('Cập nhật thông tin'), findsOneWidget);
    expect(find.text('Chiều cao (cm)'), findsOneWidget);
    expect(find.text('Cân nặng (kg)'), findsOneWidget);
    expect(find.text('Lưu hồ sơ sức khỏe'), findsOneWidget);
  });

  testWidgets('HealthStatsScreen and HealthSurveyScreen mount HealthProfileScreen', (tester) async {
    await tester.pumpWidget(createWidgetUnderTest(child: const HealthStatsScreen()));
    await tester.pump();
    expect(find.byType(HealthProfileScreen), findsOneWidget);

    await tester.pumpWidget(createWidgetUnderTest(child: const HealthSurveyScreen()));
    await tester.pump();
    expect(find.byType(HealthProfileScreen), findsOneWidget);
  });
}

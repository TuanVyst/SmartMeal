import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';
import 'package:smart_meal/features/profile/data/subscription_service.dart';
import 'package:smart_meal/features/profile/domain/subscription_model.dart';
import 'package:smart_meal/features/profile/presentation/screens/subscription/subscription_plans_screen.dart';
import 'package:smart_meal/features/profile/presentation/widgets/change_password_dialog.dart';
import 'package:smart_meal/features/profile/presentation/widgets/feedback_dialog.dart';
import 'package:smart_meal/features/auth/presentation/widgets/forgot_password_dialog.dart';
import 'package:smart_meal/features/recipes/data/ingredient_service.dart';
import 'package:smart_meal/features/recipes/domain/ingredient_model.dart';
import 'package:smart_meal/features/recipes/presentation/screens/ingredients/ingredient_list_screen.dart';
import 'package:smart_meal/core/utils/ingredient_images.dart';
import 'package:smart_meal/features/diary/presentation/screens/diary_screen.dart';
import 'package:smart_meal/features/favorites/presentation/providers/favorite_provider.dart';
import 'package:smart_meal/features/favorites/presentation/screens/favorites_screen.dart';

class FakeIngredientService extends IngredientService {
  @override
  Future<List<Ingredient>> getAll() async {
    return [
      Ingredient(
        ingredientId: 'ing-1',
        ingredientName: 'Ức gà tươi',
        nutritionalValue: NutritionalValue(calories: 165, protein: 31, carbs: 0, fat: 3.6),
        tags: [IngredientTag(tagId: 'meat', tagName: 'Thịt tươi')],
      ),
    ];
  }

  @override
  Future<List<IngredientTag>> getTags() async {
    return [IngredientTag(tagId: 'meat', tagName: 'Thịt tươi')];
  }
}

class FakeSubscriptionService extends SubscriptionService {
  @override
  Future<List<SubscriptionPlan>> getAllPlans() async {
    return [
      SubscriptionPlan(
        planId: 'plan-1',
        name: 'SmartMeal Pro (1 Tháng)',
        price: 49000,
        durationDays: 30,
        features: ['Gợi ý thực đơn cá nhân hóa chuẩn BMI & bệnh lý'],
      ),
    ];
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  Widget wrapWithProviders(Widget child) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => NutritionProvider()),
        ChangeNotifierProvider(create: (_) => HealthProfileProvider(loading: false)),
      ],
      child: MaterialApp(home: Scaffold(body: child)),
    );
  }

  testWidgets('SubscriptionPlansScreen displays PayOS subscription plan', (tester) async {
    await tester.pumpWidget(wrapWithProviders(SubscriptionPlansScreen(
      showAppBar: false,
      subscriptionService: FakeSubscriptionService(),
    )));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.textContaining('SmartMeal Pro'), findsWidgets);
    expect(find.textContaining('Đặc quyền'), findsWidgets);
    expect(find.byType(ElevatedButton), findsWidgets);
  });

  testWidgets('IngredientListScreen mounts search and filter chips', (tester) async {
    await tester.pumpWidget(wrapWithProviders(IngredientListScreen(
      ingredientService: FakeIngredientService(),
    )));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 100));

    expect(find.text('Tra cứu nguyên liệu & Thực phẩm'), findsOneWidget);
    expect(find.text('Tất cả'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
    expect(find.text('Ức gà tươi'), findsOneWidget);
  });

  testWidgets('FeedbackDialog renders categories and inputs', (tester) async {
    await tester.pumpWidget(wrapWithProviders(const FeedbackDialog()));
    await tester.pump();

    expect(find.text('Gửi phản hồi & Báo lỗi'), findsOneWidget);
    expect(find.text('Báo lỗi'), findsOneWidget);
    expect(find.text('Góp ý chung'), findsOneWidget);
    expect(find.text('Gửi phản hồi'), findsOneWidget);
  });

  testWidgets('ChangePasswordDialog renders password fields', (tester) async {
    await tester.pumpWidget(wrapWithProviders(const ChangePasswordDialog()));
    await tester.pump();

    expect(find.text('Đổi mật khẩu'), findsOneWidget);
    expect(find.text('Mật khẩu hiện tại'), findsOneWidget);
    expect(find.text('Xác nhận đổi'), findsOneWidget);
  });

  testWidgets('ForgotPasswordDialog renders step 1 email input', (tester) async {
    await tester.pumpWidget(wrapWithProviders(const ForgotPasswordDialog(initialEmail: 'test@smartmeal.vn')));
    await tester.pump();

    expect(find.text('Quên mật khẩu'), findsOneWidget);
    expect(find.text('Gửi mã OTP'), findsOneWidget);
    expect(find.text('test@smartmeal.vn'), findsOneWidget);
  });

  test('Ingredient.fromJson correctly parses backend name, imageUrl, and tags', () {
    final json = {
      'ingredient_id': '11111111-1111-1111-1111-111111111111',
      'name': 'Cá hồi Na Uy',
      'imageUrl': 'https://res.cloudinary.com/smartmeal/image/upload/v12345/cahoi.jpg',
      'nutritional_value': {
        'calories': 208.0,
        'protein': 20.0,
        'carbs': 0.0,
        'fat': 13.0,
      },
      'ingredientLabels': [
        {'label_id': '2222', 'labelName': 'Thủy hải sản'}
      ]
    };

    final ingredient = Ingredient.fromJson(json);
    expect(ingredient.name, 'Cá hồi Na Uy');
    expect(ingredient.imageUrl, 'https://res.cloudinary.com/smartmeal/image/upload/v12345/cahoi.jpg');
    expect(ingredient.nutritionalValue?.calories, 208.0);
    expect(ingredient.tags.first.tagName, 'Thủy hải sản');
  });

  test('IngredientImages.resolve handles Cloudinary URLs and name matching', () {
    // Cloudinary URL returns directly
    const cloudUrl = 'https://res.cloudinary.com/smartmeal/image/upload/v123/tomato.jpg';
    expect(IngredientImages.resolve(cloudUrl, 'Cà chua'), cloudUrl);
    // Relative or empty URL resolves via name
    final nameUrl = IngredientImages.resolve('/images/ca-chua.jpg', 'Cà chua');
    expect(nameUrl.startsWith('https://images.unsplash.com'), isTrue);

    // Test substring matching precedence: Bắp cải vs Bắp (must NOT return corn for cabbage!)
    final bapUrl = IngredientImages.resolve('', 'Bắp');
    final bapCaiUrl = IngredientImages.resolve('', 'Bắp cải');
    final bapCaiTimUrl = IngredientImages.resolve('', 'Bắp cải tím');
    expect(bapUrl != bapCaiUrl, isTrue);
    expect(bapCaiUrl != bapCaiTimUrl, isTrue);

    // Test Bánh mì and Bánh mì sandwich
    final banhMiUrl = IngredientImages.resolve('', 'Bánh mì');
    final sandwichUrl = IngredientImages.resolve('', 'Bánh mì sandwich');
    expect(banhMiUrl.startsWith('https://images.unsplash.com'), isTrue);
    expect(sandwichUrl.startsWith('https://images.unsplash.com'), isTrue);

    // Fallback for unknown
    final fallbackUrl = IngredientImages.resolve('', 'Nguyên liệu lạ');
    expect(fallbackUrl, IngredientImages.fallback);
  });

  testWidgets('DiaryScreen renders meals of day and switches to stats tab', (tester) async {
    await tester.pumpWidget(wrapWithProviders(const DiaryScreen(showAppBar: false)));
    await tester.pump();

    // Check day meals card header
    expect(find.textContaining('Bữa ăn ngày'), findsOneWidget);
    // Check tabs
    expect(find.text('Nhật ký và mục tiêu'), findsOneWidget);
    expect(find.text('Thống kê và phân tích'), findsOneWidget);

    // Tap Thống kê và phân tích tab
    await tester.tap(find.text('Thống kê và phân tích'));
    await tester.pump();

    expect(find.textContaining('Xu hướng năng lượng tuần'), findsOneWidget);
    expect(find.text('Trung bình nạp / ngày'), findsOneWidget);
    expect(find.text('Chuỗi ghi nhật ký'), findsOneWidget);
  });

  testWidgets('FavoritesScreen displays favorite recipes without Navigator error', (tester) async {
    final favoriteProvider = FavoriteProvider();
    final testWidget = MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => NutritionProvider()),
        ChangeNotifierProvider(create: (_) => HealthProfileProvider(loading: false)),
        ChangeNotifierProvider.value(value: favoriteProvider),
      ],
      child: const MaterialApp(home: Scaffold(body: FavoritesScreen())),
    );

    await tester.pumpWidget(testWidget);
    await tester.pump();

    // Empty state when none
    expect(find.text('Bạn chưa lưu món ăn nào'), findsOneWidget);
  });
}

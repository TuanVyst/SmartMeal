import 'dart:math';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import 'package:smart_meal/core/ui/smart_card.dart';
import 'package:smart_meal/core/ui/smart_loading.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/features/onboarding/domain/health_profile_model.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';

/// Health Profile Screen – Complete health metrics, BMI classification,
/// daily nutrition targets, health condition rules, and profile editing.
class HealthProfileScreen extends StatefulWidget {
  const HealthProfileScreen({super.key});

  @override
  State<HealthProfileScreen> createState() => _HealthProfileScreenState();
}

class _HealthProfileScreenState extends State<HealthProfileScreen> {
  bool _isEditing = false;
  bool _saving = false;
  bool _loadingHistory = false;
  List<dynamic> _bmiHistory = [];

  // Controllers for edit mode
  final _heightCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _targetWeightCtrl = TextEditingController();
  final _targetDaysCtrl = TextEditingController();
  final _ageCtrl = TextEditingController();

  String _gender = 'Nam';
  String _goal = 'maintain';
  String _activityLevel = 'sedentary';
  String _dietType = 'normal';
  List<String> _conditions = [];

  static const Map<String, _BmiConfig> _bmiConfigs = {
    'underweight': _BmiConfig(
      label: 'Thiếu cân',
      color: Color(0xFF2563EB),
      bgColor: Color(0xFFDBEAFE),
      advice: 'Cần bổ sung thêm năng lượng và dinh dưỡng lành mạnh để đạt cân nặng chuẩn.',
    ),
    'normal': _BmiConfig(
      label: 'Bình thường',
      color: Color(0xFF16A34A),
      bgColor: Color(0xFFDCFCE7),
      advice: 'Chỉ số tuyệt vời! Hãy duy trì chế độ dinh dưỡng và vận động cân bằng này.',
    ),
    'overweight': _BmiConfig(
      label: 'Thừa cân',
      color: Color(0xFFEA580C),
      bgColor: Color(0xFFFFEDD5),
      advice: 'Nên kiểm soát lượng calo và tăng cường vận động để đưa BMI về ngưỡng an toàn.',
    ),
    'obese': _BmiConfig(
      label: 'Béo phì',
      color: Color(0xFFDC2626),
      bgColor: Color(0xFFFEF2F2),
      advice: 'Nguy cơ ảnh hưởng tim mạch và huyết áp. Khuyến nghị giảm cân an toàn theo lộ trình.',
    ),
  };

  static const List<_ActivityConfig> _activityLevels = [
    _ActivityConfig(
      key: 'sedentary',
      label: 'Ít vận động',
      icon: Icons.chair_outlined,
      factor: 1.2,
      desc: 'Công việc văn phòng, ngồi nhiều, hầu như không tập thể dục',
    ),
    _ActivityConfig(
      key: 'light',
      label: 'Vận động nhẹ',
      icon: Icons.directions_walk,
      factor: 1.375,
      desc: 'Đi bộ nhẹ nhàng, tập thể dục 1–3 buổi / tuần',
    ),
    _ActivityConfig(
      key: 'moderate',
      label: 'Vận động vừa',
      icon: Icons.directions_run,
      factor: 1.55,
      desc: 'Tập gym, chạy bộ hoặc chơi thể thao 3–5 buổi / tuần',
    ),
    _ActivityConfig(
      key: 'active',
      label: 'Vận động nhiều',
      icon: Icons.fitness_center,
      factor: 1.725,
      desc: 'Lao động nặng, tập luyện cường độ cao 6–7 buổi / tuần',
    ),
    _ActivityConfig(
      key: 'very_active',
      label: 'Rất năng động',
      icon: Icons.local_fire_department,
      factor: 1.9,
      desc: 'Vận động viên chuyên nghiệp, tập 2 buổi / ngày',
    ),
  ];

  static const Map<String, _ConditionConfig> _conditionConfigs = {
    'diabetes': _ConditionConfig(
      key: 'diabetes',
      label: 'Tiểu đường',
      icon: Icons.water_drop_outlined,
      color: Color(0xFF0284C7),
      desc: 'Hạn chế đường tự do < 25g/ngày, ưu tiên carbohydrate phức hợp có chỉ số GI thấp.',
      restrictedFoods: ['Đường trắng', 'Mật ong', 'Cơm trắng nhiều', 'Bánh kẹo ngọt', 'Nước ngọt'],
    ),
    'hypertension': _ConditionConfig(
      key: 'hypertension',
      label: 'Huyết áp cao',
      icon: Icons.favorite_border,
      color: Color(0xFFDC2626),
      desc: 'Hạn chế natri/muối < 1.5g/ngày, tránh đồ hộp mặn, thức ăn chế biến sẵn.',
      restrictedFoods: ['Muối tinh nhiều', 'Nước mắm đặc', 'Đồ hộp mặn', 'Xúc xích', 'Dưa cà muối'],
    ),
    'cholesterol': _ConditionConfig(
      key: 'cholesterol',
      label: 'Mỡ máu cao',
      icon: Icons.bloodtype_outlined,
      color: Color(0xFFEA580C),
      desc: 'Giảm chất béo bão hòa và cholesterol xấu, hạn chế mỡ động vật và nội tạng.',
      restrictedFoods: ['Mỡ heo', 'Lòng đỏ trứng', 'Nội tạng động vật', 'Da gia cầm', 'Bơ động vật'],
    ),
    'heartDisease': _ConditionConfig(
      key: 'heartDisease',
      label: 'Tim mạch',
      icon: Icons.monitor_heart_outlined,
      color: Color(0xFF7C3AED),
      desc: 'Ưu tiên chất béo không bão hòa (Omega-3), giảm tối đa chất béo chuyển hóa và muối.',
      restrictedFoods: ['Đồ chiên rán', 'Mỡ động vật', 'Thực phẩm chế biến sẵn', 'Muối tinh'],
    ),
    'gerd': _ConditionConfig(
      key: 'gerd',
      label: 'Dạ dày / Trào ngược',
      icon: Icons.medical_services_outlined,
      color: Color(0xFFD97706),
      desc: 'Tránh thức ăn cay nóng, nhiều axit chua, nước có gas và caffeine đậm đặc.',
      restrictedFoods: ['Ớt cay', 'Chanh/giấm nhiều', 'Cà phê đặc', 'Nước có gas', 'Đồ chua'],
    ),
    'gout': _ConditionConfig(
      key: 'gout',
      label: 'Bệnh Gout',
      icon: Icons.healing_outlined,
      color: Color(0xFF0D9488),
      desc: 'Kiểm soát axit uric, tránh thực phẩm giàu purine như thịt đỏ, hải sản và bia rượu.',
      restrictedFoods: ['Nội tạng động vật', 'Thịt bò/dê', 'Hải sản giàu purine', 'Bia rượu', 'Nước hầm xương'],
    ),
  };

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadProfileData();
    });
  }

  @override
  void dispose() {
    _heightCtrl.dispose();
    _weightCtrl.dispose();
    _targetWeightCtrl.dispose();
    _targetDaysCtrl.dispose();
    _ageCtrl.dispose();
    super.dispose();
  }

  void _loadProfileData() {
    final healthProvider = context.read<HealthProfileProvider>();
    final profile = healthProvider.profile;
    if (profile != null) {
      _initFormFromProfile(profile);
    }
  }

  void _initFormFromProfile(HealthProfile profile) {
    _heightCtrl.text = profile.height != null ? profile.height!.toStringAsFixed(1) : '';
    _weightCtrl.text = profile.weight != null ? profile.weight!.toStringAsFixed(1) : '';
    _targetWeightCtrl.text = profile.targetWeight != null ? profile.targetWeight!.toStringAsFixed(1) : '';
    _targetDaysCtrl.text = profile.targetDays != null ? profile.targetDays.toString() : '84';

    if (profile.dateOfBirth != null) {
      final years = DateTime.now().year - profile.dateOfBirth!.year;
      _ageCtrl.text = years > 0 ? years.toString() : '25';
    } else {
      _ageCtrl.text = '25';
    }

    setState(() {
      _gender = profile.gender ?? 'Nam';
      _goal = profile.goal ?? 'maintain';
      _activityLevel = profile.activityLevel ?? 'sedentary';
      _dietType = profile.dietType ?? 'normal';
      _conditions = List<String>.from(profile.conditions ?? []);
    });
  }

  double? _calcBmi(double? h, double? w) {
    if (h == null || w == null || h <= 0 || w <= 0) return null;
    final hm = h / 100.0;
    return w / (hm * hm);
  }

  String _classifyBmi(double? bmi) {
    if (bmi == null) return 'normal';
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25.0) return 'normal';
    if (bmi < 30.0) return 'overweight';
    return 'obese';
  }

  double _calcBmr(double h, double w, int age, String gender) {
    if (h <= 0 || w <= 0 || age <= 0) return 1500;
    if (gender == 'Nam') {
      return (10 * w) + (6.25 * h) - (5 * age) + 5;
    } else if (gender == 'Nữ') {
      return (10 * w) + (6.25 * h) - (5 * age) - 161;
    }
    return (10 * w) + (6.25 * h) - (5 * age) - 78;
  }

  double _getActivityFactor(String level) {
    for (final a in _activityLevels) {
      if (a.key == level) return a.factor;
    }
    return 1.2;
  }

  Map<String, double> _calculateLiveTargets({
    required double h,
    required double w,
    required double? tw,
    required int days,
    required String goal,
    required String activityLevel,
    required String gender,
    required int age,
    required List<String> conditions,
  }) {
    final bmr = _calcBmr(h, w, age, gender);
    final factor = _getActivityFactor(activityLevel);
    final tdee = bmr * factor;

    double delta = 0;
    if (goal == 'lose' && tw != null && tw > 0 && w > tw && days > 0) {
      final totalKcal = (tw - w) * 7700.0;
      delta = (totalKcal / days).clamp(-1000.0, 0.0);
    } else if (goal == 'gain' && tw != null && tw > 0 && tw > w && days > 0) {
      final totalKcal = (tw - w) * 7700.0;
      delta = (totalKcal / days).clamp(0.0, 1000.0);
    }

    double calories = tdee + delta;
    final minCal = gender == 'Nam' ? 1500.0 : 1200.0;
    if (calories < minCal) calories = minCal;
    if (calories < bmr * 0.9) calories = bmr * 0.9;

    double proteinPct = 0.20;
    double carbsPct = 0.50;
    double fatPct = 0.30;

    if (conditions.contains('diabetes')) {
      proteinPct = 0.25;
      carbsPct = 0.40;
      fatPct = 0.35;
    } else if (conditions.contains('gout')) {
      proteinPct = 0.15;
      carbsPct = 0.55;
      fatPct = 0.30;
    }

    final proteinGrams = (calories * proteinPct) / 4.0;
    final carbsGrams = (calories * carbsPct) / 4.0;
    final fatGrams = (calories * fatPct) / 9.0;
    final fiberGrams = (calories / 1000.0) * 14.0;
    final sugarLimit = conditions.contains('diabetes') ? 25.0 : 50.0;
    final saltLimit = (conditions.contains('hypertension') || conditions.contains('heartDisease')) ? 1.5 : 5.0;

    return {
      'bmr': bmr,
      'tdee': tdee,
      'calories': calories,
      'protein': proteinGrams,
      'carbs': carbsGrams,
      'fat': fatGrams,
      'fiber': fiberGrams,
      'sugarLimit': sugarLimit,
      'saltLimit': saltLimit,
      'delta': delta,
    };
  }

  Future<void> _saveProfile() async {
    final h = double.tryParse(_heightCtrl.text);
    final w = double.tryParse(_weightCtrl.text);
    final tw = double.tryParse(_targetWeightCtrl.text);
    final days = int.tryParse(_targetDaysCtrl.text) ?? 84;
    final age = int.tryParse(_ageCtrl.text) ?? 25;

    if (h == null || h <= 0 || w == null || w <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập chiều cao và cân nặng hợp lệ'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    if ((_goal == 'lose' || _goal == 'gain') && (tw == null || tw <= 0)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập cân nặng mục tiêu hợp lệ'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _saving = true);
    try {
      final payload = {
        'height': h,
        'weight': w,
        'targetWeight': (_goal == 'lose' || _goal == 'gain') ? tw : null,
        'targetDays': (_goal == 'lose' || _goal == 'gain') ? days : null,
        'goal': _goal,
        'gender': _gender,
        'age': age,
        'activityLevel': _activityLevel,
        'dietType': _dietType,
        'conditions': _conditions,
        'cookingTimeMinutes': 30,
        'mealsPerDay': 3,
      };

      final provider = context.read<HealthProfileProvider>();
      final success = await provider.updateProfile(payload);

      if (!mounted) return;
      if (success) {
        final auth = context.read<AuthProvider>();
        if (auth.accountId != null) {
          context.read<NutritionProvider>().fetchGoals(auth.accountId!);
        }

        setState(() => _isEditing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cập nhật hồ sơ sức khỏe thành công!'),
            backgroundColor: AppColors.success,
          ),
        );
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Không thể cập nhật hồ sơ. Vui lòng thử lại.'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _openBmiHistorySheet() async {
    setState(() => _loadingHistory = true);
    try {
      final history = await context.read<HealthProfileProvider>().getBmiHistory();
      if (mounted) {
        setState(() {
          _bmiHistory = history;
          _loadingHistory = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loadingHistory = false);
    }

    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.7,
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 48,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.history, color: AppColors.primaryDark),
                        SizedBox(width: 8),
                        Text(
                          'Lịch sử đo BMI & Cân nặng',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: AppColors.divider),
              Expanded(
                child: _loadingHistory
                    ? const SmartLoadingSpinner()
                    : _bmiHistory.isEmpty
                        ? const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.monitor_weight_outlined, size: 56, color: Colors.grey),
                                SizedBox(height: 12),
                                Text(
                                  'Chưa có lịch sử đo lường',
                                  style: TextStyle(color: AppColors.textSecondary, fontSize: 16),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: _bmiHistory.length,
                            separatorBuilder: (_, _) => const SizedBox(height: 10),
                            itemBuilder: (context, index) {
                              final item = _bmiHistory[index];
                              final dateStr = item['recordedAt']?.toString() ?? '';
                              DateTime? dt;
                              if (dateStr.isNotEmpty) {
                                dt = DateTime.tryParse(dateStr);
                              }
                              final formattedDate = dt != null
                                  ? DateFormat('dd/MM/yyyy HH:mm').format(dt.toLocal())
                                  : 'Không xác định';

                              final double bmiVal = (item['bmi'] as num?)?.toDouble() ?? 0.0;
                              final level = _classifyBmi(bmiVal);
                              final cfg = _bmiConfigs[level] ?? _bmiConfigs['normal']!;

                              return Container(
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: AppColors.background,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 22,
                                      backgroundColor: cfg.bgColor,
                                      child: Text(
                                        bmiVal.toStringAsFixed(1),
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13,
                                          color: cfg.color,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Text(
                                                '${item['weight'] ?? 0} kg',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 16,
                                                  color: AppColors.textPrimary,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Text(
                                                '• ${item['height'] ?? 0} cm',
                                                style: const TextStyle(
                                                  color: AppColors.textSecondary,
                                                  fontSize: 14,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            formattedDate,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textHint,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: cfg.bgColor,
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        cfg.label,
                                        style: TextStyle(
                                          color: cfg.color,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final healthProvider = context.watch<HealthProfileProvider>();
    final profile = healthProvider.profile;

    if (healthProvider.loading && profile == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Hồ sơ sức khỏe'),
          backgroundColor: Colors.white,
          elevation: 0.5,
        ),
        body: const SmartLoadingSpinner(),
      );
    }
    final double curH = double.tryParse(_heightCtrl.text) ?? profile?.height ?? 170.0;
    final double curW = double.tryParse(_weightCtrl.text) ?? profile?.weight ?? 65.0;
    final double? curTw = double.tryParse(_targetWeightCtrl.text) ?? profile?.targetWeight;
    final int curDays = int.tryParse(_targetDaysCtrl.text) ?? profile?.targetDays ?? 84;
    final int curAge = int.tryParse(_ageCtrl.text) ?? 25;

    final double? bmi = _calcBmi(curH, curW);
    final String bmiLevel = _classifyBmi(bmi);
    final _BmiConfig bmiConfig = _bmiConfigs[bmiLevel] ?? _bmiConfigs['normal']!;

    final double minHealthyWeight = (curH > 0) ? 18.5 * pow(curH / 100.0, 2) : 50.0;
    final double maxHealthyWeight = (curH > 0) ? 24.9 * pow(curH / 100.0, 2) : 70.0;

    final liveTargets = _calculateLiveTargets(
      h: curH,
      w: curW,
      tw: curTw,
      days: curDays,
      goal: _goal,
      activityLevel: _activityLevel,
      gender: _gender,
      age: curAge,
      conditions: _conditions,
    );

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          _isEditing ? 'Chỉnh sửa hồ sơ' : 'Hồ sơ sức khỏe',
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: AppColors.primaryDark),
            tooltip: 'Lịch sử BMI',
            onPressed: _openBmiHistorySheet,
          ),
          IconButton(
            icon: Icon(
              _isEditing ? Icons.close : Icons.edit_note,
              color: _isEditing ? Colors.red : AppColors.primaryDark,
              size: 26,
            ),
            tooltip: _isEditing ? 'Hủy bỏ' : 'Chỉnh sửa',
            onPressed: () {
              setState(() {
                if (_isEditing) {
                  if (profile != null) _initFormFromProfile(profile);
                  _isEditing = false;
                } else {
                  if (profile != null) _initFormFromProfile(profile);
                  _isEditing = true;
                }
              });
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // ── 1. BMI Hero Card ──
            _buildBmiHeroCard(
              bmi: bmi,
              bmiConfig: bmiConfig,
              curH: curH,
              curW: curW,
              minHealthyWeight: minHealthyWeight,
              maxHealthyWeight: maxHealthyWeight,
            ),
            const SizedBox(height: 16),

            // ── 2. Chế độ Chỉnh sửa hoặc Hiển thị ──
            if (_isEditing) ...[
              _buildEditFormCard(liveTargets: liveTargets),
              const SizedBox(height: 16),
            ] else ...[
              // ── 3. Chỉ số Dinh dưỡng Mục tiêu (Daily Nutrition Targets) ──
              _buildDailyTargetsCard(liveTargets: liveTargets, profileTargets: profile?.dailyTargets),
              const SizedBox(height: 16),

              // ── 4. Mục tiêu & Lộ trình cân nặng ──
              _buildGoalCard(curW: curW, curTw: curTw, curDays: curDays, liveTargets: liveTargets),
              const SizedBox(height: 16),

              // ── 5. Mức độ Vận động & Chế độ ăn ──
              _buildLifestyleCard(),
              const SizedBox(height: 16),

              // ── 6. Bệnh lý nền & Cảnh báo Y khoa ──
              _buildConditionsCard(),
              const SizedBox(height: 16),

              // ── 7. Thực phẩm hạn chế theo bệnh lý ──
              _buildRestrictedFoodsCard(),
              const SizedBox(height: 16),
            ],

            // ── Bottom Action Button in View Mode ──
            if (!_isEditing)
              SmartButton(
                text: 'Chỉnh sửa chỉ số & mục tiêu',
                icon: Icons.edit,
                onPressed: () {
                  if (profile != null) _initFormFromProfile(profile);
                  setState(() => _isEditing = true);
                },
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // WIDGET BUILDERS
  // ─────────────────────────────────────────────────────────────

  Widget _buildBmiHeroCard({
    required double? bmi,
    required _BmiConfig bmiConfig,
    required double curH,
    required double curW,
    required double minHealthyWeight,
    required double maxHealthyWeight,
  }) {
    return SmartCard(
      padding: const EdgeInsets.all(18),
      backgroundColor: Colors.white,
      borderColor: AppColors.cardBorder,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.monitor_weight_outlined, color: AppColors.primaryDark, size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Chỉ số thể hình (BMI)',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: bmiConfig.bgColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: bmiConfig.color.withValues(alpha: 0.3)),
                ),
                child: Text(
                  bmiConfig.label,
                  style: TextStyle(
                    color: bmiConfig.color,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Big BMI Number + Stats
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                bmi != null ? bmi.toStringAsFixed(1) : '--',
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.w900,
                  color: bmiConfig.color,
                  height: 1.0,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Chiều cao: ${curH.toStringAsFixed(0)} cm  •  Cân nặng: ${curW.toStringAsFixed(1)} kg',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Cân nặng chuẩn: ${minHealthyWeight.toStringAsFixed(1)} – ${maxHealthyWeight.toStringAsFixed(1)} kg',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Visual BMI Gauge Bar
          _buildBmiSpectrumBar(bmi ?? 22.0),
          const SizedBox(height: 12),

          // Advice box
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: bmiConfig.bgColor.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, size: 16, color: bmiConfig.color),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    bmiConfig.advice,
                    style: TextStyle(
                      fontSize: 12,
                      color: bmiConfig.color.withValues(alpha: 0.9),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBmiSpectrumBar(double currentBmi) {
    // Normal range representation: 15 to 35
    const double minScale = 15.0;
    const double maxScale = 35.0;
    final clampedBmi = currentBmi.clamp(minScale, maxScale);
    final ratio = (clampedBmi - minScale) / (maxScale - minScale);

    return Column(
      children: [
        // Marker
        LayoutBuilder(
          builder: (context, constraints) {
            final double leftPos = (constraints.maxWidth * ratio) - 8;
            return Stack(
              clipBehavior: Clip.none,
              children: [
                SizedBox(
                  height: 12,
                  width: constraints.maxWidth,
                ),
                Positioned(
                  left: leftPos.clamp(0.0, constraints.maxWidth - 16),
                  top: 0,
                  child: const Icon(
                    Icons.arrow_drop_down,
                    size: 20,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            );
          },
        ),
        // Colored Segments Bar
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: Row(
            children: [
              // Underweight (<18.5) -> (18.5 - 15) / 20 = 17.5%
              Expanded(
                flex: 35,
                child: Container(height: 10, color: const Color(0xFF3B82F6)),
              ),
              const SizedBox(width: 2),
              // Normal (18.5 - 24.9) -> (24.9 - 18.5) / 20 = 32%
              Expanded(
                flex: 64,
                child: Container(height: 10, color: const Color(0xFF22C55E)),
              ),
              const SizedBox(width: 2),
              // Overweight (25 - 29.9) -> 5 / 20 = 25%
              Expanded(
                flex: 50,
                child: Container(height: 10, color: const Color(0xFFF97316)),
              ),
              const SizedBox(width: 2),
              // Obese (>=30) -> 5.1 / 20 = 25.5%
              Expanded(
                flex: 51,
                child: Container(height: 10, color: const Color(0xFFEF4444)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('18.5', style: TextStyle(fontSize: 10, color: AppColors.textHint)),
            Text('24.9 (Chuẩn)', style: TextStyle(fontSize: 10, color: AppColors.textHint)),
            Text('29.9', style: TextStyle(fontSize: 10, color: AppColors.textHint)),
          ],
        ),
      ],
    );
  }

  Widget _buildDailyTargetsCard({
    required Map<String, double> liveTargets,
    required DailyTargets? profileTargets,
  }) {
    final calories = profileTargets?.calories ?? liveTargets['calories']!;
    final protein = profileTargets?.protein ?? liveTargets['protein']!;
    final carbs = profileTargets?.carbs ?? liveTargets['carbs']!;
    final fat = profileTargets?.fat ?? liveTargets['fat']!;
    final fiber = profileTargets?.fiber ?? liveTargets['fiber']!;
    final sugar = profileTargets?.sugarLimit ?? liveTargets['sugarLimit']!;
    final salt = profileTargets?.saltLimit ?? liveTargets['saltLimit']!;

    return SmartCard(
      padding: const EdgeInsets.all(18),
      backgroundColor: Colors.white,
      borderColor: AppColors.cardBorder,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.bolt, color: Colors.amber, size: 22),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Mục tiêu năng lượng hàng ngày',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Tự động tối ưu',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primaryDark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Total Calories Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFF0FDF4), Color(0xFFDCFCE7)],
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.primaryLight),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Khuyến nghị nạp',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            calories.toStringAsFixed(0),
                            style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                              color: AppColors.primaryDark,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Flexible(
                            child: Text(
                              'kcal / ngày',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.primaryDark,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildPill('BMR', '${liveTargets['bmr']?.toStringAsFixed(0)} kcal'),
                    const SizedBox(width: 6),
                    _buildPill('TDEE', '${liveTargets['tdee']?.toStringAsFixed(0)} kcal'),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Macro Breakdown Grid (Đạm, Tinh bột, Béo)
          Row(
            children: [
              Expanded(
                child: _buildMacroItem(
                  label: 'Đạm (Protein)',
                  value: '${protein.toStringAsFixed(0)}g',
                  color: const Color(0xFF3B82F6),
                  bgColor: const Color(0xFFEFF6FF),
                  icon: Icons.fitness_center,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMacroItem(
                  label: 'Tinh bột (Carb)',
                  value: '${carbs.toStringAsFixed(0)}g',
                  color: const Color(0xFF10B981),
                  bgColor: const Color(0xFFECFDF5),
                  icon: Icons.grain,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildMacroItem(
                  label: 'Chất béo (Fat)',
                  value: '${fat.toStringAsFixed(0)}g',
                  color: const Color(0xFFF97316),
                  bgColor: const Color(0xFFFFF7ED),
                  icon: Icons.opacity,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Micro Targets (Chất xơ, Giới hạn đường, Muối)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildMicroItem('Chất xơ', '≥ ${fiber.toStringAsFixed(0)}g', const Color(0xFF14B8A6)),
                Container(width: 1, height: 28, color: AppColors.divider),
                _buildMicroItem('Đường tối đa', '≤ ${sugar.toStringAsFixed(0)}g', const Color(0xFFF59E0B)),
                Container(width: 1, height: 28, color: AppColors.divider),
                _buildMicroItem('Muối tối đa', '≤ ${salt.toStringAsFixed(1)}g', const Color(0xFF64748B)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPill(String title, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Text(title, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildMacroItem({
    required String label,
    required String value,
    required Color color,
    required Color bgColor,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 10, color: AppColors.textSecondary),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildMicroItem(String title, String value, Color color) {
    return Column(
      children: [
        Text(title, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        const SizedBox(height: 2),
        Text(
          value,
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color),
        ),
      ],
    );
  }

  Widget _buildGoalCard({
    required double curW,
    required double? curTw,
    required int curDays,
    required Map<String, double> liveTargets,
  }) {
    String goalText = 'Duy trì vóc dáng';
    IconData goalIcon = Icons.balance;
    Color goalColor = const Color(0xFF0D9488);

    if (_goal == 'lose') {
      goalText = 'Giảm cân lành mạnh';
      goalIcon = Icons.trending_down;
      goalColor = const Color(0xFFF97316);
    } else if (_goal == 'gain') {
      goalText = 'Tăng cơ & khối lượng nạc';
      goalIcon = Icons.fitness_center;
      goalColor = const Color(0xFF2563EB);
    }

    final delta = liveTargets['delta'] ?? 0.0;

    return SmartCard(
      padding: const EdgeInsets.all(18),
      backgroundColor: Colors.white,
      borderColor: AppColors.cardBorder,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(goalIcon, color: goalColor, size: 22),
              const SizedBox(width: 8),
              Text(
                'Mục tiêu: $goalText',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (_goal == 'lose' || _goal == 'gain') ...[
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Cân nặng mục tiêu', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 4),
                        Text(
                          '${curTw?.toStringAsFixed(1) ?? '--'} kg',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: goalColor),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Thời gian dự kiến', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        const SizedBox(height: 4),
                        Text(
                          '$curDays ngày (${(curDays / 7).round()} tuần)',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Deficit info
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: goalColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Icon(Icons.speed, size: 16, color: goalColor),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _goal == 'lose'
                          ? 'Thâm hụt khuyến nghị: ${delta.abs().toStringAsFixed(0)} kcal / ngày để giảm an toàn.'
                          : 'Thặng dư khuyến nghị: +${delta.abs().toStringAsFixed(0)} kcal / ngày để tăng cơ bền vững.',
                      style: TextStyle(
                        fontSize: 12,
                        color: goalColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Bạn đang ở chế độ duy trì cân nặng ổn định. Thực đơn sẽ cân bằng calo nạp vào đúng bằng TDEE của bạn.',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildLifestyleCard() {
    final activity = _activityLevels.firstWhere(
      (a) => a.key == _activityLevel,
      orElse: () => _activityLevels.first,
    );

    final dietNames = {
      'normal': 'Ăn uống đa dạng (Bình thường)',
      'vegetarian': 'Ăn chay có trứng & sữa',
      'vegan': 'Thuần chay 100%',
      'keto': 'Keto (Giàu chất béo tốt, ít carb)',
      'mediterranean': 'Địa Trung Hải (Nhiều cá, rau, dầu olive)',
      'low_carb': 'Low Carb (Hạn chế tinh bột)',
    };

    return SmartCard(
      padding: const EdgeInsets.all(18),
      backgroundColor: Colors.white,
      borderColor: AppColors.cardBorder,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.directions_run, color: AppColors.primaryDark, size: 22),
              SizedBox(width: 8),
              Text(
                'Lối sống & Thói quen',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Activity Item
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              backgroundColor: AppColors.primaryLight.withValues(alpha: 0.3),
              child: Icon(activity.icon, color: AppColors.primaryDark),
            ),
            title: Text(
              activity.label,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            subtitle: Text(
              activity.desc,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.border),
              ),
              child: Text(
                '×${activity.factor}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.primaryDark),
              ),
            ),
          ),
          const Divider(height: 16, color: AppColors.divider),

          // Diet Type Item
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFFEF3C7),
              child: Icon(Icons.restaurant_menu, color: Color(0xFFD97706)),
            ),
            title: const Text(
              'Chế độ ăn ưa thích',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
            ),
            subtitle: Text(
              dietNames[_dietType] ?? _dietType,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConditionsCard() {
    final activeConditions = _conditions
        .map((k) => _conditionConfigs[k])
        .whereType<_ConditionConfig>()
        .toList();

    return SmartCard(
      padding: const EdgeInsets.all(18),
      backgroundColor: Colors.white,
      borderColor: AppColors.cardBorder,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.health_and_safety_outlined, color: Color(0xFFE11D48), size: 22),
                  SizedBox(width: 8),
                  Text(
                    'Bệnh lý & Tình trạng sức khỏe',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Text(
                '${activeConditions.length} đã chọn',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 14),

          if (activeConditions.isEmpty)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFBBF7D0)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle_outline, color: Color(0xFF16A34A), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Không có bệnh lý nền cần lưu ý đặc biệt. Bạn có thể thoải mái áp dụng thực đơn cân bằng.',
                      style: TextStyle(fontSize: 13, color: Color(0xFF15803D)),
                    ),
                  ),
                ],
              ),
            )
          else ...[
            ...activeConditions.map((cond) {
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: cond.color.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: cond.color.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(cond.icon, color: cond.color, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          cond.label,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: cond.color,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      cond.desc,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }

  Widget _buildRestrictedFoodsCard() {
    final activeConditions = _conditions
        .map((k) => _conditionConfigs[k])
        .whereType<_ConditionConfig>()
        .toList();

    final allRestricted = <String>{};
    for (final c in activeConditions) {
      allRestricted.addAll(c.restrictedFoods);
    }

    if (allRestricted.isEmpty) return const SizedBox.shrink();

    return SmartCard(
      padding: const EdgeInsets.all(18),
      backgroundColor: Colors.white,
      borderColor: AppColors.cardBorder,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.block, color: AppColors.error, size: 20),
              SizedBox(width: 8),
              Text(
                'Thực phẩm hệ thống hạn chế / khóa',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'SmartMeal tự động lọc bỏ hoặc giảm thiểu các nguyên liệu này khi tạo thực đơn gợi ý:',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: allRestricted.map((food) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFFECACA)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.remove_circle_outline, size: 14, color: AppColors.error),
                    const SizedBox(width: 4),
                    Text(
                      food,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF991B1B),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  // ─────────────────────────────────────────────────────────────
  // EDIT FORM BUILDER
  // ─────────────────────────────────────────────────────────────

  Widget _buildEditFormCard({required Map<String, double> liveTargets}) {
    return SmartCard(
      padding: const EdgeInsets.all(18),
      backgroundColor: Colors.white,
      borderColor: AppColors.primary,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.edit, color: AppColors.primaryDark),
                  SizedBox(width: 8),
                  Text(
                    'Cập nhật thông tin',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              TextButton(
                onPressed: () => setState(() => _isEditing = false),
                child: const Text('Hủy', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
          const Divider(height: 16, color: AppColors.divider),

          // Height & Weight Inputs
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _heightCtrl,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'Chiều cao (cm)',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.height),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _weightCtrl,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(
                    labelText: 'Cân nặng (kg)',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.monitor_weight_outlined),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Age & Gender
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _ageCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Tuổi',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.cake_outlined),
                  ),
                  onChanged: (_) => setState(() {}),
                ),
              ),
              Expanded(
                child: DropdownButtonFormField<String>(
                  initialValue: _gender,
                  decoration: const InputDecoration(
                    labelText: 'Giới tính',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'Nam', child: Text('Nam')),
                    DropdownMenuItem(value: 'Nữ', child: Text('Nữ')),
                    DropdownMenuItem(value: 'Khác', child: Text('Khác')),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _gender = val);
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Goal Selector
          const Text('Mục tiêu thể hình', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildChoiceChip('lose', 'Giảm cân', Icons.trending_down),
              const SizedBox(width: 8),
              _buildChoiceChip('maintain', 'Duy trì', Icons.balance),
              const SizedBox(width: 8),
              _buildChoiceChip('gain', 'Tăng cơ', Icons.fitness_center),
            ],
          ),
          const SizedBox(height: 14),

          // If lose or gain: Target Weight & Target Days
          if (_goal == 'lose' || _goal == 'gain') ...[
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _targetWeightCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: InputDecoration(
                      labelText: 'Cân nặng đích (kg)',
                      border: const OutlineInputBorder(),
                      prefixIcon: const Icon(Icons.flag_outlined),
                      helperText: _goal == 'lose' ? 'Thấp hơn hiện tại' : 'Cao hơn hiện tại',
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextField(
                    controller: _targetDaysCtrl,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Thời gian (ngày)',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.calendar_today_outlined),
                      helperText: 'Tối thiểu 14 ngày',
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],

          // Activity Level
          const Text('Mức độ vận động', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Column(
            children: _activityLevels.map((lvl) {
              final isSelected = _activityLevel == lvl.key;
              return InkWell(
                onTap: () => setState(() => _activityLevel = lvl.key),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primaryLight.withValues(alpha: 0.2) : AppColors.background,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Icon(lvl.icon, size: 20, color: isSelected ? AppColors.primaryDark : AppColors.textSecondary),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          '${lvl.label} (×${lvl.factor})',
                          style: TextStyle(
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? AppColors.primaryDark : AppColors.textPrimary,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      if (isSelected)
                        const Icon(Icons.check_circle, size: 18, color: AppColors.primaryDark),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),

          // Medical Conditions Selector
          const Text('Bệnh lý nền (chọn nếu có)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _conditionConfigs.values.map((cond) {
              final isSelected = _conditions.contains(cond.key);
              return FilterChip(
                label: Text(cond.label),
                selected: isSelected,
                selectedColor: cond.color.withValues(alpha: 0.2),
                checkmarkColor: cond.color,
                labelStyle: TextStyle(
                  color: isSelected ? cond.color : AppColors.textPrimary,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  fontSize: 12,
                ),
                backgroundColor: AppColors.background,
                onSelected: (selected) {
                  setState(() {
                    if (selected) {
                      _conditions.add(cond.key);
                    } else {
                      _conditions.remove(cond.key);
                    }
                  });
                },
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _dietType,
            decoration: const InputDecoration(
              labelText: 'Chế độ ăn ưa thích',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.restaurant),
            ),
            items: const [
              DropdownMenuItem(value: 'normal', child: Text('Bình thường (Đa dạng)')),
              DropdownMenuItem(value: 'vegetarian', child: Text('Ăn chay (Trứng & Sữa)')),
              DropdownMenuItem(value: 'vegan', child: Text('Thuần chay (100% Thực vật)')),
              DropdownMenuItem(value: 'keto', child: Text('Keto (Ít carb, giàu béo tốt)')),
              DropdownMenuItem(value: 'mediterranean', child: Text('Địa Trung Hải')),
              DropdownMenuItem(value: 'low_carb', child: Text('Low Carb (Ít tinh bột)')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _dietType = val);
            },
          ),
          const SizedBox(height: 20),

          // Live Preview calculated stats box
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF86EFAC)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    const Text('Calo mục tiêu', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      '${liveTargets['calories']?.toStringAsFixed(0)} kcal',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.primaryDark),
                    ),
                  ],
                ),
                Column(
                  children: [
                    const Text('Đạm (Protein)', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      '${liveTargets['protein']?.toStringAsFixed(0)}g',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF2563EB)),
                    ),
                  ],
                ),
                Column(
                  children: [
                    const Text('Carb', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      '${liveTargets['carbs']?.toStringAsFixed(0)}g',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF10B981)),
                    ),
                  ],
                ),
                Column(
                  children: [
                    const Text('Fat', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    Text(
                      '${liveTargets['fat']?.toStringAsFixed(0)}g',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFFF97316)),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Save / Cancel Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _saving ? null : () => setState(() => _isEditing = false),
                  child: const Text('Hủy'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: SmartButton(
                  text: _saving ? 'Đang lưu...' : 'Lưu hồ sơ sức khỏe',
                  icon: Icons.check,
                  isLoading: _saving,
                  onPressed: _saving ? null : _saveProfile,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChoiceChip(String key, String label, IconData icon) {
    final isSelected = _goal == key;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _goal = key),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primaryLight.withValues(alpha: 0.3) : AppColors.background,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSelected ? AppColors.primary : AppColors.border),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: isSelected ? AppColors.primaryDark : AppColors.textSecondary),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? AppColors.primaryDark : AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// CONFIG DATA HOLDERS
// ─────────────────────────────────────────────────────────────

class _BmiConfig {
  final String label;
  final Color color;
  final Color bgColor;
  final String advice;

  const _BmiConfig({
    required this.label,
    required this.color,
    required this.bgColor,
    required this.advice,
  });
}

class _ActivityConfig {
  final String key;
  final String label;
  final IconData icon;
  final double factor;
  final String desc;

  const _ActivityConfig({
    required this.key,
    required this.label,
    required this.icon,
    required this.factor,
    required this.desc,
  });
}

class _ConditionConfig {
  final String key;
  final String label;
  final IconData icon;
  final Color color;
  final String desc;
  final List<String> restrictedFoods;

  const _ConditionConfig({
    required this.key,
    required this.label,
    required this.icon,
    required this.color,
    required this.desc,
    required this.restrictedFoods,
  });
}

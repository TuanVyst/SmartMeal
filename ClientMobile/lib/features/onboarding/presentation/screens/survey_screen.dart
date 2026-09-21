import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/ui/smart_button.dart';
import '../../../../core/ui/smart_text_field.dart';
import '../../../../core/ui/smart_dialog.dart';
import '../../../../core/ui/smart_card.dart';
import '../providers/health_profile_provider.dart';

class SurveyScreen extends StatefulWidget {
  const SurveyScreen({super.key});

  @override
  State<SurveyScreen> createState() => _SurveyScreenState();
}

class _SurveyScreenState extends State<SurveyScreen> {
  int _step = 1;
  bool _submitting = false;

  // Step 1
  final _heightCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _ageCtrl = TextEditingController();
  String _gender = 'Nam';

  // Step 2
  String _goal = '';
  final _targetWeightCtrl = TextEditingController();

  // Step 3
  String _activityLevel = '';

  // Step 4
  String _dietType = 'normal';

  @override
  void dispose() {
    _heightCtrl.dispose();
    _weightCtrl.dispose();
    _ageCtrl.dispose();
    _targetWeightCtrl.dispose();
    super.dispose();
  }

  void _nextStep() {
    FocusScope.of(context).unfocus();
    String? error = _validateStep();
    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error), backgroundColor: Colors.red));
      return;
    }
    setState(() => _step++);
  }

  void _prevStep() {
    FocusScope.of(context).unfocus();
    setState(() => _step--);
  }

  String? _validateStep() {
    if (_step == 1) {
      if (_heightCtrl.text.isEmpty || _weightCtrl.text.isEmpty || _ageCtrl.text.isEmpty) {
        return 'Vui lòng điền đầy đủ thông tin';
      }
    } else if (_step == 2) {
      if (_goal.isEmpty) return 'Vui lòng chọn mục tiêu';
      if ((_goal == 'lose' || _goal == 'gain') && _targetWeightCtrl.text.isEmpty) {
        return 'Vui lòng nhập cân nặng mục tiêu hợp lệ';
      }
    } else if (_step == 3) {
      if (_activityLevel.isEmpty) return 'Vui lòng chọn mức độ vận động';
    } else if (_step == 4) {
      if (_dietType.isEmpty) return 'Vui lòng chọn chế độ ăn';
    }
    return null;
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final provider = context.read<HealthProfileProvider>();
      
      final height = double.tryParse(_heightCtrl.text) ?? 0;
      final weight = double.tryParse(_weightCtrl.text) ?? 0;
      final tw = double.tryParse(_targetWeightCtrl.text) ?? 0;
      
      int targetDays = 84;
      if ((_goal == 'lose' || _goal == 'gain') && weight > 0 && tw > 0) {
        final calculatedDays = ((tw - weight).abs() / 0.5 * 7).ceil();
        targetDays = calculatedDays < 14 ? 14 : calculatedDays;
      }

      final payload = {
        'height': height,
        'weight': weight,
        'age': int.tryParse(_ageCtrl.text) ?? 0,
        'gender': _gender,
        'goal': _goal,
        'activityLevel': _activityLevel,
        'targetWeight': (_goal == 'lose' || _goal == 'gain') ? tw : null,
        'targetDays': targetDays,
        'dietType': _dietType,
        'cookingTimeMinutes': 30, // Default matching Web
        'mealsPerDay': 3, // Default matching Web
        'conditions': [],
        'allergies': [],
        'bmiLevel': 'normal', 
      };

      final success = await provider.submitSurvey(payload);
      if (!mounted) return;
      if (success) {
        context.go('/main');
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Không thể lưu hồ sơ')));
      }
    } catch (e) {
      if (!mounted) return;
      SmartDialog.showAlert(context: context, title: 'Lỗi', message: e.toString());
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Bước $_step/5'),
        leading: _step > 1 ? IconButton(icon: const Icon(Icons.arrow_back), onPressed: _prevStep) : null,
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Column(
          children: [
            LinearProgressIndicator(value: _step / 5, backgroundColor: Colors.grey[200]),
            Expanded(
              child: SingleChildScrollView(
                padding: AppSpacing.edgeInsetsAllLg,
                child: _buildCurrentStep(),
              ),
            ),
            Padding(
              padding: AppSpacing.edgeInsetsAllLg,
              child: _step < 5
                  ? SmartButton(text: 'Tiếp theo', onPressed: _nextStep)
                  : SmartButton(text: 'Hoàn thành', isLoading: _submitting, onPressed: _submit),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_step) {
      case 1:
        return _buildStep1();
      case 2:
        return _buildStep2();
      case 3:
        return _buildStep3();
      case 4:
        return _buildStep4();
      case 5:
        return _buildStep5();
      default:
        return const SizedBox();
    }
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Thông tin cơ bản', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
        const SizedBox(height: AppSpacing.xl),
        Row(
          children: [
            Expanded(child: SmartTextField(controller: _heightCtrl, label: 'Chiều cao (cm)', keyboardType: TextInputType.number)),
            const SizedBox(width: AppSpacing.md),
            Expanded(child: SmartTextField(controller: _weightCtrl, label: 'Cân nặng (kg)', keyboardType: TextInputType.number)),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        SmartTextField(controller: _ageCtrl, label: 'Tuổi', keyboardType: TextInputType.number),
        const SizedBox(height: AppSpacing.lg),
        Text('Giới tính', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: ['Nam', 'Nữ'].map((g) {
            final isSelected = _gender == g;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _gender = g),
                child: SmartCard(
                  padding: AppSpacing.edgeInsetsAllMd,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  backgroundColor: isSelected ? AppColors.primaryLight : Colors.white,
                  borderColor: isSelected ? AppColors.primary : AppColors.divider,
                  child: Center(child: Text(g, style: TextStyle(color: isSelected ? AppColors.primary : AppColors.textPrimary, fontWeight: FontWeight.bold))),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildStep2() {
    final goals = [
      {'value': 'lose', 'label': 'Giảm cân', 'desc': 'Giảm mỡ và kiểm soát cân nặng'},
      {'value': 'gain', 'label': 'Tăng cơ', 'desc': 'Xây dựng cơ bắp và sức mạnh'},
      {'value': 'maintain', 'label': 'Duy trì', 'desc': 'Giữ vóc dáng hiện tại'},
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Mục tiêu cân nặng', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
        const SizedBox(height: AppSpacing.xl),
        ...goals.map((g) {
          final isSelected = _goal == g['value'];
          return GestureDetector(
            onTap: () => setState(() => _goal = g['value']!),
            child: SmartCard(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              padding: AppSpacing.edgeInsetsAllMd,
              backgroundColor: isSelected ? AppColors.primaryLight : Colors.white,
              borderColor: isSelected ? AppColors.primary : AppColors.divider,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(g['label']!, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isSelected ? AppColors.primary : AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  Text(g['desc']!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ],
              ),
            ),
          );
        }),
        if (_goal == 'lose' || _goal == 'gain') ...[
          const SizedBox(height: AppSpacing.lg),
          SmartTextField(controller: _targetWeightCtrl, label: 'Cân nặng mục tiêu (kg)', keyboardType: TextInputType.number),
        ]
      ],
    );
  }

  Widget _buildStep3() {
    final levels = [
      {'value': 'sedentary', 'label': 'Ít vận động', 'desc': 'Làm việc văn phòng, ít đi lại'},
      {'value': 'light', 'label': 'Vận động nhẹ', 'desc': 'Đi bộ, làm việc nhà nhẹ nhàng'},
      {'value': 'moderate', 'label': 'Vận động vừa', 'desc': 'Tập thể dục 3-5 ngày/tuần'},
      {'value': 'active', 'label': 'Vận động nhiều', 'desc': 'Chơi thể thao, lao động chân tay'},
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Vận động hằng ngày', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
        const SizedBox(height: AppSpacing.xl),
        ...levels.map((l) {
          final isSelected = _activityLevel == l['value'];
          return GestureDetector(
            onTap: () => setState(() => _activityLevel = l['value']!),
            child: SmartCard(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              padding: AppSpacing.edgeInsetsAllMd,
              backgroundColor: isSelected ? AppColors.primaryLight : Colors.white,
              borderColor: isSelected ? AppColors.primary : AppColors.divider,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l['label']!, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isSelected ? AppColors.primary : AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  Text(l['desc']!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildStep4() {
    final diets = [
      {'value': 'normal', 'label': 'Ăn bình thường', 'desc': 'Không kiêng cữ gì cả'},
      {'value': 'weight_loss', 'label': 'Ăn giảm cân', 'desc': 'Ưu tiên các món ít béo, ít đường'},
      {'value': 'muscle_gain', 'label': 'Ăn tăng cơ', 'desc': 'Ăn chủ yếu là bò, gà, giảm tinh bột'},
      {'value': 'vegetarian', 'label': 'Ăn chay', 'desc': 'Không có 1 món thịt nào'},
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Chế độ ăn', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
        const SizedBox(height: AppSpacing.xl),
        ...diets.map((d) {
          final isSelected = _dietType == d['value'];
          return GestureDetector(
            onTap: () => setState(() => _dietType = d['value']!),
            child: SmartCard(
              margin: const EdgeInsets.only(bottom: AppSpacing.md),
              padding: AppSpacing.edgeInsetsAllMd,
              backgroundColor: isSelected ? AppColors.primaryLight : Colors.white,
              borderColor: isSelected ? AppColors.primary : AppColors.divider,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(d['label']!, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isSelected ? AppColors.primary : AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  Text(d['desc']!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildStep5() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('Hoàn tất', style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
        const SizedBox(height: AppSpacing.xl),
        SmartCard(
          padding: AppSpacing.edgeInsetsAllLg,
          backgroundColor: AppColors.surfaceHover,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tóm tắt hồ sơ:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: AppSpacing.md),
              Text('• Mục tiêu: ${_goal == "lose" ? "Giảm cân" : _goal == "gain" ? "Tăng cơ" : "Duy trì"}'),
              const SizedBox(height: 8),
              Text('• Mức độ vận động: $_activityLevel'),
              const SizedBox(height: 8),
              Text('• Chế độ ăn: $_dietType'),
              const SizedBox(height: AppSpacing.lg),
              const Text('Ứng dụng sẽ tính toán thực đơn tự động dựa trên các thông số này.', style: TextStyle(color: AppColors.textSecondary, fontStyle: FontStyle.italic)),
            ],
          ),
        ),
      ],
    );
  }
}

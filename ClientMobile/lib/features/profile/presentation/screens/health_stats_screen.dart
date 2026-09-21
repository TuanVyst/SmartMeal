import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_spacing.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import 'package:smart_meal/features/onboarding/presentation/providers/health_profile_provider.dart';

class HealthStatsScreen extends StatefulWidget {
  const HealthStatsScreen({super.key});

  @override
  State<HealthStatsScreen> createState() => _HealthStatsScreenState();
}

class _HealthStatsScreenState extends State<HealthStatsScreen> {
  final _heightCtrl = TextEditingController();
  final _weightCtrl = TextEditingController();
  final _targetWeightCtrl = TextEditingController();
  String _goal = 'maintain';
  String _activityLevel = 'sedentary';
  bool _loading = false;
  List<dynamic> _bmiHistory = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadData();
    });
  }

  Future<void> _loadData() async {
    final provider = context.read<HealthProfileProvider>();
    final profile = provider.profile;
    if (profile != null) {
      _heightCtrl.text = profile.height?.toString() ?? '';
      _weightCtrl.text = profile.weight?.toString() ?? '';
      _targetWeightCtrl.text = profile.targetWeight?.toString() ?? '';
      _goal = profile.goal ?? 'maintain';
      _activityLevel = profile.activityLevel ?? 'sedentary';
    }
    
    final history = await provider.getBmiHistory();
    if (mounted) {
      setState(() {
        _bmiHistory = history;
      });
    }
  }

  Future<void> _save() async {
    setState(() => _loading = true);
    try {
      final payload = {
        'height': double.tryParse(_heightCtrl.text),
        'weight': double.tryParse(_weightCtrl.text),
        'targetWeight': double.tryParse(_targetWeightCtrl.text),
        'goal': _goal,
        'activityLevel': _activityLevel,
      };
      await context.read<HealthProfileProvider>().updateProfile(payload);
      await _loadData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã cập nhật hồ sơ sức khỏe')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lỗi cập nhật')));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hồ sơ sức khỏe')),
      body: SingleChildScrollView(
        padding: AppSpacing.edgeInsetsAllLg,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Chỉ số cơ thể', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: TextField(controller: _heightCtrl, decoration: const InputDecoration(labelText: 'Chiều cao (cm)', border: OutlineInputBorder()), keyboardType: TextInputType.number)),
                const SizedBox(width: 16),
                Expanded(child: TextField(controller: _weightCtrl, decoration: const InputDecoration(labelText: 'Cân nặng (kg)', border: OutlineInputBorder()), keyboardType: TextInputType.number)),
              ],
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _goal,
              decoration: const InputDecoration(labelText: 'Mục tiêu', border: OutlineInputBorder()),
              items: const [
                DropdownMenuItem(value: 'lose', child: Text('Giảm cân')),
                DropdownMenuItem(value: 'maintain', child: Text('Duy trì')),
                DropdownMenuItem(value: 'gain', child: Text('Tăng cơ')),
              ],
              onChanged: (val) => setState(() => _goal = val!),
            ),
            const SizedBox(height: 16),
            if (_goal == 'lose' || _goal == 'gain')
              TextField(
                controller: _targetWeightCtrl,
                decoration: const InputDecoration(labelText: 'Cân nặng mục tiêu (kg)', border: OutlineInputBorder()),
                keyboardType: TextInputType.number,
              ),
            const SizedBox(height: 24),
            SmartButton(text: _loading ? 'Đang lưu...' : 'Cập nhật', onPressed: _loading ? null : _save),
            const SizedBox(height: 32),
            const Text('Lịch sử BMI', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            if (_bmiHistory.isEmpty)
              const Text('Chưa có lịch sử BMI', style: TextStyle(color: Colors.grey))
            else
              ..._bmiHistory.map<Widget>((item) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text('${item['weight']}kg / ${item['height']}cm'),
                    subtitle: Text('BMI: ${item['bmi']} - ${item['bmiLevel'] == 'normal' ? 'Bình thường' : item['bmiLevel'] == 'overweight' ? 'Thừa cân' : 'Béo phì'}'),
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}

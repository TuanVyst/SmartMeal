import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';

class AddLogSheet extends StatefulWidget {
  final String date;
  const AddLogSheet({super.key, required this.date});

  static void show(BuildContext context, String date) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => AddLogSheet(date: date),
    );
  }

  @override
  State<AddLogSheet> createState() => _AddLogSheetState();
}

class _AddLogSheetState extends State<AddLogSheet> {
  String _mealType = 'breakfast';
  final _nameCtrl = TextEditingController();
  final _calCtrl = TextEditingController();
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24, right: 24, top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Thêm bữa ăn (Tùy chỉnh)', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _mealType,
            decoration: const InputDecoration(labelText: 'Bữa ăn', border: OutlineInputBorder()),
            items: const [
              DropdownMenuItem(value: 'breakfast', child: Text('Sáng')),
              DropdownMenuItem(value: 'lunch', child: Text('Trưa')),
              DropdownMenuItem(value: 'dinner', child: Text('Tối')),
              DropdownMenuItem(value: 'snack', child: Text('Bữa phụ')),
            ],
            onChanged: (val) => setState(() => _mealType = val!),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Tên món ăn', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _calCtrl,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Năng lượng (kcal)', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 24),
          SmartButton(
            text: _loading ? 'Đang lưu...' : 'Lưu',
            onPressed: _loading ? null : _save,
          ),
        ],
      ),
    );
  }

  void _save() async {
    if (_nameCtrl.text.isEmpty || _calCtrl.text.isEmpty) return;
    final cal = double.tryParse(_calCtrl.text);
    if (cal == null) return;

    setState(() => _loading = true);
    final accountId = context.read<AuthProvider>().accountId;

    try {
      await context.read<NutritionProvider>().addLog({
        'account_id': accountId,
        'logDate': '${widget.date}T12:00:00.000Z',
        'mealType': _mealType,
        'quantity': 1,
        'unit': 'phần',
        'totalCalories': cal,
      });
      if (mounted) Navigator.pop(context);
    } catch (e) {
      // Error handling
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }
}

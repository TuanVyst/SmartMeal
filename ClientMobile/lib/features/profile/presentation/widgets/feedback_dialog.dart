import 'package:flutter/material.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import 'package:smart_meal/core/ui/smart_text_field.dart';
import '../../data/feedback_service.dart';

class FeedbackDialog extends StatefulWidget {
  const FeedbackDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      builder: (_) => const FeedbackDialog(),
    );
  }

  @override
  State<FeedbackDialog> createState() => _FeedbackDialogState();
}

class _FeedbackDialogState extends State<FeedbackDialog> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  final _feedbackService = FeedbackService();

  int _selectedCategory = 0;
  bool _submitting = false;

  static const List<Map<String, dynamic>> _categories = [
    {'id': 0, 'label': 'Góp ý chung', 'icon': Icons.chat_bubble_outline},
    {'id': 1, 'label': 'Báo lỗi', 'icon': Icons.bug_report_outlined},
    {'id': 2, 'label': 'Đề xuất tính năng', 'icon': Icons.lightbulb_outline},
    {'id': 3, 'label': 'Góp ý món ăn', 'icon': Icons.restaurant_outlined},
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final title = _titleController.text.trim();
    final content = _contentController.text.trim();

    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập tiêu đề phản hồi'), backgroundColor: AppColors.error),
      );
      return;
    }

    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập nội dung chi tiết'), backgroundColor: AppColors.error),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      final res = await _feedbackService.submitFeedback(
        category: _selectedCategory,
        title: title,
        content: content,
      );

      if (mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(res['message']?.toString() ?? 'Cảm ơn bạn đã gửi phản hồi cho SmartMeal!'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gửi phản hồi thất bại: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Row(
        children: [
          Icon(Icons.feedback_outlined, color: AppColors.primary),
          SizedBox(width: 8),
          Text('Gửi phản hồi & Báo lỗi', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Ý kiến đóng góp của bạn giúp SmartMeal ngày một hoàn thiện hơn:',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 14),

            // Category Chips
            const Text('Loại phản hồi:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat['id'];
                return ChoiceChip(
                  avatar: Icon(
                    cat['icon'] as IconData,
                    size: 16,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  label: Text(
                    cat['label'] as String,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    ),
                  ),
                  selected: isSelected,
                  selectedColor: AppColors.primary,
                  backgroundColor: AppColors.background,
                  onSelected: (selected) {
                    if (selected) setState(() => _selectedCategory = cat['id'] as int);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 14),

            // Title input
            SmartTextField(
              controller: _titleController,
              label: 'Tiêu đề ngắn gọn',
              prefixIcon: Icons.title,
            ),
            const SizedBox(height: 12),

            // Content input
            TextField(
              controller: _contentController,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: 'Mô tả chi tiết góp ý hoặc lỗi gặp phải...',
                alignLabelWithHint: true,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                filled: true,
                fillColor: AppColors.background,
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _submitting ? null : () => Navigator.of(context).pop(),
          child: const Text('Hủy'),
        ),
        SmartButton(
          text: _submitting ? 'Đang gửi...' : 'Gửi phản hồi',
          isLoading: _submitting,
          fullWidth: false,
          onPressed: _submitting ? null : _submit,
        ),
      ],
    );
  }
}

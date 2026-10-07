import 'package:flutter/material.dart';
import 'package:smart_meal/core/theme/app_colors.dart';

/// Modal bộ lọc và sắp xếp món ăn (Wireframe Page 8)
class RecipeFilterSheet extends StatefulWidget {
  final VoidCallback? onApply;

  const RecipeFilterSheet({super.key, this.onApply});

  @override
  State<RecipeFilterSheet> createState() => _RecipeFilterSheetState();
}

class _RecipeFilterSheetState extends State<RecipeFilterSheet> {
  String _sortBy = 'Phù hợp nhất';
  double _cookTime = 60;
  String _timeRange = 'Tất cả';
  final Set<String> _selectedDifficulties = {'Dễ'};
  RangeValues _calorieRange = const RangeValues(100, 800);

  final List<String> _sortOptions = [
    'Phù hợp nhất',
    'Nhanh nhất',
    'Dễ nhất',
    'Ít calo nhất',
  ];

  final List<String> _timeQuickChips = [
    'Tất cả',
    '≤15 phút',
    '15-30 phút',
    '30-60 phút',
    '>60 phút',
  ];

  final List<String> _difficulties = ['Dễ', 'Trung bình', 'Khó'];

  void _resetFilter() {
    setState(() {
      _sortBy = 'Phù hợp nhất';
      _cookTime = 60;
      _timeRange = 'Tất cả';
      _selectedDifficulties.clear();
      _calorieRange = const RangeValues(100, 800);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 12, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBackground,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.tune, color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Bộ lọc & Sắp xếp',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textSecondary),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.divider),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              children: [
                // 1. SẮP XẾP THEO
                _buildSectionTitle('Sắp xếp theo'),
                const SizedBox(height: 8),
                Column(
                  children: _sortOptions.map((opt) {
                    final isChecked = _sortBy == opt;
                    return InkWell(
                      onTap: () => setState(() => _sortBy = opt),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Row(
                          children: [
                            Radio<String>(
                              value: opt,
                              groupValue: _sortBy,
                              activeColor: AppColors.primary,
                              onChanged: (val) => setState(() => _sortBy = val!),
                            ),
                            Text(
                              opt,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: isChecked ? FontWeight.bold : FontWeight.normal,
                                color: isChecked ? AppColors.primaryDark : AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 16),
                const Divider(color: AppColors.divider),
                const SizedBox(height: 16),

                // 2. THỜI GIAN NẤU
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSectionTitle('Thời gian nấu'),
                    Text(
                      'Tối đa ${_cookTime.toInt()} phút',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ],
                ),
                SliderTheme(
                  data: SliderTheme.of(context).copyWith(
                    activeTrackColor: AppColors.primary,
                    inactiveTrackColor: AppColors.border,
                    thumbColor: AppColors.primary,
                    overlayColor: AppColors.primary.withValues(alpha: 0.2),
                  ),
                  child: Slider(
                    value: _cookTime,
                    min: 0,
                    max: 180,
                    divisions: 12,
                    label: '${_cookTime.toInt()} phút',
                    onChanged: (val) => setState(() => _cookTime = val),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('0 phút', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    Text('180 phút+', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _timeQuickChips.map((chip) {
                    final selected = _timeRange == chip;
                    return ChoiceChip(
                      label: Text(chip),
                      selected: selected,
                      selectedColor: AppColors.primaryLight.withValues(alpha: 0.5),
                      backgroundColor: AppColors.surfaceHover,
                      labelStyle: TextStyle(
                        fontSize: 12,
                        fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                        color: selected ? AppColors.primaryDark : AppColors.textPrimary,
                      ),
                      onSelected: (val) => setState(() => _timeRange = chip),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 16),
                const Divider(color: AppColors.divider),
                const SizedBox(height: 16),

                // 3. ĐỘ KHÓ
                _buildSectionTitle('Độ khó'),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 12,
                  children: _difficulties.map((diff) {
                    final selected = _selectedDifficulties.contains(diff);
                    return FilterChip(
                      label: Text(diff),
                      selected: selected,
                      selectedColor: AppColors.primaryLight.withValues(alpha: 0.5),
                      backgroundColor: AppColors.surfaceHover,
                      labelStyle: TextStyle(
                        fontSize: 13,
                        fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                        color: selected ? AppColors.primaryDark : AppColors.textPrimary,
                      ),
                      onSelected: (val) {
                        setState(() {
                          if (val) {
                            _selectedDifficulties.add(diff);
                          } else {
                            _selectedDifficulties.remove(diff);
                          }
                        });
                      },
                    );
                  }).toList(),
                ),

                const SizedBox(height: 16),
                const Divider(color: AppColors.divider),
                const SizedBox(height: 16),

                // 4. CALORIES
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildSectionTitle('Calories'),
                    Text(
                      '${_calorieRange.start.round()} - ${_calorieRange.end.round()} kcal',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ],
                ),
                RangeSlider(
                  values: _calorieRange,
                  min: 50,
                  max: 1200,
                  divisions: 23,
                  activeColor: AppColors.primary,
                  inactiveColor: AppColors.border,
                  onChanged: (val) => setState(() => _calorieRange = val),
                ),
              ],
            ),
          ),

          // Footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.divider)),
            ),
            child: Column(
              children: [
                const Center(
                  child: Text(
                    'Tìm thấy 59 công thức',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      flex: 1,
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          side: const BorderSide(color: AppColors.border),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _resetFilter,
                        icon: const Icon(Icons.refresh, size: 18, color: AppColors.textSecondary),
                        label: const Text('Đặt lại', style: TextStyle(color: AppColors.textSecondary)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          widget.onApply?.call();
                          Navigator.of(context).pop();
                        },
                        child: const Text(
                          'Áp dụng',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    );
  }
}

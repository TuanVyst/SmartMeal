import 'package:flutter/material.dart';
import 'package:smart_meal/core/theme/app_colors.dart';

/// Modal bảng nguyên liệu & Dị ứng (Wireframe Page 6)
class IngredientFridgeSheet extends StatefulWidget {
  final Function(Set<String> selectedIngredients)? onApply;

  const IngredientFridgeSheet({super.key, this.onApply});

  @override
  State<IngredientFridgeSheet> createState() => _IngredientFridgeSheetState();
}

class _IngredientFridgeSheetState extends State<IngredientFridgeSheet> {
  int _activeTab = 0; // 0: Tủ lạnh, 1: Dị ứng
  final TextEditingController _searchCtrl = TextEditingController();
  String _searchKeyword = '';

  final List<String> _grains = [
    'Bánh mì',
    'Bánh phở',
    'Bột mì',
    'Bột ngọt',
    'Bún',
    'Gạo',
    'Gạo nếp',
    'Hủ tiếu',
    'Mì Quảng',
    'Mì ý',
    'Miến',
    'Phở',
    'Vỏ bánh tortilla',
  ];

  final List<String> _dryFoods = [
    'Bánh mì sandwich',
    'Bột chiên giòn',
    'Bột gạo',
    'Bột năng',
    'Đậu phộng',
    'Lá lốt',
    'Mè',
    'Ngò rí',
  ];

  final Set<String> _selectedFridgeIngredients = {'Gạo', 'Bún', 'Thịt bò'};
  final Set<String> _selectedAllergies = {'Đậu phộng'};

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 12, 10),
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
                      child: const Icon(Icons.kitchen_outlined, color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Nguyên liệu & Dị ứng',
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
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              children: [
                // 2 Tab Tủ lạnh & Dị ứng
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => setState(() => _activeTab = 0),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _activeTab == 0 ? AppColors.primaryBackground : Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _activeTab == 0 ? AppColors.primary : Colors.transparent,
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.kitchen, size: 18, color: _activeTab == 0 ? AppColors.primaryDark : AppColors.textSecondary),
                              const SizedBox(width: 8),
                              Text(
                                'Tủ lạnh',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: _activeTab == 0 ? AppColors.primaryDark : AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: InkWell(
                        onTap: () => setState(() => _activeTab = 1),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: _activeTab == 1 ? const Color(0xFFFEF2F2) : Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _activeTab == 1 ? Colors.redAccent : Colors.transparent,
                              width: 1.5,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.block, size: 18, color: _activeTab == 1 ? Colors.redAccent : AppColors.textSecondary),
                              const SizedBox(width: 8),
                              Text(
                                'Dị ứng',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: _activeTab == 1 ? Colors.redAccent : AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Lời dẫn mô tả
                Text(
                  _activeTab == 0
                      ? 'Chọn các nguyên liệu bạn đang sẵn có ở nhà để hệ thống gợi ý thực đơn thích hợp nhất.'
                      : 'Chọn các thành phần gây dị ứng để hệ thống loại trừ các món ăn không an toàn.',
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.3),
                ),
                const SizedBox(height: 12),

                // 2 nút tác vụ: Khám phá & Nấu ăn
                Row(
                  children: [
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primaryDark,
                        side: const BorderSide(color: AppColors.primary),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      onPressed: () {},
                      icon: const Icon(Icons.search, size: 16),
                      label: const Text('Khám phá'),
                    ),
                    const SizedBox(width: 8),
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.textSecondary,
                        side: const BorderSide(color: AppColors.border),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      ),
                      onPressed: () {},
                      icon: const Icon(Icons.soup_kitchen_outlined, size: 16),
                      label: const Text('Nấu ăn'),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Ô tìm kiếm nguyên liệu
                TextField(
                  controller: _searchCtrl,
                  onChanged: (val) => setState(() => _searchKeyword = val.trim().toLowerCase()),
                  decoration: InputDecoration(
                    hintText: _activeTab == 0 ? 'Tìm nguyên liệu trong tủ lạnh...' : 'Tìm thành phần dị ứng...',
                    hintStyle: const TextStyle(fontSize: 14, color: AppColors.textHint),
                    prefixIcon: const Icon(Icons.search, color: AppColors.textSecondary),
                    filled: true,
                    fillColor: AppColors.surfaceHover,
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Nhóm 1: Ngũ cốc
                _buildCategorySection('NGŨ CỐC', _grains),
                const SizedBox(height: 20),

                // Nhóm 2: Đồ khô
                _buildCategorySection('ĐỒ KHÔ', _dryFoods),
              ],
            ),
          ),

          // Nút Áp dụng dưới cùng
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.divider)),
            ),
            child: SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  widget.onApply?.call(_selectedFridgeIngredients);
                  Navigator.of(context).pop();
                },
                child: Text(
                  'Áp dụng (${_activeTab == 0 ? _selectedFridgeIngredients.length : _selectedAllergies.length} đã chọn)',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySection(String title, List<String> items) {
    final filtered = items.where((i) => i.toLowerCase().contains(_searchKeyword)).toList();
    if (filtered.isEmpty) return const SizedBox.shrink();

    final targetSet = _activeTab == 0 ? _selectedFridgeIngredients : _selectedAllergies;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: AppColors.textSecondary,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: filtered.map((item) {
            final isSelected = targetSet.contains(item);
            return FilterChip(
              label: Text(item),
              labelStyle: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                color: isSelected
                    ? (_activeTab == 0 ? AppColors.primaryDark : Colors.red.shade900)
                    : AppColors.textPrimary,
              ),
              selected: isSelected,
              selectedColor: _activeTab == 0 ? AppColors.primaryLight.withValues(alpha: 0.5) : Colors.red.shade100,
              backgroundColor: AppColors.surfaceHover,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(
                  color: isSelected
                      ? (_activeTab == 0 ? AppColors.primary : Colors.redAccent)
                      : Colors.transparent,
                ),
              ),
              showCheckmark: false,
              onSelected: (val) {
                setState(() {
                  if (val) {
                    targetSet.add(item);
                  } else {
                    targetSet.remove(item);
                  }
                });
              },
            );
          }).toList(),
        ),
      ],
    );
  }
}

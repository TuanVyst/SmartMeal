import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';

class SubscriptionPlansScreen extends StatelessWidget {
  final bool showAppBar;
  const SubscriptionPlansScreen({super.key, this.showAppBar = true});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isPremium = auth.isPremium;

    final body = SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner Header
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isPremium
                    ? const [Color(0xFFF59E0B), Color(0xFFD97706)]
                    : const [Color(0xFF22C55E), Color(0xFF16A34A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: (isPremium ? Colors.orange : Colors.green).withValues(alpha: 0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(
                  isPremium ? Icons.workspace_premium : Icons.stars,
                  size: 52,
                  color: Colors.white,
                ),
                const SizedBox(height: 10),
                Text(
                  isPremium ? 'Gói SmartMeal Pro (Đang hoạt động)' : 'Nâng Cấp SmartMeal Pro',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  isPremium
                      ? 'Bạn đang tận hưởng trọn vẹn mọi đặc quyền thông minh'
                      : 'Tối ưu dinh dưỡng và chăm sóc sức khỏe khoa học mỗi ngày',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Card Chi Tiết Gói Pro
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: isPremium ? Colors.amber.shade400 : AppColors.primary,
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 14,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'SmartMeal Pro',
                      style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'TIẾT KIỆM 40%',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFB45309),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: const [
                    Text(
                      '49.000 đ',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryDark,
                      ),
                    ),
                    SizedBox(width: 6),
                    Text('/ tháng', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                  ],
                ),
                const Divider(height: 28),
                const Text(
                  'Đặc quyền dành riêng cho bạn:',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 12),
                _buildFeatureItem('Gợi ý thực đơn cá nhân hóa chuẩn BMI & bệnh lý'),
                _buildFeatureItem('Tự động lên kế hoạch bữa ăn 7 ngày thông minh'),
                _buildFeatureItem('Phân tích chuyên sâu vi chất & cảnh báo dị ứng'),
                _buildFeatureItem('Không giới hạn tìm kiếm & lưu công thức nấu ăn'),
                _buildFeatureItem('Trải nghiệm mượt mà, không quảng cáo làm phiền'),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isPremium ? Colors.grey.shade400 : AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: isPremium
                        ? null
                        : () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Vui lòng quét mã QR thanh toán trên website để kích hoạt Pro!'),
                              ),
                            );
                          },
                    child: Text(
                      isPremium ? 'Đang Sử Dụng' : 'Đăng Ký Ngay',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );

    if (!showAppBar) return body;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Gói SmartMeal Pro', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: body,
    );
  }

  Widget _buildFeatureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, color: AppColors.textPrimary, height: 1.3),
            ),
          ),
        ],
      ),
    );
  }
}

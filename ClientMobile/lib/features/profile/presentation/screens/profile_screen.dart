import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import '../widgets/change_password_dialog.dart';
import '../widgets/feedback_dialog.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            labelColor: AppColors.primary,
            unselectedLabelColor: Colors.grey,
            indicatorColor: AppColors.primary,
            tabs: [
              Tab(text: 'Hồ sơ cá nhân'),
              Tab(text: 'Gói Pro'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildPersonalInfo(context),
                _buildSubscriptionInfo(context),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPersonalInfo(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 16),
          CircleAvatar(
            radius: 50,
            backgroundImage: user?.avatar != null ? NetworkImage(user!.avatar!) : null,
            child: user?.avatar == null ? const Icon(Icons.person, size: 50) : null,
          ),
          const SizedBox(height: 24),
          _buildInfoField('Tên đăng nhập', user?.username ?? ''),
          const SizedBox(height: 16),
          _buildInfoField('Họ và tên', user?.name ?? ''),
          const SizedBox(height: 16),
          _buildInfoField('Email', user?.email ?? ''),
          const SizedBox(height: 16),
          _buildInfoField('Số điện thoại', user?.phone ?? ''),
          const SizedBox(height: 16),
          _buildInfoField('Địa chỉ', user?.address ?? ''),
          const SizedBox(height: 24),
          // Nút truy cập Hồ sơ Sức khỏe
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              leading: CircleAvatar(
                backgroundColor: AppColors.primaryLight.withValues(alpha: 0.3),
                child: const Icon(Icons.monitor_heart, color: AppColors.primaryDark),
              ),
              title: const Text(
                'Hồ sơ Sức khỏe & Dinh dưỡng',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              subtitle: const Text(
                'Chỉ số BMI, calo mục tiêu, bệnh lý & thực đơn',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              trailing: const Icon(Icons.chevron_right, color: AppColors.primaryDark),
              onTap: () {
                context.push('/health-profile');
              },
            ),
          ),
          const SizedBox(height: 12),
          // Đổi mật khẩu
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppColors.surfaceHover,
                child: Icon(Icons.lock_outline, color: AppColors.textPrimary),
              ),
              title: const Text('Đổi mật khẩu', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              subtitle: const Text('Cập nhật mật khẩu bảo mật tài khoản', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              trailing: const Icon(Icons.chevron_right, color: Colors.grey),
              onTap: () => ChangePasswordDialog.show(context),
            ),
          ),
          const SizedBox(height: 12),
          // Góp ý & Báo lỗi
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppColors.surfaceHover,
                child: Icon(Icons.feedback_outlined, color: AppColors.textPrimary),
              ),
              title: const Text('Góp ý & Báo lỗi', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              subtitle: const Text('Gửi phản hồi cho đội ngũ phát triển', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              trailing: const Icon(Icons.chevron_right, color: Colors.grey),
              onTap: () => FeedbackDialog.show(context),
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Colors.red,
              elevation: 0,
              side: const BorderSide(color: Colors.red),
              minimumSize: const Size(double.infinity, 50),
            ),
            onPressed: () {
              context.read<AuthProvider>().logout();
            },
            icon: const Icon(Icons.logout),
            label: const Text('Đăng xuất'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoField(String label, String value) {
    return TextField(
      readOnly: true,
      controller: TextEditingController(text: value),
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        filled: true,
        fillColor: Colors.grey[50],
      ),
    );
  }

  Widget _buildSubscriptionInfo(BuildContext context) {
    final isPremium = context.watch<AuthProvider>().isPremium;

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: isPremium 
                  ? const LinearGradient(colors: [Color(0xFFD4AF37), Color(0xFFF3E5AB)])
                  : const LinearGradient(colors: [Colors.grey, Colors.blueGrey]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Icon(isPremium ? Icons.workspace_premium : Icons.stars, size: 64, color: Colors.white),
                const SizedBox(height: 12),
                Text(
                  isPremium ? 'Đã đăng ký (Gói Pro)' : 'Gói Cơ Bản (Miễn phí)',
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  isPremium ? 'Bạn đang sử dụng toàn bộ tính năng' : 'Nâng cấp lên gói Pro để mở khóa',
                  style: const TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';

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
          const SizedBox(height: 12),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryLight.withValues(alpha: 0.2),
              foregroundColor: AppColors.primary,
              elevation: 0,
              minimumSize: const Size(double.infinity, 50),
            ),
            onPressed: () {
              Navigator.pushNamed(context, '/health-stats');
            },
            icon: const Icon(Icons.monitor_heart),
            label: const Text('Hồ sơ Sức khỏe & BMI'),
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

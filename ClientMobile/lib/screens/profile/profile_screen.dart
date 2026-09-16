import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/auth_provider.dart';

/// Profile screen – matching web's Profile.jsx
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Avatar + Name card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: const [BoxShadow(color: AppColors.shadowLight, blurRadius: 20, offset: Offset(0, 4))],
            ),
            child: Column(
              children: [
                // Avatar
                CircleAvatar(
                  radius: 48,
                  backgroundColor: AppColors.heroGradientMid,
                  backgroundImage: user?.avatar != null && user!.avatar!.isNotEmpty
                      ? NetworkImage(user.avatar!)
                      : null,
                  child: user?.avatar == null || user!.avatar!.isEmpty
                      ? Text(user?.initials ?? '?', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.primaryDark))
                      : null,
                ),
                const SizedBox(height: 12),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(user?.displayName ?? 'Bạn', style: AppTextStyles.heroTitle.copyWith(fontSize: 20)),
                    if (auth.isPremium) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: AppColors.premiumBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text('PRO', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.premiumText)),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(user?.email ?? '', style: AppTextStyles.bodySmall),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Menu items
          _buildMenuSection([
            _MenuItem(Icons.person_outline, 'Thông tin cá nhân', () {}),
            _MenuItem(Icons.health_and_safety_outlined, 'Hồ sơ sức khỏe', () {
              Navigator.of(context).pushNamed('/health-survey');
            }),
            _MenuItem(Icons.workspace_premium, auth.isPremium ? 'Gói Pro' : 'Nâng cấp Pro', () {
              Navigator.of(context).pushNamed('/subscription');
            }),
          ]),
          const SizedBox(height: 14),

          _buildMenuSection([
            _MenuItem(Icons.help_outline, 'Trợ giúp', () {}),
            _MenuItem(Icons.info_outline, 'Về SmartMeal', () {}),
          ]),
          const SizedBox(height: 14),

          // Logout
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: ListTile(
              leading: const Icon(Icons.logout, color: AppColors.favActive),
              title: const Text('Đăng xuất', style: TextStyle(color: AppColors.favActive, fontWeight: FontWeight.w600)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              onTap: () async {
                final confirm = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Đăng xuất'),
                    content: const Text('Bạn có chắc muốn đăng xuất?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('Đăng xuất', style: TextStyle(color: AppColors.favActive)),
                      ),
                    ],
                  ),
                );

                if (confirm == true && context.mounted) {
                  await context.read<AuthProvider>().logout();
                  if (context.mounted) Navigator.of(context).pushReplacementNamed('/login');
                }
              },
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildMenuSection(List<_MenuItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: items.asMap().entries.map((entry) {
          final item = entry.value;
          final isLast = entry.key == items.length - 1;

          return Column(
            children: [
              ListTile(
                leading: Icon(item.icon, color: AppColors.textSecondary),
                title: Text(item.title, style: AppTextStyles.bodyMedium),
                trailing: const Icon(Icons.chevron_right, color: AppColors.textHint),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                onTap: item.onTap,
              ),
              if (!isLast) Divider(height: 1, indent: 56, color: AppColors.divider),
            ],
          );
        }).toList(),
      ),
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final VoidCallback onTap;
  _MenuItem(this.icon, this.title, this.onTap);
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';

/// Drawer menu bên trái điều hướng ứng dụng theo Wireframe
class AppNavigationDrawer extends StatelessWidget {
  final int currentNavIndex;
  final Function(int)? onNavSelect;

  const AppNavigationDrawer({
    super.key,
    this.currentNavIndex = 0,
    this.onNavSelect,
  });

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final userName = auth.user?.name ?? auth.user?.username ?? 'Người dùng';
    final userEmail = auth.user?.email ?? 'user@smartmeal.vn';

    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            // Header drawer với thông tin người dùng
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: AppColors.primaryLight.withValues(alpha: 0.4),
                    child: const Text(
                      'AVT',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primaryDark,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          userName,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          userEmail,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.divider),
            const SizedBox(height: 12),

            // 1. Khám phá
            _buildMenuItem(
              context,
              icon: Icons.explore_outlined,
              title: 'Khám phá',
              isSelected: currentNavIndex == 0,
              onTap: () {
                Navigator.of(context).pop();
                onNavSelect?.call(0);
              },
            ),

            // 2. Nhật ký -> Điều hướng tới màn hình Nhật ký ăn uống
            _buildMenuItem(
              context,
              icon: Icons.menu_book_outlined,
              title: 'Nhật ký',
              isSelected: false,
              onTap: () {
                Navigator.of(context).pop();
                context.push('/diary');
              },
            ),

            // 3. Bộ sưu tập -> Mục yêu thích
            _buildMenuItem(
              context,
              icon: Icons.bookmarks_outlined,
              title: 'Bộ sưu tập',
              isSelected: currentNavIndex == 3,
              onTap: () {
                Navigator.of(context).pop();
                onNavSelect?.call(3);
              },
            ),

            // 4. Gói Pro
            _buildMenuItem(
              context,
              icon: Icons.workspace_premium_outlined,
              title: 'Gói Pro',
              badge: 'HOT',
              badgeColor: Colors.amber,
              onTap: () {
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Tính năng Gói Pro đang được phát triển')),
                );
              },
            ),

            // 5. Cài đặt
            _buildMenuItem(
              context,
              icon: Icons.settings_outlined,
              title: 'Cài đặt',
              isSelected: currentNavIndex == 4,
              onTap: () {
                Navigator.of(context).pop();
                onNavSelect?.call(4);
              },
            ),

            const Spacer(),
            const Divider(height: 1, color: AppColors.divider),

            // 6. Đăng xuất
            _buildMenuItem(
              context,
              icon: Icons.logout,
              title: 'Đăng xuất',
              textColor: Colors.redAccent,
              iconColor: Colors.redAccent,
              onTap: () async {
                Navigator.of(context).pop();
                await context.read<AuthProvider>().logout();
                if (context.mounted) {
                  context.go('/login');
                }
              },
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    bool isSelected = false,
    String? badge,
    Color? badgeColor,
    Color? textColor,
    Color? iconColor,
    required VoidCallback onTap,
  }) {
    final effectiveTextColor = textColor ?? (isSelected ? AppColors.primaryDark : AppColors.textPrimary);
    final effectiveIconColor = iconColor ?? (isSelected ? AppColors.primaryDark : AppColors.textSecondary);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: isSelected ? AppColors.primary.withValues(alpha: 0.12) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        leading: Icon(icon, color: effectiveIconColor, size: 24),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: effectiveTextColor,
          ),
        ),
        trailing: badge != null
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: (badgeColor ?? AppColors.primary).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: badgeColor ?? AppColors.primary,
                  ),
                ),
              )
            : null,
        onTap: onTap,
      ),
    );
  }
}

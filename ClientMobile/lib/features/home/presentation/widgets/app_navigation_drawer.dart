import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/diary/presentation/providers/nutrition_provider.dart';
import 'package:smart_meal/features/favorites/presentation/providers/favorite_provider.dart';

/// Drawer menu bên trái điều hướng ứng dụng theo format Web Sidebar
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
    final user = auth.user;
    final userName = user?.name ?? user?.username ?? 'Người dùng';
    final userEmail = user?.email ?? 'user@smartmeal.vn';
    final isPremium = auth.isPremium;
    final streak = context.watch<NutritionProvider>().streakDays;
    final favoritesCount = context.watch<FavoriteProvider>().favorites.length;
    final userInitial = (user?.name?.isNotEmpty == true
            ? user!.name![0]
            : user?.username?.isNotEmpty == true
                ? user!.username![0]
                : 'U')
        .toUpperCase();

    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            // Header drawer với thông tin người dùng
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: isPremium ? const Color(0xFFFFF7ED) : AppColors.primaryLight.withValues(alpha: 0.4),
                    backgroundImage: user?.avatar != null ? NetworkImage(user!.avatar!) : null,
                    child: user?.avatar == null
                        ? Text(
                            userInitial,
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: isPremium ? Colors.orange.shade800 : AppColors.primaryDark,
                              fontSize: 18,
                            ),
                          )
                        : null,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          userName,
                          style: const TextStyle(
                            fontSize: 16,
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

            // Stats mini cards (chuẩn theo Web Sidebar)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.orange.shade200),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.local_fire_department, color: Colors.orange, size: 15),
                              const SizedBox(width: 4),
                              Text(
                                '$streak ngày',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Colors.orange,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Liên tiếp',
                            style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: InkWell(
                      onTap: () {
                        Navigator.of(context).pop();
                        onNavSelect?.call(2);
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                        decoration: BoxDecoration(
                          color: Colors.pink.shade50,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.pink.shade200),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.favorite, color: Colors.pink, size: 15),
                                const SizedBox(width: 4),
                                Text(
                                  '$favoritesCount món',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                    color: Colors.pink,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Yêu thích',
                              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Divider(height: 1, color: AppColors.divider),
            const SizedBox(height: 8),
            const SizedBox(height: 12),

            // 1. Khám phá (matches Web /home)
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

            // 2. Nhật ký (matches Web /journal)
            _buildMenuItem(
              context,
              icon: Icons.menu_book_outlined,
              title: 'Nhật ký',
              isSelected: currentNavIndex == 1,
              onTap: () {
                Navigator.of(context).pop();
                onNavSelect?.call(1);
              },
            ),

            // 3. Bộ sưu tập (matches Web /favorites)
            _buildMenuItem(
              context,
              icon: Icons.favorite_border,
              title: 'Bộ sưu tập',
              isSelected: currentNavIndex == 2,
              onTap: () {
                Navigator.of(context).pop();
                onNavSelect?.call(2);
              },
            ),

            // 4. Gói Pro (matches Web /subscription)
            _buildMenuItem(
              context,
              icon: Icons.workspace_premium_outlined,
              title: 'Gói Pro',
              badge: isPremium ? 'PRO' : 'HOT',
              badgeColor: isPremium ? Colors.green : Colors.amber,
              isSelected: currentNavIndex == 3,
              onTap: () {
                Navigator.of(context).pop();
                onNavSelect?.call(3);
              },
            ),

            // 5. Cài đặt (matches Web /profile)
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

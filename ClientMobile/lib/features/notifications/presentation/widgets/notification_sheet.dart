import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import '../../domain/notification_item.dart';
import '../providers/notification_provider.dart';

class NotificationSheet extends StatefulWidget {
  final Function(int targetTab)? onActionSelect;

  const NotificationSheet({
    super.key,
    this.onActionSelect,
  });

  static Future<void> show(BuildContext context, {Function(int)? onActionSelect}) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => NotificationSheet(onActionSelect: onActionSelect),
    );
  }

  @override
  State<NotificationSheet> createState() => _NotificationSheetState();
}

class _NotificationSheetState extends State<NotificationSheet> {
  bool _filterUnreadOnly = false;

  String _formatTimestamp(DateTime dt) {
    final now = DateTime.now();
    final difference = now.difference(dt);

    if (difference.inMinutes < 1) {
      return 'Vừa xong';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} phút trước';
    } else if (difference.inHours < 24 && dt.day == now.day) {
      return 'Hôm nay ${DateFormat('HH:mm').format(dt)}';
    } else if (difference.inDays == 1 || (difference.inHours < 48 && dt.day == now.day - 1)) {
      return 'Hôm qua ${DateFormat('HH:mm').format(dt)}';
    } else {
      return DateFormat('dd/MM HH:mm').format(dt);
    }
  }

  Color _getEmojiBackgroundColor(NotificationType type) {
    switch (type) {
      case NotificationType.breakfast:
        return Colors.orange.shade50;
      case NotificationType.lunch:
        return Colors.green.shade50;
      case NotificationType.dinner:
        return Colors.indigo.shade50;
      case NotificationType.water:
        return Colors.blue.shade50;
      case NotificationType.streak:
        return Colors.red.shade50;
      case NotificationType.trending:
        return Colors.amber.shade50;
      case NotificationType.general:
        return AppColors.primaryLight.withValues(alpha: 0.2);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<NotificationProvider>();
    final allItems = provider.items;
    final displayedItems = _filterUnreadOnly
        ? allItems.where((item) => !item.isRead).toList()
        : allItems;
    final unreadCount = provider.unreadCount;

    return Container(
      height: MediaQuery.of(context).size.height * 0.82,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Drag handle
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 10, bottom: 8),
              width: 44,
              height: 4.5,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.notifications_active_outlined, color: AppColors.primary, size: 24),
                const SizedBox(width: 8),
                const Text(
                  'Thông Báo',
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (unreadCount > 0) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.redAccent.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$unreadCount mới',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.redAccent,
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: AppColors.textSecondary),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),

          // Action bar (Đánh dấu đã đọc + Thử thông báo Duolingo)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                // Filter Tất cả / Chưa đọc
                ChoiceChip(
                  label: Text('Tất cả (${allItems.length})'),
                  selected: !_filterUnreadOnly,
                  selectedColor: AppColors.primary.withValues(alpha: 0.15),
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: !_filterUnreadOnly ? FontWeight.bold : FontWeight.w500,
                    color: !_filterUnreadOnly ? AppColors.primaryDark : AppColors.textSecondary,
                  ),
                  onSelected: (val) => setState(() => _filterUnreadOnly = false),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: Text('Chưa đọc ($unreadCount)'),
                  selected: _filterUnreadOnly,
                  selectedColor: AppColors.primary.withValues(alpha: 0.15),
                  labelStyle: TextStyle(
                    fontSize: 12,
                    fontWeight: _filterUnreadOnly ? FontWeight.bold : FontWeight.w500,
                    color: _filterUnreadOnly ? AppColors.primaryDark : AppColors.textSecondary,
                  ),
                  onSelected: (val) => setState(() => _filterUnreadOnly = true),
                ),
                const Spacer(),
                if (unreadCount > 0)
                  TextButton.icon(
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                      visualDensity: VisualDensity.compact,
                    ),
                    icon: const Icon(Icons.done_all, size: 16, color: AppColors.primary),
                    label: const Text(
                      'Đọc hết',
                      style: TextStyle(fontSize: 12, color: AppColors.primary, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () => provider.markAllAsRead(),
                  ),
              ],
            ),
          ),

          // Nút thử nghiệm nhanh thông báo Duolingo Nudge
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
            child: InkWell(
              onTap: () async {
                await provider.triggerRandomDuolingoNudge();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('🔔 Đã bắn 1 thông báo Duolingo lên điện thoại của bạn!'),
                      duration: Duration(seconds: 2),
                    ),
                  );
                }
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  children: [
                    const Text('🥑', style: TextStyle(fontSize: 20)),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Thử nghiệm thông báo Duolingo',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF166534),
                            ),
                          ),
                          Text(
                            'Bấm để bắn thông báo nhắc giờ ăn / món hot lên điện thoại ngay',
                            style: TextStyle(fontSize: 11, color: Color(0xFF15803D)),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green.shade600,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.bolt, color: Colors.white, size: 14),
                          SizedBox(width: 2),
                          Text(
                            'Thử ngay',
                            style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const Divider(height: 1, color: AppColors.divider),

          // List of notifications
          Expanded(
            child: displayedItems.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text('🥑', style: TextStyle(fontSize: 48)),
                        const SizedBox(height: 12),
                        Text(
                          _filterUnreadOnly ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Các lời nhắc giờ ăn và món ngon sẽ xuất hiện tại đây',
                          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    itemCount: displayedItems.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final item = displayedItems[index];
                      return _buildNotificationCard(context, item, provider);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    NotificationItem item,
    NotificationProvider provider,
  ) {
    return InkWell(
      onTap: () {
        provider.markAsRead(item.id);
        if (item.targetTab != null) {
          Navigator.of(context).pop();
          widget.onActionSelect?.call(item.targetTab!);
        }
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: item.isRead ? Colors.white : Colors.green.shade50.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: item.isRead ? AppColors.border : AppColors.primaryLight.withValues(alpha: 0.6),
            width: item.isRead ? 1 : 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: item.isRead ? 0.02 : 0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Emoji avatar
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: _getEmojiBackgroundColor(item.type),
                borderRadius: BorderRadius.circular(12),
              ),
              alignment: Alignment.center,
              child: Text(
                item.emoji,
                style: const TextStyle(fontSize: 22),
              ),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          item.title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: item.isRead ? FontWeight.w600 : FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (!item.isRead) ...[
                        const SizedBox(width: 6),
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.body,
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: AppColors.textSecondary,
                      height: 1.35,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _formatTimestamp(item.timestamp),
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade500,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smart_meal/features/notifications/domain/notification_item.dart';
import 'package:smart_meal/features/notifications/presentation/providers/notification_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('NotificationItem tests', () {
    test('NotificationItem correctly serializes to and from Map/JSON', () {
      final now = DateTime(2026, 10, 14, 12, 0, 0);
      final item = NotificationItem(
        id: 'test_1',
        title: '🍳 Tới giờ ăn sáng rồi bạn ơi!',
        body: 'Nạp năng lượng khởi đầu ngày mới thật bùng nổ nhé!',
        type: NotificationType.breakfast,
        emoji: '🍳',
        timestamp: now,
        isRead: false,
        targetTab: 0,
      );

      final jsonStr = item.toJson();
      final restored = NotificationItem.fromJson(jsonStr);

      expect(restored.id, 'test_1');
      expect(restored.title, item.title);
      expect(restored.body, item.body);
      expect(restored.type, NotificationType.breakfast);
      expect(restored.emoji, '🍳');
      expect(restored.timestamp, now);
      expect(restored.isRead, false);
      expect(restored.targetTab, 0);
    });

    test('NotificationItem copyWith modifies fields correctly', () {
      final item = NotificationItem(
        id: 'test_2',
        title: 'Bữa trưa',
        body: 'Salad gà',
        type: NotificationType.lunch,
        emoji: '🥗',
        timestamp: DateTime.now(),
        isRead: false,
      );

      final readItem = item.copyWith(isRead: true);
      expect(readItem.isRead, true);
      expect(readItem.title, 'Bữa trưa');
    });
  });

  group('NotificationProvider tests', () {
    test('NotificationProvider initializes with default Duolingo notifications', () async {
      final provider = NotificationProvider();
      await provider.loadNotifications();

      expect(provider.items.isNotEmpty, true);
      expect(provider.unreadCount, greaterThan(0));
    });

    test('markAsRead updates item isRead state and unread count', () async {
      final provider = NotificationProvider();
      await provider.loadNotifications();

      final firstUnread = provider.items.firstWhere((i) => !i.isRead);
      final initialUnreadCount = provider.unreadCount;

      await provider.markAsRead(firstUnread.id);

      expect(provider.unreadCount, initialUnreadCount - 1);
      final updated = provider.items.firstWhere((i) => i.id == firstUnread.id);
      expect(updated.isRead, true);
    });

    test('markAllAsRead sets all items to isRead = true', () async {
      final provider = NotificationProvider();
      await provider.loadNotifications();

      await provider.markAllAsRead();
      expect(provider.unreadCount, 0);
      for (final item in provider.items) {
        expect(item.isRead, true);
      }
    });

    test('addNotification adds item to the beginning of the list', () async {
      final provider = NotificationProvider();
      await provider.loadNotifications();

      final customItem = NotificationItem(
        id: 'custom_1',
        title: '🔥 Món ăn thịnh hành',
        body: 'Hôm nay ăn phở nhé!',
        type: NotificationType.trending,
        emoji: '🍜',
        timestamp: DateTime.now(),
        isRead: false,
        targetTab: 0,
      );

      await provider.addNotification(customItem, showSystemNotification: false);

      expect(provider.items.first.id, 'custom_1');
      expect(provider.items.first.title, '🔥 Món ăn thịnh hành');
    });
  });
}

import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/notification_item.dart';
import '../../data/notification_service.dart';

class NotificationProvider extends ChangeNotifier {
  static const String _storageKey = 'smartmeal_in_app_notifications';

  final NotificationService _service = NotificationService();
  List<NotificationItem> _items = [];
  bool _loading = false;

  List<NotificationItem> get items => List.unmodifiable(_items);
  bool get loading => _loading;
  int get unreadCount => _items.where((i) => !i.isRead).length;

  NotificationProvider() {
    loadNotifications();
  }

  Future<void> initialize() async {
    await _service.initialize(
      onNotificationTap: (payload) {
        // Có thể bắt tap khi mở từ thanh thông báo hệ thống
      },
    );
    await loadNotifications();
  }

  Future<void> loadNotifications() async {
    _loading = true;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final rawList = prefs.getStringList(_storageKey);

      if (rawList != null && rawList.isNotEmpty) {
        _items = rawList.map((str) => NotificationItem.fromJson(str)).toList();
        // Sắp xếp thông báo mới nhất lên đầu
        _items.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      } else {
        // Khởi tạo các thông báo mẫu phong cách Duolingo lần đầu
        _items = _getInitialDuolingoNotifications();
        await _saveToStorage();
      }
    } catch (e) {
      debugPrint('Error loading notifications: $e');
      if (_items.isEmpty) {
        _items = _getInitialDuolingoNotifications();
      }
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> markAsRead(String id) async {
    final index = _items.indexWhere((item) => item.id == id);
    if (index != -1 && !_items[index].isRead) {
      _items[index] = _items[index].copyWith(isRead: true);
      notifyListeners();
      await _saveToStorage();
    }
  }

  Future<void> markAllAsRead() async {
    bool hasChanged = false;
    _items = _items.map((item) {
      if (!item.isRead) {
        hasChanged = true;
        return item.copyWith(isRead: true);
      }
      return item;
    }).toList();

    if (hasChanged) {
      notifyListeners();
      await _saveToStorage();
    }
  }

  Future<void> addNotification(NotificationItem item, {bool showSystemNotification = true}) async {
    _items.insert(0, item);
    notifyListeners();
    await _saveToStorage();

    if (showSystemNotification) {
      await _service.triggerDuolingoNudge(item);
    }
  }

  Future<void> removeNotification(String id) async {
    _items.removeWhere((item) => item.id == id);
    notifyListeners();
    await _saveToStorage();
  }

  Future<void> clearAll() async {
    _items.clear();
    notifyListeners();
    await _saveToStorage();
  }

  /// Bắn một thông báo Duolingo Nudge ngẫu nhiên (dùng để test & demo tính năng tức thì)
  Future<void> triggerRandomDuolingoNudge() async {
    final templates = _duolingoNudgePool;
    final random = Random();
    final template = templates[random.nextInt(templates.length)];

    final newNotif = NotificationItem(
      id: 'nudge_${DateTime.now().millisecondsSinceEpoch}',
      title: template['title'] as String,
      body: template['body'] as String,
      type: template['type'] as NotificationType,
      emoji: template['emoji'] as String,
      timestamp: DateTime.now(),
      isRead: false,
      targetTab: template['targetTab'] as int?,
    );

    await addNotification(newNotif, showSystemNotification: true);
  }

  Future<void> _saveToStorage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rawList = _items.map((item) => item.toJson()).toList();
      await prefs.setStringList(_storageKey, rawList);
    } catch (e) {
      debugPrint('Error saving notifications: $e');
    }
  }

  List<NotificationItem> _getInitialDuolingoNotifications() {
    final now = DateTime.now();
    return [
      NotificationItem(
        id: 'init_1',
        title: '🔥 Món ăn được nhiều người chọn nhất hôm nay',
        body: 'Hơn 500 thành viên SmartMeal đã nấu món "Cơm gạo lứt bò lúc lắc" trưa nay. Bấm để xem công thức ngay!',
        type: NotificationType.trending,
        emoji: '🥩',
        timestamp: now.subtract(const Duration(minutes: 15)),
        isRead: false,
        targetTab: 0,
      ),
      NotificationItem(
        id: 'init_2',
        title: '🍳 Tới giờ ăn sáng rồi bạn ơi!',
        body: 'Nạp năng lượng khởi đầu ngày mới thật bùng nổ nhé! Đừng để chiếc bụng đói réo gọi lúc 10h 🥑',
        type: NotificationType.breakfast,
        emoji: '🍳',
        timestamp: now.subtract(const Duration(hours: 3)),
        isRead: false,
        targetTab: 0,
      ),
      NotificationItem(
        id: 'init_3',
        title: '🔥 Đừng để mất chuỗi ngày liên tiếp!',
        body: 'Bạn đang có chuỗi Streak ăn uống lành mạnh rất ấn tượng! Dành 1 phút ghi nhật ký hôm nay nhé.',
        type: NotificationType.streak,
        emoji: '🔥',
        timestamp: now.subtract(const Duration(hours: 8)),
        isRead: true,
        targetTab: 1,
      ),
    ];
  }

  static const List<Map<String, dynamic>> _duolingoNudgePool = [
    {
      'title': '🍳 Tới giờ ăn sáng rồi bạn ơi!',
      'body': 'Bữa sáng lành mạnh giúp não bộ minh mẫn gấp 2 lần. Bơ Mascot đang đợi bạn mở app ăn sáng nè! 🥑',
      'type': NotificationType.breakfast,
      'emoji': '🍳',
      'targetTab': 0,
    },
    {
      'title': '🥗 Trưa nay ăn gì ngon mà khoẻ?',
      'body': 'Món "Salad ức gà sốt mè rang" đang đứng Top 1 thịnh hành hôm nay. Khám phá thực đơn ngay!',
      'type': NotificationType.lunch,
      'emoji': '🥗',
      'targetTab': 0,
    },
    {
      'title': '🍲 Bữa tối ấm cúng đã sẵn sàng chưa?',
      'body': 'Tối nay nên ăn thanh đạm để dễ tiêu hóa và ngủ ngon. Gợi ý: Canh rong biển đậu hũ siêu nhẹ bụng!',
      'type': NotificationType.dinner,
      'emoji': '🍲',
      'targetTab': 0,
    },
    {
      'title': '💧 Uống miếng nước cho tỉnh táo nào!',
      'body': 'Đã 2 tiếng trôi qua, cơ thể bạn đang cần được cấp nước đấy! Uống một ly nước lọc ngay nào bạn ơi.',
      'type': NotificationType.water,
      'emoji': '💧',
      'targetTab': 1,
    },
    {
      'title': '🔥 Đừng để chuỗi Streak biến mất!',
      'body': 'Chỉ còn vài tiếng nữa thôi! Hãy ghi lại bữa ăn hôm nay để bảo vệ chuỗi ngày liên tiếp của bạn nhé.',
      'type': NotificationType.streak,
      'emoji': '🔥',
      'targetTab': 1,
    },
    {
      'title': '🔥 Món ăn được nhiều người chọn nhất hôm nay',
      'body': 'Món "Cá hồi áp chảo sốt chanh leo" đang sốt xình xịch trong cộng đồng hôm nay. Xem cách làm cực dễ!',
      'type': NotificationType.trending,
      'emoji': '🐟',
      'targetTab': 0,
    },
  ];
}

import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import '../domain/notification_item.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  bool _isInitialized = false;

  static const String channelId = 'smartmeal_meal_reminders';
  static const String channelName = 'Nhắc nhở bữa ăn & Dinh dưỡng SmartMeal';
  static const String channelDescription =
      'Thông báo nhắc nhở giờ ăn, thực đơn thịnh hành và giữ chuỗi streak phong cách Duolingo';

  Future<void> initialize({Function(String?)? onNotificationTap}) async {
    if (_isInitialized) return;

    try {
      tz.initializeTimeZones();
    } catch (e) {
      debugPrint('Error initializing timezones: $e');
    }

    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      settings: initSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        onNotificationTap?.call(response.payload);
      },
    );

    // Request permissions on Android 13+ and iOS
    await requestPermissions();

    _isInitialized = true;

    // Automatically schedule default daily meal times
    await scheduleDailyMealReminders();
  }

  Future<bool> requestPermissions() async {
    try {
      final androidImplementation =
          _localNotifications.resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>();
      if (androidImplementation != null) {
        await androidImplementation.requestNotificationsPermission();
      }

      final iosImplementation =
          _localNotifications.resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>();
      if (iosImplementation != null) {
        await iosImplementation.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
      }
      return true;
    } catch (e) {
      debugPrint('Failed to request notification permissions: $e');
      return false;
    }
  }

  NotificationDetails _notificationDetails() {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      channelId,
      channelName,
      channelDescription: channelDescription,
      importance: Importance.max,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );

    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    return const NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
  }

  /// Hiển thị thông báo ngay lập tức trên điện thoại
  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    try {
      await _localNotifications.show(
        id: id,
        title: title,
        body: body,
        notificationDetails: _notificationDetails(),
        payload: payload,
      );
    } catch (e) {
      debugPrint('Error showing local notification: $e');
    }
  }

  /// Bắn thông báo Duolingo Nudge từ NotificationItem
  Future<void> triggerDuolingoNudge(NotificationItem item) async {
    final id = item.timestamp.millisecondsSinceEpoch ~/ 1000;
    await showNotification(
      id: id,
      title: item.title,
      body: item.body,
      payload: item.targetTab?.toString(),
    );
  }

  /// Lên lịch các mốc thông báo hàng ngày (Sáng, Trưa, Xế, Tối, Nhắc streak)
  Future<void> scheduleDailyMealReminders() async {
    try {
      // 1. Bữa sáng: 07:30
      await _scheduleDaily(
        id: 101,
        hour: 7,
        minute: 30,
        title: '🍳 Tới giờ ăn sáng rồi bạn ơi!',
        body: 'Nạp năng lượng khởi đầu ngày mới thật bùng nổ nhé! Đừng để chiếc bụng đói réo gọi lúc 10h 🥑',
        payload: '0',
      );

      // 2. Bữa trưa: 12:00
      await _scheduleDaily(
        id: 102,
        hour: 12,
        minute: 0,
        title: '🥗 Trưa nay ăn gì ngon mà khoẻ?',
        body: 'Món "Salad ức gà sốt mè rang" đang được cộng đồng chọn nhiều nhất hôm nay! Khám phá ngay nhé!',
        payload: '0',
      );

      // 3. Giờ xế uống nước: 15:30
      await _scheduleDaily(
        id: 103,
        hour: 15,
        minute: 30,
        title: '💧 Uống miếng nước cho tỉnh táo nào!',
        body: 'Bạn đã uống đủ 1.5L nước hôm nay chưa? Uống một ly nước lọc để da đẹp và tập trung hơn nhé!',
        payload: '1',
      );

      // 4. Bữa tối: 19:00
      await _scheduleDaily(
        id: 104,
        hour: 19,
        minute: 0,
        title: '🍲 Bữa tối ấm cúng đã sẵn sàng chưa?',
        body: 'Tối nay nên ăn thanh đạm để dễ tiêu hóa và ngủ ngon. Gợi ý: Canh rong biển đậu hũ siêu nhẹ bụng!',
        payload: '0',
      );

      // 5. Nhắc nhở giữ chuỗi Streak (20:30) - Phong cách Duolingo
      await _scheduleDaily(
        id: 105,
        hour: 20,
        minute: 30,
        title: '🔥 Đừng để mất chuỗi ngày liên tiếp!',
        body: 'Chỉ còn vài tiếng nữa là hết ngày! Dành 30 giây ghi lại nhật ký ăn uống để duy trì chuỗi Streak nhé!',
        payload: '1',
      );
    } catch (e) {
      debugPrint('Error scheduling daily reminders: $e');
    }
  }

  Future<void> _scheduleDaily({
    required int id,
    required int hour,
    required int minute,
    required String title,
    required String body,
    String? payload,
  }) async {
    final tz.TZDateTime scheduledDate = _nextInstanceOfTime(hour, minute);

    await _localNotifications.zonedSchedule(
      id: id,
      title: title,
      body: body,
      scheduledDate: scheduledDate,
      notificationDetails: _notificationDetails(),
      androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      matchDateTimeComponents: DateTimeComponents.time,
      payload: payload,
    );
  }

  tz.TZDateTime _nextInstanceOfTime(int hour, int minute) {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      hour,
      minute,
    );

    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }

  Future<void> cancelAll() async {
    await _localNotifications.cancelAll();
  }
}

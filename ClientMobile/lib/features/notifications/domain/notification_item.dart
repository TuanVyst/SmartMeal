import 'dart:convert';

enum NotificationType {
  breakfast,
  lunch,
  dinner,
  water,
  streak,
  trending,
  general,
}

class NotificationItem {
  final String id;
  final String title;
  final String body;
  final NotificationType type;
  final String emoji;
  final DateTime timestamp;
  final bool isRead;
  final int? targetTab; // 0: Khám phá, 1: Nhật ký, 2: Bộ sưu tập, 3: Gói Pro, 4: Cài đặt

  const NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.emoji,
    required this.timestamp,
    this.isRead = false,
    this.targetTab,
  });

  NotificationItem copyWith({
    String? id,
    String? title,
    String? body,
    NotificationType? type,
    String? emoji,
    DateTime? timestamp,
    bool? isRead,
    int? targetTab,
  }) {
    return NotificationItem(
      id: id ?? this.id,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      emoji: emoji ?? this.emoji,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      targetTab: targetTab ?? this.targetTab,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'body': body,
      'type': type.name,
      'emoji': emoji,
      'timestamp': timestamp.toIso8601String(),
      'isRead': isRead,
      'targetTab': targetTab,
    };
  }

  factory NotificationItem.fromMap(Map<String, dynamic> map) {
    return NotificationItem(
      id: map['id'] as String,
      title: map['title'] as String,
      body: map['body'] as String,
      type: NotificationType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => NotificationType.general,
      ),
      emoji: map['emoji'] as String? ?? '🥑',
      timestamp: DateTime.tryParse(map['timestamp'] as String? ?? '') ?? DateTime.now(),
      isRead: map['isRead'] as bool? ?? false,
      targetTab: map['targetTab'] as int?,
    );
  }

  String toJson() => json.encode(toMap());

  factory NotificationItem.fromJson(String source) =>
      NotificationItem.fromMap(json.decode(source) as Map<String, dynamic>);
}

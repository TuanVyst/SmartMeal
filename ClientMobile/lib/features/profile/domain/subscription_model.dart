/// Subscription plan model
class SubscriptionPlan {
  final String? planId;
  final String? name;
  final String? description;
  final double? price;
  final int? durationDays;
  final List<String> features;

  SubscriptionPlan({
    this.planId,
    this.name,
    this.description,
    this.price,
    this.durationDays,
    this.features = const [],
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlan(
      planId: json['plan_id']?.toString() ?? json['planId']?.toString(),
      name: json['name'] as String?,
      description: json['description'] as String?,
      price: _toDouble(json['price']),
      durationDays: json['durationDays'] as int? ?? json['duration_days'] as int?,
      features: (json['features'] as List?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  bool get isFree => (price ?? 0) == 0;

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }
}

/// Active subscription
class Subscription {
  final String? subscriptionId;
  final String? accountId;
  final String? planId;
  final String? status;
  final DateTime? startDate;
  final DateTime? endDate;

  Subscription({
    this.subscriptionId,
    this.accountId,
    this.planId,
    this.status,
    this.startDate,
    this.endDate,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      subscriptionId: json['subscription_id']?.toString() ?? json['subscriptionId']?.toString(),
      accountId: json['account_id']?.toString() ?? json['accountId']?.toString(),
      planId: json['plan_id']?.toString() ?? json['planId']?.toString(),
      status: json['status'] as String?,
      startDate: _parseDate(json['startDate'] ?? json['start_date']),
      endDate: _parseDate(json['endDate'] ?? json['end_date']),
    );
  }

  bool get isActive {
    if (status != 'active') return false;
    if (endDate == null) return true;
    return endDate!.isAfter(DateTime.now());
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is String) return DateTime.tryParse(value);
    return null;
  }
}

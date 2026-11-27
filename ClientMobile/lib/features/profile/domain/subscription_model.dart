/// Subscription plan model
class SubscriptionPlan {
  final String? planId;
  final String? name;
  final String? description;
  final double? price;
  final int? durationDays;
  final List<String> features;

  /// Server-computed price actually charged (equals [price] when no promotion).
  final double? effectivePrice;
  final double? salePercent;
  final DateTime? saleStartAt;
  final DateTime? saleEndAt;
  final bool isOnSale;
  final String? promotionName;

  SubscriptionPlan({
    this.planId,
    this.name,
    this.description,
    this.price,
    this.durationDays,
    this.features = const [],
    this.effectivePrice,
    this.salePercent,
    this.saleStartAt,
    this.saleEndAt,
    this.isOnSale = false,
    this.promotionName,
  });

  double get chargeablePrice => effectivePrice ?? price ?? 0;

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    List<String> parsedFeatures = [];
    final rawFeatures = json['features'] ?? json['Features'];
    if (rawFeatures is List) {
      parsedFeatures = rawFeatures.map((e) => e.toString()).toList();
    } else if (rawFeatures is String && rawFeatures.trim().isNotEmpty) {
      parsedFeatures = rawFeatures.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    }

    return SubscriptionPlan(
      planId: json['plan_id']?.toString() ??
          json['Plan_id']?.toString() ??
          json['planId']?.toString() ??
          json['id']?.toString() ??
          json['Id']?.toString(),
      name: (json['name'] ?? json['Name']) as String?,
      description: (json['description'] ?? json['Description']) as String?,
      price: _toDouble(json['price'] ?? json['Price']),
      durationDays: (json['duration'] ??
              json['Duration'] ??
              json['durationDays'] ??
              json['duration_days'] ??
              json['DurationDays']) as int?,
      features: parsedFeatures,
      effectivePrice: _toDouble(json['effectivePrice'] ?? json['EffectivePrice'] ?? json['effective_price']),
      salePercent: _toDouble(json['salePercent'] ?? json['SalePercent'] ?? json['sale_percent']),
      saleStartAt: _parseIsoDate(json['saleStartAt'] ?? json['SaleStartAt'] ?? json['sale_start_at']),
      saleEndAt: _parseIsoDate(json['saleEndAt'] ?? json['SaleEndAt'] ?? json['sale_end_at']),
      isOnSale: (json['isOnSale'] ?? json['IsOnSale'] ?? json['is_on_sale']) == true,
      promotionName: (json['promotionName'] ?? json['PromotionName']) as String?,
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
      subscriptionId: json['sub_id']?.toString() ??
          json['Sub_id']?.toString() ??
          json['subscription_id']?.toString() ??
          json['subscriptionId']?.toString() ??
          json['id']?.toString(),
      accountId: json['account_id']?.toString() ??
          json['Account_id']?.toString() ??
          json['accountId']?.toString(),
      planId: json['plan_id']?.toString() ??
          json['Plan_id']?.toString() ??
          json['planId']?.toString(),
      status: (json['status'] ?? json['Status']) as String?,
      startDate: _parseDate(json['startDate'] ?? json['start_date'] ?? json['StartDate']),
      endDate: _parseDate(json['endDate'] ?? json['end_date'] ?? json['EndDate']),
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

DateTime? _parseIsoDate(dynamic value) {
  if (value == null) return null;
  if (value is String) return DateTime.tryParse(value);
  return null;
}

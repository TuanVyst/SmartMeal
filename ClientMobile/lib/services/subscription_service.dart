import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../models/subscription.dart';

/// Subscription service – mapped from web's subscriptionService.js
class SubscriptionService {
  final ApiClient _api = ApiClient();

  Future<List<SubscriptionPlan>> getAllPlans() async {
    final response = await _api.get(ApiConstants.plans);
    final data = response.data['data'] as List? ?? [];
    return data.map((e) => SubscriptionPlan.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Subscription>> getByAccountId(String accountId) async {
    final response = await _api.get(ApiConstants.subscription, queryParameters: {
      'accountId': accountId,
    });
    final data = response.data['data'] as List? ?? [];
    return data.map((e) => Subscription.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<Map<String, dynamic>> createPayment(Map<String, dynamic> data) async {
    final response = await _api.post(ApiConstants.paymentCreate, data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> checkPaymentStatus(String orderCode) async {
    final response = await _api.get('${ApiConstants.paymentCheckStatus}/$orderCode');
    return response.data as Map<String, dynamic>;
  }
}

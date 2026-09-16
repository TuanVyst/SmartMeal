import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';

/// Allergy service – mapped from web's allergyService.js
class AllergyService {
  final ApiClient _api = ApiClient();

  Future<List<Map<String, dynamic>>> getAll(String accountId) async {
    final response = await _api.get(ApiConstants.allergy, queryParameters: {
      'accountId': accountId,
    });
    return (response.data['data'] as List? ?? []).cast<Map<String, dynamic>>();
  }

  Future<void> create(Map<String, dynamic> data) async {
    await _api.post(ApiConstants.allergy, data: data);
  }

  Future<void> delete(String id) async {
    await _api.delete('${ApiConstants.allergy}/$id');
  }
}

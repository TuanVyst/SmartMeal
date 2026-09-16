import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';
import '../models/health_profile.dart';

/// Health survey service – mapped from web's healthSurveyService.js
class HealthSurveyService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> submitSurvey(Map<String, dynamic> data) async {
    final response = await _api.post(ApiConstants.healthSurvey, data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<HealthProfile?> getProfile() async {
    try {
      final response = await _api.get(ApiConstants.healthProfile);
      final data = response.data;
      if (data != null && data['profile'] != null) {
        return HealthProfile.fromJson(data['profile'] as Map<String, dynamic>);
      }
      if (data != null && data is Map<String, dynamic>) {
        return HealthProfile.fromJson(data);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await _api.put(ApiConstants.healthProfile, data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getBmiHistory() async {
    final response = await _api.get(ApiConstants.bmiHistory);
    return response.data['data'] as List? ?? [];
  }
}

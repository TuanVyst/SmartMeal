import 'package:smart_meal/core/network/api_client.dart';
import 'package:smart_meal/core/constants/api_constants.dart';

class ProfileRemoteDataSource {
  final ApiClient _api;

  ProfileRemoteDataSource({ApiClient? api}) : _api = api ?? ApiClient();

  Future<Map<String, dynamic>> submitHealthSurvey(Map<String, dynamic> surveyData) async {
    final response = await _api.post(ApiConstants.healthSurvey, data: surveyData);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getHealthProfile() async {
    final response = await _api.get(ApiConstants.healthProfile);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> updateHealthProfile(Map<String, dynamic> profileData) async {
    final response = await _api.put(ApiConstants.healthProfile, data: profileData);
    return response.data as Map<String, dynamic>;
  }

  Future<List<dynamic>> getBmiHistory() async {
    final response = await _api.get(ApiConstants.bmiHistory);
    return response.data['data'] as List? ?? [];
  }
}

import 'health_profile_model.dart';
import '../data/profile_remote_data_source.dart';

class ProfileRepository {
  final ProfileRemoteDataSource _remoteDataSource;

  ProfileRepository({ProfileRemoteDataSource? remoteDataSource}) 
      : _remoteDataSource = remoteDataSource ?? ProfileRemoteDataSource();

  Future<HealthProfile?> submitHealthSurvey(Map<String, dynamic> data) async {
    final res = await _remoteDataSource.submitHealthSurvey(data);
    if (res['success'] == true && res['profile'] != null) {
      return HealthProfile.fromJson(res['profile']);
    }
    return null;
  }

  Future<HealthProfile?> getHealthProfile() async {
    final res = await _remoteDataSource.getHealthProfile();
    if (res['success'] == true && res['profile'] != null) {
      return HealthProfile.fromJson(res['profile']);
    }
    return null;
  }

  Future<HealthProfile?> updateHealthProfile(Map<String, dynamic> data) async {
    final res = await _remoteDataSource.updateHealthProfile(data);
    if (res['success'] == true && res['profile'] != null) {
      return HealthProfile.fromJson(res['profile']);
    }
    return null;
  }

  Future<List<dynamic>> getBmiHistory() async {
    return await _remoteDataSource.getBmiHistory();
  }
}

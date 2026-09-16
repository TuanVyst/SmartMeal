import '../core/network/api_client.dart';
import '../core/constants/api_constants.dart';

/// Auth service – mapped 1-1 from web's authService.js
class AuthService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> login(String emailOrUsername, String password) async {
    final response = await _api.post(ApiConstants.login, data: {
      'emailOrUsername': emailOrUsername,
      'password': password,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    final response = await _api.post(ApiConstants.register, data: data);
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyOtp(String email, String otpCode) async {
    final response = await _api.post(ApiConstants.verifyOtp, data: {
      'email': email,
      'otpCode': otpCode,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyRegisterOtp(String email, String otpCode) async {
    final response = await _api.post(ApiConstants.verifyRegisterOtp, data: {
      'email': email,
      'otpCode': otpCode,
    });
    return response.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> googleLogin(String idToken) async {
    final response = await _api.post(ApiConstants.googleLogin, data: {
      'idToken': idToken,
    });
    return response.data as Map<String, dynamic>;
  }
}

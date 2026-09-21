import 'package:smart_meal/features/profile/domain/user_model.dart';
import '../data/auth_remote_data_source.dart';

class AuthResult {
  final User? user;
  final bool requiresOtp;
  final String? email;
  final String? message;
  
  AuthResult({this.user, this.requiresOtp = false, this.email, this.message});
}

class AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;

  AuthRepository({AuthRemoteDataSource? remoteDataSource}) 
      : _remoteDataSource = remoteDataSource ?? AuthRemoteDataSource();

  AuthResult _mapToResult(Map<String, dynamic> data) {
    if (data['requiresOtp'] == true) {
      return AuthResult(
        requiresOtp: true,
        email: data['email'] as String?,
        message: data['message'] as String?,
      );
    }
    return AuthResult(user: User.fromJson(data));
  }

  Future<AuthResult> login(String emailOrUsername, String password) async {
    final data = await _remoteDataSource.login(emailOrUsername, password);
    return _mapToResult(data);
  }

  Future<AuthResult> register(Map<String, dynamic> credentials) async {
    final data = await _remoteDataSource.register(credentials);
    return _mapToResult(data);
  }

  Future<AuthResult> verifyOtp(String email, String otpCode) async {
    final data = await _remoteDataSource.verifyOtp(email, otpCode);
    return _mapToResult(data);
  }

  Future<AuthResult> verifyRegisterOtp(String email, String otpCode) async {
    final data = await _remoteDataSource.verifyRegisterOtp(email, otpCode);
    return _mapToResult(data);
  }

  Future<AuthResult> googleLogin(String idToken) async {
    final data = await _remoteDataSource.googleLogin(idToken);
    return _mapToResult(data);
  }
}

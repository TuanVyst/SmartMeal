import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:smart_meal/features/profile/domain/user_model.dart';
import 'package:smart_meal/features/profile/domain/subscription_model.dart' as sub_model;
import 'package:smart_meal/features/auth/domain/auth_repository.dart';
import 'package:smart_meal/features/profile/data/subscription_service.dart';
import 'package:smart_meal/core/storage/secure_storage.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository = AuthRepository();
  final SubscriptionService _subscriptionService = SubscriptionService();
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  User? _user;
  bool _loading = true;
  sub_model.Subscription? _subscription;
  bool _isPremium = false;

  User? get user => _user;
  bool get loading => _loading;
  bool get isLoggedIn => _user != null;
  sub_model.Subscription? get subscription => _subscription;
  bool get isPremium => _isPremium;
  String? get accountId => _user?.accountId;

  AuthProvider() {
    _loadStoredUser();
  }

  Future<void> _loadStoredUser() async {
    try {
      final token = await SecureStorage.getToken();
      final prefs = await SharedPreferences.getInstance();
      final userJson = prefs.getString('user');

      if (token != null && userJson != null) {
        _user = User.fromJson(jsonDecode(userJson));
        if (_user?.accountId != null) {
          await _checkPremiumStatus(_user!.accountId!);
        }
      }
    } catch (e) {
      debugPrint('Error loading stored user: $e');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<AuthResult> login(String emailOrUsername, String password) async {
    final result = await _authRepository.login(emailOrUsername, password);
    if (!result.requiresOtp && result.user != null) {
      await _saveUser(result.user!);
    }
    return result;
  }

  Future<AuthResult> verifyOtp(String email, String otpCode) async {
    final result = await _authRepository.verifyOtp(email, otpCode);
    if (result.user != null) {
      await _saveUser(result.user!);
    }
    return result;
  }

  Future<AuthResult> register(Map<String, dynamic> credentials) async {
    final result = await _authRepository.register(credentials);
    if (!result.requiresOtp && result.user != null) {
      await _saveUser(result.user!);
    }
    return result;
  }

  Future<AuthResult> verifyRegisterOtp(String email, String otpCode) async {
    final result = await _authRepository.verifyRegisterOtp(email, otpCode);
    if (result.user != null) {
      await _saveUser(result.user!);
    }
    return result;
  }

  Future<AuthResult> googleLogin() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) throw Exception('Google Sign-In cancelled');
      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      if (idToken == null) throw Exception('No ID token');

      final result = await _authRepository.googleLogin(idToken);
      if (result.user != null) {
        await _saveUser(result.user!);
      }
      return result;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    await SecureStorage.deleteToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    await prefs.remove('userHealthProfile');
    try { await _googleSignIn.signOut(); } catch (_) {}

    _user = null;
    _subscription = null;
    _isPremium = false;
    notifyListeners();
  }

  Future<void> _saveUser(User user) async {
    if (user.token != null) {
      await SecureStorage.saveToken(user.token!);
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user.toJson()));

    _user = user;
    notifyListeners();

    if (_user?.accountId != null) {
      await _checkPremiumStatus(_user!.accountId!);
    }
  }

  Future<void> _checkPremiumStatus(String accountId) async {
    try {
      final subs = await _subscriptionService.getByAccountId(accountId);
      final activeSubs = subs.where((s) => s.isActive).toList()
        ..sort((a, b) {
          if (a.endDate == null) return 1;
          if (b.endDate == null) return -1;
          return b.endDate!.compareTo(a.endDate!);
        });
      if (activeSubs.isNotEmpty) {
        _subscription = activeSubs.first;
        _isPremium = true;
      } else {
        _subscription = null;
        _isPremium = false;
      }
      notifyListeners();
    } catch (e) {
      _subscription = null;
      _isPremium = false;
      notifyListeners();
    }
  }

  Future<void> refreshPremiumStatus() async {
    if (accountId != null) {
      await _checkPremiumStatus(accountId!);
    }
  }
}

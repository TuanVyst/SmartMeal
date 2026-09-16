import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user.dart';
import '../models/subscription.dart' as sub_model;
import '../services/auth_service.dart';
import '../services/subscription_service.dart';

/// Auth provider – ported from web's AuthContext.jsx
class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
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

  /// Load user from SharedPreferences (equivalent to readStoredUser on web)
  Future<void> _loadStoredUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
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

  /// Login with email/username and password
  Future<Map<String, dynamic>> login(String emailOrUsername, String password) async {
    final data = await _authService.login(emailOrUsername, password);

    if (data['requiresOtp'] == true) {
      return data; // Return early, let UI handle OTP step
    }

    await _saveUserData(data);
    return data;
  }

  /// Verify OTP
  Future<Map<String, dynamic>> verifyOtp(String email, String otpCode) async {
    final data = await _authService.verifyOtp(email, otpCode);
    await _saveUserData(data);
    return data;
  }

  /// Register
  Future<Map<String, dynamic>> register(Map<String, dynamic> credentials) async {
    final data = await _authService.register(credentials);
    if (data['requiresOtp'] == true) {
      return data;
    }
    await _saveUserData(data);
    return data;
  }

  /// Verify register OTP
  Future<Map<String, dynamic>> verifyRegisterOtp(String email, String otpCode) async {
    final data = await _authService.verifyRegisterOtp(email, otpCode);
    await _saveUserData(data);
    return data;
  }

  /// Google Sign-In
  Future<Map<String, dynamic>> googleLogin() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) throw Exception('Google Sign-In cancelled');

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;
      if (idToken == null) throw Exception('No ID token');

      final data = await _authService.googleLogin(idToken);
      await _saveUserData(data);
      return data;
    } catch (e) {
      rethrow;
    }
  }

  /// Logout
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    await prefs.remove('userHealthProfile');

    try { await _googleSignIn.signOut(); } catch (_) {}

    _user = null;
    _subscription = null;
    _isPremium = false;
    notifyListeners();
  }

  /// Save user data to SharedPreferences and update state
  Future<void> _saveUserData(Map<String, dynamic> data) async {
    final prefs = await SharedPreferences.getInstance();
    final token = data['token'] as String?;

    if (token != null) {
      await prefs.setString('token', token);
    }
    await prefs.setString('user', jsonEncode(data));

    _user = User.fromJson(data);
    notifyListeners();

    if (_user?.accountId != null) {
      await _checkPremiumStatus(_user!.accountId!);
    }
  }

  /// Check premium subscription status (ported from web's checkPremiumStatus)
  Future<void> _checkPremiumStatus(String accountId) async {
    try {
      final subs = await _subscriptionService.getByAccountId(accountId);
      final now = DateTime.now();

      final activeSubs = subs
          .where((s) => s.isActive)
          .toList()
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
      debugPrint('Error checking premium status: $e');
      _subscription = null;
      _isPremium = false;
      notifyListeners();
    }
  }

  /// Refresh premium status (public)
  Future<void> refreshPremiumStatus() async {
    if (accountId != null) {
      await _checkPremiumStatus(accountId!);
    }
  }
}

import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smart_meal/core/network/api_exceptions.dart';
import 'package:smart_meal/core/storage/secure_storage.dart';
import '../../domain/health_profile_model.dart';
import '../../domain/profile_repository.dart';

class HealthProfileProvider extends ChangeNotifier {
  final ProfileRepository _repository = ProfileRepository();

  HealthProfile? _profile;
  bool _loading = true;
  bool _submitting = false;
  bool _surveyCompleted = false;

  HealthProfile? get profile => _profile;
  bool get loading => _loading;
  bool get submitting => _submitting;
  bool get surveyCompleted => _surveyCompleted;

  HealthProfileProvider({HealthProfile? initialProfile, bool? loading})
      : _profile = initialProfile,
        _loading = loading ?? (initialProfile == null),
        _surveyCompleted = initialProfile != null {
    if (initialProfile == null) {
      _loadProfile();
    }
  }

  Future<void> loadProfile() async {
    _loading = true;
    notifyListeners();
    await _loadProfile();
  }

  Future<void> clearProfile() async {
    _profile = null;
    _surveyCompleted = false;
    await _clearLocal();
    notifyListeners();
  }

  Future<void> _loadProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final localData = prefs.getString('userHealthProfile');
      final completed = prefs.getBool('healthSurveyCompleted') ?? false;

      if (localData != null) {
        try {
          _profile = HealthProfile.fromJson(jsonDecode(localData));
        } catch (e) {
          debugPrint('Error parsing cached health profile: $e');
        }
      }
      _surveyCompleted = completed;
      
      // Fetch latest from remote if logged in
      final token = await SecureStorage.getToken();
      if (token != null && token.isNotEmpty) {
        final fetched = await _repository.getHealthProfile();
        if (fetched != null) {
          _profile = fetched;
          _surveyCompleted = true;
          await _saveLocal(fetched, true);
        }
      }
    } catch (e) {
      debugPrint('Error loading health profile: $e');
      final is401 = e is UnauthorizedException ||
          (e is DioException &&
              (e.error is UnauthorizedException || e.response?.statusCode == 401));
      final is404 = e is NotFoundException ||
          (e is DioException &&
              (e.error is NotFoundException || e.response?.statusCode == 404));
      if (is401 || is404) {
        _profile = null;
        _surveyCompleted = false;
        await _clearLocal();
      }
      // For network errors, safely keep local profile & completed status
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> _saveLocal(HealthProfile profile, bool completed) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('userHealthProfile', jsonEncode(profile.toJson()));
    await prefs.setBool('healthSurveyCompleted', completed);
  }

  Future<void> _clearLocal() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userHealthProfile');
    await prefs.remove('healthSurveyCompleted');
  }

  Future<bool> submitSurvey(Map<String, dynamic> data) async {
    _submitting = true;
    notifyListeners();
    try {
      final profile = await _repository.submitHealthSurvey(data);
      if (profile != null) {
        _profile = profile;
        _surveyCompleted = true;
        await _saveLocal(profile, true);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error submitting survey: $e');
      rethrow;
    } finally {
      _submitting = false;
      notifyListeners();
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _submitting = true;
    notifyListeners();
    try {
      final profile = await _repository.updateHealthProfile(data);
      if (profile != null) {
        _profile = profile;
        await _saveLocal(profile, true);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Error updating health profile: $e');
      rethrow;
    } finally {
      _submitting = false;
      notifyListeners();
    }
  }

  Future<List<dynamic>> getBmiHistory() async {
    try {
      return await _repository.getBmiHistory();
    } catch (e) {
      debugPrint('Error fetching BMI history: $e');
      return [];
    }
  }
}

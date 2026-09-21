import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../domain/health_profile_model.dart';
import '../../domain/profile_repository.dart';

class HealthProfileProvider extends ChangeNotifier {
  final ProfileRepository _repository = ProfileRepository();

  HealthProfile? _profile;
  bool _loading = true;
  bool _surveyCompleted = false;

  HealthProfile? get profile => _profile;
  bool get loading => _loading;
  bool get surveyCompleted => _surveyCompleted;

  HealthProfileProvider() {
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final localData = prefs.getString('userHealthProfile');
      final completed = prefs.getBool('healthSurveyCompleted') ?? false;

      if (localData != null) {
        _profile = HealthProfile.fromJson(jsonDecode(localData));
      }
      _surveyCompleted = completed;
      
      // Fetch latest from remote if logged in
      final fetched = await _repository.getHealthProfile();
      if (fetched != null) {
        _profile = fetched;
        _surveyCompleted = true;
        await _saveLocal(fetched, true);
      }
    } catch (e) {
      debugPrint('Error loading health profile: $e');
      // If error (e.g. 404 because not created), survey is not completed
      _surveyCompleted = false;
      await _clearLocal();
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
    _loading = true;
    notifyListeners();
    try {
      final profile = await _repository.submitHealthSurvey(data);
      if (profile != null) {
        _profile = profile;
        _surveyCompleted = true;
        await _saveLocal(profile, true);
        return true;
      }
      return false;
    } catch (e) {
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _loading = true;
    notifyListeners();
    try {
      final profile = await _repository.updateHealthProfile(data);
      if (profile != null) {
        _profile = profile;
        await _saveLocal(profile, true);
        return true;
      }
      return false;
    } catch (e) {
      rethrow;
    } finally {
      _loading = false;
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

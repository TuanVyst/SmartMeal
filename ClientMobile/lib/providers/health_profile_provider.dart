import 'package:flutter/material.dart';
import '../models/health_profile.dart';
import '../models/nutrition_goal.dart';
import '../services/health_survey_service.dart';

/// Health profile provider – ported from web's HealthProfileContext.jsx
class HealthProfileProvider extends ChangeNotifier {
  final HealthSurveyService _service = HealthSurveyService();

  HealthProfile? _healthProfile;
  DailyTargets _dailyTargets = const DailyTargets();
  bool _loading = false;

  HealthProfile? get healthProfile => _healthProfile;
  DailyTargets get dailyTargets => _dailyTargets;
  bool get loading => _loading;

  /// Fetch health profile
  Future<void> fetchProfile() async {
    _loading = true;
    notifyListeners();

    try {
      _healthProfile = await _service.getProfile();
      notifyListeners();
    } catch (e) {
      debugPrint('Error fetching health profile: $e');
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  /// Submit health survey
  Future<void> submitSurvey(Map<String, dynamic> data) async {
    try {
      await _service.submitSurvey(data);
      await fetchProfile();
    } catch (e) {
      debugPrint('Error submitting survey: $e');
      rethrow;
    }
  }

  /// Update daily targets from nutrition goal
  void updateTargets(DailyTargets targets) {
    _dailyTargets = targets;
    notifyListeners();
  }
}

import 'package:smart_meal/core/network/api_client.dart';
import 'package:smart_meal/core/constants/api_constants.dart';

/// Feedback service – submitting user feedback, bug reports, and suggestions
class FeedbackService {
  final ApiClient _api = ApiClient();

  /// Category values matching backend FeedbackCategoryEnum:
  /// 0: GeneralFeedback (Góp ý chung)
  /// 1: BugReport (Báo lỗi ứng dụng)
  /// 2: FeatureRequest (Đề xuất tính năng mới)
  /// 3: RecipeFeedback (Góp ý công thức món ăn)
  Future<Map<String, dynamic>> submitFeedback({
    required int category,
    required String title,
    required String content,
  }) async {
    final response = await _api.post(ApiConstants.feedback, data: {
      'category': category,
      'title': title,
      'content': content,
    });
    return response.data as Map<String, dynamic>;
  }
}

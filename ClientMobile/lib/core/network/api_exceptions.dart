/// Custom API exception classes
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException({required this.message, this.statusCode, this.data});

  @override
  String toString() => 'ApiException($statusCode): $message';
}

class NetworkException extends ApiException {
  NetworkException()
      : super(
          message: 'Không thể kết nối máy chủ. Hãy kiểm tra kết nối mạng.',
          statusCode: 0,
        );
}

class TimeoutException extends ApiException {
  TimeoutException()
      : super(
          message: 'Yêu cầu đã hết thời gian chờ.',
          statusCode: 408,
        );
}

class ServerException extends ApiException {
  ServerException({required int statusCode, String? message})
      : super(
          message: message ?? 'Lỗi máy chủ ($statusCode)',
          statusCode: statusCode,
        );
}

class UnauthorizedException extends ApiException {
  UnauthorizedException()
      : super(
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          statusCode: 401,
        );
}

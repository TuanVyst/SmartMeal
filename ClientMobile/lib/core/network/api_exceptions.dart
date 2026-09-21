class AppException implements Exception {
  final String message;
  final String? prefix;
  final int? statusCode;

  AppException([this.message = 'Đã xảy ra lỗi không xác định', this.prefix, this.statusCode]);

  @override
  String toString() {
    return message;
  }
}

class NetworkException extends AppException {
  NetworkException([
    String message = 'Không có kết nối mạng hoặc máy chủ không phản hồi',
    int statusCode = 0,
  ]) : super(message, null, statusCode);
}

class ValidationException extends AppException {
  ValidationException([
    String message = 'Dữ liệu không hợp lệ',
    int statusCode = 400,
  ]) : super(message, null, statusCode);
}

class UnauthorizedException extends AppException {
  UnauthorizedException([
    String message = 'Phiên đăng nhập hết hạn hoặc sai thông tin',
    int statusCode = 401,
  ]) : super(message, null, statusCode);
}

class ForbiddenException extends AppException {
  ForbiddenException([
    String message = 'Bạn không có quyền truy cập',
    int statusCode = 403,
  ]) : super(message, null, statusCode);
}

class NotFoundException extends AppException {
  NotFoundException([
    String message = 'Không tìm thấy tài nguyên',
    int statusCode = 404,
  ]) : super(message, null, statusCode);
}

class ServerException extends AppException {
  ServerException([
    String message = 'Lỗi máy chủ nội bộ',
    int statusCode = 500,
  ]) : super(message, null, statusCode);
}

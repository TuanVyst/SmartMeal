import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';
import '../constants/api_constants.dart';
import 'api_exceptions.dart';

class ApiClient {
  static ApiClient? _instance;
  late final Dio dio;
  static VoidCallback? onUnauthorized;

  ApiClient._() {
    dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(milliseconds: ApiConstants.connectTimeout),
      receiveTimeout: const Duration(milliseconds: ApiConstants.receiveTimeout),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SecureStorage.getToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException error, handler) async {
        if (error.response?.statusCode == 401) {
          await SecureStorage.deleteToken();
          onUnauthorized?.call();
        }
        return handler.next(_handleError(error));
      },
    ));
  }

  factory ApiClient() {
    _instance ??= ApiClient._();
    return _instance!;
  }

  DioException _handleError(DioException error) {
    String message = 'Đã xảy ra lỗi không xác định';
    
    // Check if there is a structured response message from backend
    if (error.response?.data != null && error.response?.data is Map) {
      final data = error.response!.data as Map<String, dynamic>;
      if (data.containsKey('message') && data['message'] != null) {
        message = data['message'].toString();
      }
    }

    AppException appException;
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        message = 'Kết nối đến máy chủ bị gián đoạn. Vui lòng kiểm tra lại mạng.';
        appException = NetworkException(message);
        break;
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        switch (statusCode) {
          case 400:
            appException = ValidationException(message);
            break;
          case 401:
            if (message == 'Đã xảy ra lỗi không xác định') {
              message = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            }
            appException = UnauthorizedException(message);
            break;
          case 403:
            if (message == 'Đã xảy ra lỗi không xác định') {
              message = 'Bạn không có quyền thực hiện thao tác này.';
            }
            appException = ForbiddenException(message);
            break;
          case 404:
            if (message == 'Đã xảy ra lỗi không xác định') {
              message = 'Không tìm thấy dữ liệu yêu cầu.';
            }
            appException = NotFoundException(message);
            break;
          case 500:
            if (message == 'Đã xảy ra lỗi không xác định') {
              message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
            }
            appException = ServerException(message);
            break;
          default:
            appException = AppException(message, 'Lỗi máy chủ', statusCode);
        }
        break;
      default:
        appException = AppException(error.message ?? message);
    }

    // Wrap the AppException in DioException to maintain Dio's signature, 
    // but carry our custom error.
    return error.copyWith(error: appException, message: message);
  }

  // Convenience methods
  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) {
    return dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> post(String path, {dynamic data}) {
    return dio.post(path, data: data);
  }

  Future<Response> put(String path, {dynamic data}) {
    return dio.put(path, data: data);
  }

  Future<Response> delete(String path) {
    return dio.delete(path);
  }

  Future<Response> uploadFile(String path, FormData formData) {
    return dio.put(path, data: formData, options: Options(
      headers: {'Content-Type': 'multipart/form-data'},
    ));
  }
}

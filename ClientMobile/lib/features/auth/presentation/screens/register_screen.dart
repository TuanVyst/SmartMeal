import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/ui/smart_button.dart';
import '../../../../core/ui/smart_text_field.dart';
import '../../../../core/ui/smart_dialog.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _otpFormKey = GlobalKey<FormState>();

  final _usernameController = TextEditingController();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _otpController = TextEditingController();

  bool _isLoading = false;
  bool _isOtpStep = false;
  String _pendingEmail = '';

  @override
  void dispose() {
    _usernameController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      final email = _emailController.text.trim();
      final result = await authProvider.register({
        'username': _usernameController.text.trim(),
        'name': _nameController.text.trim(),
        'email': email,
        'password': _passwordController.text,
        'confirmPassword': _confirmPasswordController.text,
      });

      if (!mounted) return;

      if (result.requiresOtp) {
        setState(() {
          _isOtpStep = true;
          _pendingEmail = result.email ?? email;
        });
        SmartDialog.showAlert(
          context: context,
          title: 'Mã OTP Đã Gửi',
          message: 'Vui lòng kiểm tra email (hoặc console backend) để lấy mã OTP xác thực.',
        );
      } else {
        context.go('/main');
      }
    } catch (e) {
      SmartDialog.showAlert(
        context: context,
        title: 'Đăng ký thất bại',
        message: e.toString().replaceAll('Exception: ', ''),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleVerifyOtp() async {
    if (!_otpFormKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      await authProvider.verifyRegisterOtp(
        _pendingEmail,
        _otpController.text.trim(),
      );

      if (!mounted) return;
      context.go('/main');
    } catch (e) {
      SmartDialog.showAlert(
        context: context,
        title: 'Xác thực OTP thất bại',
        message: e.toString().replaceAll('Exception: ', ''),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isOtpStep ? 'Xác thực OTP' : 'Đăng ký'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (_isOtpStep) {
              setState(() => _isOtpStep = false);
            } else {
              context.go('/login');
            }
          },
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: AppSpacing.edgeInsetsAllLg,
          child: _isOtpStep ? _buildOtpView() : _buildRegisterFormView(),
        ),
      ),
    );
  }

  Widget _buildOtpView() {
    return Form(
      key: _otpFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Nhập mã xác thực OTP',
            style: Theme.of(context).textTheme.displayMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Mã OTP 6 chữ số đã được gửi tới email:\n$_pendingEmail',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppSpacing.xl),
          SmartTextField(
            controller: _otpController,
            label: 'Mã OTP (6 chữ số)',
            prefixIcon: Icons.mark_email_read_outlined,
            keyboardType: TextInputType.number,
            validator: (value) {
              if (value == null || value.trim().isEmpty) return 'Vui lòng nhập mã OTP';
              if (value.trim().length < 6) return 'Mã OTP gồm 6 chữ số';
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.xl),
          SmartButton(
            text: 'Xác nhận & Tạo tài khoản',
            isLoading: _isLoading,
            onPressed: _handleVerifyOtp,
          ),
          const SizedBox(height: AppSpacing.md),
          TextButton(
            onPressed: () => setState(() => _isOtpStep = false),
            child: const Text('Quay lại sửa thông tin'),
          ),
        ],
      ),
    );
  }

  Widget _buildRegisterFormView() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Tạo tài khoản mới',
            style: Theme.of(context).textTheme.displayMedium,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Tham gia SmartMeal ngay hôm nay',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: AppSpacing.xl),
          SmartTextField(
            controller: _usernameController,
            label: 'Tên đăng nhập',
            prefixIcon: Icons.person_outline,
            validator: (value) {
              if (value == null || value.trim().isEmpty) return 'Bắt buộc';
              if (value.trim().length < 3) return 'Tối thiểu 3 ký tự';
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.md),
          SmartTextField(
            controller: _nameController,
            label: 'Họ và Tên',
            prefixIcon: Icons.badge_outlined,
            validator: (value) => value == null || value.trim().isEmpty ? 'Bắt buộc' : null,
          ),
          const SizedBox(height: AppSpacing.md),
          SmartTextField(
            controller: _emailController,
            label: 'Email',
            prefixIcon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              if (value == null || value.trim().isEmpty) return 'Bắt buộc';
              if (!value.contains('@')) return 'Email không hợp lệ';
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.md),
          SmartTextField(
            controller: _passwordController,
            label: 'Mật khẩu',
            obscureText: true,
            prefixIcon: Icons.lock_outline,
            validator: (value) {
              if (value == null || value.isEmpty) return 'Bắt buộc';
              if (value.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.md),
          SmartTextField(
            controller: _confirmPasswordController,
            label: 'Nhập lại mật khẩu',
            obscureText: true,
            prefixIcon: Icons.lock_reset_outlined,
            validator: (value) {
              if (value == null || value.isEmpty) return 'Bắt buộc';
              if (value != _passwordController.text) return 'Mật khẩu nhập lại không khớp';
              return null;
            },
          ),
          const SizedBox(height: AppSpacing.xl),
          SmartButton(
            text: 'Đăng ký',
            isLoading: _isLoading,
            onPressed: _handleRegister,
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/auth_provider.dart';

/// Register screen – matching web's Register.jsx
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _otpController = TextEditingController();

  bool _loading = false;
  String? _error;
  bool _otpStep = false;
  String _pendingEmail = '';
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _error = 'Mật khẩu xác nhận không khớp');
      return;
    }

    setState(() { _loading = true; _error = null; });

    try {
      final auth = context.read<AuthProvider>();
      final result = await auth.register({
        'username': _usernameController.text.trim(),
        'email': _emailController.text.trim(),
        'password': _passwordController.text,
      });

      if (result['requiresOtp'] == true) {
        setState(() {
          _otpStep = true;
          _pendingEmail = result['email'] as String? ?? _emailController.text;
        });
      } else if (mounted) {
        Navigator.of(context).pushReplacementNamed('/main');
      }
    } catch (e) {
      setState(() { _error = e.toString().replaceFirst('Exception: ', ''); });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  Future<void> _handleOtpSubmit() async {
    setState(() { _loading = true; _error = null; });

    try {
      final auth = context.read<AuthProvider>();
      await auth.verifyRegisterOtp(_pendingEmail, _otpController.text.trim());
      if (mounted) Navigator.of(context).pushReplacementNamed('/main');
    } catch (e) {
      setState(() { _error = 'Xác thực OTP thất bại'; });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: _otpStep ? _buildOtpForm() : _buildRegisterForm(),
          ),
        ),
      ),
    );
  }

  Widget _buildRegisterForm() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: AppColors.shadowLight, blurRadius: 20, offset: Offset(0, 4))],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.eco, size: 48, color: AppColors.primary),
            const SizedBox(height: 8),
            Text('Tạo tài khoản', style: AppTextStyles.authTitle),
            const SizedBox(height: 6),
            Text('Đăng ký để bắt đầu hành trình sức khỏe', style: AppTextStyles.authSubtitle),
            const SizedBox(height: 24),

            TextFormField(
              controller: _usernameController,
              decoration: const InputDecoration(labelText: 'Tên đăng nhập', prefixIcon: Icon(Icons.person_outline)),
              validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập tên đăng nhập' : null,
            ),
            const SizedBox(height: 14),

            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email', prefixIcon: Icon(Icons.email_outlined)),
              keyboardType: TextInputType.emailAddress,
              validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập email' : null,
            ),
            const SizedBox(height: 14),

            TextFormField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: InputDecoration(
                labelText: 'Mật khẩu',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),
              validator: (v) => v == null || v.length < 6 ? 'Mật khẩu tối thiểu 6 ký tự' : null,
            ),
            const SizedBox(height: 14),

            TextFormField(
              controller: _confirmPasswordController,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Xác nhận mật khẩu', prefixIcon: Icon(Icons.lock_outline)),
              validator: (v) => v != _passwordController.text ? 'Mật khẩu không khớp' : null,
            ),

            if (_error != null) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: AppColors.errorText.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppColors.errorText, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.errorText, fontSize: 13))),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _loading ? null : _handleRegister,
                child: _loading
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                    : Text('Đăng ký', style: AppTextStyles.buttonText),
              ),
            ),
            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Đã có tài khoản? ', style: AppTextStyles.bodySmall),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text('Đăng nhập', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOtpForm() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [BoxShadow(color: AppColors.shadowLight, blurRadius: 20, offset: Offset(0, 4))],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.mark_email_read, size: 48, color: AppColors.primary),
          const SizedBox(height: 16),
          Text('Xác thực email', style: AppTextStyles.authTitle),
          const SizedBox(height: 8),
          Text('Nhập mã OTP đã gửi đến $_pendingEmail', style: AppTextStyles.authSubtitle, textAlign: TextAlign.center),
          const SizedBox(height: 24),

          TextFormField(
            controller: _otpController,
            decoration: const InputDecoration(labelText: 'Mã OTP', hintText: 'Nhập mã 6 chữ số'),
            keyboardType: TextInputType.number,
            maxLength: 6,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, letterSpacing: 8),
          ),

          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: AppColors.errorText, fontSize: 13)),
          ],
          const SizedBox(height: 20),

          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _loading ? null : _handleOtpSubmit,
              child: _loading
                  ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                  : Text('Xác thực', style: AppTextStyles.buttonText),
            ),
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_text_styles.dart';
import '../../providers/auth_provider.dart';

/// Login screen – matching web's Login.jsx + auth-card-modern CSS
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();

  bool _loading = false;
  String? _error;
  bool _otpStep = false;
  String _pendingEmail = '';
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() { _loading = true; _error = null; });

    try {
      final auth = context.read<AuthProvider>();
      final result = await auth.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (result['requiresOtp'] == true) {
        setState(() {
          _otpStep = true;
          _pendingEmail = result['email'] as String? ?? _emailController.text;
        });
      } else if (mounted) {
        Navigator.of(context).pushReplacementNamed('/main');
      }
    } catch (e) {
      setState(() {
        _error = _extractError(e);
      });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  Future<void> _handleOtpSubmit() async {
    setState(() { _loading = true; _error = null; });

    try {
      final auth = context.read<AuthProvider>();
      await auth.verifyOtp(_pendingEmail, _otpController.text.trim());
      if (mounted) Navigator.of(context).pushReplacementNamed('/main');
    } catch (e) {
      setState(() { _error = _extractError(e); });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  Future<void> _handleGoogleLogin() async {
    setState(() { _loading = true; _error = null; });

    try {
      final auth = context.read<AuthProvider>();
      await auth.googleLogin();
      if (mounted) Navigator.of(context).pushReplacementNamed('/main');
    } catch (e) {
      setState(() {
        _error = 'Đăng nhập Google thất bại';
      });
    } finally {
      if (mounted) setState(() { _loading = false; });
    }
  }

  String _extractError(dynamic e) {
    if (e is Exception) return e.toString().replaceFirst('Exception: ', '');
    return 'Đăng nhập thất bại';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: _otpStep ? _buildOtpForm() : _buildLoginForm(),
          ),
        ),
      ),
    );
  }

  Widget _buildLoginForm() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(color: AppColors.shadowLight, blurRadius: 20, offset: Offset(0, 4)),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Logo
            Icon(Icons.eco, size: 48, color: AppColors.primary),
            const SizedBox(height: 8),
            Text('SmartMeal', style: AppTextStyles.heroTitle.copyWith(color: AppColors.primary, fontSize: 24)),
            const SizedBox(height: 24),
            Text('Chào mừng trở lại', style: AppTextStyles.authTitle),
            const SizedBox(height: 6),
            Text('Đăng nhập để tiếp tục với SmartMeal', style: AppTextStyles.authSubtitle),
            const SizedBox(height: 28),

            // Email/Username field
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email hoặc tên đăng nhập',
                hintText: 'you@example.com',
                prefixIcon: Icon(Icons.person_outline),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập email hoặc tên đăng nhập' : null,
            ),
            const SizedBox(height: 16),

            // Password field
            TextFormField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: InputDecoration(
                labelText: 'Mật khẩu',
                hintText: 'Nhập mật khẩu',
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
              ),
              validator: (v) => v == null || v.isEmpty ? 'Vui lòng nhập mật khẩu' : null,
            ),
            const SizedBox(height: 8),

            // Forgot password
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {},
                child: Text('Quên mật khẩu?', style: TextStyle(color: AppColors.primary, fontSize: 13)),
              ),
            ),

            // Error message
            if (_error != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.errorText.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppColors.errorText, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.errorText, fontSize: 13))),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Login button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _loading ? null : _handleLogin,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                child: _loading
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                    : Text('Đăng nhập', style: AppTextStyles.buttonText),
              ),
            ),
            const SizedBox(height: 20),

            // Divider
            Row(
              children: [
                const Expanded(child: Divider()),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('hoặc tiếp tục với', style: AppTextStyles.labelSmall),
                ),
                const Expanded(child: Divider()),
              ],
            ),
            const SizedBox(height: 16),

            // Google Sign-In button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton.icon(
                onPressed: _loading ? null : _handleGoogleLogin,
                icon: const Icon(Icons.g_mobiledata, size: 28),
                label: const Text('Đăng nhập với Google'),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Register link
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Chưa có tài khoản? ', style: AppTextStyles.bodySmall),
                TextButton(
                  onPressed: () => Navigator.of(context).pushNamed('/register'),
                  child: Text('Tạo ngay', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
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
        boxShadow: const [
          BoxShadow(color: AppColors.shadowLight, blurRadius: 20, offset: Offset(0, 4)),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.security, size: 48, color: AppColors.primary),
          const SizedBox(height: 16),
          Text('Xác thực OTP', style: AppTextStyles.authTitle),
          const SizedBox(height: 8),
          Text('Nhập mã đã gửi đến', style: AppTextStyles.authSubtitle),
          Text(_pendingEmail, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 24),

          TextFormField(
            controller: _otpController,
            decoration: const InputDecoration(
              labelText: 'Mã OTP',
              hintText: 'Nhập mã 6 chữ số',
              prefixIcon: Icon(Icons.pin),
            ),
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
          const SizedBox(height: 12),

          TextButton(
            onPressed: () => setState(() { _otpStep = false; _otpController.clear(); _error = null; }),
            child: const Text('Quay lại đăng nhập'),
          ),
        ],
      ),
    );
  }
}

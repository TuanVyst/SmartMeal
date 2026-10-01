import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/ui/smart_button.dart';
import '../../../../core/ui/smart_text_field.dart';
import '../../../../core/ui/smart_dialog.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _isGoogleLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      final result = await authProvider.login(
        _usernameController.text,
        _passwordController.text,
      );

      if (!mounted) return;

      if (result.requiresOtp) {
        SmartDialog.showAlert(
          context: context, 
          title: 'OTP Required', 
          message: result.message ?? 'Vui lòng kiểm tra email để nhận mã OTP'
        );
      } else {
        context.go('/main');
      }
    } catch (e) {
      SmartDialog.showAlert(
        context: context, 
        title: 'Đăng nhập thất bại', 
        message: e.toString().replaceAll('Exception: ', ''),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleGoogleLogin() async {
    setState(() => _isGoogleLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      await authProvider.googleLogin();

      if (!mounted) return;
      context.go('/main');
    } catch (e) {
      if (mounted) {
        SmartDialog.showAlert(
          context: context,
          title: 'Đăng nhập Google thất bại',
          message: e.toString().replaceAll('Exception: ', ''),
        );
      }
    } finally {
      if (mounted) setState(() => _isGoogleLoading = false);
    }
  }

  void _handleForgotPassword() {
    final emailController = TextEditingController(
      text: _usernameController.text.contains('@') ? _usernameController.text : '',
    );
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppSpacing.borderRadiusLg),
        title: Text('Quên mật khẩu', style: Theme.of(context).textTheme.displaySmall),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Nhập địa chỉ email đăng ký tài khoản của bạn để nhận hướng dẫn khôi phục mật khẩu:',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.md),
            SmartTextField(
              controller: emailController,
              label: 'Email',
              prefixIcon: Icons.email_outlined,
              keyboardType: TextInputType.emailAddress,
            ),
          ],
        ),
        actions: [
          SmartButton(
            text: 'Hủy',
            variant: SmartButtonVariant.text,
            onPressed: () => Navigator.of(dialogContext).pop(),
            fullWidth: false,
          ),
          SmartButton(
            text: 'Gửi yêu cầu',
            onPressed: () {
              final email = emailController.text.trim();
              Navigator.of(dialogContext).pop();
              if (email.isNotEmpty) {
                SmartDialog.showAlert(
                  context: context,
                  title: 'Yêu cầu đã gửi',
                  message: 'Nếu email $email đã đăng ký tài khoản SmartMeal, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn.',
                );
              }
            },
            fullWidth: false,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.sm,
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - (AppSpacing.sm * 2),
                ),
                child: IntrinsicHeight(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Spacer(),
                        const Icon(Icons.restaurant_menu, size: 48, color: AppColors.primary),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Đăng nhập',
                          style: Theme.of(context).textTheme.displayMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          'Chào mừng trở lại với SmartMeal',
                          style: Theme.of(context).textTheme.bodyMedium,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: AppSpacing.md),
                        SmartTextField(
                          controller: _usernameController,
                          label: 'Email hoặc Tên đăng nhập',
                          prefixIcon: Icons.person_outline,
                          validator: (value) => value == null || value.isEmpty ? 'Vui lòng nhập tài khoản' : null,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        SmartTextField(
                          controller: _passwordController,
                          label: 'Mật khẩu',
                          obscureText: true,
                          prefixIcon: Icons.lock_outline,
                          validator: (value) => value == null || value.isEmpty ? 'Vui lòng nhập mật khẩu' : null,
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: _handleForgotPassword,
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.zero,
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            ),
                            child: Text(
                              'Quên mật khẩu?',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        SmartButton(
                          text: 'Đăng nhập',
                          isLoading: _isLoading,
                          onPressed: _handleLogin,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Row(
                          children: [
                            const Expanded(child: Divider()),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                              child: Text(
                                'hoặc tiếp tục với',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                              ),
                            ),
                            const Expanded(child: Divider()),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        SmartButton(
                          text: 'Đăng nhập bằng Google',
                          variant: SmartButtonVariant.outline,
                          isLoading: _isGoogleLoading,
                          icon: Icons.g_mobiledata,
                          onPressed: _handleGoogleLogin,
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('Chưa có tài khoản?', style: Theme.of(context).textTheme.bodyMedium),
                            TextButton(
                              onPressed: () => context.go('/register'),
                              child: const Text('Đăng ký ngay'),
                            ),
                          ],
                        ),
                        const Spacer(),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

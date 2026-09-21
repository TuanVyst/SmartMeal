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
  final _usernameController = TextEditingController();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final authProvider = context.read<AuthProvider>();
      final result = await authProvider.register({
        'username': _usernameController.text,
        'name': _nameController.text,
        'email': _emailController.text,
        'password': _passwordController.text,
      });

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
      SmartDialog.showAlert(context: context, title: 'Đăng ký thất bại', message: e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng ký'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: AppSpacing.edgeInsetsAllLg,
          child: Form(
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
                  validator: (value) => value == null || value.isEmpty ? 'Bắt buộc' : null,
                ),
                const SizedBox(height: AppSpacing.md),
                SmartTextField(
                  controller: _nameController,
                  label: 'Họ và Tên',
                  prefixIcon: Icons.badge_outlined,
                  validator: (value) => value == null || value.isEmpty ? 'Bắt buộc' : null,
                ),
                const SizedBox(height: AppSpacing.md),
                SmartTextField(
                  controller: _emailController,
                  label: 'Email',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) => value == null || value.isEmpty ? 'Bắt buộc' : null,
                ),
                const SizedBox(height: AppSpacing.md),
                SmartTextField(
                  controller: _passwordController,
                  label: 'Mật khẩu',
                  obscureText: true,
                  prefixIcon: Icons.lock_outline,
                  validator: (value) => value == null || value.isEmpty ? 'Bắt buộc' : null,
                ),
                const SizedBox(height: AppSpacing.xl),
                SmartButton(
                  text: 'Đăng ký',
                  isLoading: _isLoading,
                  onPressed: _handleRegister,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:smart_meal/core/theme/app_colors.dart';
import 'package:smart_meal/core/ui/smart_button.dart';
import 'package:smart_meal/core/ui/smart_loading.dart';
import 'package:smart_meal/features/auth/presentation/providers/auth_provider.dart';
import 'package:smart_meal/features/profile/data/subscription_service.dart';
import 'package:smart_meal/features/profile/domain/subscription_model.dart';

class SubscriptionPlansScreen extends StatefulWidget {
  final bool showAppBar;
  final SubscriptionService? subscriptionService;
  const SubscriptionPlansScreen({super.key, this.showAppBar = true, this.subscriptionService});

  @override
  State<SubscriptionPlansScreen> createState() => _SubscriptionPlansScreenState();
}

class _SubscriptionPlansScreenState extends State<SubscriptionPlansScreen> {
  late final SubscriptionService _subscriptionService;

  List<SubscriptionPlan> _plans = [];
  SubscriptionPlan? _selectedPlan;
  bool _loadingPlans = true;
  bool _creatingPayment = false;

  @override
  void initState() {
    super.initState();
    _subscriptionService = widget.subscriptionService ?? SubscriptionService();
    _fetchPlans();
  }

  Future<void> _fetchPlans() async {
    setState(() => _loadingPlans = true);
    try {
      final plans = await _subscriptionService.getAllPlans();
      final paidPlans = plans.where((p) => (p.price ?? 0) > 0).toList();
      if (mounted) {
        setState(() {
          _plans = paidPlans.isNotEmpty ? paidPlans : _defaultPlans;
          _selectedPlan = _plans.first;
          _loadingPlans = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _plans = _defaultPlans;
          _selectedPlan = _plans.first;
          _loadingPlans = false;
        });
      }
    }
  }

  static final List<SubscriptionPlan> _defaultPlans = [
    SubscriptionPlan(
      planId: 'plan-pro-month',
      name: 'SmartMeal Pro (1 Tháng)',
      description: 'Gói tháng linh hoạt cho người mới bắt đầu',
      price: 49000,
      durationDays: 30,
      features: [
        'Gợi ý thực đơn cá nhân hóa chuẩn BMI & bệnh lý',
        'Tự động lên kế hoạch bữa ăn 7 ngày thông minh',
        'Phân tích chuyên sâu vi chất & cảnh báo dị ứng',
        'Không giới hạn tìm kiếm & lưu công thức nấu ăn',
        'Trải nghiệm mượt mà, không quảng cáo làm phiền',
      ],
    ),
  ];

  Future<void> _handleSubscribe() async {
    final auth = context.read<AuthProvider>();
    final accountId = auth.accountId;

    if (accountId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để nâng cấp gói Pro!'), backgroundColor: AppColors.error),
      );
      return;
    }

    final plan = _selectedPlan ?? _plans.firstOrNull;
    if (plan == null) return;

    setState(() => _creatingPayment = true);
    try {
      final res = await _subscriptionService.createPayment({
        'account_id': accountId,
        'plan_id': plan.planId,
      });

      final paymentData = res['data'] as Map<String, dynamic>?;
      if (paymentData == null) {
        throw Exception(res['message'] ?? 'Không thể khởi tạo thanh toán');
      }

      final checkoutUrl = paymentData['checkoutUrl']?.toString() ?? '';
      final orderCode = paymentData['orderCode']?.toString() ?? '';
      final amount = (paymentData['amount'] as num?)?.toInt() ?? (plan.price?.toInt() ?? 49000);
      final qrCode = paymentData['qrCode']?.toString() ?? '';
      final transferContent = paymentData['transferContent']?.toString() ?? 'SMARTMEAL $orderCode';

      if (mounted) {
        // Launch PayOS checkout URL if present
        if (checkoutUrl.isNotEmpty) {
          final uri = Uri.parse(checkoutUrl);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          }
        }

        // Open status & QR modal sheet
        _showPaymentModal(
          orderCode: orderCode,
          amount: amount,
          checkoutUrl: checkoutUrl,
          qrCode: qrCode,
          transferContent: transferContent,
          planName: plan.name ?? 'SmartMeal Pro',
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi thanh toán: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _creatingPayment = false);
    }
  }

  void _showPaymentModal({
    required String orderCode,
    required int amount,
    required String checkoutUrl,
    required String qrCode,
    required String transferContent,
    required String planName,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      isDismissible: true,
      builder: (_) {
        return _PaymentStatusSheet(
          orderCode: orderCode,
          amount: amount,
          checkoutUrl: checkoutUrl,
          qrCode: qrCode,
          transferContent: transferContent,
          planName: planName,
          onPaymentSuccess: () async {
            await context.read<AuthProvider>().refreshPremiumStatus();
            if (mounted) {
              _showSuccessDialog();
            }
          },
        );
      },
    );
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: const Column(
            children: [
              Icon(Icons.stars, color: Colors.amber, size: 54),
              SizedBox(height: 12),
              Text('Nâng cấp thành công!', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20)),
            ],
          ),
          content: const Text(
            'Chúc mừng bạn đã trở thành thành viên SmartMeal Pro! Mọi tính năng cao cấp đã được mở khóa hoàn toàn trên tài khoản của bạn.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.4),
          ),
          actions: [
            SmartButton(
              text: 'Bắt đầu trải nghiệm ngay',
              onPressed: () => Navigator.of(ctx).pop(),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isPremium = auth.isPremium;
    final currencyFormatter = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);

    final body = SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner Header
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isPremium
                    ? const [Color(0xFFF59E0B), Color(0xFFD97706)]
                    : const [Color(0xFF22C55E), Color(0xFF16A34A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: (isPremium ? Colors.orange : Colors.green).withValues(alpha: 0.25),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(
                  isPremium ? Icons.workspace_premium : Icons.stars,
                  size: 52,
                  color: Colors.white,
                ),
                const SizedBox(height: 10),
                Text(
                  isPremium ? 'Gói SmartMeal Pro (Đang hoạt động)' : 'Nâng Cấp SmartMeal Pro',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  isPremium
                      ? 'Bạn đang tận hưởng trọn vẹn mọi đặc quyền thông minh'
                      : 'Cổng thanh toán PayOS bảo mật, quét mã QR ngân hàng kích hoạt tức thì',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Plans Selection Cards
          if (_loadingPlans)
            const Center(child: SmartLoadingSpinner())
          else ...[
            ..._plans.map((plan) {
              final isSelected = _selectedPlan?.planId == plan.planId;
              final formattedPrice = currencyFormatter.format(plan.price ?? 49000);

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: isPremium
                        ? Colors.amber.shade400
                        : (isSelected ? AppColors.primary : AppColors.border),
                    width: isSelected ? 2.0 : 1.0,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          plan.name ?? 'SmartMeal Pro',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.amber.shade100,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            'ƯU ĐÃI PAYOS',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFB45309),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          formattedPrice,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primaryDark,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text('/ ${(plan.durationDays ?? 30)} ngày', style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                      ],
                    ),
                    const Divider(height: 24),
                    const Text(
                      'Đặc quyền gói Pro:',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 12),
                    _buildFeatureItem('Gợi ý thực đơn cá nhân hóa chuẩn BMI & bệnh lý'),
                    _buildFeatureItem('Tự động lên kế hoạch bữa ăn thông minh 7-14 ngày'),
                    _buildFeatureItem('Phân tích chuyên sâu vi chất & cảnh báo dị ứng'),
                    _buildFeatureItem('Không giới hạn tìm kiếm & lưu công thức nấu ăn'),
                    _buildFeatureItem('Trải nghiệm mượt mà, không quảng cáo làm phiền'),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isPremium ? Colors.grey.shade400 : AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: (isPremium || _creatingPayment) ? null : _handleSubscribe,
                        icon: _creatingPayment
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : Icon(isPremium ? Icons.check_circle : Icons.payment, size: 20),
                        label: Text(
                          isPremium
                              ? 'Đang Sử Dụng'
                              : (_creatingPayment ? 'Đang tạo giao dịch...' : 'Thanh toán PayOS ($formattedPrice)'),
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );

    if (!widget.showAppBar) return body;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Gói SmartMeal Pro', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: body,
    );
  }

  Widget _buildFeatureItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, color: AppColors.primary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, color: AppColors.textPrimary, height: 1.3),
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PAYMENT STATUS & QR SHEET WITH POLLING
// ─────────────────────────────────────────────────────────────

class _PaymentStatusSheet extends StatefulWidget {
  final String orderCode;
  final int amount;
  final String checkoutUrl;
  final String qrCode;
  final String transferContent;
  final String planName;
  final VoidCallback onPaymentSuccess;

  const _PaymentStatusSheet({
    required this.orderCode,
    required this.amount,
    required this.checkoutUrl,
    required this.qrCode,
    required this.transferContent,
    required this.planName,
    required this.onPaymentSuccess,
  });

  @override
  State<_PaymentStatusSheet> createState() => _PaymentStatusSheetState();
}

class _PaymentStatusSheetState extends State<_PaymentStatusSheet> {
  final SubscriptionService _subscriptionService = SubscriptionService();
  Timer? _pollingTimer;
  Timer? _countdownTimer;
  int _secondsLeft = 900; // 15 mins
  bool _checking = false;

  @override
  void initState() {
    super.initState();
    _startCountdown();
    _startPolling();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startCountdown() {
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsLeft <= 1) {
        timer.cancel();
        _pollingTimer?.cancel();
        setState(() => _secondsLeft = 0);
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  void _startPolling() {
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      _checkPaymentStatus(isManual: false);
    });
  }

  Future<void> _checkPaymentStatus({bool isManual = false}) async {
    if (_checking) return;
    if (isManual) setState(() => _checking = true);

    try {
      final res = await _subscriptionService.checkPaymentStatus(widget.orderCode);
      if (res['isPaid'] == true || res['success'] == true && res['status'] == 'PAID') {
        _pollingTimer?.cancel();
        _countdownTimer?.cancel();

        if (mounted) {
          Navigator.of(context).pop();
          widget.onPaymentSuccess();
        }
      } else if (isManual && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Hệ thống chưa nhận được thanh toán. Vui lòng thử lại sau vài giây!')),
        );
      }
    } catch (_) {
      // Ignore polling errors
    } finally {
      if (isManual && mounted) setState(() => _checking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);
    final min = (_secondsLeft ~/ 60).toString().padLeft(2, '0');
    final sec = (_secondsLeft % 60).toString().padLeft(2, '0');

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 48,
                height: 5,
                decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 16),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.qr_code_scanner, color: AppColors.primaryDark),
                    SizedBox(width: 8),
                    Text('Thanh toán qua PayOS', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.orange.shade200),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.timer_outlined, size: 14, color: Colors.orange),
                      const SizedBox(width: 4),
                      Text('$min:$sec', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.orange)),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 20),

            // Plan & Amount info
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Gói dịch vụ:', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Text(widget.planName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Mã đơn hàng:', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Text('#${widget.orderCode}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Số tiền thanh toán:', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Text(
                        currencyFormat.format(widget.amount),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Nội dung chuyển khoản:', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      Text(widget.transferContent, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.blue)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Re-open checkout button
            if (widget.checkoutUrl.isNotEmpty) ...[
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () async {
                  final uri = Uri.parse(widget.checkoutUrl);
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri, mode: LaunchMode.externalApplication);
                  }
                },
                icon: const Icon(Icons.open_in_new, size: 18),
                label: const Text('Mở trang thanh toán PayOS', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 10),
            ],

            // Manual check button
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                side: const BorderSide(color: AppColors.primary),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _checking ? null : () => _checkPaymentStatus(isManual: true),
              icon: _checking
                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.refresh, size: 18, color: AppColors.primaryDark),
              label: Text(
                _checking ? 'Đang kiểm tra...' : 'Tôi đã thanh toán - Kiểm tra ngay',
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryDark),
              ),
            ),
            const SizedBox(height: 8),

            const Center(
              child: Text(
                'Hệ thống tự động kích hoạt tài khoản ngay khi nhận được thanh toán',
                style: TextStyle(fontSize: 11, color: AppColors.textHint),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

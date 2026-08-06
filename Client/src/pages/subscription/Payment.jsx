import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { pendingPaymentStorage } from '../../utils/pendingPaymentStorage';
import { IoChevronBackOutline } from 'react-icons/io5';
import { QRCodeSVG } from 'qrcode.react';
import './SubscriptionPlans.css';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, subscription, isPremium, checkPremiumStatus } = useAuth();
  const accountId = user?.accountId || user?.account_id;

  const [currentPlan, setCurrentPlan] = useState(() => location.state?.plan || null);
  const [step, setStep] = useState('idle');
  const [qrImage, setQrImage] = useState('');
  const [orderCode, setOrderCode] = useState(null);
  const [transferContent, setTransferContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(900);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(null);
  const pollingRef = useRef(null);

  const startPolling = useCallback((accId, currentOrderCode) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (currentOrderCode == null || currentOrderCode === undefined) return;
    const orderCodeStr = currentOrderCode.toString();

    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await subscriptionService.checkPaymentStatus(orderCodeStr);
        if (data && data.success && data.isPaid) {
          clearInterval(pollingRef.current);
          pendingPaymentStorage.clearPendingPayment();
          if (accId) await checkPremiumStatus(accId);
          setStep('success');
        }
      } catch {
        /* ignore polling errors */
      }
    }, 3000);
  }, [checkPremiumStatus]);

  // Restore pending payment session on mount
  useEffect(() => {
    const savedPayment = pendingPaymentStorage.getPendingPayment(accountId);
    if (savedPayment) {
      const activePlan = location.state?.plan || savedPayment.plan;
      setCurrentPlan(activePlan);
      setOrderCode(savedPayment.orderCode);
      setQrImage(savedPayment.qrImage);
      setTransferContent(savedPayment.transferContent);
      setStep('pending');

      const remainingSec = Math.max(0, Math.floor((savedPayment.expiresAt - Date.now()) / 1000));
      setTimeLeft(remainingSec);
      if (remainingSec > 0) {
        startPolling(accountId, savedPayment.orderCode);
      } else {
        pendingPaymentStorage.clearPendingPayment();
        setStep('idle');
      }
    } else if (location.state?.plan) {
      setCurrentPlan(location.state.plan);
    } else {
      navigate('/subscription');
    }
  }, [accountId, location.state, navigate, startPolling]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (step !== 'pending' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          pendingPaymentStorage.clearPendingPayment();
          setStep('idle');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!currentPlan) return null;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePay = async () => {
    setErrorMsg('');
    setStep('loading');

    try {
      const { data } = await subscriptionService.createPayment({
        account_id: accountId,
        plan_id: currentPlan.plan_id,
      });

      if (data.success && data.data) {
        const resp = data.data;
        const newOrderCode = resp.orderCode;
        const newQrImage = resp.qrCode || '';
        const newTransferContent = resp.transferContent || resp.qrCode || '';

        setOrderCode(newOrderCode);
        setQrImage(newQrImage);
        setTransferContent(newTransferContent);
        setStep('pending');
        setTimeLeft(900);

        pendingPaymentStorage.savePendingPayment({
          accountId,
          plan: currentPlan,
          orderCode: newOrderCode,
          qrImage: newQrImage,
          transferContent: newTransferContent,
        });

        startPolling(accountId, newOrderCode);
      } else {
        setErrorMsg(data.message || 'Không thể tạo thanh toán. Vui lòng thử lại.');
        setStep('idle');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Lỗi kết nối mạng.';
      setErrorMsg(msg);
      setStep('idle');
    }
  };

  const handleCancelPayment = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pendingPaymentStorage.clearPendingPayment();
    if (step === 'pending') {
      setStep('idle');
      setOrderCode(null);
      setQrImage('');
      setTransferContent('');
    } else {
      navigate('/subscription');
    }
  };

  const activePlan = location.state?.activePlan;

  const remainingDays = subscription?.endDate
    ? Math.max(0, Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  let scenario = location.state?.scenario || 'new';
  if (!location.state?.scenario && isPremium && subscription) {
    if (currentPlan?.plan_id === subscription.plan_id) {
      scenario = 'renew';
    } else {
      scenario = 'upgrade';
    }
  }

  return (
    <div className="payment-page-container">
      <button onClick={() => navigate('/subscription')} className="btn-back-plans">
        <IoChevronBackOutline /> Quay lại chọn gói
      </button>

      <div className="payment-wrapper">
        <div className="payment-left-card">
          {scenario === 'upgrade' ? (
            <>
              <span className="badge-scenario badge-upgrade">🚀 Nâng cấp gói dịch vụ</span>
              <h2 className="payment-title">Nâng Cấp Gói Service</h2>
            </>
          ) : scenario === 'renew' ? (
            <>
              <span className="badge-scenario badge-renew">🔄 Gia hạn gói dịch vụ</span>
              <h2 className="payment-title">Gia Hạn Gói Service</h2>
            </>
          ) : (
            <>
              <span className="badge-scenario badge-new">✨ Đăng ký mới</span>
              <h2 className="payment-title">Thanh Toán Đăng Ký</h2>
            </>
          )}

          <div className="selected-plan-summary">
            <div>
              <h3>Gói Premium: <strong>{currentPlan.name}</strong></h3>
              <p>{currentPlan.description}</p>
            </div>
            <div className="checkout-price">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPlan.price)}
            </div>
          </div>

          {scenario === 'upgrade' && (
            <div className="scenario-notice-card notice-upgrade">
              <div className="notice-icon">🚀</div>
              <div className="notice-content">
                <h4>Đặc quyền Nâng Cấp Tự Động</h4>
                <p>
                  Bạn đang nâng cấp từ gói <strong>{activePlan?.name || 'hiện tại'}</strong> sang <strong>{currentPlan.name}</strong>.
                  {remainingDays > 0 ? (
                    <> Toàn bộ <strong>{remainingDays} ngày</strong> còn lại của gói cũ sẽ được <strong>tự động cộng dồn</strong> vào hạn dùng của gói mới ngay sau khi thanh toán thành công!</>
                  ) : (
                    <> Gói mới sẽ có hiệu lực ngay sau khi thanh toán thành công.</>
                  )}
                </p>
              </div>
            </div>
          )}

          {scenario === 'renew' && (
            <div className="scenario-notice-card notice-renew">
              <div className="notice-icon">🔄</div>
              <div className="notice-content">
                <h4>Gia Hạn Nối Tiếp Thời Gian</h4>
                <p>
                  Bạn đang gia hạn gói <strong>{currentPlan.name}</strong>.
                  Thời hạn sử dụng sẽ được <strong>nối tiếp thêm {currentPlan.duration} ngày</strong> vào thời gian còn lại của gói hiện tại.
                </p>
              </div>
            </div>
          )}

          {scenario === 'new' && (
            <div className="scenario-notice-card notice-new">
              <div className="notice-icon">💡</div>
              <div className="notice-content">
                <h4>Trải Nghiệm Premium Trọn Vẹn</h4>
                <p>
                  Đăng ký gói <strong>{currentPlan.name}</strong> để mở khóa gợi ý bữa ăn AI cá nhân hóa và phân tích dinh dưỡng chuyên sâu.
                </p>
              </div>
            </div>
          )}

          <div className="instructions-card">
            <h3>
              {scenario === 'upgrade'
                ? 'Hướng dẫn nâng cấp gói:'
                : scenario === 'renew'
                ? 'Hướng dẫn gia hạn gói:'
                : 'Hướng dẫn thanh toán:'}
            </h3>
            <div className="detail-rows">
              <div className="detail-item">
                <span className="item-label">Bước 1:</span>
                <div className="item-value-row">
                  <span className="item-value">Mở app ngân hàng hoặc ví MoMo</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="item-label">Bước 2:</span>
                <div className="item-value-row">
                  <span className="item-value">Quét mã QR thanh toán bên phải</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="item-label">Bước 3:</span>
                <div className="item-value-row">
                  <span className="item-value">
                    {scenario === 'upgrade'
                      ? `Xác nhận chuyển khoản - Gói mới & ${remainingDays > 0 ? remainingDays + ' ngày cộng dồn' : 'quyền lợi'} sẽ tự động kích hoạt`
                      : scenario === 'renew'
                      ? `Xác nhận chuyển khoản - Hạn sử dụng sẽ nối tiếp thêm ${currentPlan.duration} ngày`
                      : 'Xác nhận thanh toán thành công trên ứng dụng'}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <span className="item-label">Số tiền:</span>
                <div className="item-value-row">
                  <span className="item-value font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPlan.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {step === 'pending' && (
            <div className="transfer-info-card">
              <h3>Thông tin chuyển khoản thủ công:</h3>
              <div className="detail-rows">
                <div className="detail-item">
                  <span className="item-label">Ngân hàng</span>
                  <div className="item-value-row">
                    <span className="item-value">BIDV</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="item-label">Số tài khoản</span>
                  <div className="item-value-row">
                    <span className="item-value font-mono">V3CAS7621983180</span>
                    <button
                      className="btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText('V3CAS7621983180');
                        setCopied('stk');
                        setTimeout(() => setCopied(null), 2000);
                      }}
                    >
                      {copied === 'stk' ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="item-label">Chủ tài khoản</span>
                  <div className="item-value-row">
                    <span className="item-value">MAI TUAN VY</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="item-label">Số tiền</span>
                  <div className="item-value-row">
                    <span className="item-value font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPlan.price)}
                    </span>
                  </div>
                </div>
                <div className="detail-item highlighted-item">
                  <span className="item-label">Nội dung chuyển khoản</span>
                  <div className="item-value-row">
                    <span className="item-value font-bold font-mono">{transferContent || orderCode || ''}</span>
                    <button
                      className="btn-copy btn-copy-highlight"
                      onClick={() => {
                        navigator.clipboard.writeText(transferContent || (orderCode?.toString() ?? ''));
                        setCopied('content');
                        setTimeout(() => setCopied(null), 2000);
                      }}
                    >
                      {copied === 'content' ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              </div>
              <p className="transfer-note">
                Sau khi chuyển khoản, vui lòng đợi hệ thống xác nhận tự động (có thể mất đến 2 phút).
              </p>
            </div>
          )}
        </div>

        <div className="payment-right-card">
          {step === 'success' ? (
            <div className="qr-success-overlay">
              <div className="success-icon-wrapper">
                <span className="success-checkmark">&#10003;</span>
              </div>
              <h3>Thanh toán thành công!</h3>
              <p>Tài khoản đã được nâng cấp lên Premium.</p>
              <button onClick={() => navigate('/dashboard')} className="btn-confirm-payment">
                Đi tới Bảng điều khiển
              </button>
            </div>
          ) : step === 'pending' && !qrImage ? (
            <div className="qr-code-wrapper">
              <p className="qr-caption">Không thể tạo mã QR. Vui lòng thử lại.</p>
            </div>
          ) : step === 'pending' && qrImage ? (
            <>
              <div className="countdown-timer">
                <p>Mã QR hết hạn sau:</p>
                <span className={`timer-clock ${timeLeft < 60 ? 'timer-danger' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="qr-code-wrapper">
                <QRCodeSVG
                  value={qrImage}
                  size={220}
                  level="M"
                  style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '8px', background: '#fff' }}
                />
                <p className="qr-caption">
                  Quét mã QR bằng app ngân hàng hoặc MoMo
                </p>
              </div>
              <div className="polling-status">
                <span className="polling-dot" />
                Đang chờ xác nhận thanh toán...
              </div>
            </>
          ) : (
            <>
              <div className="qr-code-wrapper">
                <p className="qr-caption">
                  Bấm "Thanh toán ngay" để tạo mã QR
                </p>
              </div>
            </>
          )}

          {step !== 'success' && (
            <div className="confirmation-form">
              {errorMsg && <div className="payment-error-alert">{errorMsg}</div>}
              {step !== 'pending' && (
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={step === 'loading'}
                  className="btn-confirm-payment"
                >
                  {step === 'loading' ? 'Đang tạo mã QR...' : 'Thanh toán ngay'}
                </button>
              )}
              <button
                type="button"
                onClick={handleCancelPayment}
                className="btn-cancel-payment"
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#475569',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                {step === 'pending' ? 'Hủy thanh toán' : 'Quay lại'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { IoChevronBackOutline } from 'react-icons/io5';
import './SubscriptionPlans.css';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkPremiumStatus } = useAuth();
  const plan = location.state?.plan;

  const [step, setStep] = useState('idle');
  const [qrImage, setQrImage] = useState('');
  const [orderCode, setOrderCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900);
  const [errorMsg, setErrorMsg] = useState('');
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!plan) navigate('/subscription');
  }, [plan, navigate]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = useCallback((accountId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await subscriptionService.getSubscriptionsByAccountId(accountId);
        const subs = Array.isArray(data) ? data : data?.data || [];
        const active = subs.find(
          (s) => s.status === 'active' && s.paymentRef === orderCode?.toString()
        );
        if (active) {
          clearInterval(pollingRef.current);
          await checkPremiumStatus(accountId);
          setStep('success');
        }
      } catch {
        /* ignore polling errors */
      }
    }, 5000);
  }, [orderCode, checkPremiumStatus]);

  useEffect(() => {
    if (step !== 'pending' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!plan) return null;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handlePay = async () => {
    setErrorMsg('');
    setStep('loading');

    try {
      const accountId = user?.accountId || user?.account_id;
      const { data } = await subscriptionService.createPayment({
        account_id: accountId,
        plan_id: plan.plan_id,
      });

      if (data.success && data.data) {
        const resp = data.data;
        setOrderCode(resp.orderCode);
        setQrImage(resp.qrCode ? `data:image/png;base64,${resp.qrCode}` : '');
        setStep('pending');
        startPolling(accountId);
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

  return (
    <div className="payment-page-container">
      <button onClick={() => navigate('/subscription')} className="btn-back-plans">
        <IoChevronBackOutline /> Quay lại chọn gói
      </button>

      <div className="payment-wrapper">
        <div className="payment-left-card">
          <h2 className="payment-title">Thanh Toán Đăng Ký</h2>
          <div className="selected-plan-summary">
            <div>
              <h3>Gói Premium: <strong>{plan.name}</strong></h3>
              <p>{plan.description}</p>
            </div>
            <div className="checkout-price">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
            </div>
          </div>

          <div className="instructions-card">
            <h3>Hướng dẫn thanh toán:</h3>
            <div className="detail-rows">
              <div className="detail-item">
                <span className="item-label">Bước 1:</span>
                <div className="item-value-row">
                  <span className="item-value">Mở app ngân hàng hoặc MoMo</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="item-label">Bước 2:</span>
                <div className="item-value-row">
                  <span className="item-value">Quét mã QR bên phải</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="item-label">Bước 3:</span>
                <div className="item-value-row">
                  <span className="item-value">Xác nhận thanh toán trên app</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="item-label">Số tiền:</span>
                <div className="item-value-row">
                  <span className="item-value font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                <img
                  src={qrImage}
                  alt="QR Code thanh toán"
                  className="qr-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <p className="qr-caption" style={{ display: 'none' }}>
                  Lỗi hiển thị QR. Vui lòng bấm "Thanh toán ngay" lại.
                </p>
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
                onClick={() => navigate('/subscription')}
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

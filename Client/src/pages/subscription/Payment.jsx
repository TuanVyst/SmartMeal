import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { IoCopyOutline, IoChevronBackOutline } from 'react-icons/io5';
import './SubscriptionPlans.css';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, checkPremiumStatus } = useAuth();
  const plan = location.state?.plan;

  const [transactionCode, setTransactionCode] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Generate unique transfer content once
  const [transferMessage] = useState(() => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const usernameClean = user?.username ? user.username.toUpperCase().replace(/[^A-Z0-9]/g, '') : 'USER';
    return `SMARTMEAL ${usernameClean} ${randomSuffix}`;
  });

  useEffect(() => {
    if (!plan) {
      navigate('/subscription');
    }
  }, [plan, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (!plan) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!transactionCode.trim()) {
      setErrorMsg('Vui lòng nhập Mã giao dịch hoặc Số tham chiếu để đối soát thanh toán.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const accountId = user?.accountId || user?.account_id;
      const now = new Date();
      const expirationDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

      const requestData = {
        account_id: accountId,
        plan_id: plan.plan_id,
        startDate: now.toISOString(),
        endDate: expirationDate.toISOString(),
        status: 'active',
        paymentRef: transactionCode.trim(),
      };

      const { data } = await subscriptionService.createSubscription(requestData);

      if (data.success) {
        // Instantly refresh the authentication state to show Premium benefits
        await checkPremiumStatus(accountId);
        setPaymentDetails(data.data);
        setPaymentSuccess(true);
      } else {
        setErrorMsg(data.message || 'Lỗi hệ thống khi ghi nhận đăng ký. Vui lòng liên hệ hỗ trợ.');
      }
    } catch (err) {
      console.error('Lỗi khi thanh toán:', err);
      const msg = err.message || 'Lỗi kết nối mạng. Vui lòng kiểm tra lại.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic VietQR generator link
  // Bank ID: BIDV, Account No: 7621983180, Account Name: MAI TUAN VY
  const bankDetails = {
    bankName: 'BIDV (Ngân hàng TMCP Đầu tư và Phát triển Việt Nam)',
    accountNo: '7621983180',
    accountName: 'MAI TUAN VY',
    amount: plan.price,
    qrUrl: `https://img.vietqr.io/image/BIDV-7621983180-compact.png?amount=${plan.price}&addInfo=${encodeURIComponent(transferMessage)}&accountName=MAI%20TUAN%20VY`,
  };

  if (paymentSuccess) {
    return (
      <div className="payment-success-container">
        <div className="success-card">
          <div className="success-icon-wrapper">
            <span className="success-checkmark">✓</span>
          </div>
          <h1 className="success-title">Thanh Toán Thành Công!</h1>
          <p className="success-desc">
            Cảm ơn bạn đã đăng ký gói <strong>{plan.name}</strong>. Tài khoản của bạn đã được nâng cấp lên Premium.
          </p>

          <div className="receipt-details">
            <div className="receipt-row">
              <span className="receipt-label">Gói đăng ký:</span>
              <span className="receipt-value">{plan.name}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Số tiền:</span>
              <span className="receipt-value">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Mã giao dịch:</span>
              <span className="receipt-value">{transactionCode}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Ngày kích hoạt:</span>
              <span className="receipt-value">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Hạn sử dụng:</span>
              <span className="receipt-value">
                {new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
            Đi tới Bảng điều khiển
          </button>
        </div>
      </div>
    );
  }

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
              <h3>Gói Premium đã chọn: <strong>{plan.name}</strong></h3>
              <p>{plan.description}</p>
            </div>
            <div className="checkout-price">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
            </div>
          </div>

          <div className="instructions-card">
              <h3>Thông tin chuyển khoản ngân hàng:</h3>
              <div className="detail-rows">
                <div className="detail-item">
                  <span className="item-label">Ngân hàng:</span>
                  <div className="item-value-row">
                    <span className="item-value">{bankDetails.bankName}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="item-label">Số tài khoản:</span>
                  <div className="item-value-row">
                    <span className="item-value font-mono">{bankDetails.accountNo}</span>
                    <button
                      onClick={() => handleCopy(bankDetails.accountNo, 'accountNo')}
                      className="btn-copy"
                      type="button"
                    >
                      <IoCopyOutline /> {copiedField === 'accountNo' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="item-label">Chủ tài khoản:</span>
                  <div className="item-value-row">
                    <span className="item-value">{bankDetails.accountName}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="item-label">Số tiền:</span>
                  <div className="item-value-row">
                    <span className="item-value font-bold text-green">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bankDetails.amount)}
                    </span>
                    <button
                      onClick={() => handleCopy(bankDetails.amount.toString(), 'amount')}
                      className="btn-copy"
                      type="button"
                    >
                      <IoCopyOutline /> {copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
                <div className="detail-item highlighted-item">
                  <span className="item-label text-bold">Nội dung chuyển khoản (bắt buộc):</span>
                  <div className="item-value-row">
                    <span className="item-value font-mono text-bold text-red">{transferMessage}</span>
                    <button
                      onClick={() => handleCopy(transferMessage, 'msg')}
                      className="btn-copy btn-copy-highlight"
                      type="button"
                    >
                      <IoCopyOutline /> {copiedField === 'msg' ? 'Đã chép' : 'Sao chép'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>

        <div className="payment-right-card">
          <div className="countdown-timer">
            <p>Mã QR hết hạn sau:</p>
            <span className={`timer-clock ${timeLeft < 60 ? 'timer-danger' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="qr-code-wrapper">
            <img src={bankDetails.qrUrl} alt="VietQR bank transfer code" className="qr-image" />
            <p className="qr-caption">Sử dụng ứng dụng ngân hàng hoặc MoMo để quét mã QR</p>
          </div>

          <form onSubmit={handleConfirmPayment} className="confirmation-form">
            <div className="input-group">
              <label htmlFor="ref-code">Nhập Mã giao dịch hoặc Số tham chiếu:</label>
              <input
                id="ref-code"
                type="text"
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                placeholder="VD: FT260702..."
                className="ref-input"
              />
              <p className="helper-text">Mã này có trong phần lịch sử giao dịch sau khi chuyển khoản thành công.</p>
            </div>

            {errorMsg && <div className="payment-error-alert">{errorMsg}</div>}

            <button
              type="submit"
              disabled={submitting || timeLeft <= 0}
              className="btn-confirm-payment"
            >
              {submitting ? 'Đang kiểm tra giao dịch...' : 'Xác nhận đã chuyển khoản'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

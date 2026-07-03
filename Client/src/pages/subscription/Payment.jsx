import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { IoChevronBackOutline } from 'react-icons/io5';
import './SubscriptionPlans.css';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const plan = location.state?.plan;

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!plan) {
      navigate('/subscription');
    }
  }, [plan, navigate]);

  if (!plan) return null;

  const handlePay = async () => {
    setErrorMsg('');
    setSubmitting(true);

    try {
      const accountId = user?.accountId || user?.account_id;

      const { data } = await subscriptionService.createPayment({
        account_id: accountId,
        plan_id: plan.plan_id,
      });

      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setErrorMsg(data.message || 'Không thể tạo link thanh toán. Vui lòng thử lại.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Lỗi khi tạo thanh toán:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi kết nối mạng. Vui lòng thử lại.';
      setErrorMsg(msg);
      setSubmitting(false);
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
              <h3>Gói Premium đã chọn: <strong>{plan.name}</strong></h3>
              <p>{plan.description}</p>
            </div>
            <div className="checkout-price">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.price)}
            </div>
          </div>

          <div className="instructions-card">
            <h3>Thông tin thanh toán:</h3>
            <div className="detail-rows">
              <div className="detail-item">
                <span className="item-label">Gói đăng ký:</span>
                <div className="item-value-row">
                  <span className="item-value">{plan.name}</span>
                </div>
              </div>
              <div className="detail-item">
                <span className="item-label">Thời hạn:</span>
                <div className="item-value-row">
                  <span className="item-value">{plan.duration} ngày</span>
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
          <div className="qr-code-wrapper">
            <p className="qr-caption">Bấm "Thanh toán ngay" để chuyển sang cổng thanh toán payOS</p>
          </div>

          <div className="confirmation-form">
            {errorMsg && <div className="payment-error-alert">{errorMsg}</div>}

            <button
              type="button"
              onClick={handlePay}
              disabled={submitting}
              className="btn-confirm-payment"
            >
              {submitting ? 'Đang tạo link thanh toán...' : 'Thanh toán ngay'}
            </button>

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
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

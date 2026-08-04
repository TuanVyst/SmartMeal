import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pendingPaymentStorage } from '../../utils/pendingPaymentStorage';
import './SubscriptionPlans.css';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, checkPremiumStatus } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activateSubscription = async () => {
      pendingPaymentStorage.clearPendingPayment();
      const orderCode = searchParams.get('orderCode');
      if (!orderCode) {
        setLoading(false);
        return;
      }

      try {
        const accountId = user?.accountId || user?.account_id;
        if (accountId) {
          await checkPremiumStatus(accountId);
        }
      } catch (err) {
        console.error('Error refreshing premium status:', err);
      } finally {
        setLoading(false);
      }
    };

    activateSubscription();
  }, [searchParams, user, checkPremiumStatus]);

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon-wrapper">
          <span className="success-checkmark">✓</span>
        </div>
        <h1 className="success-title">Thanh Toán Thành Công!</h1>
        <p className="success-desc">
          {loading
            ? 'Đang xác nhận thanh toán...'
            : 'Tài khoản của bạn đã được nâng cấp lên Premium.'}
        </p>

        {!loading && (
          <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
            Đi tới Bảng điều khiển
          </button>
        )}
      </div>
    </div>
  );
}


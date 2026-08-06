import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { pendingPaymentStorage } from '../../utils/pendingPaymentStorage';
import './SubscriptionPlans.css';

export default function PaymentCancel() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const accId = user?.accountId || user?.account_id;
    const pending = pendingPaymentStorage.getPendingPayment(accId);
    if (pending?.orderCode) {
      subscriptionService.cancelPayment(pending.orderCode).catch(() => {});
    }
    pendingPaymentStorage.clearPendingPayment();
  }, [user]);

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon-wrapper" style={{ background: '#fee2e2' }}>
          <span className="success-checkmark" style={{ color: '#ef4444' }}>✕</span>
        </div>
        <h1 className="success-title">Thanh Toán Bị Hủy</h1>
        <p className="success-desc">
          Giao dịch đã bị hủy hoặc không thành công. Bạn có thể thử lại bất cứ lúc nào.
        </p>

        <button onClick={() => navigate('/subscription')} className="btn-dashboard">
          <IoChevronBackOutline /> Quay lại chọn gói
        </button>
      </div>
    </div>
  );
}


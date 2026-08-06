import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { pendingPaymentStorage } from '../../utils/pendingPaymentStorage';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import './SubscriptionPlans.css';

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { user, isPremium, subscription } = useAuth();
  const accountId = user?.accountId || user?.account_id;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingPayment, setPendingPayment] = useState(null);

  useEffect(() => {
    if (accountId) {
      setPendingPayment(pendingPaymentStorage.getPendingPayment(accountId));
    }
  }, [accountId]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await subscriptionService.getAllPlans();
        // Sort plans by price
        const sortedPlans = (data.data || []).sort((a, b) => a.price - b.price);
        setPlans(sortedPlans);
      } catch (err) {
        console.error('Lỗi khi tải gói dịch vụ:', err);
        setError('Không thể tải danh sách gói dịch vụ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const activePlan = plans.find((p) => p.plan_id === subscription?.plan_id);

  const handleSelectPlan = (plan, scenarioType = 'new') => {
    if (plan.price === 0) return;

    if (pendingPayment && pendingPayment.plan?.plan_id !== plan.plan_id) {
      const confirmChange = window.confirm(
        `Bạn đang có mã QR thanh toán chưa hoàn tất cho gói "${pendingPayment.plan?.name}". Bạn có muốn hủy mã cũ để chọn gói "${plan.name}" không?`
      );
      if (!confirmChange) return;
      pendingPaymentStorage.clearPendingPayment();
      setPendingPayment(null);
    }

    navigate('/subscription/payment', {
      state: {
        plan,
        scenario: scenarioType,
        activePlan,
      },
    });
  };

  const handleCancelPending = () => {
    pendingPaymentStorage.clearPendingPayment();
    setPendingPayment(null);
  };

  const getFeaturesList = (featuresJson) => {
    try {
      const keys = JSON.parse(featuresJson || '[]');
      const featureMap = {
        ai_basic: 'Gợi ý món ăn AI cơ bản',
        ai_advanced: 'Gợi ý thực đơn AI nâng cao & cá nhân hóa',
        meal_plan: 'Tạo kế hoạch ăn uống tự động',
        calorie_tracking: 'Theo dõi dinh dưỡng & nhật ký chi tiết',
        no_ads: 'Trải nghiệm mượt mà không quảng cáo',
        priority_support: 'Hỗ trợ khách hàng ưu tiên 24/7',
        family_sharing: 'Chia sẻ tài khoản gia đình (tối đa 4 người)',
      };
      return keys.map(k => featureMap[k] || k);
    } catch {
      return ['Đầy đủ tính năng Pro'];
    }
  };

  if (loading) {
    return (
      <div className="plans-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách các gói dịch vụ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plans-error-container">
        <div className="error-icon"><FiAlertTriangle size={32} /></div>
        <p className="error-msg">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">Tải lại</button>
      </div>
    );
  }

  const getEffectiveTier = (p) => {
    if (!p) return 0;
    if (p.tier !== undefined && p.tier !== null && p.tier > 0) return p.tier;
    if (p.price === 0) return 0;
    if (p.duration >= 365) return 3;
    if (p.duration >= 30) return 2;
    return 1;
  };

  const activeTier = getEffectiveTier(activePlan);

  return (
    <div className="plans-container">
      <div className="plans-header">
        <span className="badge-premium">SMARTMEAL PRO</span>
        <h1 className="plans-title">Nâng Cấp Sức Khỏe Toàn Diện</h1>
        <p className="plans-subtitle">
          Mở khóa những tính năng phân tích và gợi ý thực đơn chuyên sâu hỗ trợ bởi trí tuệ nhân tạo (AI).
        </p>
      </div>

      {pendingPayment && !isPremium && (
        <div className="pending-payment-banner">
          <div className="pending-banner-text">
            <p>
              ⚠️ Bạn đang có giao dịch thanh toán cho gói <strong>{pendingPayment.plan?.name || 'Pro'}</strong> đang chờ xử lý.
            </p>
          </div>
          <div className="pending-banner-actions">
            <button
              type="button"
              className="btn-resume-payment"
              onClick={() => navigate('/subscription/payment', { state: { plan: pendingPayment.plan } })}
            >
              Tiếp tục thanh toán (Mã QR)
            </button>
            <button
              type="button"
              className="btn-cancel-pending"
              onClick={handleCancelPending}
            >
              Hủy giao dịch
            </button>
          </div>
        </div>
      )}

      {isPremium && subscription && (
        <div className="active-sub-banner">
          <div className="sub-banner-icon"><FiCheckCircle size={24} /></div>
          <div className="sub-banner-text">
            <h3>Bạn đang sử dụng gói Pro: <strong>{activePlan?.name || 'Pro'}</strong></h3>
            <p>
              Hạn dùng đến hết ngày:{' '}
              <strong>
                {subscription.endDate
                  ? new Date(subscription.endDate).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Vĩnh viễn'}
              </strong>
            </p>
          </div>
        </div>
      )}

      <div className="plans-grid">
        {plans.map((plan) => {
          const isCurrent = subscription && subscription.plan_id === plan.plan_id;
          const isFree = plan.price === 0;
          const features = getFeaturesList(plan.features);

          const planTier = getEffectiveTier(plan);
          const isLowerTier = isPremium && subscription && !isCurrent && (planTier < activeTier || plan.price < (activePlan?.price || 0));
          const isHigherTier = isPremium && subscription && !isCurrent && (planTier > activeTier || plan.price > (activePlan?.price || 0));

          return (
            <div
              key={plan.plan_id}
              className={`plan-card ${plan.price > 0 && plan.duration === 30 ? 'featured-plan' : ''} ${
                isCurrent ? 'active-plan' : ''
              }`}
            >
              {plan.price > 0 && plan.duration === 30 && (
                <div className="featured-badge">PHỔ BIẾN NHẤT</div>
              )}

              <div className="plan-card-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-desc">{plan.description}</p>
                <div className="plan-price-container">
                  <span className="plan-price">
                    {plan.price === 0
                      ? 'Miễn phí'
                      : new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="plan-duration">/{plan.duration} ngày</span>
                  )}
                </div>
              </div>

              <div className="plan-card-body">
                <h4 className="features-title">Tính năng bao gồm:</h4>
                <ul className="features-list">
                  {features.map((feat, idx) => (
                    <li key={idx} className="feature-item">
                      <span className="check-icon">✓</span>
                      <span className="feature-text">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-card-footer">
                {isFree ? (
                  <button className="btn-plan btn-free-tier" disabled>
                    Mặc định tài khoản
                  </button>
                ) : isCurrent ? (
                  <>
                    <button
                      onClick={() => handleSelectPlan(plan, 'renew')}
                      className="btn-plan btn-plan-renew"
                    >
                      🔄 Gia hạn gói ngay
                    </button>
                    <div className="plan-card-subtext">Cộng tiếp {plan.duration} ngày vào thời hạn hiện tại</div>
                  </>
                ) : isLowerTier ? (
                  <>
                    <button className="btn-plan btn-plan-lower" disabled title="Gói hiện tại của bạn có đặc quyền cao hơn">
                      Gói hiện tại cao hơn
                    </button>
                    <div className="plan-card-subtext">Bạn đang sở hữu đặc quyền cao hơn gói này</div>
                  </>
                ) : isHigherTier ? (
                  <>
                    <button
                      onClick={() => handleSelectPlan(plan, 'upgrade')}
                      className="btn-plan btn-plan-upgrade"
                    >
                      🚀 Nâng cấp ngay
                    </button>
                    <div className="plan-card-subtext">Tự động cộng dồn số ngày chưa dùng của gói cũ</div>
                  </>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan, 'new')}
                    className={`btn-plan ${plan.duration === 30 ? 'btn-featured' : 'btn-regular'}`}
                  >
                    Đăng ký ngay
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="plans-faq">
        <h2 className="faq-main-title">Những câu hỏi thường gặp</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Quy trình thanh toán hoạt động như thế nào?</h3>
            <p>
              Hệ thống hỗ trợ thanh toán qua chuyển khoản ngân hàng quét mã VietQR hoặc ví điện tử MoMo. Mã QR chứa đầy đủ số tiền và thông tin giao dịch để bạn thanh toán tự động, nhanh chóng.
            </p>
          </div>
          <div className="faq-item">
            <h3>Tôi có thể hủy gói giữa chừng không?</h3>
            <p>
              Các gói dịch vụ sau khi đăng ký sẽ tự động kết thúc khi hết hạn mà không tự động gia hạn tự động trừ tiền, vì vậy bạn hoàn toàn yên tâm sử dụng mà không lo phát sinh chi phí ngoài ý muốn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



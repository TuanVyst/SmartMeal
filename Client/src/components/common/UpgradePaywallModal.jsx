import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiStar, FiCheck, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './UpgradePaywallModal.css';

const UpgradePaywallModal = ({ isOpen, onClose, featureName = "Tính năng này" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return createPortal(
    <div className={`paywall-overlay ${isOpen ? 'show' : ''}`}>
      <div className="paywall-backdrop" onClick={onClose}></div>
      <div className="paywall-modal">
        <button className="paywall-close-btn" onClick={onClose}>
          <FiX />
        </button>
        
        <div className="paywall-header">
          <div className="paywall-icon-wrapper">
            <FiStar className="paywall-icon" />
          </div>
          <h2>Nâng Cấp Tài Khoản Pro</h2>
          <p>{featureName} chỉ dành riêng cho thành viên Pro. Khám phá toàn bộ sức mạnh của SmartMeal!</p>
        </div>

        <div className="paywall-features">
          <div className="feature-item">
            <div className="feature-icon"><FiCheck /></div>
            <span>Tạo thực đơn thông minh bằng AI</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FiCheck /></div>
            <span>Gợi ý thay đổi món ăn tự động</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FiCheck /></div>
            <span>Theo dõi chỉ số dinh dưỡng nâng cao</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><FiCheck /></div>
            <span>Không giới hạn công thức nấu ăn</span>
          </div>
        </div>

        <div className="paywall-actions">
          <button 
            className="paywall-upgrade-btn"
            onClick={() => {
              onClose();
              navigate('/subscription');
            }}
          >
            Xem Các Gói Pro Ngay
          </button>
          <button className="paywall-cancel-btn" onClick={onClose}>
            Để sau
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UpgradePaywallModal;

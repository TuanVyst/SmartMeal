import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { FiUser, FiAward } from 'react-icons/fi';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateAvatar, isPremium, subscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const [activeTab, setActiveTab] = useState('profile'); // profile | subscription
  const [history, setHistory] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    setAvatarPreview(user?.avatar || '');
    setAvatarFile(null);
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || ''
    });
  }, [user]);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      const accId = user?.accountId || user?.account_id;
      if (!accId) return;

      setLoadingHistory(true);
      try {
        const [plansRes, historyRes] = await Promise.all([
          subscriptionService.getAllPlans(),
          subscriptionService.getSubscriptionsByAccountId(accId)
        ]);
        setPlans(plansRes.data.data || []);
        // Sort history by StartDate descending
        const sortedHistory = (historyRes.data.data || []).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setHistory(sortedHistory);
      } catch (err) {
        console.error('Lỗi khi tải lịch sử đăng ký:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (activeTab === 'subscription') {
      fetchSubscriptionData();
    }
  }, [activeTab, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarFile(file);
    setAvatarMsg('');
  };

  const handleAvatarSave = async () => {
    if (!avatarFile) return;
    setAvatarMsg('');
    setAvatarUploading(true);
    try {
      const result = await updateAvatar(avatarFile);
      const savedAvatarUrl = result?.avatarUrl || '';
      if (savedAvatarUrl) {
        setAvatarPreview(savedAvatarUrl);
      }
      setAvatarFile(null);
      setAvatarMsg('Đã cập nhật ảnh đại diện!');
      setTimeout(() => setAvatarMsg(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật ảnh. Vui lòng thử lại.';
      setAvatarMsg(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Cập nhật hồ sơ thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 800);
  };

  const currentAvatar = avatarPreview.trim() || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username||'U')}&background=38bdf8&color=fff&size=96`;

  return (
    <div className="profile-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>
        &larr; Quay lại Bảng điều khiển
      </button>

      <div className="profile-tabs">
        <button
          className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser size={16} /> Hồ sơ cá nhân
        </button>
        <button
          className={`profile-tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          <FiAward size={16} /> Gói Premium & Lịch sử
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="profile-card">
          <h2 className="profile-title">Hồ sơ tài khoản</h2>
          <p className="profile-subtitle">Quản lý thông tin cá nhân của bạn</p>

          {successMsg && <div className="alert-success">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group" style={{textAlign:'center',marginBottom:'1.5rem'}}>
              <img
                src={currentAvatar}
                alt="Avatar"
                style={{width:96,height:96,borderRadius:'50%',objectFit:'cover',border: isPremium ? '3px solid #D4AF37' : '3px solid #cbd5e1'}}
              />
              <div style={{marginTop:'.75rem'}}>
                <label htmlFor="avatar-file" style={{display:'block',fontSize:'.85rem',color:'#94a3b8',marginBottom:'.35rem'}}>Chọn ảnh từ thiết bị</label>
                <div style={{display:'flex',gap:'.5rem',maxWidth:360,margin:'0 auto'}}>
                  <input
                    id="avatar-file"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="form-input"
                    style={{flex:1, padding:'.45rem .5rem'}}
                  />
                  <button
                    type="button"
                    onClick={handleAvatarSave}
                    disabled={avatarUploading || !avatarFile}
                    className="btn-save"
                    style={{padding:'.5rem 1rem',fontSize:'.85rem',whiteSpace:'nowrap'}}
                  >
                    {avatarUploading ? '...' : 'Lưu ảnh'}
                  </button>
                </div>
              </div>
              {avatarMsg && <div style={{marginTop:'.5rem',fontSize:'.8rem',color: avatarMsg.includes('Lỗi') || avatarMsg.includes('lỗi') ? '#f87171' : '#4ade80'}}>{avatarMsg}</div>}
            </div>
            <div className="form-group readonly-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <input
                type="text"
                id="username"
                value={user?.username || 'Khách'}
                readOnly
                className="form-input readonly-input"
              />
              <span className="help-text">Tên đăng nhập không thể thay đổi.</span>
            </div>

            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Nhập email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Địa chỉ</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input textarea-input"
                placeholder="Nhập địa chỉ đầy đủ"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="profile-card">
          <h2 className="profile-title">Gói Premium & Lịch sử</h2>
          <p className="profile-subtitle">Xem trạng thái dịch vụ và lịch sử giao dịch của bạn</p>

          <div className={`premium-status-section ${isPremium ? 'active-premium' : ''}`}>
            <div className="status-info">
              {isPremium && subscription ? (
                <>
                  <h3>Trạng thái: <strong style={{color: '#16a34a'}}>Đã đăng ký (Premium PRO)</strong></h3>
                  <p>Hạn dùng đến hết: <strong>{subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Vĩnh viễn'}</strong></p>
                </>
              ) : (
                <>
                  <h3>Trạng thái: <strong>Gói Cơ Bản (Miễn phí)</strong></h3>
                  <p>Nâng cấp lên gói Premium để sử dụng tính năng thực đơn AI nâng cao.</p>
                </>
              )}
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="btn-renew-premium"
            >
              {isPremium ? 'Gia hạn gói Premium' : 'Nâng cấp ngay'}
            </button>
          </div>

          <h3 className="history-title">Lịch sử đăng ký của bạn</h3>

          {loadingHistory ? (
            <div style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>Đang tải lịch sử đăng ký...</div>
          ) : history.length === 0 ? (
            <div className="empty-history">Bạn chưa đăng ký gói Premium nào trước đây.</div>
          ) : (
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Gói dịch vụ</th>
                    <th>Ngày bắt đầu</th>
                    <th>Ngày kết thúc</th>
                    <th>Mã giao dịch (Payment Ref)</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((sub) => {
                    const planInfo = plans.find((p) => p.plan_id === sub.plan_id);
                    const now = new Date();
                    const isExpired = sub.endDate && new Date(sub.endDate) < now;
                    let displayStatus = sub.status === 'active' ? (isExpired ? 'Hết hạn' : 'Đang hoạt động') : sub.status;

                    return (
                      <tr key={sub.sub_id}>
                        <td><strong>{planInfo?.name || 'Pro'}</strong></td>
                        <td>{new Date(sub.startDate).toLocaleDateString('vi-VN')}</td>
                        <td>{sub.endDate ? new Date(sub.endDate).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}</td>
                        <td><code style={{background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85rem'}}>{sub.paymentRef || 'N/A'}</code></td>
                        <td>
                          <span className={`status-badge ${sub.status === 'active' ? (isExpired ? 'expired' : 'active') : sub.status}`}>
                            {displayStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

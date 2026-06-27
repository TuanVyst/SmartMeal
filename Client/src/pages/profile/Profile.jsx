import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateAvatar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    setAvatarUrl(user?.avatar || '');
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      address: user?.address || ''
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSave = async () => {
    const url = avatarUrl.trim();
    if (!url) return;
    setAvatarMsg('');
    setAvatarUploading(true);
    try {
      await updateAvatar(url);
      setAvatarMsg('Đã cập nhật ảnh đại diện!');
      setTimeout(() => setAvatarMsg(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật ảnh. Vui lòng thử lại.';
      setAvatarMsg(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    // ponytail: fake timeout — replace with PUT /auth/profile when BE ready
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Cập nhật hồ sơ thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 800);
  };

  const currentAvatar = avatarUrl.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username||'U')}&background=38bdf8&color=fff&size=96`;

  return (
    <div className="profile-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>
        &larr; Quay lại Bảng điều khiển
      </button>
      <div className="profile-card">
        <h2 className="profile-title">Hồ sơ tài khoản</h2>
        <p className="profile-subtitle">Quản lý thông tin cá nhân của bạn</p>

        {successMsg && <div className="alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group" style={{textAlign:'center',marginBottom:'1.5rem'}}>
            <img
              src={currentAvatar}
              alt="Avatar"
              style={{width:96,height:96,borderRadius:'50%',objectFit:'cover',border:'3px solid #38bdf8'}}
            />
            <div style={{marginTop:'.75rem'}}>
              <label htmlFor="avatar-url" style={{display:'block',fontSize:'.85rem',color:'#94a3b8',marginBottom:'.35rem'}}>URL ảnh đại diện</label>
              <div style={{display:'flex',gap:'.5rem',maxWidth:360,margin:'0 auto'}}>
                <input
                  id="avatar-url"
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="form-input"
                  style={{flex:1}}
                />
                <button
                  type="button"
                  onClick={handleAvatarSave}
                  disabled={avatarUploading || !avatarUrl.trim()}
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
    </div>
  );
}

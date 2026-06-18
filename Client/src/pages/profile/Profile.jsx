import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    setFormData({
      name: 'Nguyễn Văn A',
      phone: '0123456789',
      email: 'nguyenvana@example.com',
      address: '123 Đường Chính, Quận 1, TP.HCM'
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

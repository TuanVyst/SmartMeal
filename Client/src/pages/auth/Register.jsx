import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const { register, verifyRegisterOtp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    if (form.username.length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const result = await register({
        name: form.name,
        username: form.username,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      if (result.requiresOtp) {
        setPendingEmail(result.email);
        setOtpStep(true);
      } else if (result.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat();
        setError(messages.join('. '));
      } else if (err.response?.data?.title) {
        setError(err.response.data.title);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối máy chủ. Hãy đảm bảo backend đang chạy.');
      } else {
        setError('Đăng ký thất bại');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await verifyRegisterOtp(pendingEmail, otpCode);
      if (result.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối máy chủ. Hãy đảm bảo backend đang chạy.');
      } else {
        setError('Xác thực OTP thất bại');
      }
    }
  };

  if (otpStep) {
    return (
        <div className="auth-card-modern">
          <Link to="/" className="back-home">← Về trang chủ</Link>
          <h1>Xác thực Email</h1>
          <p className="auth-subtitle">Nhập mã đã gửi đến <strong>{pendingEmail}</strong></p>
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label>Mã OTP</label>
              <input
                type="text"
                placeholder="Nhập mã 6 chữ số"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                maxLength={6}
                autoFocus
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn-submit">Xác thực & Tạo tài khoản</button>
          </form>
          <p className="auth-footer-text">
            <button className="btn-link" onClick={() => { setOtpStep(false); setOtpCode(''); setError(''); }}>
              Quay lại đăng ký
            </button>
          </p>
        </div>
    );
  }

  return (
        <div className="auth-card-modern">
          <Link to="/" className="back-home">← Về trang chủ</Link>
          <h1>Tạo tài khoản</h1>
        <p className="auth-subtitle">Tham gia SmartMeal và bắt đầu hành trình nấu ăn của bạn</p>
        <form onSubmit={handleSubmit}>
          <div className="register-row">
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="name"
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                placeholder="nguyenvana (tối thiểu 3 ký tự)"
                value={form.username}
                onChange={handleChange}
                required
                minLength={3}
              />
            </div>
          </div>
          <div className="register-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="nguyen@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại (không bắt buộc)</label>
              <input
                type="tel"
                name="phone"
                placeholder="+84 123 456 789"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Địa chỉ (không bắt buộc)</label>
            <input
              type="text"
              name="address"
              placeholder="Địa chỉ của bạn"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div className="register-row">
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                name="password"
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-submit">Tạo tài khoản</button>
        </form>
        <p className="auth-footer-text">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
    </div>
  );
}

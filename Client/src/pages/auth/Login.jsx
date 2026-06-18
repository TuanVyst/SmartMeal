import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const { login, verifyOtp, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login({ emailOrUsername: form.emailOrUsername, password: form.password });
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
      } else if (err.response?.data?.title) {
        setError(err.response.data.title);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Không thể kết nối máy chủ. Hãy đảm bảo backend đang chạy.');
      } else {
        setError('Đăng nhập thất bại');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await verifyOtp(pendingEmail, otpCode);
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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const result = await googleLogin(credentialResponse.credential);
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
        setError('Đăng nhập Google thất bại');
      }
    }
  };

  if (otpStep) {
    return (
        <div className="auth-card-modern">
          <Link to="/" className="back-home">← Về trang chủ</Link>
          <h1>Xác thực OTP</h1>
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
            <button type="submit" className="btn-submit">Xác thực</button>
          </form>
          <p className="auth-footer-text">
            <button className="btn-link" onClick={() => { setOtpStep(false); setOtpCode(''); setError(''); }}>
              Quay lại đăng nhập
            </button>
          </p>
        </div>
    );
  }

  return (
        <div className="auth-card-modern">
          <Link to="/" className="back-home">← Về trang chủ</Link>
          <h1>Chào mừng trở lại</h1>
        <p className="auth-subtitle">Đăng nhập để tiếp tục với SmartMeal</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email hoặc tên đăng nhập</label>
            <input
              type="text"
              placeholder="you@example.com hoặc tên đăng nhập"
              value={form.emailOrUsername}
              onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="forgot-password">
            <a href="#forgot">Quên mật khẩu?</a>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-submit">Đăng nhập</button>
        </form>
        <div className="divider">hoặc tiếp tục với</div>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Đăng nhập Google thất bại')}
          shape="pill"
          text="signin_with"
          theme="outline"
          size="large"
        />
        <p className="auth-footer-text">
          Chưa có tài khoản? <Link to="/register">Tạo ngay</Link>
        </p>
    </div>
  );
}

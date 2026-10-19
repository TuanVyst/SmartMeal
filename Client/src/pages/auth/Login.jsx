import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const { login, verifyOtp, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Load remembered credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartmeal_remember_login');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.emailOrUsername) {
          setForm((prev) => ({ ...prev, emailOrUsername: parsed.emailOrUsername }));
          setRememberMe(true);
        }
      }
    } catch {}
  }, []);

  const handleRememberMeSave = () => {
    try {
      if (rememberMe) {
        localStorage.setItem(
          'smartmeal_remember_login',
          JSON.stringify({ emailOrUsername: form.emailOrUsername })
        );
      } else {
        localStorage.removeItem('smartmeal_remember_login');
      }
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login({ emailOrUsername: form.emailOrUsername, password: form.password });
      handleRememberMeSave();

      if (result.requiresOtp) {
        setPendingEmail(result.email);
        setOtpStep(true);
      } else if (result.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Không thể kết nối với máy chủ. Vui lòng thử lại sau.');
      } else if (
        err.response?.status === 401 ||
        err.response?.data?.message?.includes('Invalid') ||
        err.response?.data?.message?.includes('không chính xác')
      ) {
        setError('Tài khoản hoặc mật khẩu không chính xác');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await verifyOtp(pendingEmail, otpCode);
      handleRememberMeSave();

      if (result.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Không thể kết nối với máy chủ. Vui lòng thử lại sau.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
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
        navigate('/');
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Không thể kết nối với máy chủ. Vui lòng thử lại sau.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
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
        {/* Email / Username */}
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

        {/* Password with Toggle Visibility */}
        <div className="form-group">
          <label>Mật khẩu</label>
          <div className="password-input-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password Options Row */}
        <div className="login-options-row">
          <label className="remember-me-label">
            <input
              type="checkbox"
              className="remember-me-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Ghi nhớ đăng nhập</span>
          </label>

          <Link
            to="/forgot-password"
            className="forgot-password-btn"
          >
            Quên mật khẩu?
          </Link>
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

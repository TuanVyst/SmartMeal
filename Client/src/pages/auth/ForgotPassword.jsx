import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Bước 1: Yêu cầu OTP qua email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.data?.success) {
        toast.success(res.data.message || 'Mã OTP đã được gửi đến email của bạn!');
        setStep(2);
      } else {
        setError(res.data?.message || 'Không thể gửi mã xác nhận.');
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Không thể kết nối với máy chủ. Vui lòng thử lại sau.');
      } else {
        setError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu. Vui lòng kiểm tra lại email.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP và đặt lại mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({
        email: email.trim(),
        otpCode: otpCode.trim(),
        newPassword,
        confirmNewPassword,
      });

      if (res.data?.success) {
        setSuccess(true);
        toast.success('Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(res.data?.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Không thể kết nối với máy chủ. Vui lòng thử lại sau.');
      } else {
        setError(err.response?.data?.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-card-modern">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ color: '#16a34a', marginBottom: '16px' }}>
            <FiCheckCircle size={60} />
          </div>
          <h1>Đặt lại mật khẩu thành công!</h1>
          <p className="auth-subtitle" style={{ maxWidth: 360, margin: '8px auto 24px' }}>
            Mật khẩu mới của bạn đã được cập nhật thành công. Đang chuyển hướng về trang đăng nhập...
          </p>
          <Link to="/login" className="btn-submit" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card-modern">
      <Link to="/login" className="back-home">
        <FiArrowLeft size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Quay lại Đăng nhập
      </Link>

      {step === 1 ? (
        <>
          <h1>Quên mật khẩu?</h1>
          <p className="auth-subtitle">
            Đừng lo lắng! Hãy nhập email đã đăng ký của bạn, SmartMeal sẽ gửi mã OTP xác thực để bạn thiết lập lại mật khẩu mới.
          </p>

          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label>
                Địa chỉ email <span className="req">*</span>
              </label>
              <div className="password-input-wrap">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn-submit" disabled={loading || !email.trim()}>
              {loading ? 'Đang gửi mã OTP...' : 'Gửi mã xác nhận'}
            </button>
          </form>

          <p className="auth-footer-text">
            Nhớ mật khẩu của bạn? <Link to="/login">Đăng nhập</Link>
          </p>
        </>
      ) : (
        <>
          <h1>Đặt lại mật khẩu</h1>
          <p className="auth-subtitle">
            Mã OTP 6 chữ số đã được gửi tới <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc thư rác).
          </p>

          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>
                Mã xác thực OTP <span className="req">*</span>
              </label>
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

            <div className="form-group">
              <label>
                Mật khẩu mới <span className="req">*</span>
              </label>
              <div className="password-input-wrap">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>
                Xác nhận mật khẩu mới <span className="req">*</span>
              </label>
              <div className="password-input-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !otpCode.trim() || !newPassword || !confirmNewPassword}
            >
              {loading ? 'Đang cập nhật mật khẩu...' : 'Xác nhận đặt lại mật khẩu'}
            </button>
          </form>

          <p className="auth-footer-text">
            Chưa nhận được mã?{' '}
            <button
              type="button"
              className="btn-link"
              onClick={() => { setStep(1); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontWeight: 600 }}
            >
              Gửi lại mã
            </button>
          </p>
        </>
      )}
    </div>
  );
}

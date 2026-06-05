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
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.title) {
        setError(err.response.data.title);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError('Login failed');
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await verifyOtp(pendingEmail, otpCode);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError('OTP verification failed');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError('Google login failed');
      }
    }
  };

  if (otpStep) {
    return (
        <div className="auth-card-modern">
          <Link to="/" className="back-home">← Back to home</Link>
          <h1>Verify OTP</h1>
          <p className="auth-subtitle">Enter the code sent to <strong>{pendingEmail}</strong></p>
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label>OTP Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
                maxLength={6}
                autoFocus
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" className="btn-submit">Verify</button>
          </form>
          <p className="auth-footer-text">
            <button className="btn-link" onClick={() => { setOtpStep(false); setOtpCode(''); setError(''); }}>
              Back to login
            </button>
          </p>
        </div>
    );
  }

  return (
        <div className="auth-card-modern">
          <Link to="/" className="back-home">← Back to home</Link>
          <h1>Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue to SmartMeal</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Username</label>
            <input
              type="text"
              placeholder="you@example.com or username"
              value={form.emailOrUsername}
              onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="forgot-password">
            <a href="#forgot">Forgot Password?</a>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-submit">Sign In</button>
        </form>
        <div className="divider">or continue with</div>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google login failed')}
          shape="pill"
          text="signin_with"
          theme="outline"
          size="large"
        />
        <p className="auth-footer-text">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
    </div>
  );
}

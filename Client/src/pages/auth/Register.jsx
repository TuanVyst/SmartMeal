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
      setError('Passwords do not match');
      return;
    }
    if (form.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
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
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError('Registration failed');
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
        setError('Cannot connect to server. Make sure the backend is running.');
      } else {
        setError('OTP verification failed');
      }
    }
  };

  if (otpStep) {
    return (
        <div className="auth-card-modern">
          <Link to="/" className="back-home">← Back to home</Link>
          <h1>Verify Email</h1>
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
            <button type="submit" className="btn-submit">Verify & Create Account</button>
          </form>
          <p className="auth-footer-text">
            <button className="btn-link" onClick={() => { setOtpStep(false); setOtpCode(''); setError(''); }}>
              Back to registration
            </button>
          </p>
        </div>
    );
  }

  return (
        <div className="auth-card-modern">
          <Link to="/" className="back-home">← Back to home</Link>
          <h1>Create Account</h1>
        <p className="auth-subtitle">Join SmartMeal and start your cooking journey</p>
        <form onSubmit={handleSubmit}>
          <div className="register-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                placeholder="johndoe (min 3 characters)"
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
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone (optional)</label>
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
            <label>Address (optional)</label>
            <input
              type="text"
              name="address"
              placeholder="Your address"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div className="register-row">
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn-submit">Create Account</button>
        </form>
        <p className="auth-footer-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
    </div>
  );
}

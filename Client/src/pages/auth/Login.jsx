import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ emailOrUsername: form.emailOrUsername, password: form.password });
      navigate('/dashboard');
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

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-modern">
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
        <button className="btn-google" onClick={() => alert('Google login coming soon!')}>
          <FcGoogle size={20} /> Sign in with Google
        </button>
        <p className="auth-footer-text">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const API = process.env.REACT_APP_API_URL || '/api';

// ── Register ──────────────────────────────────────────
export function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/register`, form);
      if (data.success) {
        // Since registration is successful and no OTP is needed, redirect to login
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Zing Bites & start ordering!">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">⚠️ {error}</div>}
        <div className="form-group">
          <label>Full Name *</label>
          <input name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input name="password" type="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} required minLength={6} />
        </div>
        <div className="form-group">
          <label>Confirm Password *</label>
          <input name="confirmPassword" type="password" placeholder="Retype your password" value={form.confirmPassword} onChange={handleChange} required minLength={6} />
        </div>
        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
          {loading ? '⏳ Registering...' : '🚀 Register Now'}
        </button>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </AuthLayout>
  );
}

// ── Login ─────────────────────────────────────────────
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(window.history.state?.usr?.message || '');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true); setSuccess('');
    try {
      const { data } = await axios.post(`${API}/auth/login`, form);
      if (data.success) {
        login(data.token, data.user);
        setTargetUser(data.user);
        setShowLoginModal(true);
        const destination = location.state?.from || '/';
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Log in to order fresh food from Zing Bites">
      <form onSubmit={handleSubmit} className="auth-form">
        {success && <div className="auth-success">✅ {success}</div>}
        {error && <div className="auth-error">⚠️ {error}</div>}
        <div className="form-group">
          <label>Email *</label>
          <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input name="password" type="password" placeholder="Your password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
          {loading ? '⏳ Logging in...' : '🚀 Login'}
        </button>
        <p className="auth-switch">New here? <Link to="/register">Create account</Link></p>
      </form>

      {showLoginModal && (
        <div className="login-success-overlay">
          <div className="login-success-card">
            <div className="login-success-brand">
              <img src="/images/download.png" alt="Logo" />
              <span>Zing_<span>Bites</span></span>
            </div>
            <div className="login-success-content">
              <div className="success-pulse">✓</div>
              <h2>Successfully Logged In!</h2>
              <p>Welcome back, <strong>{targetUser?.name || 'User'}</strong></p>
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

// ── Admin Login ──────────────────────────────────────────
export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [targetAdmin, setTargetAdmin] = useState(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, form);
      if (data.success) {
        login(data.token, data.user);
        setTargetAdmin(data.user);
        setShowAdminModal(true);
        const destination = '/admin';
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Admin Portal" subtitle="Login with your admin email & password">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">⚠️ {error}</div>}
        <div className="form-group">
          <label>Admin Email *</label>
          <input name="email" type="email" placeholder="admin@zingbites.com" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input name="password" type="password" placeholder="Admin password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
          {loading ? '⏳ Verifying...' : '🔐 Secure Admin Login'}
        </button>
        <p className="auth-switch"><Link to="/login">Back to Customer Login</Link></p>
      </form>

      {showAdminModal && (
        <div className="login-success-overlay">
          <div className="login-success-card">
            <div className="login-success-brand">
              <img src="/images/download.png" alt="Logo" />
              <span>Zing_<span>Bites</span></span>
            </div>
            <div className="login-success-content">
              <div className="success-pulse">👑</div>
              <h2>Successfully Logged In!</h2>
              <p>Welcome back, <strong>{targetAdmin?.name || 'ZingAdmin'}</strong></p>
              <div className="loading-bar">
                <div className="loading-progress"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

// ── OTP Verification ──────────────────────────────────
export function VerifyOTP() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const email = window.history.state?.usr?.email || '';
  const inputsRef = React.useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputsRef.current[i - 1]?.focus();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) { setError('Please enter all 6 digits'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/verify-otp`, { email, otp: otpStr });
      if (data.success) {
        login(data.token, data.user);
        setSuccess('✅ Verified! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const resendOTP = async () => {
    try {
      await axios.post(`${API}/auth/resend-otp`, { email });
      setSuccess('OTP resent to your email!');
    } catch { setError('Failed to resend OTP'); }
  };

  return (
    <AuthLayout title="Verify Email 📧" subtitle={`Enter the 6-digit OTP sent to ${email}`}>
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}
        <div className="otp-grid">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => inputsRef.current[i] = el}
              type="text"
              maxLength={1}
              className="otp-input"
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoFocus={i === 0}
            />
          ))}
        </div>
        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
          {loading ? '⏳ Verifying...' : '✅ Verify OTP'}
        </button>
        <p className="auth-switch">
          Didn't get OTP? <button type="button" onClick={resendOTP} className="link-btn">Resend</button>
        </p>
      </form>
    </AuthLayout>
  );
}

// ── Layout ─────────────────────────────────────────────
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-shapes">
          {[...Array(6)].map((_, i) => <div key={i} className={`auth-shape s${i}`}></div>)}
        </div>
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-brand">
            <Link to="/" className="auth-logo-link">
              <img src="/images/download.png" alt="Zing_Bites Logo" className="auth-logo-img" />
              <div className="auth-brand-text">Zing_<span>Bites</span></div>
            </Link>
          </div>
          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

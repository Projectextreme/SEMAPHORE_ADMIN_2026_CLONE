import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import './LoginView.css';

export const LoginView = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('semaphore2026@gmail.com');
  const [password, setPassword] = useState('mca@9988');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMsg('');
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      setSuccessMsg(`Welcome back, ${res.name}!`);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillSuperAdmin = () => {
    setEmail('semaphore2026@gmail.com');
    setPassword('mca@9988');
    setErrorMessage('');
  };

  const handleQuickFillAdmin = () => {
    setEmail('john@example.com');
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="login-container">
      <div className="login-background-glow"></div>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo-badge">
            <ShieldCheck className="logo-icon" />
          </div>
          <h1 className="login-title">SEMAPHORE 2026</h1>
          <p className="login-subtitle">Admin Control Portal</p>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle className="alert-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 className="alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="admin-email"
                type="email"
                className="form-input"
                placeholder="admin@semaphore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-wrapper">
                <span className="spinner"></span> Authenticating...
              </span>
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div className="quick-fill-section">
          <div className="quick-fill-title">
            <Sparkles size={14} /> Quick Auto-Fill Demo Credentials
          </div>
          <div className="quick-fill-buttons">
            <button
              type="button"
              className="btn btn-sm btn-outline-cyan"
              onClick={handleQuickFillSuperAdmin}
            >
              Super Admin (semaphore2026@gmail.com)
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-purple"
              onClick={handleQuickFillAdmin}
            >
              Standard Admin (john@example.com)
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="login-footer">
          <span>Protected Route • Authorization & Security Strict Mode</span>
        </div>
      </div>
    </div>
  );
};

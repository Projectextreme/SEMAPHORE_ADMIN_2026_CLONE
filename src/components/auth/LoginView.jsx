import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import './LoginView.css';

export const LoginView = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="login-container">
      <div className="login-background-glow"></div>
      <div className="login-secondary-glow"></div>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo-badge">
            <ShieldCheck className="logo-icon" size={28} />
          </div>
          <div className="login-title-row">
            <h1 className="login-title">SEMAPHORE</h1>
            <span className="login-year-tag">2026</span>
          </div>
          <p className="login-subtitle">National Level IT Fest • Admin Console</p>
        </div>

        {/* Error / Success Banners */}
        {errorMessage && (
          <div className="alert alert-error">
            <AlertCircle size={16} className="alert-icon" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} className="alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Administrator Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={17} />
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
            <div className="password-label-row">
              <label className="form-label" htmlFor="admin-password">Password</label>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={17} />
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                <span className="spinner"></span> Verifying Credentials...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="login-footer">
          <Lock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          <span>Secure Administrator Portal • 256-bit Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};

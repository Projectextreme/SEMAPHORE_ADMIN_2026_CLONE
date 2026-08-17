import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, LogOut, User, Crown, Key, Sun, Moon } from 'lucide-react';
import './Header.css';

export const Header = () => {
  const { admin, logout, isSuperAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="main-header">
      <div className="header-brand">
        <div className="header-logo">
          <ShieldCheck size={22} className="brand-icon" />
        </div>
        <div className="brand-text">
          <span className="brand-name">SEMAPHORE 2026</span>
          <span className="brand-tag">ADMIN PORTAL</span>
        </div>
      </div>

      <div className="header-actions">
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn" 
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} className="theme-icon sun-icon" />
              <span className="theme-toggle-label">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} className="theme-icon moon-icon" />
              <span className="theme-toggle-label">Dark Mode</span>
            </>
          )}
        </button>

        <div className="admin-profile-badge">
          <div className="avatar-circle">
            {isSuperAdmin ? <Crown size={16} className="crown-icon" /> : <User size={16} />}
          </div>
          <div className="admin-info">
            <span className="admin-name">{admin?.name || 'Admin User'}</span>
            <span className="admin-email">{admin?.email}</span>
          </div>
          <span className={`role-badge ${admin?.role === 'superadmin' ? 'badge-superadmin' : 'badge-admin'}`}>
            {admin?.role === 'superadmin' ? (
              <>
                <Key size={11} /> Super Admin
              </>
            ) : (
              'Admin'
            )}
          </span>
        </div>

        <button onClick={logout} className="btn-logout" title="Sign Out">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};


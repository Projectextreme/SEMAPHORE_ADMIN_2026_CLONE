import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, LogOut, User, Crown, Key, Sun, Moon, Palette, Menu, X } from 'lucide-react';
import './Header.css';

export const Header = ({ isMobileNavOpen, onToggleMobileNav }) => {
  const navigate = useNavigate();
  const { admin, logout, isSuperAdmin } = useAuth();
  const { theme, toggleTheme, colorPreset, changeColorPreset } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const presets = [
    { id: 'indigo', name: 'Indigo Cobalt', color: '#6366f1' },
    { id: 'emerald', name: 'Emerald Mint', color: '#10b981' },
    { id: 'violet', name: 'Royal Violet', color: '#8b5cf6' },
    { id: 'amber', name: 'Sunset Amber', color: '#f59e0b' },
    { id: 'cyan', name: 'Electric Cyan', color: '#06b6d4' }
  ];

  return (
    <header className="main-header">
      <div className="header-left">
        <button 
          className={`mobile-nav-toggle ${isMobileNavOpen ? 'active' : ''}`}
          onClick={onToggleMobileNav}
          title="Toggle Navigation Menu"
          aria-label="Toggle navigation drawer"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/dashboard" className="header-brand" style={{ textDecoration: 'none' }}>
          <div className="header-logo">
            <ShieldCheck size={20} className="brand-icon" />
            <span className="logo-beacon"></span>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">SEMAPHORE</span>
              <span className="brand-year">2026</span>
            </div>
            <span className="brand-tag">ADMIN CONTROL SUITE</span>
          </div>
        </Link>
      </div>

      <div className="header-center-info">
        <div className="api-status-badge">
          <span className="pulse-dot"></span>
          <span className="status-text">REST Engine Live</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Color Palette Switcher */}
        <div className="color-picker-wrapper">
          <button 
            className="theme-palette-btn" 
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Choose Theme Accent Color"
            aria-label="Color Palette"
          >
            <Palette size={15} />
            <span className="color-dot-indicator" style={{ background: presets.find(p => p.id === colorPreset)?.color || '#6366f1' }}></span>
          </button>

          {showColorPicker && (
            <div className="color-palette-popover">
              <div className="palette-title">Accent Palette</div>
              <div className="palette-options">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    className={`palette-chip ${colorPreset === p.id ? 'active' : ''}`}
                    onClick={() => {
                      changeColorPreset(p.id);
                      setShowColorPicker(false);
                    }}
                    title={p.name}
                  >
                    <span className="chip-circle" style={{ background: p.color }}></span>
                    <span className="chip-label">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn" 
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} className="theme-icon sun-icon" />
              <span className="theme-toggle-label">Light</span>
            </>
          ) : (
            <>
              <Moon size={15} className="theme-icon moon-icon" />
              <span className="theme-toggle-label">Dark</span>
            </>
          )}
        </button>

        {/* Profile Chip */}
        <div className="admin-profile-badge">
          <div className="avatar-circle">
            {isSuperAdmin ? <Crown size={14} className="crown-icon" /> : <User size={14} />}
          </div>
          <div className="admin-info">
            <span className="admin-name">{admin?.name || 'Administrator'}</span>
            <span className="admin-email">{admin?.email || 'admin@semaphore.com'}</span>
          </div>
          <span className={`role-badge ${admin?.role === 'superadmin' ? 'badge-superadmin' : 'badge-admin'}`}>
            {admin?.role === 'superadmin' ? (
              <>
                <Key size={10} /> Superadmin
              </>
            ) : (
              'Admin'
            )}
          </span>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="btn-logout" title="Sign Out">
          <LogOut size={16} />
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
};

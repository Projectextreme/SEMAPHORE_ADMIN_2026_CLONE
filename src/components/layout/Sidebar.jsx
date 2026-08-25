import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  Calendar, 
  UserCheck, 
  Clock, 
  FileSpreadsheet,
  CheckCircle,
  Database,
  X,
  Building2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export const Sidebar = ({ isMobileNavOpen, onCloseMobileNav }) => {
  const { isSuperAdmin } = useAuth();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', path: '/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'reports', path: '/reports', label: 'Reports & Export Hub', icon: FileSpreadsheet, badge: 'XLSX' }
      ]
    },

    {
      title: 'EVENT OPERATIONS',
      items: [
        { id: 'colleges', path: '/colleges', label: 'College Directory', icon: Building2 },
        { id: 'events', path: '/events', label: 'Events Management', icon: Calendar, badge: 'Active' },
        { id: 'rules', path: '/rules', label: 'Team Rules & Guidelines', icon: BookOpen },
        { id: 'registrations', path: '/registrations', label: 'Team Registrations', icon: FileSpreadsheet },
        { id: 'payments', path: '/payments', label: 'Payment Approvals', icon: CreditCard, count: 2 },
        { id: 'coordinators', path: '/coordinators', label: 'Event Coordinators', icon: UserCheck },
        { id: 'slots', path: '/slots', label: 'Slots & Schedules', icon: Clock }
      ]
    },
    {
      title: 'SECURITY & USERS',
      items: [
        { id: 'users', path: '/users', label: 'User Directory', icon: Users },
        ...(isSuperAdmin ? [{ id: 'admins', path: '/admins', label: 'Admin Management', icon: ShieldCheck, badge: 'Super' }] : [])
      ]
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`sidebar-backdrop ${isMobileNavOpen ? 'visible' : ''}`}
        onClick={onCloseMobileNav}
        aria-hidden="true"
      />

      <aside className={`main-sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}>
        {/* Mobile Header Inside Sidebar */}
        <div className="sidebar-mobile-header">
          <span className="sidebar-mobile-title">Navigation Menu</span>
          <button 
            className="sidebar-close-btn"
            onClick={onCloseMobileNav}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-nav-container">
          {navSections.map((section, idx) => (
            <div key={idx} className="sidebar-section">
              <div className="sidebar-section-title">{section.title}</div>
              <div className="sidebar-items-list">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={onCloseMobileNav}
                      className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}
                    >
                      <Icon size={17} className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                      {item.count && <span className="nav-count">{item.count}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-system-card">
            <div className="system-card-top">
              <Database size={14} className="db-icon" />
              <span className="system-title">API REST Backend</span>
              <span className="system-live-pill">LIVE</span>
            </div>
            <span className="system-desc">JWT Auth & Admin Guard Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};


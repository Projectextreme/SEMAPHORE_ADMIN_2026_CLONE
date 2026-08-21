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
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export const Sidebar = ({ activeTab, setActiveTab, isMobileNavOpen, onCloseMobileNav }) => {
  const { isSuperAdmin } = useAuth();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard }
      ]
    },
    {
      title: 'EVENT OPERATIONS',
      items: [
        { id: 'events', label: 'Events & Rules', icon: Calendar, badge: 'Active' },
        { id: 'registrations', label: 'College Registrations', icon: FileSpreadsheet },
        { id: 'payments', label: 'Payment Approvals', icon: CreditCard, count: 2 },
        { id: 'coordinators', label: 'Event Coordinators', icon: UserCheck },
        { id: 'slots', label: 'Slots & Schedules', icon: Clock }
      ]
    },
    {
      title: 'SECURITY & USERS',
      items: [
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'admins', label: 'Admins & Roles', icon: ShieldCheck, badge: isSuperAdmin ? 'Super' : 'Auth' }
      ]
    }
  ];

  const handleItemClick = (tabId) => {
    setActiveTab(tabId);
    if (onCloseMobileNav) {
      onCloseMobileNav();
    }
  };

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
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`nav-item ${isActive ? 'nav-active' : ''}`}
                    >
                      <Icon size={17} className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                      {item.count && <span className="nav-count">{item.count}</span>}
                    </button>
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


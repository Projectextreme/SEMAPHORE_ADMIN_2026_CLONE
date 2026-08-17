import { LayoutDashboard, ShieldCheck, Users, CreditCard, Calendar, UserCheck, Clock, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { isSuperAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'admins', label: 'Admins & Roles', icon: ShieldCheck, badge: 'API 1-5' },
    { id: 'users', label: 'User Directory', icon: Users, badge: 'API 6-9' },
    { id: 'payments', label: 'Payment Approvals', icon: CreditCard, count: 3 },
    { id: 'registrations', label: 'Registrations', icon: FileSpreadsheet },
    { id: 'events', label: 'Events & Rules', icon: Calendar },
    { id: 'coordinators', label: 'Coordinators', icon: UserCheck },
    { id: 'slots', label: 'Slots & Schedule', icon: Clock }
  ];

  return (
    <aside className="main-sidebar">
      <div className="sidebar-nav">
        <div className="sidebar-section-title">MAIN NAVIGATION</div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'nav-active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
              {item.count && <span className="nav-count">{item.count}</span>}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-status-pill">
          <span className="status-dot"></span>
          <span>API REST Engine Active</span>
        </div>
      </div>
    </aside>
  );
};

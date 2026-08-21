import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import {
  Users,
  ShieldCheck,
  CreditCard,
  Calendar,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  RefreshCw
} from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = ({ setActiveTab }) => {
  const { admin, isSuperAdmin } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalAdmins: 3,
    totalUsers: 3,
    pendingPayments: 2,
    approvedPayments: 12,
    activeEvents: 3,
    totalColleges: 3
  });

  const loadStats = async () => {
    setIsRefreshing(true);
    try {
      const users = await apiService.getAllUsers();
      const events = await apiService.getAllEvents();

      if (isSuperAdmin) {
        const admins = await apiService.getAllAdmins();
        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          totalAdmins: admins.length,
          activeEvents: events.length
        }));
      } else {
        setStats((prev) => ({
          ...prev,
          totalUsers: users.length,
          activeEvents: events.length
        }));
      }
    } catch (err) {
      console.warn('Dashboard stats fallback mode');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    loadStats();
  }, [isSuperAdmin]);

  const kpis = [
    isSuperAdmin ? {
      id: 'admins',
      title: 'Administrators',
      value: stats.totalAdmins,
      subtext: 'Full Access Granted',
      icon: ShieldCheck,
      colorClass: 'indigo',
      trend: '+1 This Week',
      tab: 'admins'
    } : {
      id: 'colleges',
      title: 'Colleges Enrolled',
      value: stats.totalColleges,
      subtext: 'Max 2 Teams / College',
      icon: Building2,
      colorClass: 'indigo',
      trend: 'Quota Guard Active',
      tab: 'registrations'
    },
    {
      id: 'users',
      title: 'Registered Users',
      value: stats.totalUsers,
      subtext: '3 Colleges Enrolled',
      icon: Users,
      colorClass: 'cyan',
      trend: '+100% Verified',
      tab: 'users'
    },
    {
      id: 'payments',
      title: 'Pending UTRs',
      value: stats.pendingPayments,
      subtext: 'Needs Scan & Pay check',
      icon: CreditCard,
      colorClass: 'amber',
      trend: 'Action Required',
      tab: 'payments'
    },
    {
      id: 'events',
      title: 'Active Events',
      value: stats.activeEvents,
      subtext: 'Tech & Non-Tech Arena',
      icon: Calendar,
      colorClass: 'emerald',
      trend: 'Live Rules',
      tab: 'events'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-top-row">
            <span className="welcome-badge">
              <Zap size={13} /> Semaphore 2026 Admin Hub
            </span>
            <span className="event-date-pill">
              <Clock size={13} /> Fest Status: Registration Open
            </span>
            <button 
              className="btn btn-xs btn-secondary refresh-btn"
              onClick={loadStats}
              disabled={isRefreshing}
              title="Refresh Dashboard Statistics"
              aria-label="Refresh Dashboard Data"
            >
              <RefreshCw size={12} className={isRefreshing ? 'spin-icon' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>

          <h2>
            Welcome back, {admin?.name || 'Admin'}! 👋
          </h2>

          <p>
            Logged in as <strong className="highlight-text">{admin?.role}</strong> ({admin?.email}).
            Real-time overview of registration quotas, UTR payment verifications, and system access.
          </p>
        </div>

        <div className="banner-quick-stats">
          <div className="banner-stat-chip">
            <span className="chip-num">2 / 2</span>
            <span className="chip-lbl">Max Teams / College</span>
          </div>
          <div className="banner-stat-chip">
            <span className="chip-num">₹ 1,750</span>
            <span className="chip-lbl">Total Volume</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="kpi-card"
              onClick={() => setActiveTab(kpi.tab)}
              role="button"
              tabIndex={0}
            >
              <div className="kpi-card-inner">
                <div className="kpi-header">
                  <span className="kpi-title">{kpi.title}</span>
                  <div className={`kpi-icon-wrapper icon-${kpi.colorClass}`}>
                    <Icon size={18} />
                  </div>
                </div>

                <div className="kpi-value-row">
                  <div className="kpi-value">{kpi.value}</div>
                  <span className={`kpi-trend-pill trend-${kpi.colorClass}`}>
                    {kpi.trend}
                  </span>
                </div>

                <div className="kpi-footer">
                  <span className="kpi-subtext">{kpi.subtext}</span>
                  <span className="kpi-arrow">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Event Registration & College Breakdown */}
      <div className="dashboard-grid-2col">
        {/* Event Registration Summary */}
        <div className="card event-summary-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Calendar size={17} /> Event Registration Breakdown
              </h3>
              <p className="card-subtitle">Active team capacity and attendee enrollments</p>
            </div>
            <button
              onClick={() => setActiveTab('events')}
              className="btn btn-xs btn-secondary"
            >
              View All <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>EVENT</th>
                  <th>TEAMS</th>
                  <th>PARTICIPANTS</th>
                  <th>CAPACITY</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="event-cell-title">
                      <strong>CodeFest 2026</strong>
                      <span>Coding & Hackathon</span>
                    </div>
                  </td>
                  <td><span className="num-pill cyan">1 Team</span></td>
                  <td><strong>4 Members</strong></td>
                  <td>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: '50%' }}></div>
                      <span>50%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="event-cell-title">
                      <strong>RoboWars Arena</strong>
                      <span>Robotics Flagship</span>
                    </div>
                  </td>
                  <td><span className="num-pill cyan">1 Team</span></td>
                  <td><strong>3 Members</strong></td>
                  <td>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: '50%' }}></div>
                      <span>50%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="event-cell-title">
                      <strong>WebCrafters</strong>
                      <span>Web Development</span>
                    </div>
                  </td>
                  <td><span className="num-pill cyan">1 Team</span></td>
                  <td><strong>2 Members</strong></td>
                  <td>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: '35%' }}></div>
                      <span>35%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Participating Colleges & Quotas */}
        <div className="card colleges-summary-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Building2 size={17} /> College Quotas (Max 2 Teams)
              </h3>
              <p className="card-subtitle">Enforcement of 2 teams per college rule</p>
            </div>
            <button
              onClick={() => setActiveTab('registrations')}
              className="btn btn-xs btn-secondary"
            >
              Quotas <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="colleges-quota-list">
            <div className="college-quota-item">
              <div className="college-info">
                <span className="college-name">MIT Tech</span>
                <span className="quota-status-tag full">Quota Reached</span>
              </div>
              <div className="quota-bar-wrapper">
                <div className="quota-bar full" style={{ width: '100%' }}></div>
              </div>
              <div className="quota-labels">
                <span>Teams Registered</span>
                <strong>2 / 2 Teams</strong>
              </div>
            </div>

            <div className="college-quota-item">
              <div className="college-info">
                <span className="college-name">RV College of Engineering</span>
                <span className="quota-status-tag full">Quota Reached</span>
              </div>
              <div className="quota-bar-wrapper">
                <div className="quota-bar full" style={{ width: '100%' }}></div>
              </div>
              <div className="quota-labels">
                <span>Teams Registered</span>
                <strong>2 / 2 Teams</strong>
              </div>
            </div>

            <div className="college-quota-item">
              <div className="college-info">
                <span className="college-name">NMAM Institute of Technology</span>
                <span className="quota-status-tag open">1 Slot Left</span>
              </div>
              <div className="quota-bar-wrapper">
                <div className="quota-bar open" style={{ width: '50%' }}></div>
              </div>
              <div className="quota-labels">
                <span>Teams Registered</span>
                <strong>1 / 2 Teams</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
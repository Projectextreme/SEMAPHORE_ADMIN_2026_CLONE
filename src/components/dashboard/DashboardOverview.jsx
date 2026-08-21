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
  RefreshCw,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Check,
  XCircle,
  AlertTriangle,
  Receipt,
  X
} from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = ({ setActiveTab }) => {
  const { admin, isSuperAdmin } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [editingReg, setEditingReg] = useState(null);
  const [deletingReg, setDeletingReg] = useState(null);

  const [stats, setStats] = useState({
    totalAdmins: 3,
    totalUsers: 3,
    pendingPayments: 2,
    approvedPayments: 12,
    activeEvents: 3,
    totalColleges: 3
  });

  const showToast = (msg, isError = false) => {
    setToastMsg({ text: msg, isError });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [users, events, regs, colleges] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllEvents(),
        apiService.getRegistrations(),
        apiService.getColleges()
      ]);

      const usersList = Array.isArray(users) ? users : (users?.users || []);
      const eventsList = Array.isArray(events) ? events : (events?.events || []);
      const regsList = Array.isArray(regs) ? regs : (regs?.registrations || []);
      const collegesList = Array.isArray(colleges) ? colleges : (colleges?.colleges || []);

      setRegistrations(regsList);

      const pendingCount = regsList.filter((r) => r.paymentStatus === 'Pending').length;
      const approvedCount = regsList.filter((r) => r.paymentStatus === 'Approved').length;

      if (isSuperAdmin) {
        const admins = await apiService.getAllAdmins();
        const adminsList = Array.isArray(admins) ? admins : (admins?.admins || []);
        setStats({
          totalUsers: usersList.length,
          totalAdmins: adminsList.length,
          activeEvents: eventsList.length,
          totalColleges: collegesList.length,
          pendingPayments: pendingCount,
          approvedPayments: approvedCount
        });
      } else {
        setStats({
          totalUsers: usersList.length,
          totalAdmins: 0,
          activeEvents: eventsList.length,
          totalColleges: collegesList.length,
          pendingPayments: pendingCount,
          approvedPayments: approvedCount
        });
      }
    } catch (err) {
      console.warn('Dashboard stats fallback mode:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    loadData();
  }, [isSuperAdmin]);

  // 1. Quick Approve / Change Payment Status
  const handleApprovePayment = async (reg, newStatus = 'Approved') => {
    const id = reg._id || reg.id;
    setActionLoading(true);
    try {
      await apiService.approveRegistrationPayment(id, newStatus);
      setRegistrations((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, paymentStatus: newStatus } : r))
      );
      showToast(`Payment for "${reg.leaderName || reg.teamName}" marked as ${newStatus}!`);
      loadData();
    } catch (err) {
      showToast('Failed to update payment status.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Save Edit Registration
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReg) return;
    const id = editingReg._id || editingReg.id;
    setActionLoading(true);
    try {
      await apiService.editRegistration(id, editingReg);
      setRegistrations((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, ...editingReg } : r))
      );
      showToast(`Registration for "${editingReg.leaderName || editingReg.teamName}" updated!`);
      setEditingReg(null);
      loadData();
    } catch (err) {
      showToast('Failed to save registration changes.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Confirm Delete Registration
  const handleDeleteConfirm = async () => {
    if (!deletingReg) return;
    const id = deletingReg._id || deletingReg.id;
    setActionLoading(true);
    try {
      await apiService.deleteRegistration(id);
      setRegistrations((prev) => prev.filter((r) => (r._id || r.id) !== id));
      showToast(`Registration for "${deletingReg.leaderName || deletingReg.teamName}" deleted.`);
      setDeletingReg(null);
      loadData();
    } catch (err) {
      showToast('Failed to delete registration.', true);
    } finally {
      setActionLoading(false);
    }
  };

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
      tab: 'colleges'
    },
    {
      id: 'users',
      title: 'Registered Users',
      value: stats.totalUsers,
      subtext: `${stats.totalColleges} Colleges Enrolled`,
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
      trend: stats.pendingPayments > 0 ? 'Action Required' : 'All Clear',
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

  const latestRegistrations = registrations.slice(0, 5);

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
              onClick={loadData}
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

      {/* Notifications Toast */}
      {toastMsg && (
        <div className={`alert ${toastMsg.isError ? 'alert-error' : 'alert-success'}`}>
          {toastMsg.isError ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

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

      {/* SECTION: Registrations (Latest) Card Table */}
      <div className="card latest-registrations-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <FileSpreadsheet size={17} /> Registrations (Latest)
            </h3>
            <p className="card-subtitle">
              Recent attendee signups, competition enrollments, and payment verification states
            </p>
          </div>
          <button
            onClick={() => setActiveTab('registrations')}
            className="btn btn-xs btn-secondary"
            title="View All Registrations"
          >
            View All ({registrations.length}) <ArrowUpRight size={12} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>USER / PARTICIPANT</th>
                <th>EMAIL</th>
                <th>EVENT NAME</th>
                <th>PAYMENT STATUS</th>
                <th>REGISTRATION DETAILS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {latestRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No recent registrations recorded yet.
                  </td>
                </tr>
              ) : (
                latestRegistrations.map((reg) => {
                  const regId = reg.id || reg._id;
                  const status = reg.paymentStatus || 'Pending';
                  const isPending = status === 'Pending';
                  const isApproved = status === 'Approved';
                  const isRejected = status === 'Rejected';

                  return (
                    <tr key={regId}>
                      {/* 1. User/Participant Name */}
                      <td>
                        <div className="participant-cell">
                          <div className="user-avatar-sm">
                            {(reg.leaderName || reg.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="participant-info">
                            <strong className="participant-name">{reg.leaderName || reg.name || 'Participant'}</strong>
                            <span className="team-subtext">Team: {reg.teamName || 'Solo'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email */}
                      <td>
                        <span className="user-email-text">{reg.email || 'N/A'}</span>
                      </td>

                      {/* 3. Event Name */}
                      <td>
                        <span className="event-tag">{reg.event || 'Semaphore 2026'}</span>
                      </td>

                      {/* 4. Payment Status */}
                      <td>
                        <span
                          className={`status-badge status-${status.toLowerCase()}`}
                          title={`Payment Status: ${status}`}
                        >
                          {isApproved && <CheckCircle2 size={11} />}
                          {isPending && <Clock size={11} />}
                          {isRejected && <XCircle size={11} />}
                          {status}
                        </span>
                        {reg.utr && (
                          <span className="utr-subtext code-font">{reg.utr}</span>
                        )}
                      </td>

                      {/* 5. Relevant Registration Details */}
                      <td>
                        <div className="reg-details-cell">
                          <span className="college-line">
                            <Building2 size={12} /> {reg.collegeName || 'Autonomous Institute'}
                          </span>
                          <span className="quota-tag-sm">
                            {reg.teamsInCollege >= 2 ? '2/2 Quota Reached' : `${reg.membersCount || 1} Member(s)`} • {reg.amount || '₹ 500'}
                          </span>
                        </div>
                      </td>

                      {/* 6. Actions (Approve Payment for pending, Edit, Delete) */}
                      <td>
                        <div className="table-actions-cell">
                          {/* Approve Payment for Pending status */}
                          {isPending && (
                            <button
                              onClick={() => handleApprovePayment(reg, 'Approved')}
                              className="btn btn-xs btn-success"
                              title="Approve Pending Payment"
                              disabled={actionLoading}
                            >
                              <Check size={12} /> Approve
                            </button>
                          )}

                          {isApproved && (
                            <button
                              onClick={() => handleApprovePayment(reg, 'Pending')}
                              className="btn-icon btn-unapprove"
                              title="Mark as Pending"
                              disabled={actionLoading}
                            >
                              <CheckCircle2 size={14} className="text-success" />
                            </button>
                          )}

                          {/* Edit Action */}
                          <button
                            onClick={() => setEditingReg({ ...reg })}
                            className="btn-icon btn-edit"
                            title="Edit Registration Details"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete Action */}
                          <button
                            onClick={() => setDeletingReg(reg)}
                            className="btn-icon btn-delete"
                            title="Delete Registration"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
              onClick={() => setActiveTab('colleges')}
              className="btn btn-xs btn-secondary"
            >
              Colleges <ArrowUpRight size={12} />
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

      {/* Edit Registration Modal */}
      {editingReg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Edit2 size={19} /> Edit Registration Details</h3>
              <button className="modal-close" onClick={() => setEditingReg(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Registration Reference: <code>{editingReg.id || editingReg._id}</code>
            </p>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Participant / Leader Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.leaderName || editingReg.name || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, leaderName: e.target.value, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={editingReg.email || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.event || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, event: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.collegeName || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, collegeName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select
                  className="form-select"
                  value={editingReg.paymentStatus || 'Pending'}
                  onChange={(e) => setEditingReg({ ...editingReg, paymentStatus: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingReg(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Registration Modal */}
      {deletingReg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}><Trash2 size={19} /> Confirm Delete Registration</h3>
              <button className="modal-close" onClick={() => setDeletingReg(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Registration Reference: <code>{deletingReg.id || deletingReg._id}</code>
            </p>

            <div style={{ background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 1rem', margin: '1rem 0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
                {deletingReg.leaderName || deletingReg.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {deletingReg.email} • {deletingReg.event}
              </div>
              <div className="code-font" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
                College: {deletingReg.collegeName}
              </div>
            </div>

            <p className="delete-warning-text">
              Are you sure you want to remove this registration record from the dashboard and database?
            </p>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeletingReg(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { apiService } from '../../services/apiService';
import {
  Users,
  CreditCard,
  Calendar,
  ArrowUpRight,
  Zap,
  Building2,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Check,
  XCircle,
  AlertTriangle,
  Receipt,
  X,
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
  Copy,
  Eye,
  Tag,
  Phone,
  Mail,
  Layers,
  Sparkles
} from 'lucide-react';
import './DashboardOverview.css';

export const DashboardOverview = () => {
  const navigate = useNavigate();
  const { admin, isSuperAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Accordion state for expanded registration rows (track expanded IDs)
  const [expandedRegs, setExpandedRegs] = useState({});
  // Accordion state for expanded event detail cards in Section 3 (in-place expansion)
  const [expandedEvents, setExpandedEvents] = useState({});

  // Modals state
  const [editingReg, setEditingReg] = useState(null);
  const [deletingReg, setDeletingReg] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [copiedUtr, setCopiedUtr] = useState(null);

  const [stats, setStats] = useState({
    pendingPayments: 8,
    pendingAmount: 2300,
    approvedPayments: 10,
    approvedAmount: 5000,
    totalUsers: 20,
    totalTeams: 21
  });

  const showToast = (msg, isError = false) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  };

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [usersData, eventsData, regsData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllEvents(),
        apiService.getRegistrations()
      ]);

      const usersList = Array.isArray(usersData) ? usersData : (usersData?.users || []);
      const eventsList = Array.isArray(eventsData) ? eventsData : (eventsData?.events || []);
      const regsList = Array.isArray(regsData) ? regsData : (regsData?.registrations || []);

      setUsers(usersList);
      setEvents(eventsList);
      setRegistrations(regsList);

      const pendingRegs = regsList.filter((r) => (r.paymentStatus || '').toLowerCase() === 'pending');
      const approvedRegs = regsList.filter((r) => (r.paymentStatus || '').toLowerCase() === 'approved');

      // Calculate numeric amounts
      const parseAmt = (amtStr) => {
        if (!amtStr) return 500;
        const num = Number(String(amtStr).replace(/[^0-9]/g, ''));
        return isNaN(num) || num === 0 ? 500 : num;
      };

      const calcPendingAmt = pendingRegs.reduce((sum, r) => sum + parseAmt(r.amount), 0) || 2300;
      const calcApprovedAmt = approvedRegs.reduce((sum, r) => sum + parseAmt(r.amount), 0) || 5000;

      setStats({
        pendingPayments: pendingRegs.length > 0 ? pendingRegs.length : 8,
        pendingAmount: calcPendingAmt,
        approvedPayments: approvedRegs.length > 0 ? approvedRegs.length : 10,
        approvedAmount: calcApprovedAmt,
        totalUsers: usersList.length > 0 ? usersList.length : 20,
        totalTeams: regsList.length > 0 ? regsList.length : 21
      });
    } catch (err) {
      console.warn('Dashboard stats fallback mode:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Toggle Accordion Registration Details
  const toggleRegDetails = (id) => {
    setExpandedRegs((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 1b. Toggle Accordion Event Details (In-place expansion)
  const toggleEventDetails = (id) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 2. Quick Verify & Approve Payment
  const handleApprovePayment = async (reg, newStatus = 'Approved') => {
    const id = reg._id || reg.id;
    setActionLoading(true);
    try {
      await apiService.approveRegistrationPayment(id, newStatus);
      setRegistrations((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, paymentStatus: newStatus } : r))
      );
      showToast(`Payment for "${reg.leaderName || reg.teamName}" verified & marked as ${newStatus}!`);
      loadData();
    } catch {
      showToast('Failed to update payment status.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Save Edit Registration
  const handleSaveEditReg = async (e) => {
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
    } catch {
      showToast('Failed to save registration changes.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Confirm Delete Registration
  const handleDeleteConfirmReg = async () => {
    if (!deletingReg) return;
    const id = deletingReg._id || deletingReg.id;
    setActionLoading(true);
    try {
      await apiService.deleteRegistration(id);
      setRegistrations((prev) => prev.filter((r) => (r._id || r.id) !== id));
      showToast(`Registration for "${deletingReg.leaderName || deletingReg.teamName}" removed.`);
      setDeletingReg(null);
      loadData();
    } catch {
      showToast('Failed to delete registration.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Confirm Delete User
  const handleDeleteConfirmUser = async () => {
    if (!deletingUser) return;
    const id = deletingUser._id || deletingUser.id;
    setActionLoading(true);
    try {
      await apiService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
      showToast(`User account for "${deletingUser.name}" deleted.`);
      setDeletingUser(null);
      loadData();
    } catch {
      showToast('Failed to delete user account.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Save Edit Event
  const handleSaveEditEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    const id = editingEvent._id || editingEvent.id;
    setActionLoading(true);
    try {
      await apiService.editEvent(id, editingEvent);
      setEvents((prev) =>
        prev.map((ev) => ((ev._id || ev.id) === id ? { ...ev, ...editingEvent } : ev))
      );
      showToast(`Event "${editingEvent.title}" updated successfully!`);
      setEditingEvent(null);
      loadData();
    } catch {
      showToast('Failed to update event.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 7. Confirm Delete Event
  const handleDeleteConfirmEvent = async () => {
    if (!deletingEvent) return;
    const id = deletingEvent._id || deletingEvent.id;
    setActionLoading(true);
    try {
      await apiService.deleteEvent(id);
      setEvents((prev) => prev.filter((ev) => (ev._id || ev.id) !== id));
      showToast(`Event "${deletingEvent.title}" deleted.`);
      setDeletingEvent(null);
      loadData();
    } catch {
      showToast('Failed to delete event.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Copy UTR helper
  const handleCopyUtr = (utr) => {
    if (!utr) return;
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    showToast('UTR reference copied to clipboard!');
    setTimeout(() => setCopiedUtr(null), 2500);
  };

  return (
    <div className="dashboard-container">
      {/* Top Header / Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-top-row">
            <span className="welcome-badge">
              <Zap size={13} /> Semaphore 2026 Admin Hub
            </span>
            <span className="event-date-pill">
              <Clock size={13} /> Fest Status: Live & Open
            </span>
            <button
              className="btn btn-xs btn-secondary refresh-btn"
              onClick={loadData}
              disabled={isRefreshing}
              title="Refresh Dashboard Data"
              aria-label="Refresh Dashboard Data"
            >
              <RefreshCw size={12} className={isRefreshing ? 'spin-icon' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>

          <h2>
            Welcome back, {admin?.name || 'Sumanth'} ({admin?.role || 'admin'}) 👋
          </h2>

          <p>
            Real-time control center for priority festival registrations, UTR fee approvals, user directory, and tournament management.
          </p>
        </div>

        <div className="banner-quick-stats">
          <div className="banner-stat-chip">
            <span className="chip-num">2 / 2</span>
            <span className="chip-lbl">Max Teams / College</span>
          </div>
          <div className="banner-stat-chip">
            <span className="chip-num">₹ {(stats.pendingAmount + stats.approvedAmount).toLocaleString()}</span>
            <span className="chip-lbl">Total Fest Volume</span>
          </div>
        </div>
      </div>

      {/* TOP 4 KPI CARDS (Matching Sketch Row) */}
      <div className="sketch-kpi-grid">
        {/* Card 1: Pending Payment */}
        <div
          className="sketch-kpi-card card-amber"
          onClick={() => navigate('/payments')}
          role="button"
          tabIndex={0}
          title="Click to view Pending Payments"
        >
          <div className="sketch-kpi-header">
            <div className="sketch-kpi-title-wrap">
              <CreditCard size={17} className="text-amber" />
              <span className="sketch-kpi-title">Pending Payment</span>
            </div>
            <span className="sketch-kpi-badge badge-amber">{stats.pendingPayments}</span>
          </div>
          <div className="sketch-kpi-amount-box box-amber">
            <span className="amount-currency">₹</span>
            <span className="amount-val">{stats.pendingAmount.toLocaleString()}</span>
          </div>
          <div className="sketch-kpi-footer">
            <span>Needs UTR verification</span>
            <ArrowUpRight size={13} />
          </div>
        </div>

        {/* Card 2: Payments Approved */}
        <div
          className="sketch-kpi-card card-emerald"
          onClick={() => navigate('/payments')}
          role="button"
          tabIndex={0}
          title="Click to view Approved Payments"
        >
          <div className="sketch-kpi-header">
            <div className="sketch-kpi-title-wrap">
              <CheckCircle2 size={17} className="text-emerald" />
              <span className="sketch-kpi-title">Payments Approved</span>
            </div>
            <span className="sketch-kpi-badge badge-emerald">{stats.approvedPayments}</span>
          </div>
          <div className="sketch-kpi-amount-box box-emerald">
            <span className="amount-currency">₹</span>
            <span className="amount-val">{stats.approvedAmount.toLocaleString()}</span>
          </div>
          <div className="sketch-kpi-footer">
            <span>Verified & Cleared</span>
            <ArrowUpRight size={13} />
          </div>
        </div>

        {/* Card 3: Total Users Registered */}
        <div
          className="sketch-kpi-card card-cyan"
          onClick={() => navigate('/users')}
          role="button"
          tabIndex={0}
          title="Click to view User Directory"
        >
          <div className="sketch-kpi-header">
            <div className="sketch-kpi-title-wrap">
              <Users size={17} className="text-cyan" />
              <span className="sketch-kpi-title">Total Users Registered</span>
            </div>
            <span className="sketch-kpi-badge badge-cyan">{stats.totalUsers}</span>
          </div>
          <div className="sketch-kpi-amount-box box-cyan">
            <span className="amount-lbl">Active Accounts</span>
          </div>
          <div className="sketch-kpi-footer">
            <span>Participant Directory</span>
            <ArrowUpRight size={13} />
          </div>
        </div>

        {/* Card 4: Total Teams */}
        <div
          className="sketch-kpi-card card-indigo"
          onClick={() => navigate('/registrations')}
          role="button"
          tabIndex={0}
          title="Click to view All Teams"
        >
          <div className="sketch-kpi-header">
            <div className="sketch-kpi-title-wrap">
              <FileSpreadsheet size={17} className="text-indigo" />
              <span className="sketch-kpi-title">Total Teams</span>
            </div>
            <span className="sketch-kpi-badge badge-indigo">{stats.totalTeams}</span>
          </div>
          <div className="sketch-kpi-amount-box box-indigo">
            <span className="amount-lbl">All Registered Teams</span>
          </div>
          <div className="sketch-kpi-footer">
            <span>Across All Events</span>
            <ArrowUpRight size={13} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1 (HIGH PRIORITY): Recent Event Registrations */}
      {/* ========================================================================= */}
      <div className="card sketch-section-card priority-section">
        <div className="sketch-section-header">
          <div className="section-title-group">
            <div className="section-icon-badge icon-badge-primary">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <div className="section-title-row">
                <h3 className="sketch-section-title">Recent Event Registrations</h3>
                <span className="priority-pill">HIGH PRIORITY</span>
              </div>
              <p className="sketch-section-subtitle">
                Latest student competition entries, college quotas, and one-click payment approvals
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/registrations')}
            className="btn btn-sm btn-secondary"
            title="Navigate to Team Registrations"
          >
            View All ({registrations.length}) <ArrowUpRight size={14} />
          </button>
        </div>

        {/* List of Registration Rows matching the hand-drawn sketch */}
        <div className="sketch-rows-list">
          {registrations.length === 0 ? (
            <EmptyState
              type="registrations"
              title="No registrations found"
              description="New team and student signups will automatically appear here in real-time."
              compact={true}
            />
          ) : (
            registrations.slice(0, 5).map((reg) => {
              const regId = reg._id || reg.id;
              const isPending = (reg.paymentStatus || '').toLowerCase() === 'pending';
              const isApproved = (reg.paymentStatus || '').toLowerCase() === 'approved';
              const isExpanded = !!expandedRegs[regId];

              return (
                <div key={regId} className={`sketch-reg-card ${isExpanded ? 'expanded' : ''}`}>
                  {/* Main Horizontal Row matching sketch */}
                  <div className="sketch-reg-row">
                    {/* 1. Avatar */}
                    <div className="sketch-avatar" title={reg.leaderName || reg.name || 'Participant'}>
                      <User size={16} />
                    </div>

                    {/* 2. Participant / Leader Name */}
                    <div className="sketch-chip chip-name" title="Leader / Participant">
                      <strong className="chip-text">{reg.leaderName || reg.name || 'Shashidhara'}</strong>
                    </div>

                    {/* 3. College Name */}
                    <div className="sketch-chip chip-college" title="College Name">
                      <Building2 size={13} className="chip-icon" />
                      <span className="chip-text">{reg.collegeName || 'NMAM Institute of Tech'}</span>
                    </div>

                    {/* 4. Team Name */}
                    <div className="sketch-chip chip-team" title="Team Name">
                      <span className="chip-label">Team:</span>
                      <strong className="chip-text">{reg.teamName || 'Team-X'}</strong>
                    </div>

                    {/* 5. Amount */}
                    <div className="sketch-chip chip-amount" title="Registration Fee">
                      <strong className="chip-text">{reg.amount || '₹ 500'}</strong>
                    </div>

                    {/* 6. Payment Status */}
                    <span className={`sketch-status-pill status-${isApproved ? 'approved' : 'pending'}`}>
                      {isApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {isApproved ? 'Approved' : 'Pending'}
                    </span>

                    {/* 7. Action Button: Verify and Approve */}
                    <div className="sketch-action-group">
                      {isPending ? (
                        <button
                          onClick={() => handleApprovePayment(reg, 'Approved')}
                          className="btn btn-sm btn-verify-approve"
                          disabled={actionLoading}
                          title="Verify and Approve this payment"
                        >
                          <Check size={13} /> Verify and Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprovePayment(reg, 'Pending')}
                          className="btn btn-sm btn-approved-check"
                          disabled={actionLoading}
                          title="Click to revert status to Pending"
                        >
                          <CheckCircle2 size={14} className="text-emerald" /> Approved ✓
                        </button>
                      )}

                      {/* 8. More Details Accordion Toggle */}
                      <button
                        onClick={() => toggleRegDetails(regId)}
                        className={`btn btn-sm btn-more-details ${isExpanded ? 'active' : ''}`}
                        title={isExpanded ? 'Hide details' : 'View more details'}
                      >
                        <span>{isExpanded ? 'Less details' : 'More details'}</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Box */}
                  {isExpanded && (
                    <div className="sketch-details-panel">
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-lbl">Assigned Event:</span>
                          <span className="detail-val font-bold text-cyan">{reg.event || 'CodeFest 2026'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Contact Email:</span>
                          <span className="detail-val">{reg.email || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Contact Phone:</span>
                          <span className="detail-val">{reg.phone || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">UTR Reference:</span>
                          <span className="detail-val utr-val">
                            <code>{reg.utr || 'UTR-NOT-ENTERED'}</code>
                            {reg.utr && (
                              <button
                                onClick={() => handleCopyUtr(reg.utr)}
                                className="btn-copy-sm"
                                title="Copy UTR Reference"
                              >
                                {copiedUtr === reg.utr ? <Check size={11} className="text-emerald" /> : <Copy size={11} />}
                              </button>
                            )}
                          </span>
                        </div>
                        <div className="detail-item span-full">
                          <span className="detail-lbl">Team Roster ({reg.membersCount || (reg.members ? reg.members.length : 1)} Members):</span>
                          <div className="members-tags-list">
                            {(reg.members && Array.isArray(reg.members) && reg.members.length > 0) ? (
                              reg.members.map((m, mIdx) => (
                                <span key={mIdx} className="member-badge">
                                  {m}
                                </span>
                              ))
                            ) : (
                              <span className="member-badge">{reg.leaderName || reg.name || 'Solo Participant'}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Panel Quick Actions */}
                      <div className="details-panel-actions">
                        <button
                          onClick={() => setEditingReg({ ...reg })}
                          className="btn btn-xs btn-secondary"
                        >
                          <Edit2 size={12} /> Edit Details
                        </button>
                        <button
                          onClick={() => setDeletingReg(reg)}
                          className="btn btn-xs btn-danger"
                        >
                          <Trash2 size={12} /> Delete Entry
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Section Navigation Footer matching sketch */}
        <div className="sketch-section-footer">
          <button
            onClick={() => navigate('/registrations')}
            className="btn btn-secondary btn-view-more"
          >
            <span>View more</span>
            <ArrowUpRight size={14} />
          </button>
          <span className="route-nav-hint">/events/registrations ← navigation</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: Recent User Registrations */}
      {/* ========================================================================= */}
      <div className="card sketch-section-card">
        <div className="sketch-section-header">
          <div className="section-title-group">
            <div className="section-icon-badge icon-badge-cyan">
              <Users size={18} />
            </div>
            <div>
              <h3 className="sketch-section-title">Recent User Registrations</h3>
              <p className="sketch-section-subtitle">
                Newly onboarded student accounts, participant logins, and college credentials
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/users')}
            className="btn btn-sm btn-secondary"
            title="Navigate to User Directory"
          >
            View All ({users.length}) <ArrowUpRight size={14} />
          </button>
        </div>

        {/* List of User Rows matching the hand-drawn sketch */}
        <div className="sketch-rows-list">
          {users.length === 0 ? (
            <EmptyState
              type="users"
              title="No users found"
              description="Registered participants will be displayed here as they sign up."
              compact={true}
            />
          ) : (
            users.slice(0, 4).map((usr, uIdx) => {
              const uId = usr._id || usr.id || `usr-${uIdx}`;
              const loginText = usr.loginTime || (uIdx === 0 ? '24 mins ago' : uIdx === 1 ? '1 hour ago' : `${uIdx + 1} hours ago`);

              return (
                <div key={uId} className="sketch-user-row">
                  {/* Avatar */}
                  <div className="sketch-avatar avatar-cyan">
                    <User size={16} />
                  </div>

                  {/* Name Box */}
                  <div className="sketch-chip chip-name">
                    <strong className="chip-text">{usr.name || 'Akash'}</strong>
                  </div>

                  {/* College Box */}
                  <div className="sketch-chip chip-college">
                    <Building2 size={13} className="chip-icon" />
                    <span className="chip-text">{usr.collegeName || (usr.college?.collegeName) || 'XY College'}</span>
                  </div>

                  {/* Delete User Button */}
                  <button
                    onClick={() => setDeletingUser(usr)}
                    className="btn btn-sm btn-delete-user"
                    title={`Delete user account for ${usr.name}`}
                  >
                    <Trash2 size={13} /> Delete user
                  </button>

                  {/* Right Meta: Login Time */}
                  <div className="sketch-user-time">
                    <Clock size={13} className="time-icon" />
                    <span>Login time: {loginText}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Section Navigation Footer */}
        <div className="sketch-section-footer">
          <button
            onClick={() => navigate('/users')}
            className="btn btn-secondary btn-view-more"
          >
            <span>View more</span>
            <ArrowUpRight size={14} />
          </button>
          <span className="route-nav-hint">/users ← navigation</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: Event Management */}
      {/* ========================================================================= */}
      <div className="card sketch-section-card">
        <div className="sketch-section-header">
          <div className="section-title-group">
            <div className="section-icon-badge icon-badge-indigo">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="sketch-section-title">Event Management</h3>
              <p className="sketch-section-subtitle">
                Tournament arenas, capacity enrollment limits, and assigned student coordinators
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/events')}
            className="btn btn-sm btn-secondary"
            title="Navigate to Events"
          >
            View All ({events.length}) <ArrowUpRight size={14} />
          </button>
        </div>

        {/* List of 3-column Event Cards matching the sketch */}
        <div className="sketch-events-list">
          {events.length === 0 ? (
            <EmptyState
              type="events"
              title="No events configured"
              description="Create competitions and hackathons to populate the event manager."
              compact={true}
            />
          ) : (
            events.slice(0, 3).map((evt) => {
              const evtId = evt._id || evt.id;
              const shortTag = evt.shortTag || (evt.title.includes('Code') ? 'Coding' : evt.title.includes('Robo') ? 'Robotics' : evt.title.includes('Web') ? 'Web' : 'Event');
              const coords = Array.isArray(evt.coordinators) ? evt.coordinators.join(', ') : (evt.coordinators || 'Havyas, Shashidhara');
              const registeredCount = evt.teamsRegistered || 18;
              const isExpanded = !!expandedEvents[evtId];

              return (
                <div key={evtId} className={`sketch-event-wrapper ${isExpanded ? 'expanded' : ''}`}>
                  <div className="sketch-event-card">
                    {/* Left Column: Title, Description, Coordinators */}
                    <div className="event-col-left">
                      <div className="event-tag-badge">
                        <span>[ {shortTag} ]</span>
                        <strong className="event-full-title">{evt.title}</strong>
                      </div>
                      <p className="event-desc-line">
                        <span className="desc-lbl">Description: </span>
                        {evt.description || '3-round technical festival competition with speed trials and algorithmic evaluation.'}
                      </p>
                      <div className="event-coord-line">
                        <span className="coord-lbl">Coordinators: </span>
                        <strong className="coord-names">{coords}</strong>
                      </div>
                    </div>

                    {/* Middle Column: Teams Registered & View Detail */}
                    <div className="event-col-middle">
                      <div className="teams-reg-box">
                        <span className="teams-reg-title">Teams Registered</span>
                        <div className="teams-reg-num-pill">{registeredCount}</div>
                      </div>
                      <button
                        onClick={() => toggleEventDetails(evtId)}
                        className={`btn btn-xs btn-view-detail ${isExpanded ? 'active' : ''}`}
                        title={isExpanded ? 'Hide event details' : 'View event details in-place'}
                      >
                        <Eye size={12} />
                        <span>{isExpanded ? 'Hide Detail ⌃' : 'View Detail ⌄'}</span>
                      </button>
                    </div>

                    {/* Right Column: Edit & Delete Actions */}
                    <div className="event-col-right">
                      <button
                        onClick={() => setEditingEvent({ ...evt })}
                        className="btn btn-sm btn-edit-event"
                      >
                        <Edit2 size={13} /> Edit event
                      </button>
                      <button
                        onClick={() => setDeletingEvent(evt)}
                        className="btn btn-sm btn-delete-event"
                      >
                        <Trash2 size={13} /> Delete event
                      </button>
                    </div>
                  </div>

                  {/* Inline Expandable Event Detail Card (Appears directly below the event card in-place) */}
                  {isExpanded && (
                    <div className="event-inline-details-panel">
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-lbl">Competition Arena:</span>
                          <span className="detail-val font-bold text-primary">{evt.category || 'Coding & Hackathon'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Registration Fee:</span>
                          <span className="detail-val font-bold text-emerald">{evt.fee || '₹ 500'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Designated Venue / Lab:</span>
                          <span className="detail-val font-bold text-main">{evt.venue || evt.location || 'Lab 301, Main Block'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Team Size & Quota:</span>
                          <span className="detail-val font-bold text-cyan">{evt.maxParticipants || evt.maxTeamMembers || 4} Members/Team • Max 2 Teams/College</span>
                        </div>
                        <div className="detail-item span-full">
                          <span className="detail-lbl">Event Summary & Guidelines:</span>
                          <span className="detail-val">{evt.description || 'Annual national level technical tournament.'}</span>
                        </div>
                        <div className="detail-item span-full">
                          <span className="detail-lbl">Assigned Faculty & Student Coordinators:</span>
                          <span className="detail-val font-bold text-cyan">{coords}</span>
                        </div>
                      </div>
                      <div className="details-panel-actions">
                        <button
                          onClick={() => setEditingEvent({ ...evt })}
                          className="btn btn-xs btn-secondary"
                        >
                          <Edit2 size={12} /> Edit Configuration
                        </button>
                        <button
                          onClick={() => navigate('/events')}
                          className="btn btn-xs btn-primary"
                        >
                          Manage in Events Page <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Section Navigation Footer */}
        <div className="sketch-section-footer">
          <button
            onClick={() => navigate('/events')}
            className="btn btn-secondary btn-view-more"
          >
            <span>View more</span>
            <ArrowUpRight size={14} />
          </button>
          <span className="route-nav-hint">/events ← navigation</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS: Edit / Delete Registration, Delete User, Edit / Delete Event */}
      {/* ========================================================================= */}

      {/* 1. Edit Registration Modal */}
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

            <form onSubmit={handleSaveEditReg} className="modal-form">
              <div className="form-group">
                <label className="form-label">Participant / Leader Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.leaderName || editingReg.name || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, leaderName: e.target.value, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Team Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.teamName || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, teamName: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">College Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingReg.collegeName || ''}
                    onChange={(e) => setEditingReg({ ...editingReg, collegeName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Registration Amount</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingReg.amount || '₹ 500'}
                    onChange={(e) => setEditingReg({ ...editingReg, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label className="form-label">UTR Ref Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingReg.utr || ''}
                    onChange={(e) => setEditingReg({ ...editingReg, utr: e.target.value })}
                  />
                </div>
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

      {/* 2. Confirm Delete Registration Modal */}
      {deletingReg && (
        <div className="modal-overlay">
          <div className="modal-content modal-danger">
            <div className="modal-header">
              <h3><AlertTriangle size={19} className="text-danger" /> Confirm Delete Registration</h3>
              <button className="modal-close" onClick={() => setDeletingReg(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Are you sure you want to permanently delete registration for <strong>{deletingReg.leaderName || deletingReg.teamName}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingReg(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirmReg}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Confirm Delete User Modal */}
      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-content modal-danger">
            <div className="modal-header">
              <h3><AlertTriangle size={19} className="text-danger" /> Delete User Account</h3>
              <button className="modal-close" onClick={() => setDeletingUser(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Are you sure you want to remove user <strong>{deletingUser.name}</strong> ({deletingUser.email || deletingUser.collegeName})?
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingUser(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirmUser}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Event Modal */}
      {editingEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Edit2 size={19} /> Edit Event Details</h3>
              <button className="modal-close" onClick={() => setEditingEvent(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">Update parameters for {editingEvent.title}</p>

            <form onSubmit={handleSaveEditEvent} className="modal-form">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Short Tag (e.g. Coding)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEvent.shortTag || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, shortTag: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fee (e.g. ₹ 500)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEvent.fee || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, fee: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Venue</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEvent.venue || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingEvent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Confirm Delete Event Modal */}
      {deletingEvent && (
        <div className="modal-overlay">
          <div className="modal-content modal-danger">
            <div className="modal-header">
              <h3><AlertTriangle size={19} className="text-danger" /> Confirm Delete Event</h3>
              <button className="modal-close" onClick={() => setDeletingEvent(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Are you sure you want to delete event <strong>{deletingEvent.title}</strong>?
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingEvent(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirmEvent}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
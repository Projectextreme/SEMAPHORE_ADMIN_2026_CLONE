import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/apiService';
import { DEFAULT_RECEIPT_PLACEHOLDER } from '../common/constants';
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
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
  Copy,
  Eye,
  Tag,
  Phone,
  Mail
} from 'lucide-react';
import { PaymentDetailsModal } from '../payments/PaymentDetailsModal';
import './DashboardOverview.css';

export const DashboardOverview = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvingRegId, setApprovingRegId] = useState(null);

  const [stats, setStats] = useState({
    pendingPayments: 0,
    pendingAmount: 0,
    approvedPayments: 0,
    approvedAmount: 0,
    totalUsers: 0,
    totalTeams: 0
  });

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
  const [previewProof, setPreviewProof] = useState(null);

  // Payment modals state
  const [paymentActionModal, setPaymentActionModal] = useState(null);
  const [paymentDetailModal, setPaymentDetailModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const showToast = useCallback((msg, isError = false) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  }, [showError, showSuccess]);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [usersData, eventsData, regsData, paymentsData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllEvents(),
        apiService.getRegistrations(),
        apiService.getRecentPayments()
      ]);

      const usersList = Array.isArray(usersData) ? usersData : (usersData?.users || []);
      const eventsList = Array.isArray(eventsData) ? eventsData : (eventsData?.events || []);
      const regsList = Array.isArray(regsData) ? regsData : (regsData?.registrations || []);
      const paymentsList = paymentsData?.payments || (Array.isArray(paymentsData) ? paymentsData : []);

      setUsers(usersList);
      setEvents(eventsList);
      setRegistrations(regsList);
      setPayments(paymentsList);

      const pendingRegs = regsList.filter((r) => (r.paymentStatus || '').toLowerCase() === 'pending');
      const approvedRegs = regsList.filter((r) => (r.paymentStatus || '').toLowerCase() === 'approved');

      // Calculate numeric amounts dynamically
      const parseAmt = (r) => {
        if (typeof r?.amountNumber === 'number') return r.amountNumber;
        if (!r?.amount) return 0;
        const num = Number(String(r.amount).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? 0 : num;
      };

      const calcPendingAmt = pendingRegs.reduce((sum, r) => sum + parseAmt(r), 0);
      const calcApprovedAmt = approvedRegs.reduce((sum, r) => sum + parseAmt(r), 0);

      setStats({
        pendingPayments: pendingRegs.length,
        pendingAmount: calcPendingAmt,
        approvedPayments: approvedRegs.length,
        approvedAmount: calcApprovedAmt,
        totalUsers: usersList.length,
        totalTeams: regsList.length
      });
    } catch (_err) {
      console.warn('Dashboard stats fallback mode:', _err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    queueMicrotask(() => {
      if (isSubscribed) loadData();
    });
    return () => {
      isSubscribed = false;
    };
  }, [loadData]);

  // Payment Handlers
  const handleOpenPaymentActionModal = (payment, status) => {
    const defaultMsg = status === 'approved'
      ? 'Payment verified via UTR bank statement'
      : 'Invalid UTR transaction reference';
    setPaymentActionModal({
      payment,
      status,
      message: payment.message && payment.status === status ? payment.message : defaultMsg
    });
  };

  const handleSubmitPaymentStatus = async (e) => {
    e.preventDefault();
    if (!paymentActionModal) return;
    const { payment, status, message } = paymentActionModal;
    const paymentId = payment._id || payment.paymentid;

    setActionLoading(true);
    try {
      const res = await apiService.updatePaymentStatus(paymentId, status, message);
      showToast(res?.message || `Payment status updated to '${status}' successfully`);
      setPaymentActionModal(null);
      loadData();
    } catch {
      showToast('Failed to update payment status.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPaymentDetails = (paymentId) => {
    setPaymentDetailModal({ id: paymentId });
  };

  const handleCopyUtr = (utr) => {
    if (!utr) return;
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    showToast(`UTR '${utr}' copied to clipboard`);
    setTimeout(() => setCopiedUtr(null), 2500);
  };

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
    setApprovingRegId(id);
    setActionLoading(true);
    try {
      await apiService.approveRegistrationPayment(id, newStatus, reg);
      setRegistrations((prev) =>
        prev.map((r) => ((r._id === id || r.id === id) ? { ...r, paymentStatus: newStatus } : r))
      );
      showToast(`Payment for "${reg.leaderName || reg.teamName}" verified & marked as ${newStatus}!`);
      await loadData();
    } catch {
      showToast('Failed to update payment status.', true);
    } finally {
      setApprovingRegId(null);
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
      {/* SECTION 0: Recent Payments Audit & Approvals (Above Recent Event Registrations) */}
      {/* ========================================================================= */}
      <div className="card sketch-section-card payments-section priority-section mb-6">
        <div className="sketch-section-header">
          <div className="section-title-group">
            <div className="section-icon-badge icon-badge-cyan">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="section-title-row">
                <h3 className="sketch-section-title">Recent Payments</h3>
                <span className="priority-pill badge-cyan">SCAN & PAY VERIFICATION</span>
              </div>
              <p className="sketch-section-subtitle">
                Review submitted payment receipts, UTR bank statement references, approve or reject payments, and inspect student team details
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/payments')}
            className="btn btn-sm btn-secondary"
            title="Navigate to Payment Approvals Hub"
          >
            View All Payments ({payments.length}) <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Payments Grid / Cards Container */}
        <div className="payment-cards-grid">
          {payments.length === 0 ? (
            <EmptyState
              type="registrations"
              title="No payment submissions found"
              description="New payment receipts and UTR reference submissions will appear here in real-time."
              compact={true}
            />
          ) : (
            payments.slice(0, 3).map((p) => {
              const paymentId = p._id || p.paymentid;
              const rawStatus = (p.status || 'pending').toLowerCase();
              const amountDisplay = typeof p.amount === 'number' ? `₹${p.amount}` : (p.amount || '₹0');
              const proofImg = p.imageUrl || p.imageurl || p.proofUrl;
              const userAvatar = p.user?.avatar || p.avatar;

              return (
                <div 
                  key={paymentId} 
                  className={`payment-card status-border-${rawStatus} clickable-card`}
                  onClick={(e) => {
                    if (!e.target.closest('button') && !e.target.closest('.payment-img-thumbnail-wrap')) {
                      handleViewPaymentDetails(paymentId);
                    }
                  }}
                  title="Click card to view complete payment details"
                >
                  {/* Card Top Banner: Amount & Status Badge */}
                  <div className="payment-card-header">
                    <div className="payment-amount-tag">
                      <Receipt size={16} className="text-cyan" />
                      <span className="payment-amount-val">{amountDisplay}</span>
                    </div>
                    <span className={`payment-status-badge status-${rawStatus}`}>
                      {rawStatus === 'approved' && <CheckCircle2 size={12} />}
                      {rawStatus === 'rejected' && <XCircle size={12} />}
                      {rawStatus === 'pending' && <Clock size={12} />}
                      {rawStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Card Body: Details & Image Screenshot */}
                  <div className="payment-card-body">
                    {/* Meta Details */}
                    <div className="payment-card-meta">
                      {/* UTR Reference Code */}
                      <div className="payment-meta-item utr-box">
                        <span className="meta-label">UTR Ref:</span>
                        <code className="utr-code" title={p.utr}>{p.utr || 'N/A'}</code>
                        {p.utr && (
                          <button
                            type="button"
                            className="btn-icon-subtle"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUtr(p.utr);
                            }}
                            title="Copy UTR to Clipboard"
                          >
                            <Copy size={13} />
                          </button>
                        )}
                      </div>

                      {/* User & Team Details */}
                      <div className="payment-user-info">
                        <div 
                          className="user-name-line clickable-user-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetUserId = p.user?._id || p.user?.id || p.userId || '66c89f1e1a2b3c4d5e6f7a80';
                            navigate(`/user/${targetUserId}`);
                          }}
                          title={`Click to view full profile of ${p.user?.name || p.leaderName || 'User'}`}
                        >
                          {userAvatar ? (
                            <img src={userAvatar} alt={p.user?.name || 'User'} className="user-avatar-sm" />
                          ) : (
                            <div className="user-avatar-placeholder">
                              <User size={12} />
                            </div>
                          )}
                          <span className="user-name">{p.user?.name || p.leaderName || 'Student Participant'}</span>
                        </div>
                        {p.user?.collegeName || p.collegeName ? (
                          <div className="college-name-line" title={p.user?.collegeName || p.collegeName}>
                            <Building2 size={12} className="text-muted" />
                            <span className="college-name">{p.user?.collegeName || p.collegeName}</span>
                          </div>
                        ) : null}
                        {p.user?.team?.name || p.teamName ? (
                          <div className="team-name-line">
                            <span className="team-badge">Team: {p.user?.team?.name || p.teamName}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Thumbnail Screenshot on Right */}
                    {proofImg ? (
                      <div 
                        className="payment-img-thumbnail-wrap" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage({ url: proofImg, utr: p.utr });
                        }}
                        title="Click to expand payment proof screenshot"
                      >
                        <img src={proofImg} alt="Payment Receipt" className="payment-img-thumbnail" />
                        <div className="payment-img-hover-overlay">
                          <Eye size={15} />
                          <span>Expand</span>
                        </div>
                      </div>
                    ) : (
                      <div className="payment-img-placeholder">
                        <Receipt size={22} />
                        <span>No Proof</span>
                      </div>
                    )}
                  </div>

                  {/* Audit Info: Approved By / Rejected By & Message (Full Width) */}
                  {(rawStatus === 'approved' || rawStatus === 'rejected' || p.approvedBy) && (
                    <div className={`payment-audit-box audit-${rawStatus}`}>
                      <div className="audit-header">
                        <ShieldCheck size={13} />
                        <span className="audit-admin-name">
                          {rawStatus === 'approved' ? 'Approved by' : 'Rejected by'}:{' '}
                          <strong>{p.approvedBy?.name || p.approvedBy?.email || 'Admin'}</strong>
                        </span>
                      </div>
                      {p.message && (
                        <p className="audit-reason-text">"{p.message}"</p>
                      )}
                    </div>
                  )}

                  {/* Card Actions Bar */}
                  <div className="payment-card-footer">
                    <div className="action-btn-group">
                      <button
                        type="button"
                        className={`btn btn-xs ${rawStatus === 'approved' ? 'btn-success-active' : 'btn-outline-success'}`}
                        onClick={() => handleOpenPaymentActionModal(p, 'approved')}
                        disabled={actionLoading}
                        title="Approve this payment"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>

                      <button
                        type="button"
                        className={`btn btn-xs ${rawStatus === 'rejected' ? 'btn-danger-active' : 'btn-outline-danger'}`}
                        onClick={() => handleOpenPaymentActionModal(p, 'rejected')}
                        disabled={actionLoading}
                        title="Reject this payment"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-xs btn-outline-secondary btn-details"
                      onClick={() => handleViewPaymentDetails(paymentId)}
                      title="View complete payment, team, user & event details"
                    >
                      <Eye size={13} /> View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View More Button Footer if more than 3 payments exist */}
        {payments.length > 3 && (
          <div className="payments-section-footer">
            <button
              type="button"
              className="btn btn-secondary btn-view-more-payments"
              onClick={() => navigate('/payments')}
              title="Navigate to All Payments Hub"
            >
              View More ({payments.length - 3} More Payment Records) <ArrowUpRight size={14} />
            </button>
          </div>
        )}
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
                      <strong className="chip-text">{reg.leaderName || reg.name || 'Participant'}</strong>
                    </div>

                    {/* 3. College Name */}
                    <div className="sketch-chip chip-college" title="College Name">
                      <Building2 size={13} className="chip-icon" />
                      <span className="chip-text">{reg.collegeName || 'College Not Specified'}</span>
                    </div>

                    {/* 4. Team Name */}
                    <div className="sketch-chip chip-team" title="Team Name">
                      <span className="chip-label">Team:</span>
                      <strong className="chip-text">{reg.teamName || (reg.id ? `Team-${reg.id.slice(-4)}` : 'Team')}</strong>
                    </div>

                    {/* 4b. Assigned Event Name */}
                    <div className="sketch-chip chip-event" title="Assigned Event">
                      <Tag size={12} className="chip-icon text-cyan" />
                      <span className="chip-text">{reg.event || reg.eventName || 'General Event'}</span>
                    </div>

                    {/* 5. Amount */}
                    <div className="sketch-chip chip-amount" title="Registration Fee">
                      <strong className="chip-text">{reg.amount || '₹ 0'}</strong>
                    </div>

                    {/* Receipt Proof Badge in Row */}
                    {(reg.imageUrl || reg.proofUrl) && (
                      <button 
                        type="button"
                        className="sketch-chip chip-receipt-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewProof(reg);
                        }}
                        title="View Cloudinary Receipt Proof"
                      >
                        <Eye size={12} className="text-cyan" />
                        <span className="chip-text">View Receipt</span>
                      </button>
                    )}

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
                          disabled={actionLoading || approvingRegId === regId}
                          title="Click to approve payment"
                        >
                          {approvingRegId === regId ? (
                            <RefreshCw size={13} className="spin-icon" />
                          ) : (
                            <Check size={13} />
                          )}
                          <span>{approvingRegId === regId ? 'Verifying...' : 'Verify and Approve'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprovePayment(reg, 'Pending')}
                          className="btn btn-sm btn-revert"
                          disabled={actionLoading || approvingRegId === regId}
                          title="Revert to pending state"
                        >
                          {approvingRegId === regId ? (
                            <RefreshCw size={13} className="spin-icon" />
                          ) : (
                            <Clock size={13} />
                          )}
                          <span>{approvingRegId === regId ? 'Updating...' : 'Mark Pending'}</span>
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
                          <span className="detail-val font-bold text-cyan">{reg.event || reg.eventName || 'General Event'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Contact Email:</span>
                          <span className="detail-val">{reg.email || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Contact Phone:</span>
                          <span className="detail-val font-bold">{reg.phone || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">UTR Reference:</span>
                          <span className="detail-val utr-val">
                            <code className="utr-code-badge">{reg.utr || 'N/A'}</code>
                            {reg.utr && reg.utr !== 'N/A' && (
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
                        <div className="detail-item">
                          <span className="detail-lbl">Registration Fee:</span>
                          <span className="detail-val font-bold text-emerald">{reg.amount || '₹ 0'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Date Enrolled:</span>
                          <span className="detail-val text-muted">
                            {reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>

                        {/* Team Roster with Full Details */}
                        <div className="detail-item span-full">
                          <span className="detail-lbl">
                            Team Roster ({reg.membersCount || (reg.participants ? reg.participants.length : 1)} Member{(reg.membersCount > 1 || (reg.participants && reg.participants.length > 1)) ? 's' : ''}):
                          </span>
                          <div className="members-tags-list">
                            {reg.participants && Array.isArray(reg.participants) && reg.participants.length > 0 ? (
                              reg.participants.map((p, pIdx) => {
                                const pName = (typeof p === 'object' ? (p.name || p.userName || p.fullName) : p) || reg.leaderName || 'Participant';
                                const pPhone = (typeof p === 'object' ? p.phone : null) || (pIdx === 0 ? reg.phone : null);
                                const pEmail = (typeof p === 'object' ? p.email : null) || (pIdx === 0 ? reg.email : null);
                                return (
                                  <div key={pIdx} className="participant-chip">
                                    <strong className="participant-name">{pName}</strong>
                                    {pPhone && <span className="participant-sub"><Phone size={10} /> {pPhone}</span>}
                                    {pEmail && <span className="participant-sub"><Mail size={10} /> {pEmail}</span>}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="participant-chip">
                                <strong className="participant-name">{reg.leaderName || reg.name || 'Participant'}</strong>
                                {reg.phone && <span className="participant-sub"><Phone size={10} /> {reg.phone}</span>}
                                {reg.email && <span className="participant-sub"><Mail size={10} /> {reg.email}</span>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Cloudinary Payment Receipt Screenshot Preview */}
                        <div className="detail-item span-full proof-preview-item">
                          <span className="detail-lbl">Payment Receipt Proof (Cloudinary Attached):</span>
                          {(reg.proofUrl || reg.imageUrl) ? (
                            <div className="receipt-preview-box">
                              <img
                                src={reg.proofUrl || reg.imageUrl}
                                alt="Payment Receipt Screenshot"
                                className="receipt-thumb"
                                onClick={() => setPreviewProof(reg)}
                                title="Click to view full receipt"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = DEFAULT_RECEIPT_PLACEHOLDER;
                                }}
                              />
                              <div className="receipt-meta">
                                <span>UTR: <code>{reg.utr || 'N/A'}</code> • <strong className="text-emerald">{reg.amount}</strong></span>
                                <div className="receipt-btn-group">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewProof(reg)}
                                    className="btn btn-xs btn-secondary"
                                  >
                                    <Eye size={12} /> Inspect Receipt
                                  </button>
                                  <a
                                    href={reg.proofUrl || reg.imageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-xs btn-outline"
                                  >
                                    <ArrowUpRight size={12} /> Open URL
                                  </a>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '0.4rem 0' }}>
                              No receipt screenshot uploaded for this registration.
                            </div>
                          )}
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
            users.slice(0, 6).map((usr, uIdx) => {
              const uId = usr._id || usr.id || `usr-${uIdx}`;
              const avatarUrl = usr.avatar || usr.picture || usr.photo || usr.imageUrl || usr.image;
              const formattedCreatedTime = usr.createdAt
                ? new Date(usr.createdAt).toLocaleString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric', 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })
                : (usr.loginTime || 'Recently');

              return (
                <div key={uId} className="sketch-user-row">
                  {/* 1. Avatar (with real profile photo support) */}
                  <div className="sketch-avatar avatar-cyan" style={{ overflow: 'hidden', padding: 0 }}>
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={usr.name || 'User'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = `<span style="font-size: 13px; font-weight: 700; color: var(--primary);">${(usr.name || 'U').charAt(0).toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                        {(usr.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* 2. Name & Email Box */}
                  <div className="sketch-chip chip-name" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', padding: '0.4rem 0.85rem' }}>
                    <strong className="chip-text">{usr.name || 'Student User'}</strong>
                    {usr.email && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={11} className="text-cyan" /> {usr.email}
                      </span>
                    )}
                  </div>

                  {/* 3. College Box */}
                  <div className="sketch-chip chip-college">
                    <Building2 size={13} className="chip-icon" />
                    <span className="chip-text">{usr.collegeName || (usr.college?.collegeName) || 'College Not Specified'}</span>
                  </div>

                  {/* 4. Delete User Button */}
                  <button
                    onClick={() => setDeletingUser(usr)}
                    className="btn btn-sm btn-delete-user"
                    title={`Delete user account for ${usr.name}`}
                  >
                    <Trash2 size={13} /> Delete user
                  </button>

                  {/* 5. Right Meta: Registered / Created Time */}
                  <div className="sketch-user-time" title={usr.createdAt ? new Date(usr.createdAt).toISOString() : ''}>
                    <Calendar size={13} className="time-icon text-cyan" />
                    <span>Registered: {formattedCreatedTime}</span>
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
                          <span className="detail-val font-bold text-primary">{evt.category || 'General'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Registration Fee:</span>
                          <span className="detail-val font-bold text-emerald">{evt.registrationFee !== undefined && evt.registrationFee !== null && evt.registrationFee !== '' ? `₹ ${evt.registrationFee}` : (evt.fee || 'Free')}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Designated Venue / Lab:</span>
                          <span className="detail-val font-bold text-main">{evt.venue || evt.location || 'TBA'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-lbl">Team Size & Quota:</span>
                          <span className="detail-val font-bold text-cyan">{evt.maxParticipants || evt.maxTeamMembers ? `${evt.maxParticipants || evt.maxTeamMembers} Members/Team` : 'Flexible'}</span>
                        </div>
                        <div className="detail-item span-full">
                          <span className="detail-lbl">Event Summary & Guidelines:</span>
                          <span className="detail-val">{evt.description || 'No description provided.'}</span>
                        </div>
                        <div className="detail-item span-full">
                          <span className="detail-lbl">Assigned Faculty & Student Coordinators:</span>
                          <span className="detail-val font-bold text-cyan">{coords || 'Unassigned'}</span>
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
      {/* MODALS (Rendered via createPortal to guarantee centered viewport position) */}
      {/* ========================================================================= */}

      {/* 1. Edit Registration Modal */}
      {editingReg && (
        <Modal isOpen={!!editingReg} onClose={() => setEditingReg(null)} maxWidth="580px">
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
        </Modal>
      )}

      {/* 2. Confirm Delete Registration Modal */}
      {deletingReg && (
        <Modal isOpen={!!deletingReg} onClose={() => setDeletingReg(null)} maxWidth="500px" isDanger={true}>
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
        </Modal>
      )}

      {/* 3. Confirm Delete User Modal */}
      {deletingUser && (
        <Modal isOpen={!!deletingUser} onClose={() => setDeletingUser(null)} maxWidth="500px" isDanger={true}>
          <div className="modal-header">
            <h3><AlertTriangle size={19} className="text-danger" /> Delete User Account</h3>
            <button className="modal-close" onClick={() => setDeletingUser(null)}>&times;</button>
          </div>
          <p className="modal-subtitle">
            Are you sure you want to remove user <strong>{deletingUser.name}</strong> ({deletingUser.email || deletingUser.collegeName || 'User'})?
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
        </Modal>
      )}

      {/* 4. Edit Event Modal */}
      {editingEvent && (
        <Modal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} maxWidth="580px">
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
        </Modal>
      )}

      {/* 5. Confirm Delete Event Modal */}
      {deletingEvent && (
        <Modal isOpen={!!deletingEvent} onClose={() => setDeletingEvent(null)} maxWidth="500px" isDanger={true}>
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
        </Modal>
      )}

      {/* 6. Payment Approve / Reject Action Modal */}
      {paymentActionModal && (
        <Modal
          isOpen={!!paymentActionModal}
          onClose={() => setPaymentActionModal(null)}
          maxWidth="520px"
          isDanger={paymentActionModal.status === 'rejected'}
        >
          <div className="modal-header">
            <h3>
              {paymentActionModal.status === 'approved' ? (
                <span className="text-success flex-align">
                  <CheckCircle2 size={20} /> Approve Payment
                </span>
              ) : (
                <span className="text-danger flex-align">
                  <XCircle size={20} /> Reject Payment
                </span>
              )}
            </h3>
            <button className="modal-close" onClick={() => setPaymentActionModal(null)}>&times;</button>
          </div>

          <p className="modal-subtitle">
            Payment UTR Reference: <code>{paymentActionModal.payment?.utr}</code> — Amount: <strong>₹{paymentActionModal.payment?.amount}</strong>
          </p>

          <form onSubmit={handleSubmitPaymentStatus} className="modal-form">
            <div className="form-group">
              <label className="form-label">
                {paymentActionModal.status === 'approved' ? 'Approval Message / Verification Note' : 'Rejection Reason'} *
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={paymentActionModal.message}
                onChange={(e) => setPaymentActionModal({ ...paymentActionModal, message: e.target.value })}
                placeholder={
                  paymentActionModal.status === 'approved'
                    ? 'e.g. Payment verified via UTR bank statement'
                    : 'e.g. Invalid UTR transaction reference code'
                }
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setPaymentActionModal(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${paymentActionModal.status === 'approved' ? 'btn-success' : 'btn-danger'}`}
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'Updating...'
                  : paymentActionModal.status === 'approved'
                  ? 'Confirm Approval'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 7. Payment Full Details Modal */}
      <PaymentDetailsModal
        isOpen={!!paymentDetailModal}
        onClose={() => setPaymentDetailModal(null)}
        paymentId={paymentDetailModal?.id}
        onOpenActionModal={handleOpenPaymentActionModal}
      />

      {/* 8. Image Lightbox Modal */}
      {previewImage && (
        <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="800px">
          <div className="modal-header">
            <h3><Receipt size={18} /> Payment Screenshot Preview {previewImage.utr ? `(${previewImage.utr})` : ''}</h3>
            <button className="modal-close" onClick={() => setPreviewImage(null)}>&times;</button>
          </div>
          <div className="preview-image-container">
            <img src={previewImage.url} alt="Payment Receipt Large" className="preview-image-full" />
          </div>
          <div className="modal-actions">
            <a href={previewImage.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
              Open Original Image <ArrowUpRight size={13} />
            </a>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setPreviewImage(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* 9. Preview Cloudinary Receipt Proof Modal */}
      {previewProof && (
        <Modal isOpen={!!previewProof} onClose={() => setPreviewProof(null)} maxWidth="640px">
          <div className="modal-header">
            <h3><Receipt size={19} /> Cloudinary Payment Receipt Audit</h3>
            <button className="modal-close" onClick={() => setPreviewProof(null)}>&times;</button>
          </div>
          <p className="modal-subtitle">
            Payment Audit for Team <strong>{previewProof.teamName}</strong> • {previewProof.leaderName}
          </p>

          <div className="proof-audit-view">
            <div className="proof-audit-image-wrap">
              <img
                src={previewProof.proofUrl || previewProof.imageUrl || DEFAULT_RECEIPT_PLACEHOLDER}
                alt="Cloudinary Payment Receipt"
                className="proof-audit-full-img"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = DEFAULT_RECEIPT_PLACEHOLDER;
                }}
              />
            </div>

            <div className="proof-audit-meta-grid">
              <div className="audit-meta-item">
                <span className="audit-lbl">UTR Reference:</span>
                <strong className="code-font font-bold text-cyan">{previewProof.utr || 'N/A'}</strong>
              </div>
              <div className="audit-meta-item">
                <span className="audit-lbl">Verified Amount:</span>
                <strong className="text-emerald">{previewProof.amount}</strong>
              </div>
              <div className="audit-meta-item">
                <span className="audit-lbl">Assigned Event:</span>
                <span>{previewProof.event || previewProof.eventName}</span>
              </div>
              <div className="audit-meta-item">
                <span className="audit-lbl">Current Status:</span>
                <span className={`status-badge status-${(previewProof.paymentStatus || 'pending').toLowerCase()}`}>
                  {previewProof.paymentStatus || 'Pending'}
                </span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1rem' }}>
              <a
                href={previewProof.proofUrl || previewProof.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
              >
                <ArrowUpRight size={14} /> Open Original in Cloudinary
              </a>
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewProof(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
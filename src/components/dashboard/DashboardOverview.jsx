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
  Mail,
  Download,
  BarChart3
} from 'lucide-react';

import { PaymentDetailsModal } from '../payments/PaymentDetailsModal';
import { CountUp } from '../common/CountUp';
import { TiltCard } from '../common/TiltCard';
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

  const [stats, setStats] = useState({
    pendingPayments: 0,
    pendingAmount: 0,
    approvedPayments: 0,
    approvedAmount: 0,
    totalUsers: 0,
    totalTeams: 0
  });

  // Modals state
  const [deletingUser, setDeletingUser] = useState(null);
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

      // Create an event fee lookup map
      const eventFeeMap = new Map();
      eventsList.forEach(e => {
        const fee = Number(e.registrationFee || (typeof e.fee === 'string' ? e.fee.replace(/[^0-9.]/g, '') : e.fee) || 0);
        if (fee > 0) {
          if (e._id) eventFeeMap.set(String(e._id).toLowerCase().trim(), fee);
          if (e.id) eventFeeMap.set(String(e.id).toLowerCase().trim(), fee);
          if (e.title) eventFeeMap.set(e.title.toLowerCase().trim(), fee);
          if (e.name) eventFeeMap.set(e.name.toLowerCase().trim(), fee);
        }
      });

      const parseAmt = (item) => {
        if (typeof item?.amountNumber === 'number' && item.amountNumber > 0) return item.amountNumber;
        if (typeof item?.amountNum === 'number' && item.amountNum > 0) return item.amountNum;
        if (typeof item?.amount === 'number' && item.amount > 0) return item.amount;
        if (typeof item?.amount === 'string') {
          const num = Number(item.amount.replace(/[^0-9.]/g, ''));
          if (!isNaN(num) && num > 0) return num;
        }
        // Match event fee from map
        const evKey1 = String(item?.event?._id || item?.event?.id || item?.eventId || item?.event || '').toLowerCase().trim();
        const evKey2 = String(item?.eventName || item?.eventTitle || item?.events?.[0]?.title || item?.events?.[0]?._id || '').toLowerCase().trim();
        if (eventFeeMap.has(evKey1)) return eventFeeMap.get(evKey1);
        if (eventFeeMap.has(evKey2)) return eventFeeMap.get(evKey2);
        return 200; // Standard Semaphore event registration fee fallback
      };

      // Extract pending & approved from registrations, fallback to paymentsList
      const pendingRegs = regsList.filter((r) => (r.paymentStatus || '').toLowerCase().includes('pend'));
      const approvedRegs = regsList.filter((r) => (r.paymentStatus || '').toLowerCase().includes('app') || (r.paymentStatus || '').toLowerCase() === 'success');

      const pendingPayments = paymentsList.filter((p) => (p.status || '').toLowerCase().includes('pend') || (p.rawStatus || '').toLowerCase().includes('pend'));
      const approvedPayments = paymentsList.filter((p) => (p.status || '').toLowerCase().includes('app') || (p.rawStatus || '').toLowerCase().includes('app') || (p.status || '').toLowerCase() === 'success');

      const effectivePending = pendingRegs.length > 0 ? pendingRegs : pendingPayments;
      const effectiveApproved = approvedRegs.length > 0 ? approvedRegs : approvedPayments;

      const calcPendingAmt = effectivePending.reduce((sum, r) => sum + parseAmt(r), 0);
      const calcApprovedAmt = effectiveApproved.reduce((sum, r) => sum + parseAmt(r), 0);

      setStats({
        pendingPayments: effectivePending.length,
        pendingAmount: calcPendingAmt,
        approvedPayments: effectiveApproved.length,
        approvedAmount: calcApprovedAmt,
        totalUsers: usersList.length,
        totalTeams: regsList.length || paymentsList.length || 0
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
      const res = await apiService.updatePaymentStatus(paymentId, status, message, payment);
      showToast(res?.message || `Payment status updated to '${status}' successfully`);
      setPaymentActionModal(null);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update payment status.', true);
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

  // 1. Confirm Delete User
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

            <button
              className="btn btn-xs btn-secondary refresh-btn"
              onClick={() => navigate('/analytics')}
              title="Open Visual Analytics & Graphs Hub"
            >
              <BarChart3 size={12} className="text-cyan" />
              <span>Analytics & Graphs</span>
            </button>

            <button
              className="btn btn-xs btn-secondary refresh-btn"
              onClick={() => navigate('/reports')}
              title="Open Reports & Export Hub"
            >
              <FileSpreadsheet size={12} />
              <span>Reports Hub</span>
            </button>

            <button
              className="btn btn-xs btn-primary refresh-btn btn-glow-sheen"
              onClick={async () => {
                try {
                  await apiService.exportAllMaster('Semaphore_2026_Master_Export.xlsx');
                  showToast('Master Consolidated Workbook downloaded (.xlsx)!');
                } catch {
                  showToast('Failed to export Master Workbook.', true);
                }
              }}
              title="1-Click Master Excel Export (.xlsx)"
            >
              <Download size={12} />
              <span>Master Export (.xlsx)</span>
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
            <span className="chip-num">
              <CountUp prefix="₹ " value={stats.pendingAmount + stats.approvedAmount} />
            </span>
            <span className="chip-lbl">Total Fest Volume</span>
          </div>
        </div>
      </div>

      {/* TOP 4 KPI CARDS (Matching Sketch Row with 3D Tilt & CountUp Physics) */}
      <div className="sketch-kpi-grid">
        {/* Card 1: Pending Payment */}
        <TiltCard maxTilt={6} glareOpacity={0.14} className="sketch-kpi-tilt">
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
              <span className="sketch-kpi-badge badge-amber">
                <CountUp value={stats.pendingPayments} />
              </span>
            </div>
            <div className="sketch-kpi-amount-box box-amber">
              <span className="amount-currency">₹</span>
              <span className="amount-val">
                <CountUp value={stats.pendingAmount} />
              </span>
            </div>
            <div className="sketch-kpi-footer">
              <span>Needs UTR verification</span>
              <ArrowUpRight size={13} />
            </div>
          </div>
        </TiltCard>

        {/* Card 2: Payments Approved */}
        <TiltCard maxTilt={6} glareOpacity={0.14} className="sketch-kpi-tilt">
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
              <span className="sketch-kpi-badge badge-emerald">
                <CountUp value={stats.approvedPayments} />
              </span>
            </div>
            <div className="sketch-kpi-amount-box box-emerald">
              <span className="amount-currency">₹</span>
              <span className="amount-val">
                <CountUp value={stats.approvedAmount} />
              </span>
            </div>
            <div className="sketch-kpi-footer">
              <span>Verified & Cleared</span>
              <ArrowUpRight size={13} />
            </div>
          </div>
        </TiltCard>

        {/* Card 3: Total Users Registered */}
        <TiltCard maxTilt={6} glareOpacity={0.14} className="sketch-kpi-tilt">
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
              <span className="sketch-kpi-badge badge-cyan">
                <CountUp value={stats.totalUsers} />
              </span>
            </div>
            <div className="sketch-kpi-amount-box box-cyan">
              <span className="amount-val">
                <CountUp value={stats.totalUsers} />
              </span>
              <span className="amount-lbl" style={{ opacity: 0.85, fontSize: '0.82rem', marginLeft: '0.2rem' }}>Active Accounts</span>
            </div>
            <div className="sketch-kpi-footer">
              <span>Participant Directory</span>
              <ArrowUpRight size={13} />
            </div>
          </div>
        </TiltCard>

        {/* Card 4: Total Teams */}
        <TiltCard maxTilt={6} glareOpacity={0.14} className="sketch-kpi-tilt">
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
              <span className="sketch-kpi-badge badge-indigo">
                <CountUp value={stats.totalTeams} />
              </span>
            </div>
            <div className="sketch-kpi-amount-box box-indigo">
              <span className="amount-val">
                <CountUp value={stats.totalTeams} />
              </span>
              <span className="amount-lbl" style={{ opacity: 0.85, fontSize: '0.82rem', marginLeft: '0.2rem' }}>Registered Teams</span>
            </div>
            <div className="sketch-kpi-footer">
              <span>Across All Events</span>
              <ArrowUpRight size={13} />
            </div>
          </div>
        </TiltCard>
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
                            const targetUserId = p.user?._id || p.user?.id || p.userId;
                            if (targetUserId) {
                              navigate(`/user/${targetUserId}`);
                            } else {
                              navigate('/users');
                            }
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
                      {rawStatus !== 'approved' && (
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-success"
                          onClick={() => handleOpenPaymentActionModal(p, 'approved')}
                          disabled={actionLoading}
                          title="Approve this payment"
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                      )}

                      {rawStatus !== 'rejected' && (
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-danger"
                          onClick={() => handleOpenPaymentActionModal(p, 'rejected')}
                          disabled={actionLoading}
                          title="Reject this payment"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      )}
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
      {/* SECTION: Recent User Registrations */}
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
                  <div className="sketch-avatar avatar-cyan">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={usr.name || 'User'} 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.innerHTML = `<span class="avatar-letter">${(usr.name || 'U').charAt(0).toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="avatar-letter">
                        {(usr.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* 2. Name & Email Box */}
                  <div className="sketch-chip chip-name">
                    <strong className="chip-text" title={usr.name || 'Student User'}>
                      {usr.name || 'Student User'}
                    </strong>
                    {usr.email && (
                      <span className="chip-email" title={usr.email}>
                        <Mail size={11} className="text-cyan chip-icon-inline" /> {usr.email}
                      </span>
                    )}
                  </div>

                  {/* 3. College Box */}
                  <div className="sketch-chip chip-college" title={usr.collegeName || (usr.college?.collegeName) || 'College Not Specified'}>
                    <Building2 size={13} className="chip-icon" />
                    <span className="chip-text">{usr.collegeName || (usr.college?.collegeName) || 'College Not Specified'}</span>
                  </div>

                  {/* 4. Delete User Button */}
                  <button
                    type="button"
                    onClick={() => setDeletingUser(usr)}
                    className="btn btn-sm btn-delete-user"
                    title={`Delete user account for ${usr.name}`}
                  >
                    <Trash2 size={13} /> <span>Delete user</span>
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
      {/* MODALS (Rendered via createPortal to guarantee centered viewport position) */}
      {/* ========================================================================= */}

      {/* 1. Confirm Delete User Modal */}
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

      {/* 4. Payment Approve / Reject Action Modal */}
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
        onPaymentDeleted={() => loadData()}
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
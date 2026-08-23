import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/apiService';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Search, 
  Copy,
  Receipt,
  Building2,
  RefreshCw,
  X,
  Calendar,
  User,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Tag
} from 'lucide-react';
import { PaymentDetailsModal } from './PaymentDetailsModal';
import './PaymentApprovals.css';

export const PaymentApprovals = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [actionModal, setActionModal] = useState(null); // { payment, status, message }
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // { url, utr }
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg, isError = false) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  };

  const loadPayments = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await apiService.getRecentPayments();
      const rawList = data?.payments || (Array.isArray(data) ? data : []);
      const formatted = rawList.map(p => ({
        id: p._id || p.paymentid || p.id,
        _id: p._id || p.paymentid,
        paymentid: p.paymentid || p._id,
        utr: p.utr || 'N/A',
        teamName: p.user?.team?.name || p.teamName || '',
        collegeName: p.user?.collegeName || p.collegeName || '',
        userName: p.user?.name || p.leaderName || 'Student Participant',
        userEmail: p.user?.email || p.email || '',
        userAvatar: p.user?.avatar || p.avatar || null,
        amountNum: typeof p.amount === 'number' ? p.amount : Number(String(p.amount || 0).replace(/[^0-9]/g, '')),
        amount: typeof p.amount === 'number' ? `₹${p.amount}` : (p.amount || '₹0'),
        event: (p.events && p.events[0]?.title) || p.event || 'General Registration',
        events: p.events || [],
        date: p.timestamp ? new Date(p.timestamp).toLocaleString() : (p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Recent'),
        status: (p.status || 'Pending').charAt(0).toUpperCase() + (p.status || 'Pending').slice(1).toLowerCase(),
        rawStatus: (p.status || 'pending').toLowerCase(),
        message: p.message || '',
        approvedBy: p.approvedBy || null,
        proofUrl: p.imageUrl || p.imageurl || p.proofUrl || 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80',
        rawItem: p
      }));
      setPayments(formatted);
    } catch (_err) {
      console.warn('Error loading payments:', _err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    queueMicrotask(() => {
      if (isSubscribed) loadPayments();
    });
    return () => {
      isSubscribed = false;
    };
  }, [loadPayments]);

  const handleOpenActionModal = (p, status) => {
    const defaultMsg = status === 'approved'
      ? 'Payment verified via UTR bank statement'
      : 'Invalid UTR transaction reference';
    setActionModal({
      payment: p,
      status,
      message: p.message && p.rawStatus === status ? p.message : defaultMsg
    });
  };

  const handleSubmitPaymentStatus = async (e) => {
    e.preventDefault();
    if (!actionModal) return;
    const { payment, status, message } = actionModal;
    const paymentId = payment._id || payment.paymentid || payment.id;

    setActionLoading(true);
    try {
      const res = await apiService.updatePaymentStatus(paymentId, status, message);
      showToast(res?.message || `Payment status updated to '${status}' successfully!`);
      setActionModal(null);
      loadPayments();
    } catch {
      showToast('Failed to update payment status.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPaymentDetails = (paymentId) => {
    setSelectedPaymentId(paymentId);
  };

  const handleCopyUtr = (utr) => {
    if (!utr || utr === 'N/A') return;
    navigator.clipboard.writeText(utr);
    showToast(`UTR '${utr}' copied to clipboard`);
  };

  const eventsList = ['All', ...new Set(payments.map(p => p.event).filter(Boolean))];

  const filteredPayments = payments.filter((p) => {
    const matchesFilter = activeFilter === 'All' || (p.status || '').toLowerCase() === activeFilter.toLowerCase();
    const matchesEvent = selectedEvent === 'All' || p.event === selectedEvent;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.utr || '').toLowerCase().includes(term) ||
      (p.teamName || '').toLowerCase().includes(term) ||
      (p.collegeName || '').toLowerCase().includes(term) ||
      (p.userName || '').toLowerCase().includes(term) ||
      (p.event || '').toLowerCase().includes(term) ||
      (p.userEmail || '').toLowerCase().includes(term);
    return matchesFilter && matchesEvent && matchesSearch;
  });

  const pendingCount = payments.filter((p) => p.rawStatus === 'pending').length;
  const approvedCount = payments.filter((p) => p.rawStatus === 'approved').length;
  const rejectedCount = payments.filter((p) => p.rawStatus === 'rejected').length;

  const totalVerifiedVolume = payments
    .filter((p) => p.rawStatus === 'approved')
    .reduce((sum, p) => sum + (p.amountNum || 0), 0);

  return (
    <div className="payments-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <CreditCard className="title-icon text-cyan" /> Payment & UTR Verification Hub
          </h2>
          <p className="page-description">
            Audit student UPI payment submissions, verify bank statement UTR codes, inspect fee receipts, and approve team registrations.
          </p>
        </div>

        <button 
          onClick={loadPayments} 
          className="btn btn-secondary"
          disabled={isRefreshing}
          title="Refresh All Payments"
          aria-label="Refresh Payments"
        >
          <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Payments'}</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="payment-summary-strip">
        <div className="payment-metric-card">
          <span className="metric-label">Approved Revenue</span>
          <span className="metric-val text-success">₹ {totalVerifiedVolume.toLocaleString()}</span>
        </div>
        <div className="payment-metric-card">
          <span className="metric-label">Pending Verification</span>
          <span className="metric-val text-warning">{pendingCount} Submissions</span>
        </div>
        <div className="payment-metric-card">
          <span className="metric-label">Verified Approvals</span>
          <span className="metric-val text-cyan">{approvedCount} Teams</span>
        </div>
        <div className="payment-metric-card">
          <span className="metric-label">Rejected Payments</span>
          <span className="metric-val text-danger">{rejectedCount} Entries</span>
        </div>
      </div>

      {/* Filters & Search Card */}
      <div className="card filter-card">
        <div className="filter-header">
          {/* Status Tabs (All, Pending, Approved, Rejected) */}
          <div className="tab-group">
            {[
              { label: 'All', count: payments.length },
              { label: 'Pending', count: pendingCount },
              { label: 'Approved', count: approvedCount },
              { label: 'Rejected', count: rejectedCount }
            ].map((tab) => (
              <button
                key={tab.label}
                className={`tab-btn ${activeFilter.toLowerCase() === tab.label.toLowerCase() ? 'tab-active' : ''}`}
                onClick={() => setActiveFilter(tab.label)}
              >
                <span>{tab.label}</span>
                <span className="tab-counter">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="filter-controls-right">
            <div className="filter-dropdown-wrapper">
              <Calendar size={14} style={{ color: 'var(--text-dim)' }} />
              <select
                className="form-select select-compact"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {eventsList.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt === 'All' ? 'All Events' : evt}
                  </option>
                ))}
              </select>
            </div>

            <div className="search-bar-wrapper">
              <Search className="search-icon" size={15} />
              <input
                type="text"
                className="search-input"
                placeholder="Search UTR, Student, Team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <span className="endpoint-badge">{filteredPayments.length} Total</span>
          </div>
        </div>

        {/* Payments Cards Grid */}
        <div className="payment-cards-grid">
          {filteredPayments.length === 0 ? (
            <EmptyState
              type="payments"
              title="No payment records found"
              description="No payment verification entries match your search query or filter selection."
              primaryAction={{
                label: 'Reset Filters',
                onClick: () => {
                  setActiveFilter('All');
                  setSelectedEvent('All');
                  setSearchTerm('');
                }
              }}
              compact={true}
            />
          ) : (
            filteredPayments.map((p) => {
              const paymentId = p._id || p.paymentid || p.id;
              const rawStatus = (p.rawStatus || 'pending').toLowerCase();
              const proofImg = p.proofUrl;
              const userAvatar = p.userAvatar;

              return (
                <div 
                  key={paymentId} 
                  className={`payment-card status-border-${rawStatus} clickable-card`}
                  onClick={(e) => {
                    if (!e.target.closest('button') && !e.target.closest('.payment-thumbnail-box')) {
                      handleViewPaymentDetails(paymentId);
                    }
                  }}
                >
                  {/* Card Header: User Avatar, Team Name & Status Badge */}
                  <div className="payment-card-header">
                    <div className="payment-user-info-cluster">
                      <div 
                        className="payment-avatar-wrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (p.rawItem?.user?._id) {
                            navigate(`/user/${p.rawItem.user._id}`);
                          }
                        }}
                        title={`View Profile: ${p.userName}`}
                      >
                        {userAvatar ? (
                          <img src={userAvatar} alt={p.userName} className="payment-avatar-img" />
                        ) : (
                          <div className="payment-avatar-placeholder">
                            <span>{(p.userName || 'U').charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                      <div className="payment-title-group">
                        <h4 className="payment-team-name" title={p.teamName || 'Solo Participant'}>
                          {p.teamName || 'Solo Participant'}
                        </h4>
                        <div 
                          className="payment-user-sub clickable-user-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.rawItem?.user?._id) {
                              navigate(`/user/${p.rawItem.user._id}`);
                            }
                          }}
                          title="View User Profile"
                        >
                          <User size={12} className="text-muted" />
                          <span className="user-name-text">{p.userName}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`payment-status-badge status-${rawStatus}`}>
                      {rawStatus === 'approved' && <CheckCircle2 size={12} />}
                      {rawStatus === 'rejected' && <XCircle size={12} />}
                      {rawStatus === 'pending' && <Clock size={12} />}
                      {p.status}
                    </span>
                  </div>

                  {/* Card Main Body: Structured Column + Screenshot Preview */}
                  <div className="payment-card-main-content">
                    {/* Left: Meta details */}
                    <div className="payment-details-column">
                      {p.collegeName && (
                        <div className="payment-meta-item" title={p.collegeName}>
                          <Building2 size={13} className="meta-icon" />
                          <span className="meta-val college-text">{p.collegeName}</span>
                        </div>
                      )}

                      <div className="payment-meta-item utr-item">
                        <span className="meta-label">UTR:</span>
                        <code className="utr-code" title={p.utr}>{p.utr || 'N/A'}</code>
                        {p.utr && p.utr !== 'N/A' && (
                          <button 
                            type="button"
                            className="btn-copy-mini"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUtr(p.utr);
                            }}
                            title="Copy UTR Reference"
                          >
                            <Copy size={11} />
                          </button>
                        )}
                      </div>

                      <div className="payment-meta-item">
                        <span className="meta-label">Amount:</span>
                        <strong className="amount-val-text">{p.amount}</strong>
                      </div>

                      <div className="payment-meta-item">
                        <Tag size={12} className="meta-icon text-cyan" />
                        <span className="event-tag-pill" title={p.event}>
                          {p.event}
                        </span>
                      </div>
                    </div>

                    {/* Right: Receipt thumbnail */}
                    {proofImg ? (
                      <div 
                        className="payment-thumbnail-box"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage({ url: proofImg, utr: p.utr });
                        }}
                        title="Click to zoom receipt image"
                      >
                        <img src={proofImg} alt="Receipt Proof" className="payment-thumb-img" />
                        <div className="thumb-hover-hint">
                          <Eye size={14} />
                          <span>Zoom</span>
                        </div>
                      </div>
                    ) : (
                      <div className="payment-thumb-placeholder">
                        <Receipt size={20} />
                        <span>No Proof</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Timestamp & Action Buttons */}
                  <div className="payment-card-footer">
                    <div className="payment-timestamp" title={p.date}>
                      <Clock size={12} className="time-icon" />
                      <span className="time-text">{p.date}</span>
                    </div>

                    <div className="payment-actions-group">
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPaymentDetails(paymentId);
                        }}
                        title="View Full Payment Breakdown"
                      >
                        <Eye size={12} /> Details
                      </button>

                      {rawStatus !== 'approved' && (
                        <button
                          type="button"
                          className="btn btn-xs btn-success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenActionModal(p, 'approved');
                          }}
                          title="Approve Payment"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                      )}

                      {rawStatus !== 'rejected' && (
                        <button
                          type="button"
                          className="btn btn-xs btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenActionModal(p, 'rejected');
                          }}
                          title="Reject Payment"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verification Note Banner */}
                  {p.approvedBy && (
                    <div className={`payment-audit-banner audit-${rawStatus}`}>
                      <ShieldCheck size={13} className="audit-icon" />
                      <span className="audit-text">
                        Verified by <strong>{p.approvedBy.name || 'Admin'}</strong>
                        {p.message ? `: ${p.message}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 1. Payment Approve / Reject Action Modal */}
      {actionModal && (
        <Modal
          isOpen={!!actionModal}
          onClose={() => setActionModal(null)}
          maxWidth="520px"
          isDanger={actionModal.status === 'rejected'}
        >
          <div className="modal-header">
            <h3>
              {actionModal.status === 'approved' ? (
                <span className="text-success flex-align">
                  <CheckCircle2 size={20} /> Approve Payment
                </span>
              ) : (
                <span className="text-danger flex-align">
                  <XCircle size={20} /> Reject Payment
                </span>
              )}
            </h3>
            <button className="modal-close" onClick={() => setActionModal(null)}>&times;</button>
          </div>

          <p className="modal-subtitle">
            Payment UTR Reference: <code>{actionModal.payment?.utr}</code> — Amount: <strong>{actionModal.payment?.amount}</strong>
          </p>

          <form onSubmit={handleSubmitPaymentStatus} className="modal-form">
            <div className="form-group">
              <label className="form-label">
                {actionModal.status === 'approved' ? 'Approval Message / Verification Note' : 'Rejection Reason'} *
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={actionModal.message}
                onChange={(e) => setActionModal({ ...actionModal, message: e.target.value })}
                placeholder={actionModal.status === 'approved' ? 'e.g. Payment verified via UTR bank statement' : 'e.g. Invalid UTR transaction reference'}
                required
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setActionModal(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${actionModal.status === 'approved' ? 'btn-success' : 'btn-danger'}`}
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : actionModal.status === 'approved' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Payment Full Details Modal */}
      <PaymentDetailsModal
        isOpen={!!selectedPaymentId}
        onClose={() => setSelectedPaymentId(null)}
        paymentId={selectedPaymentId}
        onOpenActionModal={handleOpenActionModal}
      />

      {/* 3. Image Lightbox Modal */}
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
    </div>
  );
};

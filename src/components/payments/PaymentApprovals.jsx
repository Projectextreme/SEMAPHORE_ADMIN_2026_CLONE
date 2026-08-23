import { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import './PaymentApprovals.css';

export const PaymentApprovals = () => {
  const { showSuccess, showError } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUtr, setCopiedUtr] = useState(null);

  // Modals state
  const [actionModal, setActionModal] = useState(null); // { payment, status, message }
  const [detailModal, setDetailModal] = useState(null); // { loading, data }
  const [previewImage, setPreviewImage] = useState(null); // { url, utr }
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg, isError = false) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  };

  const loadPayments = async () => {
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
    } catch (err) {
      console.warn('Error loading payments:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

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
    } catch (err) {
      showToast('Failed to update payment status.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewPaymentDetails = async (paymentId) => {
    setDetailModal({ loading: true, data: null });
    try {
      const data = await apiService.getPaymentDetails(paymentId);
      setDetailModal({ loading: false, data });
    } catch (err) {
      showToast('Failed to load payment details', true);
      setDetailModal(null);
    }
  };

  const handleCopyUtr = (utr) => {
    if (!utr) return;
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    showToast(`UTR '${utr}' copied to clipboard`);
    setTimeout(() => setCopiedUtr(null), 2500);
  };

  const eventsList = ['All', ...new Set(payments.map(p => p.event))];

  const filteredPayments = payments.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
    const matchesEvent = selectedEvent === 'All' || p.event === selectedEvent;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.utr.toLowerCase().includes(term) ||
      p.teamName.toLowerCase().includes(term) ||
      p.collegeName.toLowerCase().includes(term) ||
      p.userName.toLowerCase().includes(term) ||
      p.event.toLowerCase().includes(term);
    return matchesFilter && matchesEvent && matchesSearch;
  });

  const pendingCount = payments.filter((p) => p.status === 'Pending').length;
  const approvedCount = payments.filter((p) => p.status === 'Approved').length;
  const rejectedCount = payments.filter((p) => p.status === 'Rejected').length;

  const totalVerifiedVolume = payments
    .filter((p) => p.status === 'Approved')
    .reduce((sum, p) => sum + (p.amountNum || 500), 0);

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
                className={`tab-btn ${activeFilter === tab.label ? 'tab-active' : ''}`}
                onClick={() => setActiveFilter(tab.label)}
              >
                <span>{tab.label}</span>
                <span className="tab-counter">{tab.count}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div className="filter-dropdown-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
                placeholder="Search by UTR, Student, Team or College..."
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

        {/* Payments Cards Grid (Identical Design as Dashboard with User Avatar & Card Clickability) */}
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
                      <span className="payment-amount-val">{p.amount}</span>
                    </div>
                    <span className={`payment-status-badge status-${rawStatus}`}>
                      {rawStatus === 'approved' && <CheckCircle2 size={12} />}
                      {rawStatus === 'rejected' && <XCircle size={12} />}
                      {rawStatus === 'pending' && <Clock size={12} />}
                      {rawStatus.toUpperCase()}
                    </span>
                  </div>

                  {/* Card Body: Image Screenshot & Details */}
                  <div className="payment-card-body">
                    {/* Thumbnail Screenshot */}
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
                          <Eye size={16} />
                          <span>Expand</span>
                        </div>
                      </div>
                    ) : (
                      <div className="payment-img-placeholder">
                        <Receipt size={24} />
                        <span>No Proof Image</span>
                      </div>
                    )}

                    {/* Meta Details */}
                    <div className="payment-card-meta">
                      {/* UTR Reference Code */}
                      <div className="payment-meta-item utr-box">
                        <span className="meta-label">UTR Ref:</span>
                        <code className="utr-code">{p.utr || 'N/A'}</code>
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

                      {/* User Avatar & Details */}
                      <div className="payment-user-info">
                        <div className="user-name-line">
                          {userAvatar ? (
                            <img src={userAvatar} alt={p.userName} className="user-avatar-sm" />
                          ) : (
                            <div className="user-avatar-placeholder">
                              <User size={12} />
                            </div>
                          )}
                          <span className="user-name">{p.userName}</span>
                        </div>
                        {p.collegeName ? (
                          <div className="college-name-line" title={p.collegeName}>
                            <Building2 size={12} className="text-muted" />
                            <span className="college-name">{p.collegeName}</span>
                          </div>
                        ) : null}
                        {p.teamName ? (
                          <div className="team-name-line">
                            <span className="team-badge">Team: {p.teamName}</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Audit Info: Approved By / Rejected By & Message */}
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
                    </div>
                  </div>

                  {/* Card Actions Bar */}
                  <div className="payment-card-footer">
                    <div className="action-btn-group">
                      <button
                        type="button"
                        className={`btn btn-xs ${rawStatus === 'approved' ? 'btn-success-active' : 'btn-outline-success'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionModal(p, 'approved');
                        }}
                        disabled={actionLoading}
                        title="Approve this payment"
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>

                      <button
                        type="button"
                        className={`btn btn-xs ${rawStatus === 'rejected' ? 'btn-danger-active' : 'btn-outline-danger'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionModal(p, 'rejected');
                        }}
                        disabled={actionLoading}
                        title="Reject this payment"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn btn-xs btn-outline-secondary btn-details"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPaymentDetails(paymentId);
                      }}
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
      </div>

      {/* 1. Action Modal (Approve / Reject) */}
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
                  <CheckCircle2 size={20} /> Approve Payment Status
                </span>
              ) : (
                <span className="text-danger flex-align">
                  <XCircle size={20} /> Reject Payment Status
                </span>
              )}
            </h3>
            <button className="modal-close" onClick={() => setActionModal(null)}>&times;</button>
          </div>

          <p className="modal-subtitle">
            UTR Reference: <code>{actionModal.payment?.utr}</code> — Student: <strong>{actionModal.payment?.userName}</strong>
          </p>

          <form onSubmit={handleSubmitPaymentStatus} className="modal-form">
            <div className="form-group">
              <label className="form-label">
                {actionModal.status === 'approved' ? 'Approval Verification Note' : 'Rejection Reason'} *
              </label>
              <textarea
                className="form-input"
                rows={3}
                value={actionModal.message}
                onChange={(e) => setActionModal({ ...actionModal, message: e.target.value })}
                placeholder={
                  actionModal.status === 'approved'
                    ? 'e.g. Payment verified via UTR bank statement'
                    : 'e.g. Invalid UTR transaction reference code'
                }
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
      {detailModal && (
        <Modal
          isOpen={!!detailModal}
          onClose={() => setDetailModal(null)}
          maxWidth="700px"
        >
          <div className="modal-header">
            <h3><Receipt size={20} className="text-cyan" /> Payment & Registration Details</h3>
            <button className="modal-close" onClick={() => setDetailModal(null)}>&times;</button>
          </div>

          {detailModal.loading ? (
            <div className="modal-loading-state" style={{ padding: '2rem', textAlign: 'center' }}>
              <RefreshCw className="spinner-icon" size={24} />
              <span>Fetching payment details from API...</span>
            </div>
          ) : detailModal.data ? (
            <div className="payment-details-view">
              <div className="details-header-card">
                <div className="details-status-row">
                  <span className={`payment-status-badge status-${(detailModal.data.payment?.status || 'pending').toLowerCase()}`}>
                    {(detailModal.data.payment?.status || 'pending').toUpperCase()}
                  </span>
                  <span className="details-timestamp">
                    Timestamp: {new Date(detailModal.data.payment?.timestamp || detailModal.data.payment?.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>

                <div className="details-amount-row">
                  <div>
                    <span className="details-label">Amount Paid</span>
                    <h2 className="details-amount-val">₹{detailModal.data.payment?.amount}</h2>
                  </div>
                  <div>
                    <span className="details-label">UTR Reference</span>
                    <div className="utr-copy-row">
                      <code className="utr-code-lg">{detailModal.data.payment?.utr}</code>
                      <button
                        type="button"
                        className="btn-icon-subtle"
                        onClick={() => handleCopyUtr(detailModal.data.payment?.utr)}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {detailModal.data.payment?.approvedBy && (
                  <div className="details-audit-alert">
                    <ShieldCheck size={16} />
                    <div>
                      <strong>Action By: {detailModal.data.payment.approvedBy.name}</strong> ({detailModal.data.payment.approvedBy.email})
                      {detailModal.data.payment.message && <p className="audit-msg-text">Reason: "{detailModal.data.payment.message}"</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="details-grid-2col">
                <div className="details-card-box">
                  <h4 className="details-card-title"><User size={15} /> Student User Details</h4>
                  <div className="user-profile-summary">
                    {detailModal.data.user?.avatar && (
                      <img src={detailModal.data.user.avatar} alt="User Avatar" className="user-avatar-lg" />
                    )}
                    <div>
                      <h5 className="user-name-text">{detailModal.data.user?.name || 'N/A'}</h5>
                      <p className="user-email-text">{detailModal.data.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="details-card-box">
                  <h4 className="details-card-title"><Building2 size={15} /> College & Team Details</h4>
                  <p className="detail-field"><strong>College:</strong> {detailModal.data.college?.collegeName || detailModal.data.user?.collegeName || 'N/A'}</p>
                  <p className="detail-field"><strong>Team Name:</strong> {detailModal.data.team?.name || 'N/A'}</p>
                  <p className="detail-field"><strong>Team ID:</strong> <code>{detailModal.data.team?.teamid || 'N/A'}</code></p>
                </div>
              </div>

              {(detailModal.data.payment?.imageUrl || detailModal.data.payment?.imageurl) && (
                <div className="details-card-box">
                  <h4 className="details-card-title"><Eye size={15} /> Payment Proof Screenshot</h4>
                  <div className="details-proof-img-container">
                    <img 
                      src={detailModal.data.payment.imageUrl || detailModal.data.payment.imageurl} 
                      alt="Proof Screenshot" 
                      className="details-proof-img" 
                    />
                  </div>
                </div>
              )}

              <div className="details-card-box">
                <h4 className="details-card-title"><Calendar size={15} /> Associated Event Registrations</h4>
                {detailModal.data.events && detailModal.data.events.length > 0 ? (
                  <div className="events-list-mini">
                    {detailModal.data.events.map((evt, idx) => (
                      <div key={evt._id || idx} className="event-item-row">
                        <div>
                          <h5 className="evt-title">{evt.title}</h5>
                          {evt.description && <p className="evt-desc">{evt.description}</p>}
                        </div>
                        <div className="evt-fee-pill">
                          <span>Fee: ₹{evt.registrationFee || evt.fee || 500}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No specific event items mapped to this payment id.</p>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setDetailModal(null)}>
                  Close
                </button>
              </div>
            </div>
          ) : (
            <p className="text-danger">Failed to load details for payment.</p>
          )}
        </Modal>
      )}

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

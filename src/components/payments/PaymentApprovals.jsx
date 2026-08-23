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
  ArrowUpRight
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

  // Modals
  const [actionModal, setActionModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
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
        teamName: p.user?.team?.name || p.teamName || 'Team Participant',
        collegeName: p.user?.collegeName || p.collegeName || 'College',
        userName: p.user?.name || p.leaderName || 'User',
        userEmail: p.user?.email || p.email || '',
        amountNum: typeof p.amount === 'number' ? p.amount : Number(String(p.amount || 0).replace(/[^0-9]/g, '')),
        amount: typeof p.amount === 'number' ? `₹ ${p.amount}` : (p.amount || '₹ 0'),
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

      {/* Filters Bar */}
      <div className="card filter-card">
        <div className="filter-header">
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

        {/* Table View */}
        <div className="table-responsive desktop-only">
          <table className="payments-table">
            <thead>
              <tr>
                <th>PROOF</th>
                <th>UTR REFERENCE</th>
                <th>STUDENT / TEAM</th>
                <th>COLLEGE</th>
                <th>AMOUNT</th>
                <th>STATUS & AUDIT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <EmptyState
                      type="payments"
                      title="No payment records found"
                      description="No payment verification entries match your current search query or filter selection."
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
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div 
                        className="payment-table-img-wrap"
                        onClick={() => setPreviewImage({ url: p.proofUrl, utr: p.utr })}
                        title="Click to view full image proof"
                      >
                        <img src={p.proofUrl} alt="Receipt" className="payment-table-img" />
                      </div>
                    </td>
                    <td>
                      <div className="utr-cell">
                        <code className="utr-code-cell">{p.utr}</code>
                        <button 
                          onClick={() => handleCopyUtr(p.utr)}
                          className="btn-icon-subtle"
                          title="Copy UTR Code"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="team-college-cell">
                        <span className="user-title"><User size={12} className="text-muted" /> {p.userName}</span>
                        {p.teamName && <span className="team-sub">Team: {p.teamName}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="college-sub">{p.collegeName}</span>
                    </td>
                    <td>
                      <strong className="amount-text">{p.amount}</strong>
                    </td>
                    <td>
                      <div className="status-audit-cell">
                        <span className={`payment-status-badge status-${p.rawStatus}`}>
                          {p.status}
                        </span>
                        {p.approvedBy && (
                          <span className="audit-sub-text" title={`Action by ${p.approvedBy.name}: ${p.message}`}>
                            {p.rawStatus === 'approved' ? 'Approved by' : 'Rejected by'} {p.approvedBy.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewPaymentDetails(p.id)}
                          className="btn-icon btn-view"
                          title="View Full Payment & Event Details"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() => handleOpenActionModal(p, 'approved')}
                          className={`btn-icon btn-approve ${p.rawStatus === 'approved' ? 'active' : ''}`}
                          title="Approve Payment"
                        >
                          <CheckCircle2 size={14} />
                        </button>

                        <button
                          onClick={() => handleOpenActionModal(p, 'rejected')}
                          className={`btn-icon btn-reject ${p.rawStatus === 'rejected' ? 'active' : ''}`}
                          title="Reject Payment"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="mobile-cards-list mobile-only" style={{ padding: '0.75rem 0.5rem' }}>
          {filteredPayments.length === 0 ? (
            <EmptyState
              type="payments"
              title="No payment records found"
              description="No entries match search filters."
              compact={true}
            />
          ) : (
            filteredPayments.map((p) => (
              <div key={p.id} className={`mobile-data-card status-border-${p.rawStatus}`}>
                <div className="mobile-card-header">
                  <div>
                    <strong className="team-title">{p.userName}</strong>
                    <div className="college-sub">{p.collegeName}</div>
                  </div>
                  <span className={`payment-status-badge status-${p.rawStatus}`}>
                    {p.status}
                  </span>
                </div>

                <div className="mobile-card-body">
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">UTR Ref:</span>
                    <div className="utr-box">
                      <code className="utr-code">{p.utr}</code>
                      <button onClick={() => handleCopyUtr(p.utr)} className="btn-icon-subtle">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Amount:</span>
                    <strong className="amount-text">{p.amount}</strong>
                  </div>

                  {p.approvedBy && (
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Audit:</span>
                      <span className="audit-sub-text">{p.rawStatus === 'approved' ? 'Approved by' : 'Rejected by'} {p.approvedBy.name}</span>
                    </div>
                  )}
                </div>

                <div className="mobile-card-actions">
                  <button
                    onClick={() => handleViewPaymentDetails(p.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Eye size={13} /> View Details
                  </button>
                  <button
                    onClick={() => handleOpenActionModal(p, 'approved')}
                    className="btn btn-success btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  <button
                    onClick={() => handleOpenActionModal(p, 'rejected')}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            ))
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

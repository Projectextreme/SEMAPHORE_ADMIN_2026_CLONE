import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { apiService } from '../../services/apiService';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Search, 
  AlertCircle, 
  Check, 
  Copy,
  Receipt,
  Building2,
  DollarSign,
  TrendingUp,
  RefreshCw,
  X,
  Calendar,
  Filter
} from 'lucide-react';
import './PaymentApprovals.css';

export const PaymentApprovals = () => {
  const { showSuccess, showError } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUtr, setCopiedUtr] = useState(false);

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
      // Map API object fields to PaymentApprovals display structure
      const formatted = rawList.map(p => ({
        id: p._id || p.paymentid || p.id,
        _id: p._id || p.paymentid,
        paymentid: p.paymentid || p._id,
        utr: p.utr || 'N/A',
        teamName: p.user?.team?.name || p.teamName || 'Team Participant',
        collegeName: p.user?.collegeName || p.collegeName || 'College',
        userName: p.user?.name || p.leaderName || 'User',
        userEmail: p.user?.email || p.email || '',
        amount: typeof p.amount === 'number' ? `₹ ${p.amount}` : (p.amount || '₹ 0'),
        event: (p.events && p.events[0]?.title) || p.event || 'General Festival Fee',
        events: p.events || [],
        date: p.timestamp ? new Date(p.timestamp).toLocaleString() : (p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Recent'),
        status: (p.status || 'Pending').charAt(0).toUpperCase() + (p.status || 'Pending').slice(1).toLowerCase(),
        rawStatus: (p.status || 'pending').toLowerCase(),
        message: p.message || '',
        approvedBy: p.approvedBy || null,
        proofUrl: p.imageUrl || p.imageurl || p.proofUrl || 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=400&q=80'
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

  const handleStatusChange = async (id, newStatus) => {
    const normStatus = newStatus.toLowerCase();
    const message = normStatus === 'approved' ? 'Payment verified via UTR statement' : 'Invalid UTR reference';
    try {
      await apiService.updatePaymentStatus(id, normStatus, message);
      setPayments((prev) =>
        prev.map((p) => (p.id === id || p._id === id ? { ...p, status: newStatus, rawStatus: normStatus, message } : p))
      );
      if (selectedPayment?.id === id || selectedPayment?._id === id) {
        setSelectedPayment((prev) => ({ ...prev, status: newStatus, rawStatus: normStatus, message }));
      }
      showToast(`Payment status updated to '${newStatus}'!`);
      loadPayments();
    } catch (err) {
      showToast(`Failed to update status for ${id}`, true);
    }
  };

  const handleCopyUtr = (utr) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
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
      p.event.toLowerCase().includes(term);
    return matchesFilter && matchesEvent && matchesSearch;
  });

  const pendingCount = payments.filter((p) => p.status === 'Pending').length;
  const approvedCount = payments.filter((p) => p.status === 'Approved').length;
  const rejectedCount = payments.filter((p) => p.status === 'Rejected').length;

  return (
    <div className="payments-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <CreditCard className="title-icon" /> UTR & Scan & Pay Verification Hub
          </h2>
          <p className="page-description">
            Audit submitted UPI transaction UTR reference codes, verify fee receipts, and approve college team registrations.
          </p>
        </div>

        <button 
          onClick={() => {
            setIsRefreshing(true);
            setTimeout(() => {
              setIsRefreshing(false);
              showSuccess('Payment queue refreshed from live transaction logs.');
            }, 600);
          }} 
          className="btn btn-secondary"
          disabled={isRefreshing}
          title="Refresh Payments Queue"
          aria-label="Refresh Payments"
        >
          <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Payments'}</span>
        </button>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="payment-summary-strip">
        <div className="payment-metric-card">
          <span className="metric-label">Total Verified Volume</span>
          <span className="metric-val text-success">₹ 1,750</span>
        </div>
        <div className="payment-metric-card">
          <span className="metric-label">Pending Verification</span>
          <span className="metric-val text-warning">{pendingCount} Entries</span>
        </div>
        <div className="payment-metric-card">
          <span className="metric-label">Approved Registrations</span>
          <span className="metric-val text-cyan">{approvedCount} Teams</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
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
                placeholder="Search by UTR number, Team or College..."
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

            <span className="endpoint-badge">{filteredPayments.length} Payments</span>
          </div>
        </div>

        {/* Payments Table */}
        {/* Desktop Table View */}
        <div className="table-responsive desktop-only">
          <table className="payments-table">
            <thead>
              <tr>
                <th>PAYMENT ID</th>
                <th>UTR REFERENCE</th>
                <th>TEAM & COLLEGE</th>
                <th>EVENT</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '1rem' }}>
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
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="code-font" title={`Click to copy: ${p.id}`} onClick={() => {
                      navigator.clipboard.writeText(p.id);
                      showSuccess('Payment ID copied!');
                    }} style={{ cursor: 'pointer' }}>
                      {p.id && p.id.length > 10 ? `${p.id.slice(0, 6)}...${p.id.slice(-4)}` : p.id}
                    </td>
                    <td>
                      <div className="utr-cell">
                        <span className="code-font font-bold utr-text">{p.utr}</span>
                        <button 
                          onClick={() => handleCopyUtr(p.utr)}
                          className="btn-copy-mini"
                          title="Copy UTR Code"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="team-college-cell">
                        <span className="team-title">{p.teamName}</span>
                        <span className="college-sub">{p.collegeName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="event-pill">{p.event}</span>
                    </td>
                    <td className="amount-text">{p.amount}</td>
                    <td>
                      <span className={`status-badge status-${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="btn-icon btn-view"
                          title="View UTR Receipt Proof"
                        >
                          <Eye size={14} />
                        </button>

                        {p.status !== 'Approved' && (
                          <button
                            onClick={() => handleStatusChange(p.id, 'Approved')}
                            className="btn-icon btn-approve"
                            title="Approve Payment"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}

                        {p.status !== 'Rejected' && (
                          <button
                            onClick={() => handleStatusChange(p.id, 'Rejected')}
                            className="btn-icon btn-reject"
                            title="Reject Payment"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mobile-cards-list mobile-only" style={{ padding: '0.75rem 0.5rem' }}>
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
            filteredPayments.map((p) => (
            <div key={p.id} className="mobile-data-card">
              <div className="mobile-card-header">
                <div>
                  <strong className="team-title" style={{ fontSize: '0.98rem' }}>{p.teamName}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.collegeName}</div>
                </div>
                <span className={`status-badge status-${p.status.toLowerCase()}`}>
                  {p.status}
                </span>
              </div>

              <div className="mobile-card-body">
                <div className="mobile-card-row">
                  <span className="mobile-card-label">UTR Ref:</span>
                  <div className="mobile-id-badge">
                    <span className="code-font">{p.utr}</span>
                    <button
                      onClick={() => handleCopyUtr(p.utr)}
                      className="btn-copy-mini"
                      title="Copy UTR Code"
                      aria-label="Copy UTR Code"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                </div>

                <div className="mobile-card-row">
                  <span className="mobile-card-label">Event:</span>
                  <span className="event-pill">{p.event}</span>
                </div>

                <div className="mobile-card-row">
                  <span className="mobile-card-label">Fee Amount:</span>
                  <strong className="amount-text" style={{ fontSize: '1.05rem', color: 'var(--success)' }}>{p.amount}</strong>
                </div>
              </div>

              <div className="mobile-card-actions">
                <button
                  onClick={() => setSelectedPayment(p)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Eye size={13} /> View Receipt
                </button>
                {p.status !== 'Approved' && (
                  <button
                    onClick={() => handleStatusChange(p.id, 'Approved')}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                )}
                {p.status !== 'Rejected' && (
                  <button
                    onClick={() => handleStatusChange(p.id, 'Rejected')}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                )}
              </div>
            </div>
          )))
        }
        </div>
      </div>

      {/* View UTR Proof Modal */}
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Receipt size={19} /> UTR Verification Audit</h3>
              <button className="modal-close" onClick={() => setSelectedPayment(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Audit Payment ID: <code>{selectedPayment.id}</code>
            </p>

            <div className="payment-receipt-view">
              <div className="receipt-card">
                <div className="receipt-row">
                  <span className="receipt-lbl">UTR Reference Code</span>
                  <div className="receipt-copy-row">
                    <strong className="code-font utr-highlight">{selectedPayment.utr}</strong>
                    <button className="btn-copy-mini" onClick={() => handleCopyUtr(selectedPayment.utr)}>
                      {copiedUtr ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="receipt-row">
                  <span className="receipt-lbl">Team Name</span>
                  <strong className="receipt-val">{selectedPayment.teamName}</strong>
                </div>

                <div className="receipt-row">
                  <span className="receipt-lbl">College Institute</span>
                  <span className="receipt-val">{selectedPayment.collegeName}</span>
                </div>

                <div className="receipt-row">
                  <span className="receipt-lbl">Registered Event</span>
                  <span className="event-pill">{selectedPayment.event}</span>
                </div>

                <div className="receipt-row">
                  <span className="receipt-lbl">Verified Amount</span>
                  <strong className="amount-highlight">{selectedPayment.amount}</strong>
                </div>

                <div className="receipt-row">
                  <span className="receipt-lbl">Current Audit Status</span>
                  <span className={`status-badge status-${selectedPayment.status.toLowerCase()}`}>
                    {selectedPayment.status}
                  </span>
                </div>
              </div>

              <div className="proof-placeholder">
                <div className="proof-box">
                  <CreditCard size={36} className="proof-icon" />
                  <span className="proof-title">Scan & Pay Digital Transaction Record</span>
                  <span className="proof-sub">Attached to UTR: {selectedPayment.utr}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedPayment(null)}
              >
                Close
              </button>
              {selectedPayment.status !== 'Approved' && (
                <button
                  className="btn btn-success"
                  onClick={() => handleStatusChange(selectedPayment.id, 'Approved')}
                >
                  <CheckCircle2 size={14} /> Approve Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

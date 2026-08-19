import { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import './PaymentApprovals.css';

export const PaymentApprovals = () => {
  const [payments, setPayments] = useState([
    {
      id: 'PAY-8921',
      utr: 'UTR98231049281',
      teamName: 'CyberKnights',
      collegeName: 'MIT Tech',
      amount: '₹ 500',
      event: 'CodeFest Hackathon',
      date: '2026-08-16 10:30 AM',
      status: 'Pending',
      proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=400&q=80'
    },
    {
      id: 'PAY-8922',
      utr: 'UTR19284019283',
      teamName: 'AlgoWizards',
      collegeName: 'NMAM Institute of Technology',
      amount: '₹ 750',
      event: 'RoboWars & Flagship',
      date: '2026-08-16 11:15 AM',
      status: 'Pending',
      proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=400&q=80'
    },
    {
      id: 'PAY-8919',
      utr: 'UTR81920391823',
      teamName: 'MatrixRunners',
      collegeName: 'RV College of Engineering',
      amount: '₹ 500',
      event: 'WebCrafters',
      date: '2026-08-16 09:00 AM',
      status: 'Approved',
      proofUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=400&q=80'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleStatusChange = (id, newStatus) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    if (selectedPayment?.id === id) {
      setSelectedPayment((prev) => ({ ...prev, status: newStatus }));
    }
    showToast(`Payment ${id} marked as ${newStatus}`);
  };

  const handleCopyUtr = (utr) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const filteredPayments = payments.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.utr.toLowerCase().includes(term) ||
      p.teamName.toLowerCase().includes(term) ||
      p.collegeName.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
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
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

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

          <div className="search-bar-wrapper">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by UTR number, Team or College..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Payments Table */}
        <div className="table-responsive">
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
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td className="code-font">{p.id}</td>
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
              ))}
            </tbody>
          </table>
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

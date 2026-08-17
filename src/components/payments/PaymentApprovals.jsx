import { useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, Eye, Search, AlertCircle } from 'lucide-react';
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

  const handleStatusChange = (id, newStatus) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
    if (selectedPayment?.id === id) {
      setSelectedPayment((prev) => ({ ...prev, status: newStatus }));
    }
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

  return (
    <div className="payments-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <CreditCard className="title-icon" /> Scan & Pay + UTR Payment Approvals
          </h2>
          <p className="page-description">
            Verify submitted UTR numbers and transaction receipts for festival event registrations.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="card filter-card">
        <div className="filter-header">
          <div className="tab-group">
            {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeFilter === tab ? 'tab-active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="search-bar-wrapper">
            <Search className="search-icon" size={16} />
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
                <th>UTR NUMBER</th>
                <th>TEAM NAME</th>
                <th>COLLEGE</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td className="code-font">{p.id}</td>
                  <td className="code-font font-bold">{p.utr}</td>
                  <td className="font-semibold">{p.teamName}</td>
                  <td>{p.collegeName}</td>
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
                        <Eye size={15} />
                      </button>

                      {p.status !== 'Approved' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'Approved')}
                          className="btn-icon btn-approve"
                          title="Approve Payment"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}

                      {p.status !== 'Rejected' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'Rejected')}
                          className="btn-icon btn-reject"
                          title="Reject Payment"
                        >
                          <XCircle size={15} />
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
              <h3>UTR Verification Details ({selectedPayment.id})</h3>
              <button className="modal-close" onClick={() => setSelectedPayment(null)}>&times;</button>
            </div>

            <div className="payment-receipt-view">
              <div className="receipt-field">
                <span>Submitted UTR:</span>
                <strong className="code-font">{selectedPayment.utr}</strong>
              </div>
              <div className="receipt-field">
                <span>Team & College:</span>
                <span>{selectedPayment.teamName} ({selectedPayment.collegeName})</span>
              </div>
              <div className="receipt-field">
                <span>Event & Amount:</span>
                <span>{selectedPayment.event} — <strong>{selectedPayment.amount}</strong></span>
              </div>

              <div className="proof-placeholder">
                <div className="proof-label">Scan & Pay Payment Proof Verification</div>
                <div className="proof-box">
                  <CreditCard size={48} className="proof-icon" />
                  <p>Verified UTR Transaction Tagged: {selectedPayment.utr}</p>
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
                  Approve Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

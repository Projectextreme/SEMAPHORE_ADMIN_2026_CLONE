import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Filter, 
  Loader2, 
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  Check,
  XCircle,
  Copy,
  Receipt,
  Calendar,
  Phone,
  Mail,
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import './RegistrationList.css';

export const RegistrationList = () => {
  const { showSuccess, showError } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');

  // Modals
  const [inspectingReg, setInspectingReg] = useState(null);
  const [editingReg, setEditingReg] = useState(null);
  const [deletingReg, setDeletingReg] = useState(null);

  const [copiedUtr, setCopiedUtr] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg, isError = false) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error('Failed to load registrations:', err);
      showToast('Failed to load registrations from database.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // 1. Approve / Change Payment Status
  const handleApprovePayment = async (reg, newStatus = 'Approved') => {
    const id = reg._id || reg.id;
    setActionLoading(true);
    try {
      await apiService.approveRegistrationPayment(id, newStatus);
      setRegistrations((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, paymentStatus: newStatus } : r))
      );
      if (inspectingReg && (inspectingReg._id || inspectingReg.id) === id) {
        setInspectingReg((prev) => ({ ...prev, paymentStatus: newStatus }));
      }
      showToast(`Payment for team "${reg.teamName}" marked as ${newStatus}!`);
    } catch (err) {
      showToast('Failed to update payment status.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Save Edit Registration Details
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingReg) return;
    const id = editingReg._id || editingReg.id;
    setActionLoading(true);
    try {
      const payload = {
        ...editingReg,
        membersCount: Number(editingReg.membersCount) || (editingReg.members ? editingReg.members.length : 1)
      };
      await apiService.editRegistration(id, payload);
      setRegistrations((prev) =>
        prev.map((r) => ((r._id || r.id) === id ? { ...r, ...payload } : r))
      );
      showToast(`Registration for team "${editingReg.teamName}" updated successfully!`);
      setEditingReg(null);
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
      showToast(`Registration for "${deletingReg.teamName}" deleted successfully.`);
      setDeletingReg(null);
    } catch (err) {
      showToast('Failed to delete registration.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyUtr = (utr) => {
    if (!utr) return;
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['Reg ID,Team Name,College Name,Leader Name,Email,Phone,Event,Members,Payment Status,UTR,Amount,Date\n'];
    const rows = filteredRegistrations.map((r) =>
      `"${r.id || r._id}","${r.teamName}","${r.collegeName}","${r.leaderName}","${r.email}","${r.phone || ''}","${r.event}",${r.membersCount || 1},"${r.paymentStatus}","${r.utr || ''}","${r.amount || ''}","${r.registeredAt || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + headers.concat(rows).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Semaphore_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Registrations CSV report generated and downloaded!');
  };

  // Filtering Logic
  const collegesList = ['All', ...new Set(registrations.map((r) => r.collegeName).filter(Boolean))];
  const eventsList = ['All', ...new Set(registrations.map((r) => r.event).filter(Boolean))];

  const filteredRegistrations = registrations.filter((r) => {
    const matchesCollege = selectedCollege === 'All' || r.collegeName === selectedCollege;
    const matchesStatus = selectedPaymentStatus === 'All' || r.paymentStatus === selectedPaymentStatus;
    const matchesEvent = selectedEventFilter === 'All' || r.event === selectedEventFilter;
    
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (r.teamName || '').toLowerCase().includes(term) ||
      (r.leaderName || '').toLowerCase().includes(term) ||
      (r.collegeName || '').toLowerCase().includes(term) ||
      (r.email || '').toLowerCase().includes(term) ||
      (r.event || '').toLowerCase().includes(term) ||
      (r.utr || '').toLowerCase().includes(term) ||
      (r.id || r._id || '').toLowerCase().includes(term);

    return matchesCollege && matchesStatus && matchesEvent && matchesSearch;
  });

  const pendingCount = registrations.filter((r) => r.paymentStatus === 'Pending').length;
  const approvedCount = registrations.filter((r) => r.paymentStatus === 'Approved').length;

  return (
    <div className="registrations-container">
      {/* Title Bar */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <FileSpreadsheet className="title-icon" /> Event Registrations & Payment Approvals
          </h2>
          <p className="page-description">
            Audit enrolled teams, edit participant details, verify UPI payments, inspect proof screenshots, and enforce 2-team college quotas.
          </p>
        </div>

        <div className="title-actions-group">
          <button 
            onClick={fetchRegistrations} 
            className="btn btn-secondary"
            disabled={loading}
            title="Refresh Registrations Data"
            aria-label="Refresh Registrations"
          >
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <button onClick={handleExportCSV} className="btn btn-primary">
            <Download size={15} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="registration-kpi-strip">
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Total Teams</span>
          <span className="kpi-mini-val text-cyan">{registrations.length}</span>
        </div>
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Pending Payments</span>
          <span className="kpi-mini-val text-warning">{pendingCount}</span>
        </div>
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Approved & Verified</span>
          <span className="kpi-mini-val text-success">{approvedCount}</span>
        </div>
        <div className="kpi-mini-card">
          <span className="kpi-mini-label">Colleges Enrolled</span>
          <span className="kpi-mini-val text-indigo">{collegesList.length - 1}</span>
        </div>
      </div>

      {/* College Rule Banner */}
      <div className="college-rule-alert">
        <AlertTriangle size={18} className="alert-rule-icon" />
        <div className="rule-text">
          <strong>Semaphore 2026 Quota Rule:</strong> Maximum 2 teams per institution permitted.
          Colleges with 2 registered teams are tagged with <span className="quota-tag-inline">2/2 Quota Reached</span>.
        </div>
      </div>

      {/* Filters Card */}
      <div className="card filter-card">
        <div className="filter-toolbar">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by team, leader, college, event, UTR, or ID..."
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

          <div className="filter-controls-group">
            {/* Payment Filter */}
            <div className="filter-dropdown-wrapper">
              <CreditCard size={14} className="filter-icon" />
              <select
                className="form-select select-compact"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              >
                <option value="All">All Payment States</option>
                <option value="Pending">Pending Approvals</option>
                <option value="Approved">Approved Payments</option>
                <option value="Rejected">Rejected Payments</option>
              </select>
            </div>

            {/* College Filter */}
            <div className="filter-dropdown-wrapper">
              <Building2 size={14} className="filter-icon" />
              <select
                className="form-select select-compact"
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
              >
                {collegesList.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Colleges' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div className="filter-dropdown-wrapper">
              <Calendar size={14} className="filter-icon" />
              <select
                className="form-select select-compact"
                value={selectedEventFilter}
                onChange={(e) => setSelectedEventFilter(e.target.value)}
              >
                {eventsList.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt === 'All' ? 'All Events' : evt}
                  </option>
                ))}
              </select>
            </div>

            <span className="endpoint-badge">{filteredRegistrations.length} Teams</span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="table-responsive desktop-only">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>REG ID</th>
                <th>TEAM & LEADER</th>
                <th>COLLEGE NAME</th>
                <th>EVENT</th>
                <th>MEMBERS</th>
                <th>QUOTA</th>
                <th>PAYMENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Loader2 size={18} className="spin-icon" />
                      <span>Loading event registrations from live database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '1rem' }}>
                    <EmptyState 
                      type="search"
                      title="No team registrations found"
                      description="No registrations match your search query or filter parameters."
                      primaryAction={{
                        label: 'Reset Filters',
                        onClick: () => {
                          setSearchTerm('');
                          setSelectedCollege('All');
                          setSelectedPaymentStatus('All');
                          setSelectedEventFilter('All');
                        }
                      }}
                      compact={true}
                    />
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => {
                  const regId = reg.id || reg._id;
                  const isApproved = reg.paymentStatus === 'Approved';

                  return (
                    <tr key={regId}>
                      <td className="code-font">{regId}</td>
                      <td>
                        <div className="team-leader-cell">
                          <strong className="team-highlight">{reg.teamName}</strong>
                          <span className="leader-name-sub">Lead: {reg.leaderName}</span>
                          <span className="leader-email-sub">{reg.email}</span>
                        </div>
                      </td>
                      <td>{reg.collegeName || 'N/A'}</td>
                      <td>
                        <span className="event-tag-pill">{reg.eventName || 'Event'}</span>
                      </td>
                      <td className="center-cell">
                        <span className="member-count-badge">
                          <Users size={12} /> {reg.participants ? reg.participants.length : 1}
                        </span>
                      </td>
                      <td>
                        <span className="quota-tag">{reg.quotaStatus || 'Under Quota'}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${(reg.paymentStatus || 'pending').toLowerCase()}`}>
                          {reg.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {/* Quick Approval Check */}
                          {!isApproved && (
                            <button
                              onClick={() => handleApprovePayment(reg, 'Approved')}
                              className="btn-icon btn-approve"
                              title="Quick Approve Registration"
                            >
                              <Check size={14} />
                            </button>
                          )}

                          {/* View Full Info */}
                          <button
                            onClick={() => setInspectingReg(reg)}
                            className="btn-icon btn-view"
                            title="View Full Registration Details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => setEditingReg(reg)}
                            className="btn-icon btn-edit"
                            title="Edit Registration Details"
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Delete Registration */}
                          <button
                            onClick={() => setDeletingReg(reg)}
                            className="btn-icon btn-delete"
                            title="Delete Registration"
                          >
                            <Trash2 size={14} />
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

        {/* Mobile Cards View */}
        <div className="mobile-cards-list mobile-only" style={{ padding: '0.5rem' }}>
          {filteredRegistrations.length === 0 ? (
            <EmptyState 
              type="search"
              title="No team registrations found"
              description="No registrations match your search query or filter parameters."
              primaryAction={{
                label: 'Reset Filters',
                onClick: () => {
                  setSearchTerm('');
                  setSelectedCollege('All');
                  setSelectedPaymentStatus('All');
                  setSelectedEventFilter('All');
                }
              }}
              compact={true}
            />
          ) : (
            filteredRegistrations.map((reg) => {
              const regId = reg.id || reg._id;
              const isApproved = reg.paymentStatus === 'Approved';

              return (
                <div key={regId} className="mobile-data-card">
                  {/* Header */}
                  <div className="mobile-card-header">
                    <div>
                      <strong className="team-highlight" style={{ fontSize: '1rem' }}>{reg.teamName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lead: {reg.leaderName}</div>
                    </div>
                    <span className={`status-badge status-${(reg.paymentStatus || 'pending').toLowerCase()}`}>
                      {reg.paymentStatus || 'Pending'}
                    </span>
                  </div>

                {/* Body Details */}
                <div className="mobile-card-body">
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Registration ID:</span>
                    <div className="mobile-id-badge">
                      <span className="code-font">{regId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(regId);
                          showToast('Registration ID copied!');
                        }}
                        className="btn-copy-mini"
                        title="Copy Reg ID"
                        aria-label="Copy Reg ID"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Event:</span>
                    <span className="event-tag">{reg.event}</span>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">College:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>{reg.collegeName}</span>
                  </div>

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Team Members:</span>
                    <span className="members-count-badge">
                      <Users size={11} /> {reg.membersCount || (reg.members ? reg.members.length : 1)} Member(s)
                    </span>
                  </div>

                  {reg.utr && (
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">UTR Ref:</span>
                      <div className="mobile-id-badge">
                        <span className="code-font">{reg.utr}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(reg.utr);
                            showToast('UTR reference copied!');
                          }}
                          className="btn-copy-mini"
                          title="Copy UTR"
                          aria-label="Copy UTR"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mobile-card-actions">
                  {!isApproved ? (
                    <button
                      onClick={() => handleApprovePayment(reg, 'Approved')}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={actionLoading}
                    >
                      <Check size={13} /> Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprovePayment(reg, 'Pending')}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 size={13} className="text-success" /> Approved
                    </button>
                  )}
                  <button
                    onClick={() => setInspectingReg(reg)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Eye size={13} /> Inspect
                  </button>
                  <button
                    onClick={() => setEditingReg({ ...reg })}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeletingReg(reg)}
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          }))
        }
        </div>
      </div>

      {/* Inspect Registration & Payment Information Modal */}
      {inspectingReg && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h3><Receipt size={19} /> Registration & Payment Details</h3>
              <button className="modal-close" onClick={() => setInspectingReg(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Registration Reference: <code>{inspectingReg.id || inspectingReg._id}</code>
            </p>

            <div className="inspect-grid">
              {/* Left Column: Team & College */}
              <div className="inspect-col">
                <h4 className="inspect-section-title"><Users size={15} /> Team & College Profile</h4>
                
                <div className="user-detail-card">
                  <div className="detail-row">
                    <span className="detail-label">Team Name</span>
                    <span className="font-bold">{inspectingReg.teamName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Team Leader</span>
                    <span>{inspectingReg.leaderName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email Address</span>
                    <span>{inspectingReg.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone Number</span>
                    <span>{inspectingReg.phone || '+91 98451 00223'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Institution</span>
                    <span>{inspectingReg.collegeName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Enrolled Event</span>
                    <span className="event-tag">{inspectingReg.event}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registration Date</span>
                    <span className="date-text">{inspectingReg.registeredAt || '2026-08-16'}</span>
                  </div>
                </div>

                {/* Team Members List */}
                <h4 className="inspect-section-title" style={{ marginTop: '1rem' }}><Users size={15} /> Team Members Roster</h4>
                <div className="members-roster-box">
                  {inspectingReg.members && inspectingReg.members.length > 0 ? (
                    inspectingReg.members.map((member, idx) => (
                      <div key={idx} className="member-item">
                        <span className="member-num">{idx + 1}.</span>
                        <span className="member-name">{member}</span>
                      </div>
                    ))
                  ) : (
                    <div className="member-item">
                      <span className="member-name">{inspectingReg.leaderName} (Team Leader)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Payment & Transaction Audit */}
              <div className="inspect-col">
                <h4 className="inspect-section-title"><CreditCard size={15} /> Payment Verification & Proof</h4>

                <div className="user-detail-card">
                  <div className="detail-row">
                    <span className="detail-label">Payment Status</span>
                    <span className={`status-badge status-${(inspectingReg.paymentStatus || 'pending').toLowerCase()}`}>
                      {inspectingReg.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Amount Paid</span>
                    <span className="font-bold text-success" style={{ fontSize: '1.05rem' }}>
                      {inspectingReg.amount || '₹ 500'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">UPI Reference (UTR)</span>
                    <div className="utr-copy-row">
                      <span className="code-font">{inspectingReg.utr || 'UTR98231049281'}</span>
                      <button 
                        onClick={() => handleCopyUtr(inspectingReg.utr || 'UTR98231049281')} 
                        className="btn-copy"
                        title="Copy UTR"
                      >
                        {copiedUtr ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot Preview */}
                <div className="payment-proof-preview">
                  <span className="detail-label" style={{ display: 'block', marginBottom: '0.4rem' }}>
                    Uploaded Payment Receipt / Screenshot:
                  </span>
                  <div className="receipt-image-container">
                    <img 
                      src={inspectingReg.proofUrl || 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=500&q=80'} 
                      alt="Payment Receipt" 
                      className="receipt-image"
                    />
                  </div>
                </div>

                {/* Quick Payment Approval Actions inside Modal */}
                <div className="modal-approval-controls">
                  {inspectingReg.paymentStatus !== 'Approved' ? (
                    <button
                      onClick={() => handleApprovePayment(inspectingReg, 'Approved')}
                      className="btn btn-success"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 size={16} /> Approve Payment Reference
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprovePayment(inspectingReg, 'Pending')}
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={actionLoading}
                    >
                      <AlertTriangle size={15} /> Revoke to Pending
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={() => setInspectingReg(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Registration Details Modal */}
      {editingReg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Edit2 size={19} /> Edit Registration Details</h3>
              <button className="modal-close" onClick={() => setEditingReg(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Registration ID: <code>{editingReg.id || editingReg._id}</code>
            </p>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.teamName || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, teamName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Leader Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.leaderName || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, leaderName: e.target.value })}
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
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.phone || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Institution / College Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.collegeName || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, collegeName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Enrolled Event</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.event || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, event: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Members Count</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  className="form-input"
                  value={editingReg.membersCount || 1}
                  onChange={(e) => setEditingReg({ ...editingReg, membersCount: e.target.value })}
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

              <div className="form-group">
                <label className="form-label">UPI Reference (UTR Number)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingReg.utr || ''}
                  onChange={(e) => setEditingReg({ ...editingReg, utr: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingReg(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Registration Confirmation Modal */}
      {deletingReg && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}><Trash2 size={19} /> Confirm Registration Deletion</h3>
              <button className="modal-close" onClick={() => setDeletingReg(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Registration Reference: <code>{deletingReg.id || deletingReg._id}</code>
            </p>

            <div style={{ background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 1rem', margin: '1rem 0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>Team: {deletingReg.teamName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Leader: {deletingReg.leaderName} ({deletingReg.email})</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>College: {deletingReg.collegeName} • Event: {deletingReg.event}</div>
            </div>

            <p className="delete-warning-text">
              Are you sure you want to permanently delete this team registration? This action cannot be reversed.
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

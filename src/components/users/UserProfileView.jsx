import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { 
  User, 
  Mail, 
  Building2, 
  Users, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ArrowLeft, 
  RefreshCw, 
  Copy, 
  Receipt, 
  Clock, 
  ShieldCheck,
  Award,
  MapPin,
  Phone,
  ArrowUpRight
} from 'lucide-react';
import './UserProfileView.css';

export const UserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state for payment operations on user profile
  const [actionModal, setActionModal] = useState(null); // { payment, status, message }
  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUserFullDetails(userId);
      setUserData(data);
    } catch (err) {
      showError(err.message || 'Failed to load user profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const handleCopyUtr = (utr) => {
    if (!utr) return;
    navigator.clipboard.writeText(utr);
    showSuccess(`UTR '${utr}' copied to clipboard`);
  };

  const handleOpenActionModal = (payment, status) => {
    const defaultMsg = status === 'approved' 
      ? 'Payment verified via bank statement' 
      : 'Invalid UTR reference code';
    setActionModal({
      payment,
      status,
      message: payment.message && payment.status === status ? payment.message : defaultMsg
    });
  };

  const handleSubmitPaymentAction = async (e) => {
    e.preventDefault();
    if (!actionModal) return;
    const { payment, status, message } = actionModal;
    const paymentId = payment._id || payment.paymentid || payment.id;

    setActionLoading(true);
    try {
      const res = await apiService.updatePaymentStatus(paymentId, status, message);
      showSuccess(res?.message || `Payment status updated to '${status}' successfully!`);
      setActionModal(null);
      loadUserDetails();
    } catch (err) {
      showError('Failed to update payment status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="profile-loading-state">
          <RefreshCw size={28} className="spin-icon text-cyan" />
          <span>Fetching comprehensive user profile from <code>/api/admin/user-full-details/{userId}</code>...</span>
        </div>
      </div>
    );
  }

  if (!userData || !userData.user) {
    return (
      <div className="user-profile-container">
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm mb-4">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="card text-center p-8">
          <User size={48} className="text-muted mb-2" />
          <h3 className="text-danger">User Profile Not Found</h3>
          <p className="text-muted">No details found for user ID: <code>{userId}</code></p>
        </div>
      </div>
    );
  }

  const { user, college, team, teamMembers = [], registeredEvents = [], payments = [], summary = {} } = userData;

  return (
    <div className="user-profile-container">
      {/* Back & Title Navigation */}
      <div className="profile-nav-bar">
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-back">
          <ArrowLeft size={15} /> Back to Directory
        </button>
        <span className="user-id-tag">User ID: <code>{user._id}</code></span>
      </div>

      {/* Main Profile Header Banner */}
      <div className="card profile-header-card">
        <div className="header-cover-glow" />
        <div className="header-content-row">
          <div className="profile-avatar-wrap">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar-lg" />
            ) : (
              <div className="profile-avatar-placeholder">
                <User size={36} />
              </div>
            )}
            <span className={`status-indicator ${user.role === 'admin' || user.role === 'superadmin' ? 'indicator-admin' : 'indicator-user'}`} />
          </div>

          <div className="profile-meta-info">
            <div className="profile-name-row">
              <h2 className="profile-user-name">{user.name}</h2>
              <span className={`role-badge role-${(user.role || 'user').toLowerCase()}`}>
                <ShieldCheck size={12} /> {(user.role || 'user').toUpperCase()}
              </span>
            </div>

            <div className="profile-details-grid">
              <div className="meta-item">
                <Mail size={14} className="text-muted" />
                <span>{user.email}</span>
              </div>
              {user.collegeName || college?.collegeName ? (
                <div className="meta-item">
                  <Building2 size={14} className="text-muted" />
                  <span>{user.collegeName || college?.collegeName}</span>
                </div>
              ) : null}
              {user.googleId && (
                <div className="meta-item">
                  <span className="meta-label">Google ID:</span>
                  <code>{user.googleId}</code>
                </div>
              )}
              <div className="meta-item">
                <Clock size={14} className="text-muted" />
                <span>Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="user-summary-strip">
        <div className="summary-metric-card">
          <span className="metric-label">Registered Events</span>
          <span className="metric-val text-cyan">{summary.totalEventsRegistered || registeredEvents.length} Events</span>
        </div>
        <div className="summary-metric-card">
          <span className="metric-label">Submitted Payments</span>
          <span className="metric-val text-warning">{summary.totalPaymentsSubmitted || payments.length} Entries</span>
        </div>
        <div className="summary-metric-card">
          <span className="metric-label">Total Fee Paid</span>
          <span className="metric-val text-success">₹ {(summary.totalAmountPaid || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Grid: Team & College Info + Payments */}
      <div className="profile-sections-grid">
        {/* Section 1: Team & College Profile */}
        <div className="card section-card">
          <div className="section-header">
            <h3 className="section-title">
              <Users size={18} className="text-cyan" /> Team & College Profile
            </h3>
            {team?.name && <span className="team-badge-lg">Team: {team.name}</span>}
          </div>

          <div className="team-info-box">
            <p className="field-row">
              <strong>College Institute:</strong> {college?.collegeName || user.collegeName || 'N/A'}
            </p>
            {team && (
              <>
                <p className="field-row">
                  <strong>Team Name:</strong> {team.name}
                </p>
                <p className="field-row">
                  <strong>Team Code ID:</strong> <code>{team.teamid}</code>
                </p>
              </>
            )}
          </div>

          <h4 className="sub-section-title"><Users size={14} /> Team Members ({teamMembers.length})</h4>
          <div className="members-list-grid">
            {teamMembers.length === 0 ? (
              <p className="text-muted text-sm">No other team members registered.</p>
            ) : (
              teamMembers.map((member) => (
                <div 
                  key={member._id} 
                  className={`member-item-card ${member._id === user._id ? 'active-user-card' : ''}`}
                  onClick={() => {
                    if (member._id !== user._id) {
                      navigate(`/user/${member._id}`);
                    }
                  }}
                  title={member._id !== user._id ? `View profile of ${member.name}` : 'Current profile'}
                >
                  <div className="member-avatar-wrap">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="member-avatar" />
                    ) : (
                      <div className="member-avatar-placeholder">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                  <div className="member-details">
                    <strong className="member-name">{member.name} {member._id === user._id ? '(This User)' : ''}</strong>
                    <span className="member-email">{member.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: User Payments & Verification Operations */}
        <div className="card section-card">
          <div className="section-header">
            <h3 className="section-title">
              <CreditCard size={18} className="text-cyan" /> Submitted Payments ({payments.length})
            </h3>
          </div>

          {payments.length === 0 ? (
            <p className="text-muted text-sm p-4 text-center">No payment submissions found for this user.</p>
          ) : (
            <div className="payments-cards-list">
              {payments.map((p) => {
                const paymentId = p._id || p.paymentid || p.id;
                const rawStatus = (p.status || 'pending').toLowerCase();
                const proofImg = p.imageUrl || p.imageurl || p.proofUrl;

                return (
                  <div key={paymentId} className={`payment-profile-card status-border-${rawStatus}`}>
                    <div className="pay-card-top">
                      <div className="amount-group">
                        <Receipt size={16} className="text-cyan" />
                        <span className="amount-val">₹{p.amount}</span>
                      </div>
                      <span className={`payment-status-badge status-${rawStatus}`}>
                        {rawStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="pay-card-body">
                      {proofImg ? (
                        <div 
                          className="pay-img-wrap"
                          onClick={() => setPreviewImage({ url: proofImg, utr: p.utr })}
                          title="Click to view full screenshot proof"
                        >
                          <img src={proofImg} alt="Receipt" className="pay-img" />
                        </div>
                      ) : null}

                      <div className="pay-meta-details">
                        <div className="utr-line">
                          <span className="meta-lbl">UTR Code:</span>
                          <code className="utr-code">{p.utr}</code>
                          <button 
                            type="button" 
                            className="btn-icon-subtle" 
                            onClick={() => handleCopyUtr(p.utr)}
                            title="Copy UTR"
                          >
                            <Copy size={12} />
                          </button>
                        </div>

                        {p.approvedBy && (
                          <div className={`audit-box audit-${rawStatus}`}>
                            <span className="audit-admin">
                              {rawStatus === 'approved' ? 'Approved by' : 'Rejected by'}: <strong>{p.approvedBy.name}</strong>
                            </span>
                            {p.message && <p className="audit-msg">"{p.message}"</p>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Action Operations (Approve / Reject) */}
                    <div className="pay-card-actions">
                      <button
                        type="button"
                        className={`btn btn-xs ${rawStatus === 'approved' ? 'btn-success-active' : 'btn-outline-success'}`}
                        onClick={() => handleOpenActionModal(p, 'approved')}
                      >
                        <CheckCircle2 size={13} /> Approve
                      </button>
                      <button
                        type="button"
                        className={`btn btn-xs ${rawStatus === 'rejected' ? 'btn-danger-active' : 'btn-outline-danger'}`}
                        onClick={() => handleOpenActionModal(p, 'rejected')}
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Registered Events Section */}
      <div className="card section-card mt-6">
        <div className="section-header">
          <h3 className="section-title">
            <Calendar size={18} className="text-cyan" /> Registered Events ({registeredEvents.length})
          </h3>
        </div>

        {registeredEvents.length === 0 ? (
          <p className="text-muted text-sm p-4 text-center">No event registrations associated with this user account.</p>
        ) : (
          <div className="events-grid-2col">
            {registeredEvents.map((evt) => (
              <div key={evt.registrationId || evt.eventId} className="user-event-card">
                {evt.image && (
                  <div className="event-cover-wrap">
                    <img src={evt.image} alt={evt.title} className="event-cover-img" />
                  </div>
                )}
                <div className="event-card-content">
                  <div className="event-header-line">
                    <h4 className="event-title">{evt.title}</h4>
                    <span className="event-fee-badge">Fee: ₹{evt.registrationFee || evt.actualPrice || 500}</span>
                  </div>
                  <p className="event-desc">{evt.description}</p>

                  <div className="event-specs-grid">
                    {evt.location && (
                      <span className="evt-spec-item"><MapPin size={12} /> {evt.location}</span>
                    )}
                    {evt.timings && (
                      <span className="evt-spec-item"><Clock size={12} /> {evt.timings}</span>
                    )}
                  </div>

                  {evt.coordinators && evt.coordinators.length > 0 && (
                    <div className="coordinators-list">
                      <strong className="coord-label">Coordinators:</strong>
                      {evt.coordinators.map((c, i) => (
                        <span key={i} className="coord-pill">
                          {c.name} {c.phone ? `(${c.phone})` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal (Approve / Reject Payment) */}
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
            UTR Reference: <code>{actionModal.payment?.utr}</code> — User: <strong>{user.name}</strong>
          </p>

          <form onSubmit={handleSubmitPaymentAction} className="modal-form">
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
                    ? 'e.g. Payment verified via bank statement'
                    : 'e.g. Invalid UTR reference code'
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

      {/* Screenshot Lightbox Modal */}
      {previewImage && (
        <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="800px">
          <div className="modal-header">
            <h3><Receipt size={18} /> Receipt Screenshot Proof</h3>
            <button className="modal-close" onClick={() => setPreviewImage(null)}>&times;</button>
          </div>
          <div className="preview-image-container">
            <img src={previewImage.url} alt="Receipt Proof" className="preview-image-full" />
          </div>
          <div className="modal-actions">
            <a href={previewImage.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
              Open Original <ArrowUpRight size={13} />
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

import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  Calendar,
  Users,
  Phone,
  Mail,
  Copy,
  ShieldCheck,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MapPin,
  ArrowUpRight,
  Sparkles,
  Trash2,
  AlertTriangle,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { resolveImageUrl } from '../../services/apiConfig';
import './PaymentDetailsModal.css';

export const PaymentDetailsModal = ({
  isOpen,
  onClose,
  paymentId,
  onOpenActionModal,
  onPaymentDeleted
}) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [eventParticipantsData, setEventParticipantsData] = useState({});
  const [loadingParticipants, setLoadingParticipants] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [proofImgFailed, setProofImgFailed] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    if (isOpen && paymentId) {
      queueMicrotask(() => {
        if (!isSubscribed) return;
        setLoading(true);
        setData(null);
        setExpandedEventId(null);
        setProofImgFailed(false);
      });
      apiService.getPaymentDetails(paymentId)
        .then((res) => {
          if (!isSubscribed) return;
          setData(res);
          const eventsList = res?.events || res?.associatedEvents || [];
          if (eventsList.length > 0) {
            const firstEvtId = eventsList[0].eventId || eventsList[0]._id || eventsList[0].registrationId;
            setExpandedEventId(firstEvtId);
          }
        })
        .catch(() => {
          if (isSubscribed) showError('Failed to load payment details');
        })
        .finally(() => {
          if (isSubscribed) setLoading(false);
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [isOpen, paymentId, showError]);

  const handleCopyUtr = (utr) => {
    if (!utr || utr === 'N/A') return;
    navigator.clipboard.writeText(utr);
    showSuccess(`UTR '${utr}' copied to clipboard`);
  };

  const handleConfirmDeletePayment = async () => {
    if (!paymentId) return;
    setIsDeleting(true);
    try {
      const res = await apiService.deletePayment(paymentId);
      showSuccess(res?.message || 'Payment record deleted successfully.');
      setDeletingPayment(false);
      onClose();
      if (onPaymentDeleted) {
        onPaymentDeleted(paymentId);
      }
    } catch (err) {
      showError(err.message || 'Failed to delete payment');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleEventExpand = async (eventId, userId, evtObj) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }

    setExpandedEventId(eventId);

    // If event already has participants in payload, no extra API needed
    if (evtObj?.participants && evtObj.participants.length > 0) {
      return;
    }

    // Fallback: fetch from getEventParticipants if participants array is missing
    if (!eventParticipantsData[eventId]) {
      setLoadingParticipants((prev) => ({ ...prev, [eventId]: true }));
      try {
        const pData = await apiService.getEventParticipants(eventId, userId);
        setEventParticipantsData((prev) => ({ ...prev, [eventId]: pData }));
      } catch {
        // Suppress or handle error gracefully
      } finally {
        setLoadingParticipants((prev) => ({ ...prev, [eventId]: false }));
      }
    }
  };

  if (!isOpen) return null;

  const payment = data?.payment;
  const user = data?.user;
  const college = data?.college;
  const team = data?.team;
  const eventsList = data?.events || data?.associatedEvents || [];
  const rawStatus = (payment?.status || 'pending').toLowerCase();
  const rawImg = payment?.imageUrl || payment?.imageurl || payment?.proofUrl || payment?.screenshot || payment?.paymentScreenshot || payment?.receipt || null;
  const proofImg = resolveImageUrl(rawImg);
  const timestampStr = payment?.timestamp || payment?.createdAt 
    ? new Date(payment?.timestamp || payment?.createdAt).toLocaleString() 
    : 'Recent';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="760px">
        {/* Modal Header */}
        <div className="modal-header payment-details-modal-header">
          <div className="modal-title-wrap">
            <div className="header-icon-circle">
              <Receipt size={18} />
            </div>
            <div>
              <h3>Payment & Registration Details</h3>
              <span className="modal-subtitle-sm">Verification record #{paymentId?.slice(-6) || ''}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="modal-loading-state">
            <RefreshCw className="spin-icon text-cyan" size={30} />
            <p>Fetching payment verification details...</p>
          </div>
        ) : data ? (
          <div className="payment-details-view">
            {/* Top Status & Amount Banner */}
            <div className="details-header-card">
              <div className="details-status-row">
                <span className={`payment-status-badge status-${rawStatus}`}>
                  {rawStatus === 'approved' && <CheckCircle2 size={13} />}
                  {rawStatus === 'rejected' && <XCircle size={13} />}
                  {rawStatus === 'pending' && <Clock size={13} />}
                  {rawStatus.toUpperCase()}
                </span>
                <span className="details-timestamp">
                  <Calendar size={13} />
                  {timestampStr}
                </span>
              </div>

              <div className="details-amount-block">
                <div className="amount-info-sub">
                  <span className="amount-label">Transaction Amount</span>
                  <h2 className="amount-value text-emerald">
                    {typeof payment?.amount === 'number' ? `₹${payment.amount}` : (payment?.amount || '₹0')}
                  </h2>
                </div>

                <div className="utr-badge-box">
                  <span className="utr-lbl">UTR Reference:</span>
                  <div className="utr-pill">
                    <code className="utr-code">{payment?.utr || 'N/A'}</code>
                    {payment?.utr && payment?.utr !== 'N/A' && (
                      <button
                        type="button"
                        className="btn-copy-icon"
                        onClick={() => handleCopyUtr(payment.utr)}
                        title="Copy UTR to Clipboard"
                      >
                        <Copy size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {payment?.message && (
                <div className={`details-audit-alert audit-${rawStatus}`}>
                  <ShieldCheck size={15} />
                  <div>
                    <strong>Admin Note:</strong> {payment.message}
                  </div>
                </div>
              )}
            </div>

            {/* User & Contingent Profile Grid */}
            <div className="details-grid-row">
              {/* Participant Card */}
              <div className="details-card-box details-user-box">
                <div className="box-title-bar">
                  <User size={15} className="box-icon" />
                  <h4>Participant Details</h4>
                </div>
                <div className="user-info-body">
                  <div className="user-avatar-circle">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name || 'User'} />
                    ) : (
                      <span>{(user?.name || 'P').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="user-text-meta">
                    <h5 className="user-name-title">{user?.name || 'Participant'}</h5>
                    <p className="user-email-text" title={user?.email}>
                      <Mail size={12} />
                      <span>{user?.email || 'No email specified'}</span>
                    </p>
                    {user?.phone && (
                      <p className="user-phone-text">
                        <Phone size={12} />
                        <span>{user.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* College & Team Card */}
              <div className="details-card-box details-college-box">
                <div className="box-title-bar">
                  <Building2 size={15} className="box-icon" />
                  <h4>College & Contingent Team</h4>
                </div>
                <div className="college-info-body">
                  <div className="college-meta-item">
                    <span className="meta-lbl">Institution:</span>
                    <strong className="meta-val">{college?.collegeName || user?.collegeName || 'Not Specified'}</strong>
                  </div>
                  <div className="college-meta-item">
                    <span className="meta-lbl">Team Name:</span>
                    <strong className="meta-val font-cyan">{team?.name || user?.team?.name || 'General Team'}</strong>
                  </div>
                  {team?.teamid && (
                    <div className="college-meta-item">
                      <span className="meta-lbl">Team ID:</span>
                      <code className="meta-val-code">{team.teamid}</code>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Proof Screenshot Section */}
            {proofImg && (
              <div className="details-card-box details-proof-section">
                <div className="box-title-bar">
                  <Receipt size={15} className="box-icon" />
                  <h4>Payment Proof Screenshot</h4>
                </div>
                <div className="proof-container">
                  {!proofImgFailed ? (
                    <div 
                      className="proof-thumbnail-wrap" 
                      onClick={() => setPreviewImage({ url: proofImg, utr: payment?.utr })}
                      title="Click to Zoom Receipt"
                    >
                      <img
                        src={proofImg}
                        alt="Receipt Screenshot Proof"
                        className="proof-thumb-img"
                        onError={() => setProofImgFailed(true)}
                      />
                      <div className="proof-overlay-hint">
                        <Eye size={16} />
                        <span>Click to Zoom</span>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="proof-thumbnail-wrap proof-fallback-box"
                      onClick={() => setPreviewImage({ url: proofImg, utr: payment?.utr })}
                      title="Inspect Receipt Proof Link"
                    >
                      <Receipt size={24} className="text-cyan" />
                      <span className="proof-fallback-lbl">Proof Image</span>
                      <span className="proof-fallback-sub"><Eye size={11} /> Inspect</span>
                    </div>
                  )}
                  <div className="proof-meta-actions">
                    <p className="proof-note">
                      Uploaded transaction proof via payment gateway or Cloudinary. Click to inspect or open in new tab.
                    </p>
                    <div className="proof-btn-row">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-cyan"
                        onClick={() => setPreviewImage({ url: proofImg, utr: payment?.utr })}
                      >
                        <Eye size={13} /> Inspect Screenshot
                      </button>
                      <a href={proofImg} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                        Open Image <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Associated Event Registrations */}
            <div className="details-card-box details-events-section">
              <div className="box-title-bar">
                <Calendar size={15} className="box-icon" />
                <h4>Associated Event Registrations ({eventsList.length})</h4>
              </div>

              {eventsList.length > 0 ? (
                <div className="events-accordion-list">
                  {eventsList.map((evt, idx) => {
                    const evtId = evt.eventId || evt._id || evt.registrationId || `evt-${idx}`;
                    const isExpanded = expandedEventId === evtId;
                    const participants = evt.participants || eventParticipantsData[evtId]?.participants || [];
                    const isLoadingP = loadingParticipants[evtId];

                    return (
                      <div key={evtId} className={`event-accordion-card ${isExpanded ? 'is-open' : ''}`}>
                        <div
                          className="event-accordion-header"
                          onClick={() => handleToggleEventExpand(evtId, user?._id || user?.id, evt)}
                        >
                          <div className="event-title-group">
                            <h5 className="event-title-text">{evt.title || evt.name || 'Festival Event'}</h5>
                            {evt.registrationFee !== undefined && (
                              <span className="event-fee-pill">₹{evt.registrationFee}</span>
                            )}
                            {evt.date && (
                              <span className="event-date-pill">
                                <Calendar size={11} /> {new Date(evt.date).toLocaleDateString()}
                              </span>
                            )}
                            {evt.location && (
                              <span className="event-venue-pill">
                                <MapPin size={11} /> {evt.location}
                              </span>
                            )}
                          </div>
                          <button type="button" className="btn-accordion-toggle" aria-label="Toggle event details">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="event-accordion-body">
                            {evt.description && <p className="event-desc-text">{evt.description}</p>}

                            <div className="participants-roster-header">
                              <Users size={14} className="text-cyan" />
                              <h6>Enrolled Participants Roster ({participants.length})</h6>
                            </div>

                            {isLoadingP ? (
                              <div className="participants-loading">
                                <RefreshCw className="spin-icon text-cyan" size={16} />
                                <span>Loading participants list...</span>
                              </div>
                            ) : participants.length > 0 ? (
                              <div className="participants-grid">
                                {participants.map((part, pIdx) => (
                                  <div key={pIdx} className="participant-badge-card">
                                    <div className="participant-avatar-tiny">
                                      <User size={12} />
                                    </div>
                                    <div className="participant-info">
                                      <h6 className="participant-name">
                                        {part.name}
                                        {part.role && <span className="participant-role-pill">{part.role}</span>}
                                      </h6>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-participants-box">
                                <p className="text-muted text-sm">No participant records attached to this event registration.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted text-sm" style={{ margin: '0.5rem 0' }}>
                  No specific event items mapped to this payment ID.
                </p>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="modal-actions-bar">
              <div className="modal-left-actions">
                {onOpenActionModal && (
                  <>
                    {rawStatus !== 'approved' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        onClick={() => {
                          onClose();
                          onOpenActionModal(payment, 'approved');
                        }}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    )}
                    {rawStatus !== 'rejected' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          onClose();
                          onOpenActionModal(payment, 'rejected');
                        }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger-subtle"
                  onClick={() => setDeletingPayment(true)}
                  title="Delete this payment record"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-error-state">
            <p className="text-danger">Failed to load details for payment ID {paymentId}.</p>
            <button type="button" className="btn btn-secondary mt-3" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Confirm Delete Payment Modal */}
      {deletingPayment && (
        <Modal isOpen={!!deletingPayment} onClose={() => setDeletingPayment(false)} maxWidth="480px" isDanger={true}>
          <div className="modal-header">
            <h3><AlertTriangle size={19} className="text-danger" /> Confirm Delete Payment</h3>
            <button className="modal-close" onClick={() => setDeletingPayment(false)}>&times;</button>
          </div>
          <p className="modal-subtitle">
            Are you sure you want to permanently delete payment record <code>{paymentId}</code> (UTR: <strong>{data?.payment?.utr || 'N/A'}</strong>, Amount: <strong>₹{data?.payment?.amount || 0}</strong>)?
          </p>
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Associated event registrations will be disassociated and reverted to unpaid status.
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setDeletingPayment(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmDeletePayment}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting Payment...' : 'Confirm Delete Payment'}
            </button>
          </div>
        </Modal>
      )}

      {/* Image Preview Lightbox */}
      {previewImage && (
        <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="840px">
          <div className="modal-header">
            <h3>
              <Receipt size={18} /> Payment Screenshot {previewImage.utr ? `(UTR: ${previewImage.utr})` : ''}
            </h3>
            <button className="modal-close" onClick={() => setPreviewImage(null)}>
              &times;
            </button>
          </div>
          <div className="preview-image-container">
            <img src={previewImage.url} alt="Payment Receipt Proof" className="preview-image-full" />
          </div>
          <div className="modal-actions">
            <a href={previewImage.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
              Open Original Image <ArrowUpRight size={13} />
            </a>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setPreviewImage(null)}>
              Close Preview
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

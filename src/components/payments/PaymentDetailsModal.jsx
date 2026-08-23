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
  Sparkles
} from 'lucide-react';
import './PaymentDetailsModal.css';

export const PaymentDetailsModal = ({
  isOpen,
  onClose,
  paymentId,
  onOpenActionModal
}) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [eventParticipantsData, setEventParticipantsData] = useState({});
  const [loadingParticipants, setLoadingParticipants] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    if (isOpen && paymentId) {
      queueMicrotask(() => {
        if (!isSubscribed) return;
        setLoading(true);
        setData(null);
        setExpandedEventId(null);
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
    if (!utr) return;
    navigator.clipboard.writeText(utr);
    showSuccess(`UTR '${utr}' copied to clipboard`);
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
  const proofImg = payment?.imageUrl || payment?.imageurl;
  const timestampStr = payment?.timestamp || payment?.createdAt ? new Date(payment?.timestamp || payment?.createdAt).toLocaleString() : 'Recent';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="740px">
        {/* Modal Header */}
        <div className="modal-header payment-details-modal-header">
          <div className="modal-title-wrap">
            <Receipt size={20} className="text-cyan" />
            <h3>Payment & Registration Details</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {loading ? (
          <div className="modal-loading-state">
            <RefreshCw className="spin-icon text-cyan" size={28} />
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
                  <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {timestampStr}
                </span>
              </div>

              <div className="details-amount-row">
                <div>
                  <span className="details-label">Amount Paid</span>
                  <h2 className="details-amount-val">
                    ₹{typeof payment?.amount === 'number' ? payment.amount.toLocaleString() : payment?.amount || 0}
                  </h2>
                </div>
                <div>
                  <span className="details-label">UTR Reference Code</span>
                  <div className="utr-copy-row">
                    <code className="utr-code-lg">{payment?.utr || 'N/A'}</code>
                    {payment?.utr && (
                      <button
                        type="button"
                        className="btn-icon-subtle"
                        onClick={() => handleCopyUtr(payment.utr)}
                        title="Copy UTR to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Audit Info */}
              {(payment?.approvedBy || payment?.approved_by) && (
                <div className={`details-audit-alert audit-${rawStatus}`}>
                  <ShieldCheck size={16} />
                  <div>
                    <strong>
                      {rawStatus === 'approved' ? 'Approved by:' : 'Rejected by:'}{' '}
                      {(payment.approvedBy || payment.approved_by)?.name || (payment.approvedBy || payment.approved_by)?.email}
                    </strong>
                    {payment.message && <p className="audit-msg-text">"{payment.message}"</p>}
                  </div>
                </div>
              )}
            </div>

            {/* 2-Column Grid: User Info & College / Team Info */}
            <div className="details-grid-2col">
              <div className="details-card-box">
                <h4 className="details-card-title">
                  <User size={15} className="text-cyan" /> Student User Details
                </h4>
                <div className="user-profile-summary">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar-lg" />
                  ) : (
                    <div className="user-avatar-placeholder-lg">
                      <User size={20} />
                    </div>
                  )}
                  <div className="user-info-text">
                    <h5 className="user-name-text">{user?.name || 'N/A'}</h5>
                    <p className="user-email-text">{user?.email || 'N/A'}</p>
                    {user?.collegeName && (
                      <p className="user-college-text">
                        <Building2 size={12} /> {user.collegeName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="details-card-box">
                <h4 className="details-card-title">
                  <Building2 size={15} className="text-cyan" /> College & Team Details
                </h4>
                <div className="team-college-details">
                  <p className="detail-field">
                    <strong>College:</strong> {college?.collegeName || user?.collegeName || 'N/A'}
                  </p>
                  <p className="detail-field">
                    <strong>Team Name:</strong> {team?.name || 'N/A'}
                  </p>
                  <p className="detail-field">
                    <strong>Team ID:</strong> <code className="team-id-badge">{team?.teamid || 'N/A'}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Proof Screenshot Section */}
            {proofImg && (
              <div className="details-card-box">
                <h4 className="details-card-title">
                  <Eye size={15} className="text-cyan" /> Payment Proof Screenshot
                </h4>
                <div className="details-proof-img-container">
                  <div className="proof-img-overlay-wrapper" onClick={() => setPreviewImage({ url: proofImg, utr: payment?.utr })}>
                    <img src={proofImg} alt="Payment Receipt Screenshot" className="details-proof-img" />
                    <div className="proof-hover-hint">
                      <Eye size={18} />
                      <span>Click to expand image</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Events Registered Associated ONLY with this Payment */}
            <div className="details-card-box events-associated-box">
              <div className="events-box-header">
                <h4 className="details-card-title">
                  <Sparkles size={15} className="text-cyan" /> Associated Event Registrations ({eventsList.length})
                </h4>
                <span className="events-sub-tag">Events mapped to Payment ID</span>
              </div>

              {eventsList.length > 0 ? (
                <div className="events-list-mini">
                  {eventsList.map((evt, idx) => {
                    const eventId = evt.eventId || evt._id || evt.id || `evt_${idx}`;
                    const isExpanded = expandedEventId === eventId;
                    const isLoadingPart = loadingParticipants[eventId];
                    const externalPartData = eventParticipantsData[eventId];
                    const participants = evt.participants || externalPartData?.participants || [];
                    const partCount = evt.participantsCount || externalPartData?.participantsCount || participants.length;

                    return (
                      <div key={eventId} className={`event-item-wrapper ${isExpanded ? 'expanded' : ''}`}>
                        {/* Event Header Row */}
                        <div
                          className="event-item-row clickable-event-row"
                          onClick={() => handleToggleEventExpand(eventId, user?._id, evt)}
                          title="Click to view/collapse event participants"
                        >
                          <div className="evt-title-group">
                            <h5 className="evt-title">{evt.title || evt.name}</h5>
                            {evt.description && <p className="evt-desc">{evt.description}</p>}
                          </div>
                          <div className="evt-right-group">
                            <div className="evt-fee-pill">
                              <span>Fee: ₹{evt.registrationFee || evt.actualPrice || evt.fee || 500}</span>
                            </div>
                            <button type="button" className="btn-icon-subtle expand-btn" aria-label="Toggle details">
                              {isLoadingPart ? (
                                <RefreshCw size={14} className="spin-icon" />
                              ) : isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Event Details & Participants */}
                        {isExpanded && (
                          <div className="event-expanded-details-container">
                            {/* Specs Bar */}
                            <div className="event-specs-strip">
                              {evt.location && (
                                <span className="spec-badge">
                                  <MapPin size={12} /> <strong>Location:</strong> {evt.location}
                                </span>
                              )}
                              {evt.date && (
                                <span className="spec-badge">
                                  <Calendar size={12} /> <strong>Date:</strong> {new Date(evt.date).toLocaleDateString()}
                                </span>
                              )}
                              <span className="spec-badge">
                                <Users size={12} /> <strong>Team Limits:</strong> {evt.minParticipants || 1} - {evt.maxParticipants || 4} Members
                              </span>
                            </div>

                            {/* Participants Section Header */}
                            <div className="participants-section-header">
                              <h5 className="participants-title">
                                <Users size={14} className="text-cyan" /> Event Registered Participants ({partCount})
                              </h5>
                              {team?.name && <span className="team-badge">Team: {team.name}</span>}
                            </div>

                            {/* Participants Grid */}
                            {isLoadingPart ? (
                              <div className="event-details-loading">
                                <RefreshCw size={14} className="spin-icon text-cyan" />
                                <span>Loading participants info...</span>
                              </div>
                            ) : participants && participants.length > 0 ? (
                              <div className="participants-grid">
                                {participants.map((part, pIdx) => (
                                  <div key={part._id || pIdx} className="participant-card-item">
                                    <div className="participant-avatar-wrap">
                                      {part.avatar ? (
                                        <img src={part.avatar} alt={part.name} className="participant-avatar" />
                                      ) : (
                                        <div className="participant-avatar-placeholder">
                                          <User size={15} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="participant-info">
                                      <h6 className="participant-name">
                                        {part.name}
                                        {part.role && <span className="participant-role-pill">{part.role}</span>}
                                      </h6>
                                      {part.phone && (
                                        <div className="participant-phone-line">
                                          <Phone size={12} className="text-cyan" />
                                          <span className="phone-num">{part.phone}</span>
                                        </div>
                                      )}
                                      {part.email && (
                                        <p className="participant-email">
                                          <Mail size={11} /> {part.email}
                                        </p>
                                      )}
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
                <p className="text-muted text-sm p-3">No specific event items mapped to this payment ID.</p>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="modal-actions-bar">
              {onOpenActionModal && (
                <div className="modal-left-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success"
                    onClick={() => {
                      onClose();
                      onOpenActionModal(payment, 'approved');
                    }}
                  >
                    <CheckCircle2 size={14} /> Approve Payment
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      onClose();
                      onOpenActionModal(payment, 'rejected');
                    }}
                  >
                    <XCircle size={14} /> Reject Payment
                  </button>
                </div>
              )}
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

      {/* Image Preview Lightbox */}
      {previewImage && (
        <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="800px">
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
              Close
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

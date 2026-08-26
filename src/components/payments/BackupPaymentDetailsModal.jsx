import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Archive,
  Trash2,
  Tag,
  Hash,
  ShieldAlert
} from 'lucide-react';
import { resolveImageUrl } from '../../services/apiConfig';
import './BackupPaymentDetailsModal.css';

export const BackupPaymentDetailsModal = ({
  isOpen,
  onClose,
  backupId
}) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [proofImgFailed, setProofImgFailed] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    if (isOpen && backupId) {
      queueMicrotask(() => {
        if (!isSubscribed) return;
        setLoading(true);
        setData(null);
        setExpandedEventId(null);
        setProofImgFailed(false);
      });

      apiService.getBackupPaymentDetails(backupId)
        .then((res) => {
          if (!isSubscribed) return;
          setData(res);
          const eventsList = res?.events || [];
          if (eventsList.length > 0) {
            const firstEvtId = eventsList[0]._id || eventsList[0].backupRegistrationId || eventsList[0].eventId || 'evt-0';
            setExpandedEventId(firstEvtId);
          }
        })
        .catch((err) => {
          if (isSubscribed) {
            console.warn('Failed to load backup payment details:', err);
            showError('Failed to load backup payment details');
          }
        })
        .finally(() => {
          if (isSubscribed) setLoading(false);
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [isOpen, backupId, showError]);

  const handleCopyText = (text, label) => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    showSuccess(`${label} copied to clipboard`);
  };

  const handleToggleEventExpand = (evtId) => {
    setExpandedEventId(prev => prev === evtId ? null : evtId);
  };

  if (!isOpen) return null;

  const payment = data?.payment || {};
  const user = data?.user || payment?.user || {};
  const college = data?.college || user?.college || null;
  const team = data?.team || user?.team || null;
  const eventsList = data?.events || [];
  
  const rawStatus = (payment?.status || 'approved').toLowerCase();
  const rawImg = payment?.imageUrl || payment?.imageurl || payment?.proofUrl || payment?.screenshot || payment?.paymentScreenshot || payment?.receipt || null;
  const proofImg = resolveImageUrl(rawImg);
  const deletedAtStr = payment?.deletedAt 
    ? new Date(payment.deletedAt).toLocaleString() 
    : 'Archived Record';

  const backupRecordId = data?.backupRecordId || payment?.backupid || payment?.backupRecordId || backupId;
  const originalPaymentId = data?.originalPaymentId || payment?.originalPaymentId || payment?.paymentid || 'N/A';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="780px">
        {/* Modal Header */}
        <div className="modal-header backup-details-modal-header">
          <div className="modal-title-wrap">
            <div className="header-icon-circle archive-icon-circle">
              <Archive size={19} />
            </div>
            <div>
              <div className="header-badge-row">
                <h3 className="modal-main-title">Deleted Payment Backup Audit</h3>
                <span className="vault-pill-badge">
                  <ShieldAlert size={12} /> Deleted Record Vault
                </span>
              </div>
              <span className="modal-subtitle-sm">
                Immutable Backup Snapshot • ID: <code>{String(backupRecordId).slice(-8)}</code>
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {loading ? (
          <div className="modal-loading-state">
            <RefreshCw className="spin-icon text-cyan" size={32} />
            <p>Retrieving backed-up payment snapshot and participant history...</p>
          </div>
        ) : data ? (
          <div className="backup-details-content">
            {/* Audit & Deletion Banner */}
            <div className="backup-audit-alert-bar">
              <div className="audit-alert-left">
                <Trash2 size={16} className="audit-delete-icon" />
                <div className="audit-alert-text">
                  <div className="audit-primary-line">
                    This payment was <strong>deleted from live records</strong> on{' '}
                    <span className="audit-timestamp-text">{deletedAtStr}</span>
                  </div>
                  {payment?.deletedBy && (
                    <div className="audit-sub-line">
                      Action initiated by Admin: <code>{payment.deletedBy}</code>
                    </div>
                  )}
                </div>
              </div>
              <span className="audit-immutable-pill">Immutable Backup</span>
            </div>

            {/* IDs Traceability Bar */}
            <div className="id-traceability-bar">
              <div className="trace-item">
                <span className="trace-lbl">
                  <Hash size={11} /> Backup Record ID:
                </span>
                <code className="trace-code">{backupRecordId}</code>
                <button
                  type="button"
                  className="btn-copy-mini"
                  onClick={() => handleCopyText(backupRecordId, 'Backup Record ID')}
                  title="Copy Backup Record ID"
                >
                  <Copy size={11} />
                </button>
              </div>

              <div className="trace-divider" />

              <div className="trace-item">
                <span className="trace-lbl">
                  <Receipt size={11} /> Original Payment ID:
                </span>
                <code className="trace-code">{originalPaymentId}</code>
                <button
                  type="button"
                  className="btn-copy-mini"
                  onClick={() => handleCopyText(originalPaymentId, 'Original Payment ID')}
                  title="Copy Original Payment ID"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>

            {/* Top Status & Amount Banner */}
            <div className="details-header-card backup-amount-card">
              <div className="details-status-row">
                <span className={`payment-status-badge status-${rawStatus}`}>
                  {rawStatus === 'approved' && <CheckCircle2 size={13} />}
                  {rawStatus === 'rejected' && <XCircle size={13} />}
                  {rawStatus === 'pending' && <Clock size={13} />}
                  {rawStatus.toUpperCase()} (At Deletion)
                </span>
                <span className="details-timestamp">
                  <Calendar size={13} /> {deletedAtStr}
                </span>
              </div>

              <div className="details-amount-block">
                <div className="amount-info-sub">
                  <span className="amount-label">Archived Amount</span>
                  <h2 className="amount-value text-emerald">
                    {typeof payment?.amount === 'number' ? `₹${payment.amount}` : (payment?.amount || '₹0')}
                  </h2>
                </div>

                <div className="utr-badge-box">
                  <span className="utr-lbl">Archived UTR Code:</span>
                  <div className="utr-pill">
                    <code className="utr-code">{payment?.utr || 'N/A'}</code>
                    {payment?.utr && payment?.utr !== 'N/A' && (
                      <button
                        type="button"
                        className="btn-copy-icon"
                        onClick={() => handleCopyText(payment.utr, 'UTR')}
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
                    <strong>Verification Note:</strong> {payment.message}
                  </div>
                </div>
              )}
            </div>

            {/* User & Institution Profile Grid */}
            <div className="details-grid-row">
              {/* Participant Card */}
              <div className="details-card-box details-user-box">
                <div className="box-title-bar">
                  <User size={15} className="box-icon" />
                  <h4>Participant Details</h4>
                </div>
                <div className="user-info-body">
                  <div 
                    className="user-avatar-circle clickable-avatar"
                    onClick={() => {
                      if (user?._id) {
                        onClose();
                        navigate(`/user/${user._id}`);
                      }
                    }}
                    title={user?._id ? "View Full Profile" : undefined}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name || 'User'} />
                    ) : (
                      <span>{(user?.name || 'P').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="user-text-meta">
                    <h5 
                      className={`user-name-title ${user?._id ? 'clickable-link' : ''}`}
                      onClick={() => {
                        if (user?._id) {
                          onClose();
                          navigate(`/user/${user._id}`);
                        }
                      }}
                    >
                      {user?.name || 'Participant'}
                    </h5>
                    <p className="user-email-text" title={user?.email}>
                      <Mail size={12} />
                      <span>{user?.email || 'No email registered'}</span>
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
                  <h4>College & Team Snapshot</h4>
                </div>
                <div className="college-info-body">
                  <div className="college-meta-item">
                    <span className="meta-lbl">Institution:</span>
                    <strong className="meta-val">{college?.collegeName || user?.collegeName || 'Not Specified'}</strong>
                  </div>
                  <div className="college-meta-item">
                    <span className="meta-lbl">Team Name:</span>
                    <strong className="meta-val font-cyan">{team?.name || user?.team?.name || 'General Registration'}</strong>
                  </div>
                  {user?._id && (
                    <div className="college-meta-item">
                      <span className="meta-lbl">User ID:</span>
                      <code className="meta-val-code">{user._id}</code>
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
                  <h4>Backed-up Payment Receipt Proof</h4>
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
                      Preserved transaction screenshot proof from the original payment record.
                    </p>
                    <div className="proof-btn-row">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-cyan"
                        onClick={() => setPreviewImage({ url: proofImg, utr: payment?.utr })}
                      >
                        <Eye size={13} /> Inspect Receipt
                      </button>
                      <a href={proofImg} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                        Open Original <ArrowUpRight size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Backed-up Event Registrations */}
            <div className="details-card-box details-events-section">
              <div className="box-title-bar">
                <Calendar size={15} className="box-icon" />
                <h4>Backed-up Event Registrations ({eventsList.length || data?.eventsCount || 0})</h4>
              </div>

              {eventsList.length > 0 ? (
                <div className="events-accordion-list">
                  {eventsList.map((evt, idx) => {
                    const evtId = evt._id || evt.backupRegistrationId || evt.registrationId || evt.eventId || `evt-${idx}`;
                    const isExpanded = expandedEventId === evtId;
                    const participants = evt.participants || [];
                    const fee = evt.actualPrice !== undefined ? evt.actualPrice : (evt.registrationFee !== undefined ? evt.registrationFee : 0);

                    return (
                      <div key={evtId} className={`event-accordion-card ${isExpanded ? 'is-open' : ''}`}>
                        <div
                          className="event-accordion-header"
                          onClick={() => handleToggleEventExpand(evtId)}
                        >
                          <div className="event-title-group">
                            <h5 className="event-title-text">{evt.title || evt.name || 'Festival Event'}</h5>
                            <span className="event-fee-pill">₹{fee}</span>
                            <span className="participants-count-pill">
                              <Users size={11} /> {evt.participantsCount || participants.length} Participants
                            </span>
                          </div>
                          <button type="button" className="btn-accordion-toggle" aria-label="Toggle event details">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="event-accordion-body">
                            <div className="event-meta-subrow">
                              {evt.originalRegistrationId && (
                                <span className="event-sub-meta">
                                  Original Reg ID: <code>{evt.originalRegistrationId}</code>
                                </span>
                              )}
                              {evt.backupRegistrationId && (
                                <span className="event-sub-meta">
                                  Backup Reg ID: <code>{evt.backupRegistrationId}</code>
                                </span>
                              )}
                            </div>

                            <div className="participants-roster-header">
                              <Users size={14} className="text-cyan" />
                              <h6>Enrolled Participants Roster ({participants.length})</h6>
                            </div>

                            {participants.length > 0 ? (
                              <div className="participants-grid">
                                {participants.map((part, pIdx) => (
                                  <div key={pIdx} className="participant-badge-card">
                                    <div className="participant-avatar-tiny">
                                      <User size={12} />
                                    </div>
                                    <div className="participant-info">
                                      <h6 className="participant-name">{part.name || 'Participant'}</h6>
                                      {part.phone && (
                                        <span className="participant-phone-sub">
                                          <Phone size={10} /> {part.phone}
                                        </span>
                                      )}
                                      {part.email && (
                                        <span className="participant-email-sub">
                                          <Mail size={10} /> {part.email}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-participants-box">
                                <p className="text-muted text-sm">No participant roster attached to this backed-up registration.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted text-sm" style={{ margin: '0.75rem 0' }}>
                  No specific event registrations mapped to this backup payment record.
                </p>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="modal-actions-bar">
              <div className="modal-left-actions">
                <span className="backup-readonly-hint">
                  <ShieldCheck size={13} /> Archived Record — Read Only Snapshot
                </span>
              </div>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close Audit View
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-error-state">
            <p className="text-danger">Failed to load details for backup payment ID {backupId}.</p>
            <button type="button" className="btn btn-secondary mt-3" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="840px">
          <div className="modal-header">
            <h3>
              <Receipt size={18} /> Backed-up Payment Screenshot {previewImage.utr ? `(UTR: ${previewImage.utr})` : ''}
            </h3>
            <button className="modal-close" onClick={() => setPreviewImage(null)}>
              &times;
            </button>
          </div>
          <div className="preview-image-container">
            <img src={previewImage.url} alt="Backed-up Receipt Proof" className="preview-image-full" />
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

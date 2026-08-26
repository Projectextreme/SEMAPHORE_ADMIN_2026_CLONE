import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/apiService';
import { 
  Archive, 
  Search, 
  Copy, 
  Receipt, 
  Building2, 
  RefreshCw, 
  X, 
  User, 
  Clock, 
  Trash2, 
  Hash, 
  Layers, 
  Eye, 
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { BackupPaymentDetailsModal } from './BackupPaymentDetailsModal';
import { ReceiptThumbnail } from '../common/ReceiptThumbnail';
import './BackupPaymentsVault.css';

export const BackupPaymentsVault = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [backupPayments, setBackupPayments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBackupId, setSelectedBackupId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const loadBackupPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getBackupPayments();
      const list = data?.payments || (Array.isArray(data) ? data : []);
      setBackupPayments(list);
    } catch (err) {
      console.warn('Error loading backup payments:', err);
      showError('Failed to load backup payment records');
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    let isSubscribed = true;
    queueMicrotask(() => {
      if (isSubscribed) {
        loadBackupPayments();
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, [loadBackupPayments]);

  const handleCopyText = (text, label = 'UTR') => {
    if (!text || text === 'N/A') return;
    navigator.clipboard.writeText(text);
    showSuccess(`${label} '${text}' copied to clipboard`);
  };

  // Filter and search
  const filteredBackupPayments = backupPayments.filter((p) => {
    const matchesStatus = activeFilter === 'All' || (p.rawStatus || '').toLowerCase() === activeFilter.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (p.utr || '').toLowerCase().includes(term) ||
      (p.userName || '').toLowerCase().includes(term) ||
      (p.userEmail || '').toLowerCase().includes(term) ||
      (p.collegeName || '').toLowerCase().includes(term) ||
      (p.teamName || '').toLowerCase().includes(term) ||
      String(p.backupId || '').toLowerCase().includes(term) ||
      String(p.backupRecordId || '').toLowerCase().includes(term) ||
      String(p.originalPaymentId || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const backupApprovedCount = backupPayments.filter(p => p.rawStatus === 'approved').length;
  const backupPendingCount = backupPayments.filter(p => p.rawStatus === 'pending').length;
  const backupRejectedCount = backupPayments.filter(p => p.rawStatus === 'rejected').length;

  const totalBackupVolume = backupPayments.reduce((sum, p) => sum + (p.amountNum || 0), 0);
  const totalBackupEvents = backupPayments.reduce((sum, p) => sum + (p.backedUpEventsCount || 1), 0);

  return (
    <div className="backup-vault-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <div className="title-with-badge">
            <h2 className="page-title">
              <Archive className="title-icon text-danger" /> Deleted Payments Backup Vault
            </h2>
            <span className="vault-header-pill">
              <ShieldAlert size={12} /> Audit Archive
            </span>
          </div>
          <p className="page-description">
            Immutable audit record of all deleted payment submissions. Inspect preserved transaction snapshots, UTR bank codes, receipt screenshot proofs, and original participant registrations.
          </p>
        </div>

        <button 
          onClick={loadBackupPayments} 
          className="btn btn-secondary"
          disabled={isLoading}
          title="Refresh Backup Records"
          aria-label="Refresh Backup Records"
        >
          <RefreshCw size={15} className={isLoading ? 'spin-icon' : ''} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh Backup Vault'}</span>
        </button>
      </div>

      {/* Summary Metrics Strip */}
      <div className="payment-summary-strip">
        <div className="payment-metric-card backup-metric-box">
          <span className="metric-label">Archived Payments</span>
          <span className="metric-val text-danger">{backupPayments.length} Records</span>
        </div>
        <div className="payment-metric-card backup-metric-box">
          <span className="metric-label">Backed-up Revenue</span>
          <span className="metric-val text-emerald">₹ {totalBackupVolume.toLocaleString()}</span>
        </div>
        <div className="payment-metric-card backup-metric-box">
          <span className="metric-label">Preserved Event Regs</span>
          <span className="metric-val text-cyan">{totalBackupEvents} Registrations</span>
        </div>
        <div className="payment-metric-card backup-metric-box">
          <span className="metric-label">Approved at Deletion</span>
          <span className="metric-val text-success">{backupApprovedCount} Items</span>
        </div>
      </div>

      {/* Filters & Search Card */}
      <div className="card filter-card">
        <div className="filter-header">
          {/* Status Tabs (All, Approved, Pending, Rejected) */}
          <div className="tab-group">
            {[
              { label: 'All', count: backupPayments.length },
              { label: 'Approved', count: backupApprovedCount },
              { label: 'Pending', count: backupPendingCount },
              { label: 'Rejected', count: backupRejectedCount }
            ].map((tab) => (
              <button
                key={tab.label}
                className={`tab-btn ${activeFilter.toLowerCase() === tab.label.toLowerCase() ? 'tab-active' : ''}`}
                onClick={() => setActiveFilter(tab.label)}
              >
                <span>{tab.label}</span>
                <span className="tab-counter">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="filter-controls-right">
            <div className="search-bar-wrapper" style={{ minWidth: '300px' }}>
              <Search className="search-icon" size={15} />
              <input
                type="text"
                className="search-input"
                placeholder="Search UTR, Student, Backup ID, Orig ID..."
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

            <span className="endpoint-badge backup-badge-count">{filteredBackupPayments.length} Backups</span>
          </div>
        </div>

        {/* Backups Cards Grid */}
        <div className="payment-cards-grid">
          {filteredBackupPayments.length === 0 ? (
            <EmptyState
              type="payments"
              title="No backup payment records found"
              description="No deleted payment snapshots match your filter query in the backup vault."
              primaryAction={{
                label: 'Reset Filters',
                onClick: () => {
                  setActiveFilter('All');
                  setSearchTerm('');
                }
              }}
              compact={true}
            />
          ) : (
            filteredBackupPayments.map((p) => {
              const backupId = p.backupId || p.backupRecordId || p._id;
              const originalPaymentId = p.originalPaymentId || p.paymentid || 'N/A';
              const rawStatus = (p.rawStatus || 'approved').toLowerCase();
              const proofImg = p.imageUrl || p.imageurl || p.proofUrl;
              const userAvatar = p.user?.avatar;

              return (
                <div 
                  key={backupId} 
                  className={`payment-card backup-record-card status-border-${rawStatus} clickable-card`}
                  onClick={(e) => {
                    if (!e.target.closest('button') && !e.target.closest('.receipt-thumb-wrapper')) {
                      setSelectedBackupId(backupId);
                    }
                  }}
                >
                  {/* Card Header: User Avatar, Team Name & Status Badge */}
                  <div className="payment-card-header">
                    <div className="payment-user-info-cluster">
                      <div 
                        className="payment-avatar-wrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (p.user?._id) {
                            navigate(`/user/${p.user._id}`);
                          }
                        }}
                        title={`View Profile: ${p.userName}`}
                      >
                        {userAvatar ? (
                          <img src={userAvatar} alt={p.userName} className="payment-avatar-img" />
                        ) : (
                          <div className="payment-avatar-placeholder">
                            <span>{(p.userName || 'U').charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                      <div className="payment-title-group">
                        <h4 className="payment-team-name" title={p.teamName || 'Solo Participant'}>
                          {p.teamName || p.userName || 'Participant'}
                        </h4>
                        <div 
                          className="payment-user-sub clickable-user-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.user?._id) {
                              navigate(`/user/${p.user._id}`);
                            }
                          }}
                          title="View User Profile"
                        >
                          <User size={12} className="text-muted" />
                          <span className="user-name-text">{p.userName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="backup-status-tag-group">
                      <span className="archived-pill">
                        <Archive size={11} /> Archived
                      </span>
                      <span className={`payment-status-badge status-${rawStatus}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body: Structured Column + Screenshot Preview */}
                  <div className="payment-card-main-content">
                    {/* Left: Meta details */}
                    <div className="payment-details-column">
                      {p.collegeName && (
                        <div className="payment-meta-item" title={p.collegeName}>
                          <Building2 size={13} className="meta-icon" />
                          <span className="meta-val college-text">{p.collegeName}</span>
                        </div>
                      )}

                      <div className="payment-meta-item utr-item">
                        <span className="meta-label">UTR:</span>
                        <code className="utr-code" title={p.utr}>{p.utr || 'N/A'}</code>
                        {p.utr && p.utr !== 'N/A' && (
                          <button 
                            type="button"
                            className="btn-copy-mini"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyText(p.utr, 'UTR');
                            }}
                            title="Copy UTR Reference"
                          >
                            <Copy size={11} />
                          </button>
                        )}
                      </div>

                      <div className="payment-meta-item">
                        <span className="meta-label">Amount:</span>
                        <strong className="amount-val-text">{p.amountFormatted || p.amount}</strong>
                      </div>

                      <div className="payment-meta-item">
                        <Layers size={12} className="meta-icon text-cyan" />
                        <span className="event-tag-pill" title={`${p.backedUpEventsCount} Backed-up Events`}>
                          {p.backedUpEventsCount} Backed-up Event(s)
                        </span>
                      </div>
                    </div>

                    {/* Right: Resilient Receipt Thumbnail */}
                    <ReceiptThumbnail
                      src={proofImg}
                      utr={p.utr}
                      onClick={(url) => {
                        if (url) {
                          setPreviewImage({ url, utr: p.utr });
                        } else {
                          setSelectedBackupId(backupId);
                        }
                      }}
                    />
                  </div>

                  {/* Deletion Audit Strip */}
                  <div className="backup-card-audit-bar">
                    <div className="audit-time-block" title={`Deleted: ${p.deletedDateFormatted}`}>
                      <Trash2 size={11} className="text-danger" />
                      <span className="audit-date-text">Deleted: {p.deletedDateFormatted}</span>
                    </div>

                    <div className="backup-id-mini-cluster">
                      <span className="mini-id-lbl">Backup ID:</span>
                      <code className="mini-id-code" title={backupId}>
                        {String(backupId).slice(-6)}
                      </code>
                      <button
                        type="button"
                        className="btn-copy-mini"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyText(backupId, 'Backup ID');
                        }}
                        title="Copy Backup ID"
                      >
                        <Copy size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Card Footer: Timestamp & Action Buttons */}
                  <div className="payment-card-footer">
                    <div className="payment-timestamp" title={`Original Payment ID: ${originalPaymentId}`}>
                      <Hash size={12} className="time-icon text-muted" />
                      <span className="time-text">Orig ID: {String(originalPaymentId).slice(-8)}</span>
                    </div>

                    <div className="payment-actions-group">
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-cyan"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBackupId(backupId);
                        }}
                        title="View Full Backup Snapshot & Roster"
                      >
                        <Eye size={12} /> Audit Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Backup Payment Details Modal (Endpoint 20) */}
      <BackupPaymentDetailsModal
        isOpen={!!selectedBackupId}
        onClose={() => setSelectedBackupId(null)}
        backupId={selectedBackupId}
      />

      {/* Image Lightbox Modal */}
      {previewImage && (
        <Modal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="800px">
          <div className="modal-header">
            <h3><Receipt size={18} /> Backed-up Screenshot Preview {previewImage.utr ? `(${previewImage.utr})` : ''}</h3>
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

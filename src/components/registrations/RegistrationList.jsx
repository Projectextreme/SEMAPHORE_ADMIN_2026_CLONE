import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle,
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
  UserCheck,
  User,
  Tag,
  LayoutGrid,
  List,
  Trophy,
  Crown,
  RotateCcw,
  Clock
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { resolveImageUrl } from '../../services/apiConfig';
import { DEFAULT_RECEIPT_PLACEHOLDER } from '../common/constants';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { CountUp } from '../common/CountUp';
import { TiltCard } from '../common/TiltCard';
import './RegistrationList.css';

export const RegistrationList = () => {
  const { showSuccess, showError } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [selectedEventFilter, setSelectedEventFilter] = useState('All');
  const [viewMode, setViewMode] = useState('cards');

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
    const teamTitle = reg.teamName || 'Team';
    const normStatus = newStatus.toLowerCase();
    const capStatus = normStatus.charAt(0).toUpperCase() + normStatus.slice(1);

    setActionLoading(true);
    // 1. Instant optimistic UI update
    setRegistrations((prev) =>
      prev.map((r) => ((r._id === id || r.id === id) ? { ...r, paymentStatus: capStatus, rawStatus: normStatus } : r))
    );
    if (inspectingReg && (inspectingReg._id === id || inspectingReg.id === id)) {
      setInspectingReg((prev) => ({ ...prev, paymentStatus: capStatus, rawStatus: normStatus }));
    }

    try {
      const res = await apiService.approveRegistrationPayment(id, capStatus, reg);
      showToast(res?.message || `Payment for team "${teamTitle}" marked as ${capStatus}!`);
      await fetchRegistrations();
    } catch (err) {
      showToast(err.message || 'Failed to update payment status.', true);
      await fetchRegistrations();
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
      await fetchRegistrations();
    } catch (err) {
      showToast(err.message || 'Failed to save registration changes.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Confirm Delete Registration
  const handleDeleteConfirm = async () => {
    if (!deletingReg) return;
    const id = deletingReg._id || deletingReg.id;
    const idStr = String(id || '');
    const teamId = deletingReg.teamId;
    const allRegIds = new Set(Array.isArray(deletingReg.allRegistrationIds) ? deletingReg.allRegistrationIds.map(String) : []);
    allRegIds.add(idStr);

    setActionLoading(true);
    try {
      const res = await apiService.deleteRegistration(id, deletingReg);
      // Optimistically remove from state immediately
      setRegistrations((prev) =>
        prev.filter((r) => {
          const rId = String(r._id || r.id || '');
          const rTeamId = String(r.teamId || '');
          if (rId === idStr || (teamId && rId === String(teamId))) return false;
          if (teamId && rTeamId === String(teamId)) return false;
          if (Array.isArray(r.allRegistrationIds) && r.allRegistrationIds.some(regId => allRegIds.has(String(regId)))) return false;
          return true;
        })
      );
      showToast(res?.message || `Team "${deletingReg.teamName}" deleted successfully.`);
      setDeletingReg(null);
      await fetchRegistrations();
    } catch (err) {
      console.error('[RegistrationList] Delete failed:', err);
      showToast(err?.message || 'Failed to delete team.', true);
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

  // Export CSV Report with UTF-8 BOM for Microsoft Excel compatibility
  const sanitizeCsvCell = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    // Neutralize CSV Formula Injection characters (=, +, -, @, \t, \r, %)
    if (/^[=+\-@\t\r%]/.test(str)) {
      str = `'${str}`;
    }
    return str.replace(/"/g, '""');
  };

  const handleExportCSV = () => {
    const headers = 'Reg ID,Team Name,College Name,Leader Name,Email,Phone,Event,Members,Payment Status,UTR,Amount (INR),Date';
    const rows = filteredRegistrations.map((r) => {
      const cleanAmount = (r.amount !== undefined && r.amount !== null ? r.amount : '0').toString().replace(/[^\d.]/g, '') || '0';
      
      // Clean compact date (YYYY-MM-DD) so Excel fits it within default column width without showing '########'
      let cleanDate = new Date().toISOString().split('T')[0];
      const rawDate = r.registeredAt || r.createdAt || r.updatedAt;
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            cleanDate = d.toISOString().split('T')[0];
          } else {
            cleanDate = String(rawDate).split(' ')[0].split('T')[0];
          }
        } catch {
          cleanDate = new Date().toISOString().split('T')[0];
        }
      }

      return `"${sanitizeCsvCell(r.id || r._id)}","${sanitizeCsvCell(r.teamName)}","${sanitizeCsvCell(r.collegeName)}","${sanitizeCsvCell(r.leaderName)}","${sanitizeCsvCell(r.email)}","${sanitizeCsvCell(r.phone)}","${sanitizeCsvCell(r.event || r.eventName)}",${Number(r.membersCount) || 1},"${sanitizeCsvCell(r.paymentStatus || 'Pending')}","${sanitizeCsvCell(r.utr)}",${cleanAmount},"${cleanDate}"`;
    });

    // Prefix with UTF-8 BOM (\uFEFF) so Excel parses all special characters correctly
    const csvString = '\uFEFF' + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Semaphore_Registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Registrations CSV report downloaded with Excel formatting!');
  };

  const handleExportTeamsXLSX = async () => {
    try {
      await apiService.exportTeams('Semaphore_2026_Teams_Report.xlsx');
      showToast('Teams Excel Report downloaded successfully (.xlsx)!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export Teams Excel report.', true);
    }
  };

  const handleExportMasterXLSX = async () => {
    try {
      await apiService.exportAllMaster('Semaphore_2026_Master_Export.xlsx');
      showToast('Master Consolidated Workbook downloaded (.xlsx)!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export Master Workbook.', true);
    }
  };

  // Filtering Logic
  const collegesList = ['All', ...new Set(registrations.map((r) => r.collegeName).filter(Boolean))];
  
  // Extract all distinct individual event titles across all teams
  const allEventsSet = new Set();
  registrations.forEach(r => {
    if (Array.isArray(r.events)) {
      r.events.forEach(e => { if (e.eventName) allEventsSet.add(e.eventName); });
    } else if (r.event) {
      allEventsSet.add(r.event);
    }
  });
  const eventsList = ['All', ...Array.from(allEventsSet)];

  const filteredRegistrations = registrations.filter((r) => {
    const matchesCollege = selectedCollege === 'All' || r.collegeName === selectedCollege;
    const matchesStatus = selectedPaymentStatus === 'All' || r.paymentStatus === selectedPaymentStatus;
    const matchesEvent = selectedEventFilter === 'All' || (
      Array.isArray(r.events)
        ? r.events.some(e => e.eventName === selectedEventFilter)
        : (r.event && r.event.includes(selectedEventFilter))
    );
    
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (r.teamName || '').toLowerCase().includes(term) ||
      (r.leaderName || '').toLowerCase().includes(term) ||
      (r.collegeName || '').toLowerCase().includes(term) ||
      (r.email || '').toLowerCase().includes(term) ||
      (r.event || '').toLowerCase().includes(term) ||
      (r.utr || '').toLowerCase().includes(term) ||
      (r.id || r._id || '').toLowerCase().includes(term) ||
      (Array.isArray(r.participants) && r.participants.some(p => (p.name || '').toLowerCase().includes(term)));

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
            Audit enrolled teams, edit participant details, verify UPI payments, inspect proof screenshots, and enforce 1-team per college quota.
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

          <button onClick={handleExportTeamsXLSX} className="btn btn-primary btn-glow-sheen" title="Download Excel (.xlsx) with Teams Summary & Participants">
            <Download size={15} /> Export Teams (.xlsx)
          </button>

          <button onClick={handleExportMasterXLSX} className="btn btn-secondary" title="Download Master 3-in-1 Workbook (.xlsx)">
            <FileSpreadsheet size={15} /> Master Export (.xlsx)
          </button>
        </div>
      </div>

      {/* Summary KPI Strip with 3D Tilt & CountUp Numbers */}
      <div className="registration-kpi-strip">
        <TiltCard maxTilt={5} glareOpacity={0.12} className="registration-kpi-tilt">
          <div className="kpi-mini-card">
            <span className="kpi-mini-label">Total Teams</span>
            <span className="kpi-mini-val text-cyan">
              <CountUp value={registrations.length} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="registration-kpi-tilt">
          <div className="kpi-mini-card">
            <span className="kpi-mini-label">Pending Payments</span>
            <span className="kpi-mini-val text-warning">
              <CountUp value={pendingCount} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="registration-kpi-tilt">
          <div className="kpi-mini-card">
            <span className="kpi-mini-label">Approved & Verified</span>
            <span className="kpi-mini-val text-success">
              <CountUp value={approvedCount} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="registration-kpi-tilt">
          <div className="kpi-mini-card">
            <span className="kpi-mini-label">Colleges Enrolled</span>
            <span className="kpi-mini-val text-indigo">
              <CountUp value={Math.max(0, collegesList.length - 1)} />
            </span>
          </div>
        </TiltCard>
      </div>

      {/* College Rule Banner */}
      <div className="college-rule-alert">
        <AlertTriangle size={18} className="alert-rule-icon" />
        <div className="rule-text">
          <strong>Semaphore 2026 Quota Rule:</strong> Maximum 1 team per institution permitted.
          Colleges with 1 registered team are tagged with <span className="quota-tag-inline">1/1 Quota Full</span>.
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

            {/* View Mode Toggle Switcher */}
            <div className="view-mode-toggle">
              <button
                type="button"
                className={`btn-view-toggle ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Cards Grid View"
                aria-label="Cards Grid View"
              >
                <LayoutGrid size={14} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                className={`btn-view-toggle ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
                aria-label="Table View"
              >
                <List size={14} />
                <span>Table</span>
              </button>
            </div>

            <span className="endpoint-badge">{filteredRegistrations.length} Teams</span>
          </div>
        </div>

        {/* Main Content Area: Loading / Empty / Cards Grid / Table View */}
        {loading ? (
          <div className="loading-state" style={{ padding: '3.5rem', textAlign: 'center' }}>
            <div className="spinner"></div>
            <span>Loading teams and registrations from live database...</span>
          </div>
        ) : filteredRegistrations.length === 0 ? (
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
        ) : viewMode === 'cards' ? (
          /* ==========================================================================
             Primary Responsive Cards Grid View
             ========================================================================== */
          <div className="registration-cards-grid">
            {filteredRegistrations.map((reg) => {
              const regId = reg.id || reg._id;
              const rawStatus = (reg.paymentStatus || 'pending').toLowerCase();
              const receiptImg = reg.imageUrl || reg.proofUrl;
              const membersCount = reg.participants ? reg.participants.length : (reg.membersCount || 1);
              const teamDisplayName = reg.teamName || (reg.leaderName ? `Team ${reg.leaderName}` : 'Event Team');
              const hasCustomTeam = reg.hasOfficialTeam || (reg.officialTeamName && reg.officialTeamName.trim().length > 0);
              const teamEvents = Array.isArray(reg.events) && reg.events.length > 0
                ? reg.events
                : [{ eventName: reg.event || reg.eventName || 'General Event', membersCount: membersCount }];

              return (
                <TiltCard key={regId} maxTilt={4} glareOpacity={0.08} className="reg-card-tilt">
                  <div className="reg-card-content">
                    {/* Card Top: Team Identity & Payment Badge */}
                    <div className="reg-card-top">
                      <div className="reg-team-cell">
                        <div className={`reg-avatar ${hasCustomTeam ? 'reg-avatar-official' : ''}`}>
                          {hasCustomTeam ? <Crown size={15} /> : teamDisplayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="reg-team-info">
                          <div className="reg-team-tag-row">
                            <span className={`team-type-badge ${hasCustomTeam ? 'team-type-official' : 'team-type-standard'}`}>
                              {hasCustomTeam ? 'OFFICIAL TEAM' : 'TEAM'}
                            </span>
                            {reg.teamCode && (
                              <span className="team-code-badge" title="Official Team Code">
                                <Tag size={9} /> {reg.teamCode}
                              </span>
                            )}
                          </div>
                          <h3 className="reg-team-name" title={teamDisplayName}>
                            {teamDisplayName}
                          </h3>
                        </div>
                      </div>

                      <div className="reg-status-top">
                        <span className={`status-badge status-${rawStatus}`} title={rawStatus === 'pending' ? 'Team registered, awaiting fee verification' : `Team payment status: ${reg.paymentStatus}`}>
                          {rawStatus === 'pending' && !reg.hasPaymentRecord ? 'Pending (Unpaid)' : (reg.paymentStatus || 'Pending')}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Enrolled Events Cluster */}
                    <div className="reg-events-cluster">
                      <div className="reg-events-header">
                        <Calendar size={12} className="text-cyan" />
                        <span className="reg-events-title">ENROLLED EVENTS ({teamEvents.length}):</span>
                      </div>
                      <div className="reg-events-pills-list">
                        {teamEvents.map((evt, eIdx) => (
                          <span key={eIdx} className="reg-event-pill" title={`${evt.eventName} (${evt.membersCount || 1} participant(s))`}>
                            <Tag size={10} className="text-cyan" />
                            <span className="event-pill-name">{evt.eventName}</span>
                            <span className="event-pill-count">({evt.membersCount || (evt.participants ? evt.participants.length : 1)})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Body Details */}
                    <div className="reg-card-body">
                      {/* Team Leader Row */}
                      <div className="reg-info-row">
                        <span className="reg-info-label">
                          <User size={12} className="info-icon" /> Leader:
                        </span>
                        <span className="reg-leader-name" title={reg.leaderName || 'Lead Participant'}>
                          {reg.leaderName || 'Lead Participant'}
                        </span>
                      </div>

                      {/* Participant Roster Row */}
                      {reg.participants && reg.participants.length > 0 && (
                        <div className="reg-roster-row">
                          <span className="reg-info-label">
                            <Users size={12} className="info-icon" /> Team Roster ({membersCount}):
                          </span>
                          <span className="reg-roster-names" title={reg.participants.map(p => p.name).join(', ')}>
                            {reg.participants.map(p => p.name).filter(Boolean).join(', ') || reg.leaderName}
                          </span>
                        </div>
                      )}

                      {/* College Row */}
                      <div className="reg-info-row">
                        <span className="reg-info-label">
                          <Building2 size={12} className="info-icon" /> College:
                        </span>
                        <span className="reg-college-text" title={reg.collegeName || 'N/A'}>
                          {reg.collegeName || 'N/A'}
                        </span>
                      </div>

                      {/* Unified Team Fee Row */}
                      <div className="reg-fee-badge-row">
                        <span className="reg-info-label">
                          <CreditCard size={12} className="info-icon text-success" /> Team Fee:
                        </span>
                        <strong className="reg-fee-amount">{reg.amount || '₹ 200'}</strong>
                      </div>

                      {/* ID & Quota Row */}
                      <div className="reg-info-row">
                        <div
                          className="reg-copyable-id"
                          onClick={() => {
                            navigator.clipboard.writeText(regId);
                            showSuccess('Team ID copied!');
                          }}
                          title="Click to copy team ID"
                        >
                          <span className="reg-id-tag">ID:</span>
                          <span className="code-font">{regId && regId.length > 10 ? `${regId.slice(0, 8)}...${regId.slice(-4)}` : regId}</span>
                          <Copy size={11} className="id-copy-icon" />
                        </div>

                        <span className={`quota-tag ${reg.quotaStatus?.includes('1/1') ? 'quota-full' : ''}`}>
                          {reg.quotaStatus || 'Under Quota'}
                        </span>
                      </div>

                      {/* Contact Info & Receipt Thumbnail */}
                      <div className="reg-contact-strip">
                        <div className="reg-contact-details">
                          {reg.email && (
                            <div className="reg-contact-item" title={reg.email}>
                              <Mail size={11} className="contact-icon" />
                              <span className="contact-text">{reg.email}</span>
                            </div>
                          )}
                          {reg.phone && (
                            <div className="reg-contact-item" title={reg.phone}>
                              <Phone size={11} className="contact-icon" />
                              <span className="contact-text">{reg.phone}</span>
                            </div>
                          )}
                        </div>
                        {receiptImg && (
                          <div
                            className="reg-receipt-thumb-wrap"
                            onClick={() => setInspectingReg(reg)}
                            title="View Uploaded UPI Receipt"
                          >
                            <img
                              src={resolveImageUrl(receiptImg) || DEFAULT_RECEIPT_PLACEHOLDER}
                              alt="Receipt"
                              className="reg-receipt-thumb"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="reg-receipt-zoom">
                              <Eye size={10} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="reg-card-footer">
                      <div className="reg-footer-status-btns">
                        {rawStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovePayment(reg, 'Approved')}
                              className="btn-reg-action btn-reg-approve"
                              title="Approve Team Payment"
                              disabled={actionLoading}
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleApprovePayment(reg, 'Rejected')}
                              className="btn-reg-action btn-reg-reject"
                              title="Reject Team Payment"
                              disabled={actionLoading}
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {rawStatus === 'approved' && (
                          <>
                            <button
                              onClick={() => handleApprovePayment(reg, 'Pending')}
                              className="btn-reg-action btn-reg-pending"
                              title="Revert Team Payment to Pending"
                              disabled={actionLoading}
                            >
                              <RotateCcw size={13} />
                              <span>Set Pending</span>
                            </button>
                            <button
                              onClick={() => handleApprovePayment(reg, 'Rejected')}
                              className="btn-reg-action btn-reg-reject"
                              title="Reject Team Payment"
                              disabled={actionLoading}
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {rawStatus === 'rejected' && (
                          <>
                            <button
                              onClick={() => handleApprovePayment(reg, 'Approved')}
                              className="btn-reg-action btn-reg-approve"
                              title="Approve Team Payment"
                              disabled={actionLoading}
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleApprovePayment(reg, 'Pending')}
                              className="btn-reg-action btn-reg-pending"
                              title="Revert Team Payment to Pending"
                              disabled={actionLoading}
                            >
                              <RotateCcw size={13} />
                              <span>Set Pending</span>
                            </button>
                          </>
                        )}
                      </div>

                      <div className="reg-footer-tool-btns">
                        <button
                          onClick={() => setInspectingReg(reg)}
                          className="btn-reg-action btn-reg-view"
                          title="View Full Team Details & Enrolled Events"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>

                        <button
                          onClick={() => setEditingReg(reg)}
                          className="btn-reg-action btn-reg-edit"
                          title="Edit Team Details"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeletingReg(reg)}
                          className="btn-reg-action btn-reg-delete"
                          title="Delete Team & Registrations"
                          disabled={actionLoading}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        ) : (
          /* ==========================================================================
             Table View
             ========================================================================== */
          <div className="table-responsive">
            <table className="registrations-table">
              <thead>
                <tr>
                  <th>TEAM ID</th>
                  <th>TEAM & LEADER</th>
                  <th>COLLEGE NAME</th>
                  <th>ENROLLED EVENTS</th>
                  <th>MEMBERS</th>
                  <th>QUOTA</th>
                  <th>PAYMENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => {
                  const regId = reg.id || reg._id;
                  const isApproved = (reg.paymentStatus || '').toLowerCase() === 'approved';
                  const rawStatus = (reg.paymentStatus || 'pending').toLowerCase();
                  const receiptImg = reg.imageUrl || reg.proofUrl;
                  const teamEvents = Array.isArray(reg.events) && reg.events.length > 0
                    ? reg.events
                    : [{ eventName: reg.event || reg.eventName || 'General Event', membersCount: reg.membersCount || 1 }];

                  return (
                    <tr key={regId}>
                      <td className="code-font" title={`Click to copy: ${regId}`} onClick={() => {
                        navigator.clipboard.writeText(regId);
                        showSuccess('Team ID copied!');
                      }} style={{ cursor: 'pointer' }}>
                        {regId && regId.length > 10 ? `${regId.slice(0, 6)}...${regId.slice(-4)}` : regId}
                      </td>
                      <td>
                        <div className="team-leader-cell">
                          {receiptImg ? (
                            <div 
                              className="table-receipt-thumb-wrap"
                              onClick={() => setInspectingReg(reg)}
                              title="Click to view receipt proof"
                            >
                              <img
                                src={resolveImageUrl(receiptImg) || DEFAULT_RECEIPT_PLACEHOLDER}
                                alt="Receipt"
                                className="table-receipt-thumb"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div className="table-receipt-zoom">
                                <Eye size={11} />
                              </div>
                            </div>
                          ) : null}
                          <div className="team-leader-info">
                            <strong className="team-highlight" title={reg.teamName || 'Solo Participant'}>
                              {reg.teamName || 'Solo Participant'}
                            </strong>
                            {reg.leaderName && (
                              <span className="leader-name-sub" title={`Leader: ${reg.leaderName}`}>
                                <User size={11} className="sub-icon" /> {reg.leaderName}
                              </span>
                            )}
                            {reg.email && (
                              <span className="leader-email-sub" title={reg.email}>
                                <Mail size={11} className="sub-icon" /> {reg.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="college-cell-name" title={reg.collegeName || 'N/A'}>
                          {reg.collegeName || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', maxWidth: '280px' }}>
                          {teamEvents.map((evt, eIdx) => (
                            <span key={eIdx} className="event-tag-pill" title={evt.eventName}>
                              {evt.eventName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="center-cell">
                        <span className="member-count-badge">
                          <Users size={12} /> {reg.participants ? reg.participants.length : (reg.membersCount || 1)}
                        </span>
                      </td>
                      <td>
                        <span className="quota-tag">
                          {reg.quotaStatus || 'Under Quota'}
                        </span>
                      </td>
                      <td>
                        <div>
                          <span className={`status-badge status-${rawStatus}`} title={rawStatus === 'pending' ? 'Team registered, awaiting fee upload' : `Payment status: ${reg.paymentStatus}`}>
                            {rawStatus === 'pending' && !reg.hasPaymentRecord ? 'Pending (Unpaid)' : (reg.paymentStatus || 'Pending')}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{reg.amount || '₹ 200'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          {!isApproved ? (
                            <button
                              onClick={() => handleApprovePayment(reg, 'Approved')}
                              className="btn-icon btn-approve"
                              title="Approve Team Payment"
                              disabled={actionLoading}
                            >
                              <Check size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApprovePayment(reg, 'Pending')}
                              className="btn-icon btn-pending"
                              title="Revert Status to Pending"
                              disabled={actionLoading}
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}

                          {rawStatus !== 'rejected' && (
                            <button
                              onClick={() => handleApprovePayment(reg, 'Rejected')}
                              className="btn-icon btn-reject"
                              title="Reject Registration Payment"
                              disabled={actionLoading}
                            >
                              <XCircle size={14} />
                            </button>
                          )}

                          {rawStatus === 'rejected' && !isApproved && (
                            <button
                              onClick={() => handleApprovePayment(reg, 'Pending')}
                              className="btn-icon btn-pending"
                              title="Revert Status to Pending"
                              disabled={actionLoading}
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => setInspectingReg(reg)}
                            className="btn-icon btn-view"
                            title="View Full Team Details"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => setEditingReg(reg)}
                            className="btn-icon btn-edit"
                            title="Edit Team Details"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => setDeletingReg(reg)}
                            className="btn-icon btn-delete"
                            title="Delete Team & Registrations"
                            disabled={actionLoading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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
              const rawStatus = (reg.paymentStatus || 'pending').toLowerCase();
              const isApproved = rawStatus.includes('app') || rawStatus === 'success' || rawStatus === 'verified';
              const teamEvents = Array.isArray(reg.events) && reg.events.length > 0
                ? reg.events
                : [{ eventName: reg.event || reg.eventName || 'General Event', membersCount: reg.membersCount || 1 }];

              return (
                <div key={regId} className="mobile-data-card">
                  {/* Header */}
                  <div className="mobile-card-header">
                    <div>
                      <strong className="team-highlight" style={{ fontSize: '1rem' }}>{reg.teamName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lead: {reg.leaderName}</div>
                    </div>
                    <span className={`status-badge status-${rawStatus}`}>
                      {reg.paymentStatus || 'Pending'}
                    </span>
                  </div>

                {/* Body Details */}
                <div className="mobile-card-body">
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Team ID:</span>
                    <div className="mobile-id-badge">
                      <span className="code-font">{regId}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(regId);
                          showToast('Team ID copied!');
                        }}
                        className="btn-copy-mini"
                        title="Copy Team ID"
                        aria-label="Copy Team ID"
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="mobile-card-row" style={{ alignItems: 'flex-start' }}>
                    <span className="mobile-card-label">Events ({teamEvents.length}):</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'flex-end', maxWidth: '65%' }}>
                      {teamEvents.map((evt, eIdx) => (
                        <span key={eIdx} className="event-tag" style={{ fontSize: '0.72rem' }}>{evt.eventName}</span>
                      ))}
                    </div>
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

                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Team Fee:</span>
                    <strong style={{ color: 'var(--success)' }}>{reg.amount || '₹ 200'}</strong>
                  </div>

                  {reg.utr && reg.utr !== 'N/A' && (
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
                      className="btn btn-warning btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={actionLoading}
                    >
                      <RotateCcw size={13} /> Set Pending
                    </button>
                  )}

                  {rawStatus !== 'rejected' && (
                    <button
                      onClick={() => handleApprovePayment(reg, 'Rejected')}
                      className="btn btn-outline-danger btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={actionLoading}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  )}

                  {rawStatus === 'rejected' && !isApproved && (
                    <button
                      onClick={() => handleApprovePayment(reg, 'Pending')}
                      className="btn btn-warning btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={actionLoading}
                    >
                      <RotateCcw size={13} /> Set Pending
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
        <Modal isOpen={!!inspectingReg} onClose={() => setInspectingReg(null)} maxWidth="740px">
          <div className="modal-header">
            <h3><Receipt size={19} /> Team Registration & Payment Details</h3>
            <button className="modal-close" onClick={() => setInspectingReg(null)}>&times;</button>
          </div>
          <p className="modal-subtitle">
            Team Reference: <code>{inspectingReg.id || inspectingReg._id}</code>
          </p>

          <div className="inspect-grid">
            {/* Left Column: Team & College */}
            <div className="inspect-col">
              <h4 className="inspect-section-title"><Users size={15} /> Team & College Profile</h4>
              
              <div className="user-detail-card">
                <div className="detail-row">
                  <span className="detail-label">Team Name</span>
                  <span className="font-bold">{inspectingReg.teamName || 'Solo Participant'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Team Leader</span>
                  <span className="font-bold">{inspectingReg.leaderName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email Address</span>
                  <span>{inspectingReg.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone Number</span>
                  <span className="font-bold">{inspectingReg.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Institution</span>
                  <span>{inspectingReg.collegeName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Registration Date</span>
                  <span className="date-text">
                    {(() => {
                      const dt = inspectingReg.registeredAt || inspectingReg.createdAt || inspectingReg.date;
                      if (!dt) return 'N/A';
                      try {
                        const d = new Date(dt);
                        return isNaN(d.getTime()) ? String(dt) : d.toLocaleString();
                      } catch {
                        return String(dt);
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Enrolled Events Breakdown */}
              <h4 className="inspect-section-title" style={{ marginTop: '1rem' }}>
                <Calendar size={15} /> Enrolled Events ({inspectingReg.events?.length || 1})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(inspectingReg.events || [{ eventName: inspectingReg.event, participants: inspectingReg.participants }]).map((evt, eIdx) => (
                  <div key={eIdx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.84rem', color: 'var(--text-heading)' }}>{evt.eventName}</strong>
                      <span className="event-tag" style={{ fontSize: '0.7rem' }}>{evt.participants?.length || evt.membersCount || 1} Participant(s)</span>
                    </div>
                    {evt.participants && evt.participants.length > 0 && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Roster: {evt.participants.map(p => (typeof p === 'object' ? p.name : p)).filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Team Members List */}
              <h4 className="inspect-section-title" style={{ marginTop: '1rem' }}><Users size={15} /> Combined Team Roster</h4>
              <div className="members-roster-box">
                {(() => {
                  const membersList = (Array.isArray(inspectingReg.participants) && inspectingReg.participants.length > 0)
                    ? inspectingReg.participants
                    : (Array.isArray(inspectingReg.members) && inspectingReg.members.length > 0)
                      ? inspectingReg.members
                      : null;

                  if (membersList && membersList.length > 0) {
                    return membersList.map((p, idx) => {
                      const pName = typeof p === 'object' ? (p.name || p.userName || p.fullName || `Member ${idx + 1}`) : String(p || `Member ${idx + 1}`);
                      const pPhone = typeof p === 'object' ? p.phone : null;
                      const pEmail = typeof p === 'object' ? p.email : null;
                      return (
                        <div key={idx} className="member-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                            <span className="member-num">{idx + 1}</span>
                            <strong className="member-name">{pName}</strong>
                          </div>
                          {(pPhone || pEmail) && (
                            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '1.75rem' }}>
                              {pPhone && <span><Phone size={10} style={{ verticalAlign: 'middle' }} /> {pPhone}</span>}
                              {pEmail && <span><Mail size={10} style={{ verticalAlign: 'middle' }} /> {pEmail}</span>}
                            </div>
                          )}
                        </div>
                      );
                    });
                  }

                  return (
                    <div className="member-item">
                      <span className="member-num">1</span>
                      <span className="member-name">{inspectingReg.leaderName || 'Solo Participant'}</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right Column: Payment Verification */}
            <div className="inspect-col">
              <h4 className="inspect-section-title"><CreditCard size={15} /> Team Payment Verification</h4>

              <div className="user-detail-card">
                <div className="detail-row">
                  <span className="detail-label">Payment Status</span>
                  <span className={`status-badge status-${(inspectingReg.paymentStatus || 'pending').toLowerCase()}`}>
                    {inspectingReg.paymentStatus || 'Pending'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Amount Billed (Whole Team)</span>
                  <strong className="font-bold text-success" style={{ fontSize: '1.05rem' }}>
                    {typeof inspectingReg.amount === 'number' ? `₹ ${inspectingReg.amount}` : (inspectingReg.amount || '₹ 200')}
                  </strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">UPI Reference (UTR)</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <code className="code-font font-bold text-cyan">{inspectingReg.utr || 'N/A'}</code>
                    {inspectingReg.utr && inspectingReg.utr !== 'N/A' && (
                      <button 
                        onClick={() => handleCopyUtr(inspectingReg.utr)}
                        className="btn-copy-mini"
                        title="Copy UTR Number"
                      >
                        {copiedUtr ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                      </button>
                    )}
                  </div>
                </div>
                {inspectingReg.paymentTimestamp && (
                  <div className="detail-row">
                    <span className="detail-label">Payment Timestamp</span>
                    <span className="date-text">
                      {(() => {
                        try {
                          const d = new Date(inspectingReg.paymentTimestamp);
                          return isNaN(d.getTime()) ? String(inspectingReg.paymentTimestamp) : d.toLocaleString();
                        } catch {
                          return String(inspectingReg.paymentTimestamp);
                        }
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {/* Cloudinary / Attached Receipt Proof Preview */}
              {(inspectingReg.proofUrl || inspectingReg.imageUrl) ? (
                <div style={{ marginTop: '1rem' }}>
                  <h4 className="inspect-section-title"><Receipt size={14} /> Attached Payment Receipt</h4>
                  <div className="proof-image-wrapper" style={{ marginTop: '0.35rem' }}>
                    <img 
                      src={resolveImageUrl(inspectingReg.proofUrl || inspectingReg.imageUrl) || DEFAULT_RECEIPT_PLACEHOLDER} 
                      alt="Payment Receipt Proof" 
                      className="receipt-proof-img"
                      style={{ maxHeight: '200px', cursor: 'pointer' }}
                      onClick={() => {
                        const targetUrl = resolveImageUrl(inspectingReg.proofUrl || inspectingReg.imageUrl);
                        if (targetUrl) window.open(targetUrl, '_blank');
                      }}
                      title="Click to view full image in new tab"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_RECEIPT_PLACEHOLDER;
                      }}
                    />
                    <div className="proof-meta-strip">
                      <span className="proof-meta-badge">Verified Receipt</span>
                      <a 
                        href={resolveImageUrl(inspectingReg.proofUrl || inspectingReg.imageUrl) || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link-external"
                        onClick={(e) => {
                          const targetUrl = resolveImageUrl(inspectingReg.proofUrl || inspectingReg.imageUrl);
                          if (!targetUrl) e.preventDefault();
                        }}
                      >
                        Open Full Image ↗
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-receipt-notice" style={{ marginTop: '0.85rem', padding: '0.75rem 0.95rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '9px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--warning)', fontWeight: 700, fontSize: '0.82rem' }}>
                    <AlertCircle size={14} /> No UPI Receipt Uploaded
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    This team registered on the portal but has not uploaded a UPI screenshot or UTR number yet. You can mark it <strong>Approved</strong> below if payment was received in cash or offline at the desk.
                  </p>
                </div>
              )}

              {/* Quick Status Action inside Modal */}
              <div className="modal-status-actions" style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Change Payment Status:</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {inspectingReg.paymentStatus?.toLowerCase() !== 'approved' && (
                    <button 
                      onClick={() => handleApprovePayment(inspectingReg, 'Approved')}
                      className="btn btn-success btn-sm"
                      disabled={actionLoading}
                    >
                      <CheckCircle2 size={13} /> Mark Approved
                    </button>
                  )}
                  {inspectingReg.paymentStatus?.toLowerCase() !== 'pending' && (
                    <button 
                      onClick={() => handleApprovePayment(inspectingReg, 'Pending')}
                      className="btn btn-warning btn-sm"
                      disabled={actionLoading}
                    >
                      <RotateCcw size={13} /> Revert to Pending
                    </button>
                  )}
                  {inspectingReg.paymentStatus?.toLowerCase() !== 'rejected' && (
                    <button 
                      onClick={() => handleApprovePayment(inspectingReg, 'Rejected')}
                      className="btn btn-danger btn-sm"
                      disabled={actionLoading}
                    >
                      <XCircle size={13} /> Reject Payment
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
            <button className="btn btn-secondary" onClick={() => setInspectingReg(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Registration Details Modal */}
      {editingReg && (
        <Modal isOpen={!!editingReg} onClose={() => setEditingReg(null)} maxWidth="580px">
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
                value={editingReg.event || editingReg.eventName || ''}
                onChange={(e) => setEditingReg({ ...editingReg, event: e.target.value, eventName: e.target.value })}
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
        </Modal>
      )}

      {/* Delete Registration Confirmation Modal */}
      {deletingReg && (
        <Modal isOpen={!!deletingReg} onClose={() => setDeletingReg(null)} maxWidth="500px" isDanger={true}>
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>College: {deletingReg.collegeName} • Event: {deletingReg.event || deletingReg.eventName}</div>
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
        </Modal>
      )}
    </div>
  );
};

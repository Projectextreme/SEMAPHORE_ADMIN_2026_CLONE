import { useState, useEffect, useCallback, Fragment } from 'react';
import { useToast } from '../../context/ToastContext';
import { apiService } from '../../services/apiService';
import {
  FileSpreadsheet,
  Download,
  Building2,
  Users,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Filter,
  Layers,
  ArrowUpRight,
  UserCheck,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Tag,
  AlertCircle
} from 'lucide-react';
import { CountUp } from '../common/CountUp';
import { TiltCard } from '../common/TiltCard';
import './ReportsHub.css';

export const ReportsHub = () => {
  const { showSuccess, showError } = useToast();

  // Active Tab: 'teams' | 'events' | 'colleges' | 'summary'
  const [activeTab, setActiveTab] = useState('teams');

  // Loading & refreshing states
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  // Data states
  const [summaryData, setSummaryData] = useState(null);
  const [teamsData, setTeamsData] = useState({ count: 0, teams: [] });
  const [eventsData, setEventsData] = useState({ eventsCount: 0, totalParticipantsCount: 0, events: [] });
  const [collegesData, setCollegesData] = useState({ collegesCount: 0, colleges: [] });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [expandedItems, setExpandedItems] = useState({});

  // 1. Fetch Dashboard Summary
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const data = await apiService.getDashboardSummaryReport();
      if (data?.summary) {
        setSummaryData(data.summary);
      } else if (data) {
        setSummaryData(data);
      }
    } catch (err) {
      console.warn('Summary report endpoint fallback:', err);
      // Fallback: derive summary from basic collections if available
      try {
        const [users, events, regs, payments] = await Promise.all([
          apiService.getAllUsers().catch(() => []),
          apiService.getAllEvents().catch(() => []),
          apiService.getRegistrations().catch(() => []),
          apiService.getRecentPayments().catch(() => ({ payments: [] }))
        ]);
        const uList = Array.isArray(users) ? users : [];
        const eList = Array.isArray(events) ? events : [];
        const rList = Array.isArray(regs) ? regs : [];
        const pList = payments?.payments || (Array.isArray(payments) ? payments : []);

        const approved = rList.length > 0
          ? rList.filter(r => (r.paymentStatus || '').toLowerCase().includes('app') || (r.paymentStatus || '').toLowerCase() === 'success')
          : pList.filter(p => (p.status || '').toLowerCase().includes('app') || (p.rawStatus || '').toLowerCase().includes('app'));

        const pending = rList.length > 0
          ? rList.filter(r => (r.paymentStatus || '').toLowerCase().includes('pend'))
          : pList.filter(p => (p.status || '').toLowerCase().includes('pend') || (p.rawStatus || '').toLowerCase().includes('pend'));

        const rev = approved.reduce((sum, r) => sum + (r.amountNumber || r.amountNum || 200), 0);

        setSummaryData({
          totalUsers: uList.length,
          totalColleges: new Set(rList.map(r => r.collegeName).filter(Boolean)).size,
          totalTeams: rList.length || pList.length || 0,
          totalEvents: eList.length,
          totalRegistrations: rList.length || pList.length || 0,
          totalPayments: pList.length || rList.length || 0,
          approvedPaymentsCount: approved.length,
          pendingPaymentsCount: pending.length,
          totalRevenue: rev
        });
      } catch {
        // Keep null if failed
      }
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  // 2. Fetch Tab-specific JSON Data
  const loadTabData = useCallback(async (tabName = activeTab) => {
    setIsLoadingData(true);
    try {
      if (tabName === 'teams') {
        const res = await apiService.getTeamsReport();
        setTeamsData({
          count: res?.count || (res?.teams ? res.teams.length : 0),
          teams: res?.teams || (Array.isArray(res) ? res : [])
        });
      } else if (tabName === 'events') {
        const evId = selectedEventId !== 'all' ? selectedEventId : null;
        const res = await apiService.getEventsReport(evId);
        setEventsData({
          eventsCount: res?.eventsCount || (res?.events ? res.events.length : 0),
          totalParticipantsCount: res?.totalParticipantsCount || 0,
          events: res?.events || (Array.isArray(res) ? res : [])
        });
      } else if (tabName === 'colleges') {
        const res = await apiService.getCollegesReport();
        setCollegesData({
          collegesCount: res?.collegesCount || (res?.colleges ? res.colleges.length : 0),
          colleges: res?.colleges || (Array.isArray(res) ? res : [])
        });
      }
    } catch (err) {
      console.error(`Error loading report tab ${tabName}:`, err);
      showError(`Failed to load ${tabName} report data. Please check backend connection.`);
    } finally {
      setIsLoadingData(false);
    }
  }, [activeTab, selectedEventId, showError]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, selectedEventId, loadTabData]);

  // Handle 1-Click Excel Downloads
  const handleDownload = async (type, eventId = null) => {
    setDownloadingType(type);
    try {
      if (type === 'all') {
        await apiService.exportAllMaster('Semaphore_2026_Master_Export.xlsx');
        showSuccess('Master Consolidated Workbook downloaded (.xlsx)');
      } else if (type === 'teams') {
        await apiService.exportTeams('Semaphore_2026_Teams_Report.xlsx');
        showSuccess('Teams Report downloaded (.xlsx)');
      } else if (type === 'events') {
        if (eventId) {
          await apiService.exportSingleEvent(eventId, `Semaphore_2026_Event_${eventId}_Report.xlsx`);
          showSuccess(`Event Report downloaded (.xlsx)`);
        } else {
          await apiService.exportEvents(null, 'Semaphore_2026_Events_Report.xlsx');
          showSuccess('Events & Participants Report downloaded (.xlsx)');
        }
      } else if (type === 'colleges') {
        await apiService.exportColleges('Semaphore_2026_Colleges_Report.xlsx');
        showSuccess('Colleges 2-Teams Report downloaded (.xlsx)');
      }
    } catch (err) {
      console.error('Download error:', err);
      showError('Failed to initiate download. Please try again.');
    } finally {
      setTimeout(() => setDownloadingType(null), 800);
    }
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    showSuccess(`${label || 'Value'} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filtered Teams List
  const filteredTeams = (teamsData.teams || []).filter((team) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (team.teamName || '').toLowerCase().includes(q) ||
      (team.teamId || '').toLowerCase().includes(q) ||
      (team.collegeName || '').toLowerCase().includes(q) ||
      (team.leader?.name || '').toLowerCase().includes(q) ||
      (team.paymentUtr || '').toLowerCase().includes(q);

    const status = (team.paymentStatus || '').toLowerCase();
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'approved' && (status.includes('app') || status === 'success' || status === 'verified')) ||
      (statusFilter === 'pending' && (status.includes('pend') || status === 'created'));

    return matchesSearch && matchesStatus;
  });

  // Filtered Colleges List
  const filteredColleges = (collegesData.colleges || []).filter((college) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (college.collegeName || '').toLowerCase().includes(q) ||
      (college.team1?.teamName || '').toLowerCase().includes(q) ||
      (college.team1?.teamId || '').toLowerCase().includes(q) ||
      (college.team2?.teamName || '').toLowerCase().includes(q) ||
      (college.team2?.teamId || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="reports-hub-page">
      {/* Page Header */}
      <div className="reports-header-section">
        <div className="reports-header-title-box">
          <div className="reports-badge">
            <Sparkles size={14} className="sparkle-icon" />
            <span>SEMAPHORE 2026 INTELLIGENCE</span>
          </div>
          <h1 className="reports-main-title">Admin Export & Reports Hub</h1>
          <p className="reports-subtext">
            Consolidated Festival Reporting, Real-time JSON Tables, and High-Performance 1-Click Excel Workbooks.
          </p>
        </div>

        <div className="reports-header-actions">
          <button 
            className="btn-refresh-reports"
            onClick={() => {
              fetchSummary();
              loadTabData(activeTab);
            }}
            disabled={isLoadingData || isLoadingSummary}
            title="Refresh All Reports"
          >
            <RefreshCw size={15} className={isLoadingData || isLoadingSummary ? 'spin-icon' : ''} />
            <span>Sync Live Data</span>
          </button>

          <button
            className="btn-master-export-top btn-glow-sheen"
            onClick={() => handleDownload('all')}
            disabled={downloadingType === 'all'}
          >
            <Download size={16} />
            <span>{downloadingType === 'all' ? 'Generating...' : 'Master Consolidated (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards with 3D Tilt & CountUp Numbers */}
      <div className="reports-kpi-grid">
        <TiltCard maxTilt={5} glareOpacity={0.12} className="reports-kpi-tilt">
          <div className="kpi-card kpi-revenue">
            <div className="kpi-top">
              <span className="kpi-label">Total Festival Revenue</span>
              <div className="kpi-icon-wrap bg-emerald">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="kpi-value">
              <CountUp prefix="₹ " value={summaryData?.totalRevenue ?? 0} />
            </div>
            <div className="kpi-footer">
              <span className="kpi-subtext text-emerald">
                <TrendingUp size={13} /> <CountUp value={summaryData?.approvedPaymentsCount ?? 0} suffix=" Approved Payments" />
              </span>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="reports-kpi-tilt">
          <div className="kpi-card kpi-teams">
            <div className="kpi-top">
              <span className="kpi-label">Total Teams</span>
              <div className="kpi-icon-wrap bg-indigo">
                <Users size={18} />
              </div>
            </div>
            <div className="kpi-value">
              <CountUp value={summaryData?.totalTeams ?? teamsData.count ?? 0} />
            </div>
            <div className="kpi-footer">
              <span className="kpi-subtext text-indigo">
                Across {summaryData?.totalColleges ?? collegesData.collegesCount ?? 0} Colleges
              </span>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="reports-kpi-tilt">
          <div className="kpi-card kpi-events">
            <div className="kpi-top">
              <span className="kpi-label">Events & Contests</span>
              <div className="kpi-icon-wrap bg-cyan">
                <Calendar size={18} />
              </div>
            </div>
            <div className="kpi-value">
              <CountUp value={summaryData?.totalEvents ?? eventsData.eventsCount ?? 0} />
            </div>
            <div className="kpi-footer">
              <span className="kpi-subtext text-cyan">
                <CountUp value={summaryData?.totalRegistrations ?? 0} suffix=" Registrations Recorded" />
              </span>
            </div>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="reports-kpi-tilt">
          <div className="kpi-card kpi-payments">
            <div className="kpi-top">
              <span className="kpi-label">Pending Verifications</span>
              <div className="kpi-icon-wrap bg-amber">
                <Clock size={18} />
              </div>
            </div>
            <div className="kpi-value">
              <CountUp value={summaryData?.pendingPaymentsCount ?? 0} />
            </div>
            <div className="kpi-footer">
              <span className="kpi-subtext text-amber">
                Out of {summaryData?.totalPayments ?? 0} Total Submissions
              </span>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Master Export Banner Card */}
      <div className="master-export-banner">
        <div className="banner-glow-effect" />
        <div className="banner-content">
          <div className="banner-icon-box">
            <FileSpreadsheet size={28} className="banner-excel-icon" />
          </div>
          <div className="banner-text-box">
            <div className="banner-title-row">
              <h3>Consolidated Master Workbook (.xlsx)</h3>
              <span className="banner-badge">MASTER COMPILATION</span>
            </div>
            <p className="banner-desc">
              Exports an all-inclusive Excel workbook containing 3 master sheets: 
              <strong> Colleges & Teams</strong>, <strong>Team Participants</strong>, and <strong>Event Participants</strong>.
            </p>
            <div className="banner-quick-chips">
              <button 
                className="chip-btn"
                onClick={() => handleDownload('teams')}
                disabled={downloadingType === 'teams'}
              >
                <Download size={12} /> Teams Summary (.xlsx)
              </button>
              <button 
                className="chip-btn"
                onClick={() => handleDownload('events')}
                disabled={downloadingType === 'events'}
              >
                <Download size={12} /> Events Roster (.xlsx)
              </button>
              <button 
                className="chip-btn"
                onClick={() => handleDownload('colleges')}
                disabled={downloadingType === 'colleges'}
              >
                <Download size={12} /> Colleges 2-Teams (.xlsx)
              </button>
            </div>
          </div>
        </div>

        <div className="banner-action-right">
          <button
            className="btn-download-master"
            onClick={() => handleDownload('all')}
            disabled={downloadingType === 'all'}
          >
            <Download size={18} />
            <span>{downloadingType === 'all' ? 'Exporting File...' : 'Download Master Export'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="reports-tabs-bar">
        <button
          className={`report-tab-btn ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => { setActiveTab('teams'); setSearchQuery(''); }}
        >
          <Users size={16} />
          <span>Teams Report</span>
          <span className="tab-count-pill">{teamsData.count || 0}</span>
        </button>

        <button
          className={`report-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => { setActiveTab('events'); setSearchQuery(''); }}
        >
          <Calendar size={16} />
          <span>Events & Participants</span>
          <span className="tab-count-pill">{eventsData.eventsCount || 0}</span>
        </button>

        <button
          className={`report-tab-btn ${activeTab === 'colleges' ? 'active' : ''}`}
          onClick={() => { setActiveTab('colleges'); setSearchQuery(''); }}
        >
          <Building2 size={16} />
          <span>Colleges 2-Teams Matrix</span>
          <span className="tab-count-pill">{collegesData.collegesCount || 0}</span>
        </button>

        <button
          className={`report-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <TrendingUp size={16} />
          <span>Festival Summary & Stats</span>
        </button>
      </div>

      {/* Tab Controls (Search & Quick Action) */}
      {activeTab !== 'summary' && (
        <div className="reports-controls-bar">
          <div className="controls-left">
            <div className="reports-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder={
                  activeTab === 'teams' ? "Search team name, ID, college, leader, UTR..." :
                  activeTab === 'events' ? "Search participant, college, team ID..." :
                  "Search college name or team..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            {activeTab === 'teams' && (
              <div className="filter-select-wrapper">
                <Filter size={14} className="filter-icon" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-dropdown"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="approved">Approved Only</option>
                  <option value="pending">Pending Only</option>
                </select>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="filter-select-wrapper">
                <Tag size={14} className="filter-icon" />
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="filter-dropdown"
                >
                  <option value="all">All Events ({eventsData.events?.length || 0})</option>
                  {(eventsData.events || []).map((ev, idx) => (
                    <option key={ev.eventId || ev._id || idx} value={ev.eventId || ev._id || ev.title}>
                      {ev.title || ev.eventTitle || `Event ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="controls-right">
            {activeTab === 'teams' && (
              <button
                className="btn-tab-export"
                onClick={() => handleDownload('teams')}
                disabled={downloadingType === 'teams'}
              >
                <Download size={15} />
                <span>{downloadingType === 'teams' ? 'Exporting...' : 'Export Teams (.xlsx)'}</span>
              </button>
            )}

            {activeTab === 'events' && (
              <button
                className="btn-tab-export"
                onClick={() => handleDownload('events', selectedEventId !== 'all' ? selectedEventId : null)}
                disabled={downloadingType === 'events'}
              >
                <Download size={15} />
                <span>
                  {downloadingType === 'events' 
                    ? 'Exporting...' 
                    : selectedEventId !== 'all' 
                      ? 'Export Selected Event (.xlsx)' 
                      : 'Export All Events (.xlsx)'
                  }
                </span>
              </button>
            )}

            {activeTab === 'colleges' && (
              <button
                className="btn-tab-export"
                onClick={() => handleDownload('colleges')}
                disabled={downloadingType === 'colleges'}
              >
                <Download size={15} />
                <span>{downloadingType === 'colleges' ? 'Exporting...' : 'Export Colleges (.xlsx)'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab 1: Teams Report */}
      {activeTab === 'teams' && (
        <div className="report-content-panel">
          {isLoadingData ? (
            <div className="report-loading-state">
              <div className="spinner"></div>
              <span>Fetching Teams Report from Backend...</span>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="report-empty-state">
              <Users size={48} className="empty-icon" />
              <h3>No Teams Found</h3>
              <p>No team records matched your search query or filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="teams-table-container desktop-only">
                <table className="reports-data-table">
                  <thead>
                    <tr>
                      <th>TEAM INFO</th>
                      <th>COLLEGE</th>
                      <th>LEADER CONTACT</th>
                      <th>MEMBERS</th>
                      <th>EVENTS & FEES</th>
                      <th>PAYMENT & UTR</th>
                      <th>TOTAL PAID</th>
                      <th>DETAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team, idx) => {
                      const isExpanded = !!expandedItems[team.teamId || idx];
                      const isApproved = (team.paymentStatus || '').toLowerCase().includes('app');
                      const rawMembers = Array.isArray(team.members) ? team.members : [];
                      const allMembers = rawMembers.length > 0
                        ? rawMembers
                        : (team.leader?.name ? [{ name: team.leader.name, email: team.leader.email, phone: team.leader.phone, role: 'Team Leader' }] : []);

                      return (
                        <Fragment key={team.teamId || idx}>
                          <tr className={isExpanded ? 'row-expanded' : ''}>
                            <td>
                              <div className="team-cell-info">
                                <span className="team-name-primary">{team.teamName || 'Unnamed Team'}</span>
                                <div className="team-id-badge" onClick={() => handleCopy(team.teamId, 'Team ID')}>
                                  <span>{team.teamId || 'N/A'}</span>
                                  {copiedText === team.teamId ? <Check size={11} className="text-emerald" /> : <Copy size={11} />}
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="college-cell">
                                <Building2 size={13} className="cell-sub-icon" />
                                <span>{team.collegeName || 'Unknown College'}</span>
                              </div>
                            </td>

                            <td>
                              <div className="leader-cell">
                                <span className="leader-name">{team.leader?.name || 'Leader N/A'}</span>
                                {team.leader?.email && (
                                  <span className="leader-contact">
                                    <Mail size={11} /> {team.leader.email}
                                  </span>
                                )}
                                {team.leader?.phone && (
                                  <span className="leader-contact">
                                    <Phone size={11} /> {team.leader.phone}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <span className="members-count-badge">
                                <Users size={12} /> {team.membersCount || (allMembers.length || 1)} Members
                              </span>
                            </td>

                            <td>
                              <div className="events-cell-list">
                                {Array.isArray(team.registeredEvents) && team.registeredEvents.length > 0 ? (
                                  team.registeredEvents.map((ev, evIdx) => (
                                    <span key={evIdx} className="event-pill">
                                      {typeof ev === 'object' ? ev.title : ev}
                                      {typeof ev === 'object' && ev.registrationFee !== undefined && (
                                        <strong className="fee-tag">₹{ev.registrationFee}</strong>
                                      )}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-muted">No events listed</span>
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="payment-cell-info">
                                <span className={`status-pill ${isApproved ? 'status-approved' : 'status-pending'}`}>
                                  {isApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                  {team.paymentStatus || 'Pending'}
                                </span>
                                {team.paymentUtr && (
                                  <div className="utr-copy-tag" onClick={() => handleCopy(team.paymentUtr, 'UTR')}>
                                    <span>UTR: {team.paymentUtr}</span>
                                    {copiedText === team.paymentUtr ? <Check size={11} className="text-emerald" /> : <Copy size={11} />}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="amount-cell">
                                <span className="amount-val">₹ {Number(team.totalAmountPaid ?? team.totalFee ?? 0).toLocaleString()}</span>
                              </div>
                            </td>

                            <td>
                              <button
                                className="btn-toggle-expand"
                                onClick={() => toggleExpand(team.teamId || idx)}
                                title="Toggle Full Member Roster"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </td>
                          </tr>

                          {/* Inline Expanded Member Details Row */}
                          {isExpanded && (
                            <tr className="expanded-roster-row">
                              <td colSpan={8} style={{ padding: '0.25rem 0', background: 'var(--bg-surface)' }}>
                                <div className="team-expanded-roster-box">
                                  <div className="roster-header">
                                    <Users size={15} className="text-indigo" />
                                    <strong>Member Roster for {team.teamName} ({team.collegeName || 'Unknown College'})</strong>
                                    <span className="roster-id-tag">Team ID: {team.teamId || 'N/A'}</span>
                                  </div>

                                  <div className="roster-members-grid">
                                    {allMembers.length > 0 ? (
                                      allMembers.map((m, mIdx) => (
                                        <div key={mIdx} className="member-card">
                                          <div className="member-avatar">
                                            {m.name ? m.name.charAt(0).toUpperCase() : (m.studentName ? m.studentName.charAt(0).toUpperCase() : 'M')}
                                          </div>
                                          <div className="member-details">
                                            <div className="member-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                              <span className="member-name">{m.name || m.studentName || `Participant ${mIdx + 1}`}</span>
                                              {m.role && <span className="participant-role-badge">{m.role}</span>}
                                            </div>
                                            {m.email && <span className="member-info"><Mail size={11} /> {m.email}</span>}
                                            {m.phone && <span className="member-info"><Phone size={11} /> {m.phone}</span>}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="no-members-msg" style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>
                                        No individual member records available for this team.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-list mobile-only">
                {filteredTeams.map((team, idx) => {
                  const isExpanded = !!expandedItems[team.teamId || idx];
                  const isApproved = (team.paymentStatus || '').toLowerCase().includes('app');
                  const members = team.members || [];

                  return (
                    <div key={`mob_${team.teamId || idx}`} className="report-mobile-card">
                      <div className="report-mobile-card-top">
                        <div className="report-mobile-card-title-box">
                          <h4 className="report-mobile-team-name">{team.teamName || 'Unnamed Team'}</h4>
                          <div className="team-id-badge" onClick={() => handleCopy(team.teamId, 'Team ID')}>
                            <span>{team.teamId || 'N/A'}</span>
                            {copiedText === team.teamId ? <Check size={11} className="text-emerald" /> : <Copy size={11} />}
                          </div>
                        </div>
                        <span className={`status-pill ${isApproved ? 'status-approved' : 'status-pending'}`}>
                          {isApproved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {team.paymentStatus || 'Pending'}
                        </span>
                      </div>

                      <div className="report-mobile-card-rows">
                        <div className="report-mobile-row">
                          <span className="report-mobile-lbl">College</span>
                          <span className="report-mobile-val font-semibold">{team.collegeName || 'Unknown College'}</span>
                        </div>

                        <div className="report-mobile-row">
                          <span className="report-mobile-lbl">Leader</span>
                          <div className="report-mobile-leader">
                            <span className="font-semibold">{team.leader?.name || 'N/A'}</span>
                            {team.leader?.phone && <span className="text-muted text-xs"><Phone size={10} /> {team.leader.phone}</span>}
                          </div>
                        </div>

                        <div className="report-mobile-row">
                          <span className="report-mobile-lbl">Members</span>
                          <span className="members-count-badge">
                            <Users size={11} /> {team.membersCount || (team.members?.length || 1)}
                          </span>
                        </div>

                        <div className="report-mobile-row">
                          <span className="report-mobile-lbl">Amount Paid</span>
                          <strong className="text-emerald font-bold">₹ {Number(team.totalAmountPaid ?? team.totalFee ?? 0).toLocaleString()}</strong>
                        </div>

                        {team.paymentUtr && (
                          <div className="report-mobile-row">
                            <span className="report-mobile-lbl">UTR</span>
                            <div className="utr-copy-tag" onClick={() => handleCopy(team.paymentUtr, 'UTR')}>
                              <span>{team.paymentUtr}</span>
                              <Copy size={10} />
                            </div>
                          </div>
                        )}

                        <div className="report-mobile-row-full">
                          <span className="report-mobile-lbl">Events</span>
                          <div className="events-cell-list" style={{ marginTop: '0.25rem' }}>
                            {Array.isArray(team.registeredEvents) && team.registeredEvents.length > 0 ? (
                              team.registeredEvents.map((ev, evIdx) => (
                                <span key={evIdx} className="event-pill">
                                  {typeof ev === 'object' ? ev.title : ev}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted text-xs">No events</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="report-mobile-card-footer">
                        <button 
                          className="btn-mobile-toggle-roster"
                          onClick={() => toggleExpand(team.teamId || idx)}
                        >
                          <Users size={13} />
                          <span>{isExpanded ? 'Hide Member Roster' : `View Members (${members.length})`}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="team-expanded-roster-box" style={{ borderRadius: '8px', marginTop: '0.5rem' }}>
                          <div className="roster-members-grid">
                            {members.length > 0 ? (
                              members.map((m, mIdx) => (
                                <div key={mIdx} className="member-card">
                                  <div className="member-avatar">
                                    {m.name ? m.name.charAt(0).toUpperCase() : 'M'}
                                  </div>
                                  <div className="member-details">
                                    <span className="member-name">{m.name || `Participant ${mIdx + 1}`}</span>
                                    {m.phone && <span className="member-info"><Phone size={10} /> {m.phone}</span>}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="no-members-msg">No individual member records available.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Events & Participants Report */}
      {activeTab === 'events' && (
        <div className="report-content-panel">
          {isLoadingData ? (
            <div className="report-loading-state">
              <div className="spinner"></div>
              <span>Fetching Events & Participant Roster...</span>
            </div>
          ) : (eventsData.events || []).length === 0 ? (
            <div className="report-empty-state">
              <Calendar size={48} className="empty-icon" />
              <h3>No Events Returned</h3>
              <p>No events or participant records found in the database.</p>
            </div>
          ) : (
            <div className="events-report-wrapper">
              {(eventsData.events || []).map((evt, evtIdx) => {
                const pList = evt.participants || [];
                const filteredP = pList.filter(p => {
                  const q = searchQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    (p.participantName || '').toLowerCase().includes(q) ||
                    (p.collegeName || '').toLowerCase().includes(q) ||
                    (p.teamName || '').toLowerCase().includes(q) ||
                    (p.teamId || '').toLowerCase().includes(q) ||
                    (p.participantPhone || '').toLowerCase().includes(q) ||
                    (p.paymentUtr || '').toLowerCase().includes(q)
                  );
                });

                return (
                  <div key={evt.eventId || evtIdx} className="event-report-card">
                    <div className="event-report-card-header">
                      <div className="evt-header-left">
                        <div className="evt-icon-box">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <h3 className="evt-title">{evt.eventTitle || evt.title || `Event ${evtIdx + 1}`}</h3>
                          <div className="evt-meta-tags">
                            <span className="evt-meta-pill">
                              Category: <strong>{evt.category || 'Contest'}</strong>
                            </span>
                            <span className="evt-meta-pill">
                              Fee: <strong>₹{evt.fee ?? evt.registrationFee ?? 0}</strong>
                            </span>
                            <span className="evt-meta-pill">
                              Participants: <strong>{pList.length}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn-evt-download"
                        onClick={() => handleDownload('events', evt.eventId)}
                        disabled={downloadingType === 'events'}
                        title="Download Event Roster Excel"
                      >
                        <Download size={13} />
                        <span>Export Event (.xlsx)</span>
                      </button>
                    </div>

                    {filteredP.length === 0 ? (
                      <div className="evt-no-participants">
                        {pList.length === 0 ? 'No participants registered for this event yet.' : 'No participants matched the search filter.'}
                      </div>
                    ) : (
                      <>
                        {/* Desktop Table View */}
                        <div className="evt-table-box desktop-only">
                          <table className="reports-data-table mini-table">
                            <thead>
                              <tr>
                                <th>PARTICIPANT</th>
                                <th>PHONE</th>
                                <th>COLLEGE</th>
                                <th>TEAM</th>
                                <th>REGISTERED BY</th>
                                <th>PAYMENT STATUS</th>
                                <th>UTR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredP.map((p, pIdx) => {
                                const isApp = (p.paymentStatus || '').toLowerCase().includes('app');
                                return (
                                  <tr key={pIdx}>
                                    <td>
                                      <strong className="participant-name-text">{p.participantName || 'N/A'}</strong>
                                    </td>
                                    <td>
                                      <span className="phone-tag">{p.participantPhone || '—'}</span>
                                    </td>
                                    <td>
                                      <span className="college-text">{p.collegeName || '—'}</span>
                                    </td>
                                    <td>
                                      <div className="team-sub-cell">
                                        <span>{p.teamName || '—'}</span>
                                        {p.teamId && <small className="text-muted">({p.teamId})</small>}
                                      </div>
                                    </td>
                                    <td>
                                      <span className="registered-by-text">{p.registeredByUser || '—'}</span>
                                    </td>
                                    <td>
                                      <span className={`status-pill mini-pill ${isApp ? 'status-approved' : 'status-pending'}`}>
                                        {p.paymentStatus || 'Pending'}
                                      </span>
                                    </td>
                                    <td>
                                      {p.paymentUtr ? (
                                        <span className="utr-inline-text" onClick={() => handleCopy(p.paymentUtr, 'UTR')}>
                                          {p.paymentUtr}
                                        </span>
                                      ) : (
                                        <span className="text-muted">—</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Participant Cards View */}
                        <div className="mobile-cards-list mobile-only" style={{ padding: '0.75rem' }}>
                          {filteredP.map((p, pIdx) => {
                            const isApp = (p.paymentStatus || '').toLowerCase().includes('app');
                            return (
                              <div key={`p_mob_${pIdx}`} className="report-mobile-card" style={{ marginBottom: '0.65rem' }}>
                                <div className="report-mobile-card-top">
                                  <div>
                                    <strong className="participant-name-text">{p.participantName || 'N/A'}</strong>
                                    <div className="college-text" style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>{p.collegeName || '—'}</div>
                                  </div>
                                  <span className={`status-pill mini-pill ${isApp ? 'status-approved' : 'status-pending'}`}>
                                    {p.paymentStatus || 'Pending'}
                                  </span>
                                </div>

                                <div className="report-mobile-card-rows">
                                  <div className="report-mobile-row">
                                    <span className="report-mobile-lbl">Phone</span>
                                    <span className="phone-tag">{p.participantPhone || '—'}</span>
                                  </div>
                                  <div className="report-mobile-row">
                                    <span className="report-mobile-lbl">Team</span>
                                    <span className="font-semibold text-xs">{p.teamName || '—'}</span>
                                  </div>
                                  {p.paymentUtr && (
                                    <div className="report-mobile-row">
                                      <span className="report-mobile-lbl">UTR</span>
                                      <span className="utr-copy-tag" onClick={() => handleCopy(p.paymentUtr, 'UTR')}>
                                        {p.paymentUtr}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Colleges 2-Teams Matrix */}
      {activeTab === 'colleges' && (
        <div className="report-content-panel">
          {isLoadingData ? (
            <div className="report-loading-state">
              <div className="spinner"></div>
              <span>Fetching College-wise 2-Teams Matrix...</span>
            </div>
          ) : filteredColleges.length === 0 ? (
            <div className="report-empty-state">
              <Building2 size={48} className="empty-icon" />
              <h3>No Colleges Found</h3>
              <p>No college teams found matching your search.</p>
            </div>
          ) : (
            <div className="colleges-matrix-grid">
              {filteredColleges.map((col, idx) => {
                const team1 = col.team1;
                const team2 = col.team2;

                return (
                  <div key={idx} className="college-matrix-card">
                    <div className="college-matrix-header">
                      <div className="col-header-left">
                        <Building2 size={18} className="col-icon" />
                        <div>
                          <h3 className="col-name">{col.collegeName || 'Unknown College'}</h3>
                          <span className="col-slots-tag">
                            Slots Filled: <strong>{col.registeredTeamsCount ?? (team1 ? (team2 ? 2 : 1) : 0)} / {col.maxAllowedTeams ?? 2}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="teams-slots-container">
                      {/* Team 1 Slot */}
                      {team1 ? (
                        <div className="team-slot-card active-slot">
                          <div className="slot-badge-row">
                            <span className="slot-badge slot-1">{team1.slot || 'Team 1'}</span>
                            <span className={`status-pill mini-pill ${(team1.paymentStatus || '').toLowerCase().includes('app') ? 'status-approved' : 'status-pending'}`}>
                              {team1.paymentStatus || 'Pending'}
                            </span>
                          </div>

                          <h4 className="slot-team-name">{team1.teamName || 'Team 1'}</h4>
                          {team1.teamId && (
                            <div className="slot-team-id" onClick={() => handleCopy(team1.teamId, 'Team ID')}>
                              <span>{team1.teamId}</span>
                              <Copy size={10} />
                            </div>
                          )}

                          {team1.leader && (
                            <div className="slot-leader-box">
                              <span className="slot-leader-title">Leader</span>
                              <span className="slot-leader-name">{team1.leader.name || 'N/A'}</span>
                              {team1.leader.email && <span className="slot-leader-email">{team1.leader.email}</span>}
                            </div>
                          )}

                          {Array.isArray(team1.registeredEvents) && team1.registeredEvents.length > 0 && (
                            <div className="slot-events-box">
                              <span className="slot-events-title">Registered Events</span>
                              <div className="slot-events-pills">
                                {team1.registeredEvents.map((ev, eIdx) => (
                                  <span key={eIdx} className="slot-ev-pill">
                                    {typeof ev === 'object' ? ev.title : ev}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="team-slot-card empty-slot">
                          <span className="slot-badge slot-empty">Team 1 Slot</span>
                          <p className="empty-slot-text">No team registered in Slot 1</p>
                        </div>
                      )}

                      {/* Team 2 Slot */}
                      {team2 ? (
                        <div className="team-slot-card active-slot">
                          <div className="slot-badge-row">
                            <span className="slot-badge slot-2">{team2.slot || 'Team 2'}</span>
                            <span className={`status-pill mini-pill ${(team2.paymentStatus || '').toLowerCase().includes('app') ? 'status-approved' : 'status-pending'}`}>
                              {team2.paymentStatus || 'Pending'}
                            </span>
                          </div>

                          <h4 className="slot-team-name">{team2.teamName || 'Team 2'}</h4>
                          {team2.teamId && (
                            <div className="slot-team-id" onClick={() => handleCopy(team2.teamId, 'Team ID')}>
                              <span>{team2.teamId}</span>
                              <Copy size={10} />
                            </div>
                          )}

                          {team2.leader && (
                            <div className="slot-leader-box">
                              <span className="slot-leader-title">Leader</span>
                              <span className="slot-leader-name">{team2.leader.name || 'N/A'}</span>
                              {team2.leader.email && <span className="slot-leader-email">{team2.leader.email}</span>}
                            </div>
                          )}

                          {Array.isArray(team2.registeredEvents) && team2.registeredEvents.length > 0 && (
                            <div className="slot-events-box">
                              <span className="slot-events-title">Registered Events</span>
                              <div className="slot-events-pills">
                                {team2.registeredEvents.map((ev, eIdx) => (
                                  <span key={eIdx} className="slot-ev-pill">
                                    {typeof ev === 'object' ? ev.title : ev}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="team-slot-card empty-slot">
                          <span className="slot-badge slot-empty">Team 2 Slot</span>
                          <p className="empty-slot-text">No team registered in Slot 2</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Festival Summary & Stats */}
      {activeTab === 'summary' && (
        <div className="report-content-panel">
          <div className="summary-tab-grid">
            <div className="summary-card stats-overview-card">
              <div className="summary-card-header">
                <TrendingUp size={18} className="text-indigo" />
                <h3>Festival Operational Highlights</h3>
              </div>

              <div className="summary-metric-rows">
                <div className="metric-row">
                  <span className="metric-name">Total Registered Users</span>
                  <strong className="metric-val">{summaryData?.totalUsers ?? 0}</strong>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Participating Colleges</span>
                  <strong className="metric-val">{summaryData?.totalColleges ?? 0}</strong>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Total Competing Teams</span>
                  <strong className="metric-val">{summaryData?.totalTeams ?? 0}</strong>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Active Contests & Events</span>
                  <strong className="metric-val">{summaryData?.totalEvents ?? 0}</strong>
                </div>
                <div className="metric-row">
                  <span className="metric-name">Total Registrations Recorded</span>
                  <strong className="metric-val">{summaryData?.totalRegistrations ?? 0}</strong>
                </div>
                <div className="metric-row highlight-row">
                  <span className="metric-name">Total Revenue Collected</span>
                  <strong className="metric-val text-emerald">₹ {(summaryData?.totalRevenue ?? 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="summary-card verification-progress-card">
              <div className="summary-card-header">
                <ShieldCheck size={18} className="text-emerald" />
                <h3>Payment Verification Rate</h3>
              </div>

              {(() => {
                const totalP = summaryData?.totalPayments || ((summaryData?.approvedPaymentsCount || 0) + (summaryData?.pendingPaymentsCount || 0)) || 1;
                const approvedP = summaryData?.approvedPaymentsCount || 0;
                const pendingP = summaryData?.pendingPaymentsCount || 0;
                const percent = Math.round((approvedP / (totalP || 1)) * 100);

                return (
                  <div className="verification-box">
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="progress-labels">
                      <span><strong>{percent}%</strong> Approved</span>
                      <span>{approvedP} of {totalP} Verified</span>
                    </div>

                    <div className="verification-stats-split">
                      <div className="split-box bg-approved">
                        <CheckCircle2 size={16} />
                        <div>
                          <strong>{approvedP}</strong>
                          <span>Approved Payments</span>
                        </div>
                      </div>

                      <div className="split-box bg-pending">
                        <Clock size={16} />
                        <div>
                          <strong>{pendingP}</strong>
                          <span>Pending Verification</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

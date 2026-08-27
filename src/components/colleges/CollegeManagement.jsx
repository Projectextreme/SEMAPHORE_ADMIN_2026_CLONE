import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  X, 
  Filter, 
  Check, 
  Copy, 
  Download, 
  FileSpreadsheet,
  Sliders,
  Settings,
  Sparkles,
  ShieldAlert,
  Layers,
  LayoutGrid,
  List,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';

import { apiService } from '../../services/apiService';
import { CountUp } from '../common/CountUp';
import { TiltCard } from '../common/TiltCard';
import { Modal } from '../common/Modal';
import './CollegeManagement.css';

export const CollegeManagement = () => {
  const { showSuccess, showError } = useToast();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quotaFilter, setQuotaFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  // Global College Allowed Config & Overrides
  const [globalConfig, setGlobalConfig] = useState({
    defaultMaxTeamsPerCollege: 1,
    enforceAllowedListOnly: false
  });
  const [allowedColleges, setAllowedColleges] = useState([]);
  const [configSaving, setConfigSaving] = useState(false);
  const [tempDefaultLimit, setTempDefaultLimit] = useState(1);

  // Modals for Colleges
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [deletingCollege, setDeletingCollege] = useState(null);

  // Modals for Custom Allowed Overrides
  const [showAllowedModal, setShowAllowedModal] = useState(false);
  const [editingAllowedCollege, setEditingAllowedCollege] = useState(null);
  const [deletingAllowedCollege, setDeletingAllowedCollege] = useState(null);

  // Form states for Regular College
  const [newCollege, setNewCollege] = useState({
    collegeName: '',
    totalTeams: 0
  });

  // Form states for Custom Allowed Override
  const [allowedForm, setAllowedForm] = useState({
    collegeName: '',
    maxTeams: 2,
    isActive: true
  });

  const showToast = (msg, isError = false) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  };

  // Fetch all colleges and allowed colleges config
  const fetchColleges = async () => {
    setLoading(true);
    try {
      const [collegesRes, allowedRes] = await Promise.allSettled([
        apiService.getColleges(),
        apiService.getAllowedCollegesData()
      ]);

      if (collegesRes.status === 'fulfilled') {
        const cList = Array.isArray(collegesRes.value) ? collegesRes.value : (collegesRes.value?.colleges || []);
        setColleges(cList);
      }

      if (allowedRes.status === 'fulfilled') {
        const data = allowedRes.value;
        if (data?.config) {
          const defLimit = Number(data.config.defaultMaxTeamsPerCollege) || 1;
          setGlobalConfig({
            defaultMaxTeamsPerCollege: defLimit,
            enforceAllowedListOnly: Boolean(data.config.enforceAllowedListOnly)
          });
          setTempDefaultLimit(defLimit);
        }
        setAllowedColleges(Array.isArray(data?.allowedColleges) ? data.allowedColleges : []);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load colleges list.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  // Update Global College Max Teams Policy (PUT /api/allowed-colleges/config)
  const handleUpdateGlobalPolicy = async (limitVal, enforceVal) => {
    setConfigSaving(true);
    const targetLimit = Number(limitVal !== undefined ? limitVal : tempDefaultLimit) || 1;
    const targetEnforce = enforceVal !== undefined ? enforceVal : globalConfig.enforceAllowedListOnly;

    try {
      const res = await apiService.updateGlobalCollegeConfig({
        defaultMaxTeamsPerCollege: targetLimit,
        enforceAllowedListOnly: targetEnforce
      });

      if (res?.config) {
        setGlobalConfig({
          defaultMaxTeamsPerCollege: Number(res.config.defaultMaxTeamsPerCollege) || targetLimit,
          enforceAllowedListOnly: Boolean(res.config.enforceAllowedListOnly)
        });
        setTempDefaultLimit(Number(res.config.defaultMaxTeamsPerCollege) || targetLimit);
      }
      showToast(`Global college limit updated to ${targetLimit} team(s) per college!`);
    } catch (err) {
      showToast(err.message || 'Failed to update global college configuration.', true);
    } finally {
      setConfigSaving(false);
    }
  };

  // Helper: Get effective max teams allowed for any college
  const getCollegeQuotaInfo = (collegeName) => {
    const defaultMax = Number(globalConfig.defaultMaxTeamsPerCollege) || 1;
    if (!collegeName) return { maxTeams: defaultMax, isOverride: false };

    const match = allowedColleges.find(
      (ac) => ac.collegeName && ac.collegeName.toLowerCase().trim() === collegeName.toLowerCase().trim()
    );
    if (match && match.isActive !== false && match.maxTeams !== undefined) {
      return {
        maxTeams: Number(match.maxTeams) || defaultMax,
        isOverride: true,
        overrideObj: match
      };
    }
    return { maxTeams: defaultMax, isOverride: false };
  };

  // 1. Add Regular College (POST /api/colleges)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCollege.collegeName.trim()) {
      showToast('Please enter a valid college name.', true);
      return;
    }
    setActionLoading(true);
    try {
      const created = await apiService.addCollege({
        collegeName: newCollege.collegeName.trim(),
        totalTeams: Number(newCollege.totalTeams) || 0
      });
      showToast(`College "${created.collegeName || newCollege.collegeName}" added successfully!`);
      setShowAddModal(false);
      setNewCollege({ collegeName: '', totalTeams: 0 });
      fetchColleges();
    } catch (err) {
      showToast(err.message || 'Failed to add college.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Edit Regular College (PUT /api/colleges/:id)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCollege || !editingCollege.collegeName.trim()) {
      showToast('Please enter a valid college name.', true);
      return;
    }
    const id = editingCollege._id || editingCollege.id;
    setActionLoading(true);
    try {
      await apiService.editCollege(id, {
        collegeName: editingCollege.collegeName.trim(),
        totalTeams: Number(editingCollege.totalTeams) || 0
      });
      showToast(`College "${editingCollege.collegeName}" updated successfully!`);
      setEditingCollege(null);
      fetchColleges();
    } catch (err) {
      showToast(err.message || 'Failed to update college.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Delete Regular College (DELETE /api/colleges/:id)
  const handleDeleteConfirm = async () => {
    if (!deletingCollege) return;
    const id = deletingCollege._id || deletingCollege.id;
    setActionLoading(true);
    try {
      await apiService.deleteCollege(id);
      showToast(`College "${deletingCollege.collegeName}" removed successfully.`);
      setDeletingCollege(null);
      fetchColleges();
    } catch (err) {
      showToast(err.message || 'Failed to delete college.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Create or Update Custom Allowed College Override (POST /api/allowed-colleges or PUT /api/allowed-colleges/:id)
  const handleSaveAllowedOverride = async (e) => {
    e.preventDefault();
    if (!allowedForm.collegeName.trim()) {
      showToast('Please specify a college name for this custom quota override.', true);
      return;
    }
    setActionLoading(true);
    try {
      if (editingAllowedCollege) {
        const id = editingAllowedCollege._id || editingAllowedCollege.id;
        await apiService.updateAllowedCollege(id, {
          collegeName: allowedForm.collegeName.trim(),
          maxTeams: Number(allowedForm.maxTeams) || 1,
          isActive: allowedForm.isActive
        });
        showToast(`Custom quota for "${allowedForm.collegeName}" updated to ${allowedForm.maxTeams} team(s)!`);
      } else {
        await apiService.addAllowedCollege({
          collegeName: allowedForm.collegeName.trim(),
          maxTeams: Number(allowedForm.maxTeams) || 1,
          isActive: allowedForm.isActive
        });
        showToast(`Custom quota override set: ${allowedForm.maxTeams} team(s) for "${allowedForm.collegeName}"`);
      }
      setShowAllowedModal(false);
      setEditingAllowedCollege(null);
      setAllowedForm({ collegeName: '', maxTeams: 2, isActive: true });
      fetchColleges();
    } catch (err) {
      showToast(err.message || 'Failed to save allowed college quota.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Delete Custom Allowed Override (DELETE /api/allowed-colleges/:id)
  const handleDeleteAllowedOverride = async () => {
    if (!deletingAllowedCollege) return;
    const id = deletingAllowedCollege._id || deletingAllowedCollege.id;
    setActionLoading(true);
    try {
      await apiService.deleteAllowedCollege(id);
      showToast(`Custom override for "${deletingAllowedCollege.collegeName}" removed. College now follows global default limit.`);
      setDeletingAllowedCollege(null);
      fetchColleges();
    } catch (err) {
      showToast(err.message || 'Failed to remove custom quota override.', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered colleges list
  const filteredColleges = colleges.filter((c) => {
    const name = c.collegeName || '';
    const id = c._id || c.id || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    const quotaInfo = getCollegeQuotaInfo(name);
    const teams = Number(c.totalTeams) || 0;
    const isFull = teams >= quotaInfo.maxTeams;

    if (quotaFilter === 'Full') return matchesSearch && isFull;
    if (quotaFilter === 'Zero') return matchesSearch && teams === 0;
    if (quotaFilter === 'Override') return matchesSearch && quotaInfo.isOverride;
    return matchesSearch;
  });

  const fullQuotaCount = colleges.filter((c) => {
    const quotaInfo = getCollegeQuotaInfo(c.collegeName);
    return (Number(c.totalTeams) || 0) >= quotaInfo.maxTeams;
  }).length;

  const availableSlotsCount = colleges.filter((c) => {
    const quotaInfo = getCollegeQuotaInfo(c.collegeName);
    return (Number(c.totalTeams) || 0) < quotaInfo.maxTeams;
  }).length;

  const totalTeamsEnrolled = colleges.reduce((sum, c) => sum + (Number(c.totalTeams) || 0), 0);

  const handleExportCollegesXLSX = async () => {
    try {
      await apiService.exportColleges('Semaphore_2026_Colleges_Report.xlsx');
      showToast('Colleges Report downloaded successfully (.xlsx)!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export Colleges Excel report.', true);
    }
  };

  return (
    <div className="colleges-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <Building2 className="title-icon text-cyan" /> College Directory & Quota Controls
          </h2>
          <p className="page-description">
            Configure global and custom team limits per college, audit registration capacities, and manage institution quotas.
          </p>
        </div>

        <div className="title-actions-group">
          <button 
            onClick={fetchColleges} 
            className="btn btn-secondary"
            disabled={loading}
            title="Refresh Colleges Directory"
            aria-label="Refresh Colleges"
          >
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button 
            onClick={handleExportCollegesXLSX} 
            className="btn btn-secondary btn-glow-sheen"
            title="Download Colleges Report (.xlsx)"
          >
            <Download size={15} />
            <span>Export (.xlsx)</span>
          </button>

          <button 
            onClick={() => {
              setEditingAllowedCollege(null);
              setAllowedForm({ collegeName: '', maxTeams: 2, isActive: true });
              setShowAllowedModal(true);
            }} 
            className="btn btn-secondary"
            title="Set custom maximum teams for a specific college"
          >
            <Sliders size={15} className="text-warning" /> Custom College Quota
          </button>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={15} /> Add College
          </button>
        </div>
      </div>

      {/* 1. Global College Quota Policy Control Card */}
      <div className="card global-quota-policy-card">
        <div className="global-policy-header">
          <div className="policy-header-title-box">
            <div className="policy-icon-badge">
              <Sliders size={20} className="text-cyan" />
            </div>
            <div>
              <div className="policy-title-row">
                <h3 className="policy-title">Global College Team Registration Limit</h3>
                <span className="policy-status-pill">
                  <Zap size={11} /> Live Backend Policy
                </span>
              </div>
              <p className="policy-desc">
                By default, each college can register up to <strong>{globalConfig.defaultMaxTeamsPerCollege} Team{globalConfig.defaultMaxTeamsPerCollege > 1 ? 's' : ''}</strong>. You can change this global limit anytime or specify individual overrides below.
              </p>
            </div>
          </div>

          <div className="global-quota-stepper-box">
            <span className="stepper-label">Default Teams Allowed:</span>
            <div className="stepper-controls">
              <button
                type="button"
                className="btn-stepper"
                disabled={configSaving || tempDefaultLimit <= 1}
                onClick={() => {
                  const next = Math.max(1, tempDefaultLimit - 1);
                  setTempDefaultLimit(next);
                  handleUpdateGlobalPolicy(next);
                }}
                title="Decrease Default Teams"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={20}
                className="stepper-input"
                value={tempDefaultLimit}
                onChange={(e) => setTempDefaultLimit(Math.max(1, Number(e.target.value) || 1))}
                onBlur={() => handleUpdateGlobalPolicy(tempDefaultLimit)}
                disabled={configSaving}
              />
              <button
                type="button"
                className="btn-stepper"
                disabled={configSaving}
                onClick={() => {
                  const next = tempDefaultLimit + 1;
                  setTempDefaultLimit(next);
                  handleUpdateGlobalPolicy(next);
                }}
                title="Increase Default Teams"
              >
                +
              </button>
            </div>

            <div className="preset-buttons">
              {[1, 2, 3, 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`btn-preset-pill ${globalConfig.defaultMaxTeamsPerCollege === preset ? 'active' : ''}`}
                  disabled={configSaving}
                  onClick={() => {
                    setTempDefaultLimit(preset);
                    handleUpdateGlobalPolicy(preset);
                  }}
                >
                  {preset} {preset === 1 ? 'Team' : 'Teams'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Overrides Overview Strip */}
        {allowedColleges.length > 0 && (
          <div className="custom-overrides-strip">
            <div className="overrides-strip-header">
              <span className="overrides-strip-title">
                <Sparkles size={13} className="text-warning" /> Specific College Overrides ({allowedColleges.length})
              </span>
              <span className="overrides-hint">These institutions have custom limits exceeding the global default</span>
            </div>
            <div className="overrides-chips-grid">
              {allowedColleges.map((ac) => (
                <div key={ac._id || ac.id} className="override-chip">
                  <span className="override-college-name">{ac.collegeName}</span>
                  <span className="override-limit-badge">{ac.maxTeams} Teams Max</span>
                  <div className="override-actions">
                    <button
                      type="button"
                      className="btn-override-edit"
                      onClick={() => {
                        setEditingAllowedCollege(ac);
                        setAllowedForm({
                          collegeName: ac.collegeName,
                          maxTeams: ac.maxTeams || 2,
                          isActive: ac.isActive !== false
                        });
                        setShowAllowedModal(true);
                      }}
                      title="Edit Quota Override"
                    >
                      <Edit2 size={11} />
                    </button>
                    <button
                      type="button"
                      className="btn-override-del"
                      onClick={() => setDeletingAllowedCollege(ac)}
                      title="Remove Custom Override"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Metric Strip with 3D Tilt & CountUp Numbers */}
      <div className="college-metric-strip">
        <TiltCard maxTilt={5} glareOpacity={0.12} className="college-metric-tilt">
          <div className="metric-chip">
            <span className="metric-chip-label">Total Colleges</span>
            <span className="metric-chip-val text-cyan">
              <CountUp value={colleges.length} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="college-metric-tilt">
          <div className="metric-chip">
            <span className="metric-chip-label">Quota Full</span>
            <span className="metric-chip-val text-warning">
              <CountUp value={fullQuotaCount} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="college-metric-tilt">
          <div className="metric-chip">
            <span className="metric-chip-label">Open Slots Available</span>
            <span className="metric-chip-val text-success">
              <CountUp value={availableSlotsCount} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="college-metric-tilt">
          <div className="metric-chip">
            <span className="metric-chip-label">Total Active Teams</span>
            <span className="metric-chip-val text-indigo">
              <CountUp value={totalTeamsEnrolled} />
            </span>
          </div>
        </TiltCard>
      </div>

      {/* Toolbar Card with View Mode Switcher */}
      <div className="card college-toolbar-card">
        <div className="college-toolbar-inner">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by college name or ID..."
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

          <div className="college-filter-group">
            <div className="filter-wrapper">
              <Filter size={14} className="filter-icon-select" />
              <select
                className="form-select select-compact"
                value={quotaFilter}
                onChange={(e) => setQuotaFilter(e.target.value)}
              >
                <option value="All">All Quota States</option>
                <option value="Full">Quota Full</option>
                <option value="Zero">0 Teams Enrolled</option>
                <option value="Override">Custom Overrides Only</option>
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

            <span className="endpoint-badge">{filteredColleges.length} Colleges Listed</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Fetching colleges roster & quotas...</span>
          </div>
        ) : filteredColleges.length === 0 ? (
          <EmptyState
            type="colleges"
            title="No college records found"
            description={searchTerm ? `No colleges found matching "${searchTerm}". Try resetting your filters.` : "No colleges are registered yet."}
            primaryAction={{
              label: 'Add New College',
              onClick: () => setShowAddModal(true)
            }}
            secondaryAction={searchTerm ? {
              label: 'Clear Search',
              onClick: () => {
                setSearchTerm('');
                setQuotaFilter('All');
              }
            } : null}
            compact={true}
          />
        ) : (
          <>
            {/* Primary Responsive Cards View */}
            {viewMode === 'cards' ? (
              <div className="colleges-cards-grid">
                {filteredColleges.map((college) => {
                  const quotaInfo = getCollegeQuotaInfo(college.collegeName);
                  const teams = Number(college.totalTeams) || 0;
                  const maxAllowed = quotaInfo.maxTeams;
                  const isFull = teams >= maxAllowed;
                  const collegeId = college._id || college.id;
                  const pct = Math.min(100, Math.round((teams / maxAllowed) * 100));

                  return (
                    <TiltCard key={collegeId} maxTilt={4} glareOpacity={0.08} className="college-card-tilt">
                      <div className="college-card-content">
                        {/* Card Top */}
                        <div className="college-card-top">
                          <div className="college-title-cell">
                            <div className="college-avatar">
                              {college.collegeName?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div className="college-title-info">
                              <h3 className="college-name-text" title={college.collegeName}>
                                {college.collegeName}
                              </h3>
                              <span className="college-subtext">Verified Institution</span>
                            </div>
                          </div>

                          <div className="quota-pill-container">
                            {quotaInfo.isOverride && (
                              <span className="override-badge-pill" title="Custom Quota Override set for this college">
                                <Sparkles size={10} /> {maxAllowed} Max
                              </span>
                            )}
                            <span className={`quota-pill ${isFull ? 'pill-full' : (teams > 0 ? 'pill-half' : 'pill-empty')}`}>
                              {isFull ? `Full (${teams}/${maxAllowed})` : `${maxAllowed - teams} Slot${maxAllowed - teams > 1 ? 's' : ''} Left`}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="college-card-body">
                          <div className="college-info-row">
                            <span className="college-info-label">College ID:</span>
                            <div 
                              className="mobile-id-badge" 
                              title="Click to copy ID"
                              onClick={() => {
                                navigator.clipboard.writeText(collegeId);
                                showToast('College ID copied to clipboard!');
                              }}
                            >
                              <span className="code-font">{collegeId ? `${collegeId.slice(0, 8)}...${collegeId.slice(-4)}` : 'N/A'}</span>
                              <Copy size={11} className="id-copy-icon" />
                            </div>
                          </div>

                          <div className="college-info-row" style={{ alignItems: 'flex-start' }}>
                            <span className="college-info-label">Team Quota:</span>
                            <div className="quota-bar-wrapper" style={{ flex: 1, maxWidth: '170px' }}>
                              <div className="quota-bar-bg">
                                <div 
                                  className={`quota-bar-fill ${isFull ? 'fill-full' : (teams > 0 ? 'fill-half' : 'fill-empty')}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="quota-progress-label">
                                <strong>{teams} / {maxAllowed} Teams</strong>
                                <span>{pct}%</span>
                              </div>
                            </div>
                          </div>

                          {college.createdAt && (
                            <div className="college-info-row">
                              <span className="college-info-label">Registered:</span>
                              <span className="college-date-val">
                                {new Date(college.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Actions */}
                        <div className="college-card-footer">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAllowedCollege(quotaInfo.overrideObj || null);
                              setAllowedForm({
                                collegeName: college.collegeName,
                                maxTeams: maxAllowed,
                                isActive: true
                              });
                              setShowAllowedModal(true);
                            }}
                            className="btn-college-action btn-quota-action"
                            title="Set or modify maximum teams allowed for this college"
                          >
                            <Sliders size={13} className="text-warning" />
                            <span>Quota: {maxAllowed}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingCollege({ ...college })}
                            className="btn-college-action btn-edit-action"
                            title="Edit College Details"
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingCollege(college)}
                            className="btn-college-action btn-delete-action"
                            title="Delete College"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </TiltCard>
                  );
                })}
              </div>
            ) : (
              /* Desktop Table View */
              <div className="table-responsive desktop-only">
                <table className="college-table">
                  <thead>
                    <tr>
                      <th>INSTITUTION / COLLEGE</th>
                      <th>COLLEGE ID</th>
                      <th>ALLOWED QUOTA</th>
                      <th>ENROLLED TEAMS</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredColleges.map((college) => {
                      const quotaInfo = getCollegeQuotaInfo(college.collegeName);
                      const teams = Number(college.totalTeams) || 0;
                      const maxAllowed = quotaInfo.maxTeams;
                      const isFull = teams >= maxAllowed;
                      const collegeId = college._id || college.id;
                      const pct = Math.min(100, Math.round((teams / maxAllowed) * 100));

                      return (
                        <tr key={collegeId}>
                          <td>
                            <div className="college-title-cell">
                              <div className="college-avatar">
                                {college.collegeName?.charAt(0).toUpperCase() || 'C'}
                              </div>
                              <div className="college-title-info">
                                <span className="college-name-text">{college.collegeName}</span>
                                <span className="college-subtext">Verified Institution</span>
                              </div>
                            </div>
                          </td>
                          <td className="code-font">{collegeId}</td>
                          <td>
                            <div className="allowed-quota-cell">
                              <span className="quota-limit-text"><strong>{maxAllowed}</strong> Team{maxAllowed > 1 ? 's' : ''}</span>
                              {quotaInfo.isOverride ? (
                                <span className="override-badge-pill-sm">Override</span>
                              ) : (
                                <span className="default-badge-pill-sm">Default</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="quota-bar-wrapper">
                              <div className="quota-bar-bg">
                                <div 
                                  className={`quota-bar-fill ${isFull ? 'fill-full' : (teams > 0 ? 'fill-half' : 'fill-empty')}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="quota-bar-text">{teams} / {maxAllowed} Teams ({pct}%)</span>
                            </div>
                          </td>
                          <td>
                            <span className={`quota-pill ${isFull ? 'pill-full' : (teams > 0 ? 'pill-half' : 'pill-empty')}`}>
                              {isFull ? `Full (${teams}/${maxAllowed})` : `${maxAllowed - teams} Slot${maxAllowed - teams > 1 ? 's' : ''} Left`}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              <button
                                onClick={() => {
                                  setEditingAllowedCollege(quotaInfo.overrideObj || null);
                                  setAllowedForm({
                                    collegeName: college.collegeName,
                                    maxTeams: maxAllowed,
                                    isActive: true
                                  });
                                  setShowAllowedModal(true);
                                }}
                                className="btn-icon btn-view"
                                title="Adjust Team Quota for this College"
                              >
                                <Sliders size={14} className="text-warning" />
                              </button>
                              <button
                                onClick={() => setEditingCollege({ ...college })}
                                className="btn-icon btn-edit"
                                title="Edit College"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeletingCollege(college)}
                                className="btn-icon btn-delete"
                                title="Delete College"
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
          </>
        )}
      </div>

      {/* Modal: Set Custom Quota Override for Specific College (POST/PUT /api/allowed-colleges) */}
      {showAllowedModal && (
        <Modal isOpen={showAllowedModal} onClose={() => setShowAllowedModal(false)} maxWidth="540px">
          <div className="modal-header">
            <h3><Sliders size={19} className="text-warning" /> {editingAllowedCollege ? 'Update College Quota Override' : 'Set Custom College Team Limit'}</h3>
            <button className="modal-close" onClick={() => setShowAllowedModal(false)}>&times;</button>
          </div>
          <p className="modal-subtitle">
            Override the global default ({globalConfig.defaultMaxTeamsPerCollege} team) for a specific institution.
          </p>

          <form onSubmit={handleSaveAllowedOverride} className="modal-form">
            <div className="form-group">
              <label className="form-label">College / Institution Name</label>
              <input
                type="text"
                list="registered-colleges-list"
                className="form-input"
                placeholder="e.g. St. Joseph's University"
                value={allowedForm.collegeName}
                onChange={(e) => setAllowedForm({ ...allowedForm, collegeName: e.target.value })}
                required
              />
              <datalist id="registered-colleges-list">
                {colleges.map((c, i) => (
                  <option key={i} value={c.collegeName} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Teams Allowed for this College</label>
              <input
                type="number"
                min={1}
                max={50}
                className="form-input"
                value={allowedForm.maxTeams}
                onChange={(e) => setAllowedForm({ ...allowedForm, maxTeams: Math.max(1, Number(e.target.value) || 1) })}
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                Teams from this college can register up to this custom limit regardless of the global default.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={allowedForm.isActive ? 'active' : 'inactive'}
                onChange={(e) => setAllowedForm({ ...allowedForm, isActive: e.target.value === 'active' })}
              >
                <option value="active">Active (Enforce this custom limit)</option>
                <option value="inactive">Inactive (Fallback to global default limit)</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAllowedModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : (editingAllowedCollege ? 'Update Quota' : 'Save Quota Override')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Delete Custom Quota Override Confirmation */}
      {deletingAllowedCollege && (
        <Modal isOpen={!!deletingAllowedCollege} onClose={() => setDeletingAllowedCollege(null)} maxWidth="480px" isDanger>
          <div className="modal-header">
            <h3 style={{ color: 'var(--danger)' }}><Trash2 size={19} /> Remove Custom Quota Override</h3>
            <button className="modal-close" onClick={() => setDeletingAllowedCollege(null)}>&times;</button>
          </div>
          <p className="delete-warning-text">
            Are you sure you want to remove the custom limit of <strong>{deletingAllowedCollege.maxTeams} teams</strong> for <strong>{deletingAllowedCollege.collegeName}</strong>? It will immediately revert to the global default ({globalConfig.defaultMaxTeamsPerCollege} team).
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeletingAllowedCollege(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDeleteAllowedOverride} disabled={actionLoading}>
              {actionLoading ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add College Modal (POST /api/colleges) */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="540px">
          <div className="modal-header">
            <h3><Building2 size={19} /> Add New Participating College</h3>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
          </div>
          <p className="modal-subtitle">
            Register a new participating college in the directory.
          </p>

          <form onSubmit={handleAddSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">College / Institution Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BMS College of Engineering"
                value={newCollege.collegeName}
                onChange={(e) => setNewCollege({ ...newCollege, collegeName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Enrolled Teams</label>
              <select
                className="form-select"
                value={newCollege.totalTeams}
                onChange={(e) => setNewCollege({ ...newCollege, totalTeams: Number(e.target.value) })}
              >
                <option value={0}>0 Teams (Freshly Enrolled)</option>
                <option value={1}>1 Team Enrolled</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Adding...' : 'Add College'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit College Modal (PUT /api/colleges/:id) */}
      {editingCollege && (
        <Modal isOpen={!!editingCollege} onClose={() => setEditingCollege(null)} maxWidth="540px">
          <div className="modal-header">
            <h3><Edit2 size={19} /> Edit College Details</h3>
            <button className="modal-close" onClick={() => setEditingCollege(null)}>&times;</button>
          </div>

          <form onSubmit={handleEditSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">College Name</label>
              <input
                type="text"
                className="form-input"
                value={editingCollege.collegeName}
                onChange={(e) => setEditingCollege({ ...editingCollege, collegeName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Enrolled Teams Count</label>
              <input
                type="number"
                min={0}
                max={50}
                className="form-input"
                value={editingCollege.totalTeams || 0}
                onChange={(e) => setEditingCollege({ ...editingCollege, totalTeams: Number(e.target.value) || 0 })}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCollege(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving Changes...' : 'Save College'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete College Modal (DELETE /api/colleges/:id) */}
      {deletingCollege && (
        <Modal isOpen={!!deletingCollege} onClose={() => setDeletingCollege(null)} maxWidth="480px" isDanger>
          <div className="modal-header">
            <h3 style={{ color: 'var(--danger)' }}><Trash2 size={19} /> Confirm College Deletion</h3>
            <button className="modal-close" onClick={() => setDeletingCollege(null)}>&times;</button>
          </div>

          <div style={{ background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 1rem', margin: '1rem 0' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>{deletingCollege.collegeName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Enrolled Teams: {deletingCollege.totalTeams || 0}</div>
            <div className="code-font" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>ID: {deletingCollege._id || deletingCollege.id}</div>
          </div>

          <p className="delete-warning-text">
            Are you sure you want to permanently delete this college entry? Teams registered under this college will be affected.
          </p>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeletingCollege(null)}>
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

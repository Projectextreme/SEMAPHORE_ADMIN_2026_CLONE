import { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import './CollegeManagement.css';

export const CollegeManagement = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quotaFilter, setQuotaFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [deletingCollege, setDeletingCollege] = useState(null);

  // Form states
  const [newCollege, setNewCollege] = useState({
    collegeName: '',
    totalTeams: 0
  });

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const fetchColleges = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getColleges();
      setColleges(data);
    } catch (err) {
      showToast(err.message || 'Failed to load colleges list.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  // 1. Add College (POST /api/colleges)
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

  // 2. Edit College (PUT /api/colleges/:id)
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

  // 3. Delete College (DELETE /api/colleges/:id)
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

  const filteredColleges = colleges.filter((c) => {
    const name = c.collegeName || '';
    const id = c._id || c.id || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase());

    const teams = Number(c.totalTeams) || 0;
    if (quotaFilter === 'Full') return matchesSearch && teams >= 2;
    if (quotaFilter === 'One') return matchesSearch && teams === 1;
    if (quotaFilter === 'Zero') return matchesSearch && teams === 0;
    return matchesSearch;
  });

  const fullQuotaCount = colleges.filter((c) => (Number(c.totalTeams) || 0) >= 2).length;
  const availableSlotsCount = colleges.filter((c) => (Number(c.totalTeams) || 0) < 2).length;
  const totalTeamsEnrolled = colleges.reduce((sum, c) => sum + (Number(c.totalTeams) || 0), 0);

  return (
    <div className="colleges-container">
      {/* Title Bar */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <Building2 className="title-icon" /> College Directory & Quota Controls
          </h2>
          <p className="page-description">
            Register participating institutions, audit enrolled team capacities (strict 2 teams/college), and manage college profiles.
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
            <span>{loading ? 'Refreshing...' : 'Refresh Colleges'}</span>
          </button>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={15} /> Add New College
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={17} />
          <span>{errorMsg}</span>
        </div>
      )}

      {toastMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={17} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Metric Strip */}
      <div className="college-metric-strip">
        <div className="metric-chip">
          <span className="metric-chip-label">Total Colleges</span>
          <span className="metric-chip-val text-cyan">{colleges.length}</span>
        </div>
        <div className="metric-chip">
          <span className="metric-chip-label">Quota Full (2/2 Teams)</span>
          <span className="metric-chip-val text-warning">{fullQuotaCount}</span>
        </div>
        <div className="metric-chip">
          <span className="metric-chip-label">Open Slots Available</span>
          <span className="metric-chip-val text-success">{availableSlotsCount}</span>
        </div>
        <div className="metric-chip">
          <span className="metric-chip-label">Total Active Teams</span>
          <span className="metric-chip-val text-indigo">{totalTeamsEnrolled}</span>
        </div>
      </div>

      {/* Toolbar Card */}
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
              <Filter size={14} className="filter-icon" />
              <select
                className="form-select select-compact"
                value={quotaFilter}
                onChange={(e) => setQuotaFilter(e.target.value)}
              >
                <option value="All">All Quota States</option>
                <option value="Full">Quota Full (2 Teams)</option>
                <option value="One">1 Team Enrolled</option>
                <option value="Zero">0 Teams Enrolled</option>
              </select>
            </div>
            <span className="endpoint-badge">{filteredColleges.length} Colleges Listed</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Fetching colleges roster...</span>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="empty-state">
            <p>No college records found matching "{searchTerm}".</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="college-table">
              <thead>
                <tr>
                  <th>INSTITUTION / COLLEGE</th>
                  <th>COLLEGE ID</th>
                  <th>ENROLLED TEAMS</th>
                  <th>QUOTA STATUS</th>
                  <th>REGISTERED ON</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredColleges.map((college) => {
                  const teams = Number(college.totalTeams) || 0;
                  const isFull = teams >= 2;
                  const collegeId = college._id || college.id;

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
                        <div className="quota-bar-wrapper">
                          <div className="quota-bar-bg">
                            <div 
                              className={`quota-bar-fill ${isFull ? 'fill-full' : teams === 1 ? 'fill-half' : 'fill-empty'}`}
                              style={{ width: `${Math.min(100, (teams / 2) * 100)}%` }}
                            />
                          </div>
                          <span className="quota-bar-text">{teams} / 2 Teams</span>
                        </div>
                      </td>
                      <td>
                        <span className={`quota-pill ${isFull ? 'pill-full' : teams === 1 ? 'pill-half' : 'pill-empty'}`}>
                          {isFull ? 'Quota Full (2/2)' : teams === 1 ? '1 Slot Available' : '2 Slots Available'}
                        </span>
                      </td>
                      <td className="date-text">
                        {college.createdAt 
                          ? new Date(college.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                      <td>
                        <div className="table-actions-cell">
                          <button
                            onClick={() => setEditingCollege({ ...college })}
                            className="btn-icon btn-edit"
                            title="Edit College (PUT /api/colleges/:id)"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeletingCollege(college)}
                            className="btn-icon btn-delete"
                            title="Delete College (DELETE /api/colleges/:id)"
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
      </div>

      {/* Add College Modal (POST /api/colleges) */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Building2 size={19} /> Add New Participating College</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>POST /api/colleges</code>
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
                  <option value={2}>2 Teams (Quota Full)</option>
                </select>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                  Maximum allowed: 2 teams per college (enforced by Semaphore rules).
                </small>
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
          </div>
        </div>
      )}

      {/* Edit College Modal (PUT /api/colleges/:id) */}
      {editingCollege && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Edit2 size={19} /> Edit College Details</h3>
              <button className="modal-close" onClick={() => setEditingCollege(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>PUT /api/colleges/{editingCollege._id || editingCollege.id}</code>
            </p>

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
                <select
                  className="form-select"
                  value={editingCollege.totalTeams || 0}
                  onChange={(e) => setEditingCollege({ ...editingCollege, totalTeams: Number(e.target.value) })}
                >
                  <option value={0}>0 Teams</option>
                  <option value={1}>1 Team</option>
                  <option value={2}>2 Teams (Quota Full)</option>
                </select>
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
          </div>
        </div>
      )}

      {/* Delete College Modal (DELETE /api/colleges/:id) */}
      {deletingCollege && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}><Trash2 size={19} /> Confirm College Deletion</h3>
              <button className="modal-close" onClick={() => setDeletingCollege(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>DELETE /api/colleges/{deletingCollege._id || deletingCollege.id}</code>
            </p>

            <div style={{ background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 1rem', margin: '1rem 0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>{deletingCollege.collegeName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Enrolled Teams: {deletingCollege.totalTeams || 0} / 2</div>
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
          </div>
        </div>
      )}
    </div>
  );
};

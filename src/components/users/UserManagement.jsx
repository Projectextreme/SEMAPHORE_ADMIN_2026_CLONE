import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { 
  Users, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  Mail, 
  ShieldCheck, 
  Filter, 
  UserCheck,
  X,
  Copy
} from 'lucide-react';
import { CountUp } from '../common/CountUp';
import { TiltCard } from '../common/TiltCard';
import './UserManagement.css';

export const UserManagement = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  // Modals
  const [selectedUserView, setSelectedUserView] = useState(null);
  const [editUserData, setEditUserData] = useState(null);
  const [deleteUserObj, setDeleteUserObj] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 6. Retrieve All Users (GET /api/admin/users)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAllUsers();
      setUsers(res);
    } catch (err) {
      showError(err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 7. Retrieve Single User (GET /api/admin/users/:id)
  const handleViewUser = async (id) => {
    try {
      const user = await apiService.getUserById(id);
      setSelectedUserView(user);
    } catch (err) {
      showError(err.message || 'User not found');
    }
  };

  // Open edit modal
  const handleOpenEdit = (user) => {
    setEditUserData({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'user',
      collegeName: user.collegeName || user.college?.collegeName || ''
    });
  };

  // 8. Edit User Details (PUT /api/admin/users/:id)
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { _id, ...payload } = editUserData;
      const res = await apiService.editUser(_id, payload);
      showSuccess(res.message || 'User updated successfully');
      setEditUserData(null);
      fetchUsers();
    } catch (err) {
      showError(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  // 9. Delete User (DELETE /api/admin/users/:id)
  const handleConfirmDelete = async () => {
    if (!deleteUserObj) return;
    setActionLoading(true);
    try {
      const res = await apiService.deleteUser(deleteUserObj._id);
      showSuccess(res.message || `User "${deleteUserObj.name}" deleted successfully.`);
      setDeleteUserObj(null);
      fetchUsers();
    } catch (err) {
      showError(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.collegeName?.toLowerCase().includes(term) ||
      u._id?.toLowerCase().includes(term);
    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const participantsCount = users.filter((u) => u.role === 'user' || !u.role).length;
  const coordinatorsCount = users.filter((u) => u.role === 'coordinator').length;
  const uniqueCollegesCount = new Set(users.map((u) => u.collegeName).filter(Boolean)).size;

  return (
    <div className="user-mgmt-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <Users className="title-icon text-cyan" /> User & Participant Directory
          </h2>
          <p className="page-description">
            Inspect registered student leaders, filter colleges, modify user profiles, and manage active accounts.
          </p>
        </div>

        <div className="header-button-group">
          <button onClick={fetchUsers} className="btn btn-secondary" title="Refresh List">
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="user-kpi-strip">
        <TiltCard maxTilt={5} glareOpacity={0.12} className="user-kpi-tilt">
          <div className="user-kpi-card">
            <span className="user-kpi-label">Total Accounts</span>
            <span className="user-kpi-val text-cyan">
              <CountUp value={users.length} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="user-kpi-tilt">
          <div className="user-kpi-card">
            <span className="user-kpi-label">Student Participants</span>
            <span className="user-kpi-val text-primary">
              <CountUp value={participantsCount} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="user-kpi-tilt">
          <div className="user-kpi-card">
            <span className="user-kpi-label">Event Coordinators</span>
            <span className="user-kpi-val text-warning">
              <CountUp value={coordinatorsCount} />
            </span>
          </div>
        </TiltCard>

        <TiltCard maxTilt={5} glareOpacity={0.12} className="user-kpi-tilt">
          <div className="user-kpi-card">
            <span className="user-kpi-label">Represented Colleges</span>
            <span className="user-kpi-val text-success">
              <CountUp value={uniqueCollegesCount} />
            </span>
          </div>
        </TiltCard>
      </div>

      {/* User Table Card */}
      <div className="card table-card">
        <div className="user-toolbar">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, college or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="search-clear-btn" 
                onClick={() => setSearchTerm('')}
                title="Clear search query"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="user-filter-group">
            <div className="role-filter-wrapper">
              <Filter size={14} className="filter-icon" />
              <select
                className="form-select select-compact"
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="user">Participants (user)</option>
                <option value="coordinator">Coordinators</option>
              </select>
            </div>
            <span className="endpoint-badge">{filteredUsers.length} Users Listed</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Fetching user directory...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            type="users"
            title="No user records found"
            description={searchTerm ? `No users found matching "${searchTerm}".` : "No registered participants or accounts found."}
            secondaryAction={searchTerm ? {
              label: 'Clear Search',
              onClick: () => {
                setSearchTerm('');
                setSelectedRoleFilter('All');
              }
            } : null}
            compact={true}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-responsive desktop-only">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>USER PROFILE</th>
                    <th>ID</th>
                    <th>COLLEGE NAME</th>
                    <th>TEAMS ENROLLED</th>
                    <th>ROLE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div 
                          className="user-profile-cell clickable-user-cell"
                          onClick={() => navigate(`/user/${user._id}`)}
                          title={`View full profile of ${user.name}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="user-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                            {(user.avatar || user.picture || user.photo) ? (
                              <img 
                                src={user.avatar || user.picture || user.photo} 
                                alt={user.name || 'User'} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerText = (user.name || 'U').charAt(0).toUpperCase();
                                  }
                                }}
                              />
                            ) : (
                              user.name?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <div className="user-cell-info">
                            <span className="user-cell-name">{user.name}</span>
                            <span className="user-cell-email">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="user-id-pill" title={`Click to copy: ${user._id}`} onClick={() => {
                          navigator.clipboard.writeText(user._id);
                          showSuccess('User ID copied to clipboard!');
                        }}>
                          <span className="code-font">{user._id ? `${user._id.slice(0, 6)}...${user._id.slice(-4)}` : 'N/A'}</span>
                          <Copy size={11} className="id-copy-icon" />
                        </div>
                      </td>
                      <td>
                        <span className="college-tag">
                          <Building2 size={13} /> {user.collegeName || user.college?.collegeName || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="teams-count-badge">
                          {user.college?.totalTeams || 1} Team(s)
                        </span>
                      </td>
                      <td>
                        <span className="role-badge badge-user">
                          <UserCheck size={11} /> {user.role || 'user'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => navigate(`/user/${user._id}`)}
                            className="btn-icon btn-view"
                            title="View Complete User Profile Hub (/user/:id)"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="btn-icon btn-edit"
                            title="Edit User Details (PUT /api/admin/users/:id)"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteUserObj(user)}
                            className="btn-icon btn-delete"
                            title="Delete User (DELETE /api/admin/users/:id)"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-cards-list mobile-only">
              {filteredUsers.map((user) => (
                <div key={user._id} className="mobile-data-card">
                  {/* Header */}
                  <div className="mobile-card-header">
                    <div className="user-profile-cell">
                      <div className="user-avatar">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="user-cell-info">
                        <span className="user-cell-name">{user.name}</span>
                        <span className="user-cell-email">{user.email}</span>
                      </div>
                    </div>
                    <span className="role-badge badge-user">
                      <UserCheck size={11} /> {user.role || 'user'}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">User ID:</span>
                      <div className="mobile-id-badge">
                        <span className="code-font">{user._id}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user._id);
                            showSuccess('User ID copied to clipboard!');
                          }}
                          className="btn-copy-mini"
                          title="Copy User ID"
                          aria-label="Copy User ID"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">College:</span>
                      <span className="college-tag">
                        <Building2 size={12} /> {user.collegeName || user.college?.collegeName || 'N/A'}
                      </span>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Teams Enrolled:</span>
                      <span className="teams-count-badge">
                        {user.college?.totalTeams || 1} Team(s)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mobile-card-actions">
                    <button
                      onClick={() => handleViewUser(user._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteUserObj(user)}
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View User Modal (GET /api/admin/users/:id) */}
      {selectedUserView && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Eye size={19} /> User Profile Inspection</h3>
              <button className="modal-close" onClick={() => setSelectedUserView(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>GET /api/admin/users/{selectedUserView._id}</code>
            </p>

            <div className="user-detail-card">
              <div className="detail-row">
                <span className="detail-label">User ID</span>
                <span className="code-font">{selectedUserView._id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Full Name</span>
                <span className="font-bold">{selectedUserView.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email Address</span>
                <span>{selectedUserView.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Assigned Role</span>
                <span className="role-badge badge-user">{selectedUserView.role || 'user'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">College Name</span>
                <span>{selectedUserView.collegeName || selectedUserView.college?.collegeName || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registered Teams</span>
                <span className="teams-count-badge">{selectedUserView.college?.totalTeams || 1} team(s)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created At</span>
                <span className="date-text">{new Date(selectedUserView.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedUserView(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal (PUT /api/admin/users/:id) */}
      {editUserData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Edit2 size={19} /> Edit User Details</h3>
              <button className="modal-close" onClick={() => setEditUserData(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>PUT /api/admin/users/{editUserData._id}</code>
            </p>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editUserData.collegeName}
                  onChange={(e) => setEditUserData({ ...editUserData, collegeName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                >
                  <option value="user">user (Participant)</option>
                  <option value="coordinator">coordinator (Event Organizer)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditUserData(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save User Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Dialog (DELETE /api/admin/users/:id) */}
      {deleteUserObj && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}><Trash2 size={19} /> Confirm User Deletion</h3>
              <button className="modal-close" onClick={() => setDeleteUserObj(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>DELETE /api/admin/users/{deleteUserObj._id}</code>
            </p>

            <div className="delete-target-info" style={{ background: 'var(--badge-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem 1rem', margin: '1rem 0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>{deleteUserObj.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{deleteUserObj.email} • {deleteUserObj.collegeName || deleteUserObj.college?.collegeName || 'N/A'}</div>
              <div className="code-font" style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>ID: {deleteUserObj._id}</div>
            </div>

            <p className="delete-warning-text">
              Are you sure you want to permanently delete this user account? This user will no longer be able to log in or register teams.
            </p>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteUserObj(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting User...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

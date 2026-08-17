import { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { Users, Search, Edit2, Trash2, Eye, RefreshCw, AlertCircle, CheckCircle2, Building2, Mail, ShieldCheck } from 'lucide-react';
import './UserManagement.css';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [selectedUserView, setSelectedUserView] = useState(null);
  const [editUserData, setEditUserData] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 6. Retrieve All Users (GET /api/admin/users)
  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiService.getAllUsers();
      setUsers(res);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 7. Retrieve Single User (GET /api/admin/users/:id)
  const handleViewUser = async (id) => {
    setErrorMsg('');
    try {
      const user = await apiService.getUserById(id);
      setSelectedUserView(user);
    } catch (err) {
      setErrorMsg(err.message || 'User not found');
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
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { _id, ...payload } = editUserData;
      const res = await apiService.editUser(_id, payload);
      setSuccessMsg(res.message || 'User updated successfully');
      setEditUserData(null);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  // 9. Delete User (DELETE /api/admin/users/:id)
  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await apiService.deleteUser(deleteUserId);
      setSuccessMsg(res.message || 'User deleted successfully');
      setDeleteUserId(null);
      fetchUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.collegeName?.toLowerCase().includes(term) ||
      u._id?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="user-mgmt-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <Users className="title-icon" /> User & College Registration Management
          </h2>
          <p className="page-description">
            View registered participants, filter by college, modify user profiles, and manage active accounts.
          </p>
        </div>

        <div className="header-button-group">
          <button onClick={fetchUsers} className="btn btn-secondary" title="Refresh List">
            <RefreshCw size={16} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* User Table Card */}
      <div className="card table-card">
        <div className="card-header border-none">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search users by Name, Email, College, or User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <span className="endpoint-badge">GET /api/admin/users</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Fetching user directory...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No user records found matching "{searchTerm}".</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="user-table">
              <thead>
                <tr>
                  <th>USER ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>COLLEGE NAME</th>
                  <th>TEAMS REGISTERED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="code-font">{user._id}</td>
                    <td className="font-semibold">{user.name}</td>
                    <td>{user.email}</td>
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
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="btn-icon btn-view"
                          title="Retrieve Single User (GET /api/admin/users/:id)"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="btn-icon btn-edit"
                          title="Edit User Details (PUT /api/admin/users/:id)"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteUserId(user._id)}
                          className="btn-icon btn-delete"
                          title="Delete User (DELETE /api/admin/users/:id)"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View User Modal (GET /api/admin/users/:id) */}
      {selectedUserView && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Eye size={20} /> User Details Inspection</h3>
              <button className="modal-close" onClick={() => setSelectedUserView(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>GET /api/admin/users/{selectedUserView._id}</code>
            </p>

            <div className="user-detail-card">
              <div className="detail-row">
                <span className="detail-label">User ID:</span>
                <span className="code-font">{selectedUserView._id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="font-bold">{selectedUserView.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email Address:</span>
                <span>{selectedUserView.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Assigned Role:</span>
                <span className="badge-user">{selectedUserView.role}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">College Name:</span>
                <span>{selectedUserView.collegeName || selectedUserView.college?.collegeName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registered Teams:</span>
                <span>{selectedUserView.college?.totalTeams || 1} team(s)</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created At:</span>
                <span className="date-text">{new Date(selectedUserView.createdAt).toLocaleString()}</span>
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
              <h3><Edit2 size={20} /> Edit User Details</h3>
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
                  <option value="user">user</option>
                  <option value="coordinator">coordinator</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditUserData(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Dialog (DELETE /api/admin/users/:id) */}
      {deleteUserId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Trash2 size={20} className="text-red" /> Confirm User Deletion</h3>
              <button className="modal-close" onClick={() => setDeleteUserId(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>DELETE /api/admin/users/{deleteUserId}</code>
            </p>

            <p className="delete-warning-text">
              Are you sure you want to permanently delete user <code className="code-font">{deleteUserId}</code>? This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteUserId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

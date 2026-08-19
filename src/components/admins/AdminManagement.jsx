import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { 
  ShieldCheck, 
  UserPlus, 
  UserCheck, 
  ShieldAlert, 
  Key, 
  Mail, 
  User, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Crown,
  Copy,
  Check
} from 'lucide-react';
import './AdminManagement.css';

export const AdminManagement = () => {
  const { admin: currentAdmin, isSuperAdmin } = useAuth();
  const [adminsList, setAdminsList] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedAdminForRole, setSelectedAdminForRole] = useState(null);

  // Add Admin Form
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  // Change Role Form
  const [roleForm, setRoleForm] = useState({
    adminId: '',
    email: '',
    role: 'superadmin',
    useEmail: false
  });

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const profile = await apiService.getAdminProfile();
      setMyProfile(profile);

      if (isSuperAdmin || profile.role === 'superadmin') {
        const allAdmins = await apiService.getAllAdmins();
        setAdminsList(allAdmins);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [isSuperAdmin]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle Add Admin Submit (POST /api/admin/addadmin)
  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await apiService.addAdmin(newAdmin);
      setSuccessMsg(`Admin "${res.name}" created successfully as ${res.role}!`);
      setShowAddModal(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add admin');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Role Change Submit (PUT /api/admin/makeadmin)
  const handleMakeAdminSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = roleForm.useEmail
        ? { email: roleForm.email, role: roleForm.role }
        : { adminId: roleForm.adminId, role: roleForm.role };

      const res = await apiService.changeAdminRole(payload);
      setSuccessMsg(res.message || `Admin role updated to ${res.role}!`);
      setShowRoleModal(false);
      fetchAdminData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update admin role');
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModalForAdmin = (adminObj) => {
    setSelectedAdminForRole(adminObj);
    setRoleForm({
      adminId: adminObj._id,
      email: adminObj.email,
      role: adminObj.role === 'superadmin' ? 'admin' : 'superadmin',
      useEmail: false
    });
    setShowRoleModal(true);
  };

  return (
    <div className="admin-mgmt-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <ShieldCheck className="title-icon" /> Administrator & Security Access
          </h2>
          <p className="page-description">
            Manage system administrators, provision new admin accounts, and assign role privileges.
          </p>
        </div>

        <div className="header-button-group">
          <button onClick={fetchAdminData} className="btn btn-secondary" title="Refresh Data">
            <RefreshCw size={15} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
          {isSuperAdmin && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <UserPlus size={15} /> Add New Admin
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={17} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={17} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="card profile-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <User size={17} /> Current Active Session
            </h3>
            <p className="card-subtitle">Authenticated Admin Profile Details</p>
          </div>
          <span className="endpoint-badge">Session Verified</span>
        </div>

        <div className="profile-details-grid">
          <div className="profile-field">
            <span className="field-label">Admin ID</span>
            <div className="field-copy-row">
              <span className="field-value code-font">{myProfile?._id || currentAdmin?._id || '—'}</span>
              <button 
                className="copy-btn" 
                onClick={() => handleCopyId(myProfile?._id || currentAdmin?._id)}
                title="Copy ID"
              >
                {copiedId ? <Check size={13} className="text-success" /> : <Copy size={13} />}
              </button>
            </div>
          </div>

          <div className="profile-field">
            <span className="field-label">Full Name</span>
            <span className="field-value font-bold">{myProfile?.name || currentAdmin?.name || '—'}</span>
          </div>

          <div className="profile-field">
            <span className="field-label">Email Address</span>
            <span className="field-value">{myProfile?.email || currentAdmin?.email || '—'}</span>
          </div>

          <div className="profile-field">
            <span className="field-label">Assigned Role</span>
            <div>
              <span className={`role-badge ${myProfile?.role === 'superadmin' ? 'badge-superadmin' : 'badge-admin'}`}>
                {myProfile?.role === 'superadmin' ? <Crown size={12} /> : <UserCheck size={12} />}
                {myProfile?.role || currentAdmin?.role || 'admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All Admins Table */}
      <div className="card table-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Key size={17} /> System Administrators List
            </h3>
            <p className="card-subtitle">
              {isSuperAdmin
                ? 'Authorized view of all system administrators and roles'
                : 'Requires Superadmin privileges to view and manage full list'}
            </p>
          </div>

          <span className="endpoint-badge">Access Control</span>
        </div>

        {!isSuperAdmin ? (
          <div className="restricted-notice">
            <ShieldAlert size={28} className="warning-icon" />
            <div>
              <h4>Restricted Superadmin View</h4>
              <p>Only administrators with the <code>superadmin</code> role can query all administrators and update user roles.</p>
            </div>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Loading admin accounts...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ADMIN USER</th>
                  <th>ID</th>
                  <th>ROLE</th>
                  <th>CREATED AT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {adminsList.map((adm) => (
                  <tr key={adm._id} className={adm._id === currentAdmin?._id ? 'highlight-row' : ''}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                          {adm.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="admin-user-info">
                          <span className="admin-user-name">
                            {adm.name} {adm._id === currentAdmin?._id && <span className="you-tag">(You)</span>}
                          </span>
                          <span className="admin-user-email">{adm.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="code-font">{adm._id}</td>
                    <td>
                      <span className={`role-badge ${adm.role === 'superadmin' ? 'badge-superadmin' : 'badge-admin'}`}>
                        {adm.role === 'superadmin' ? <Crown size={12} /> : null}
                        {adm.role}
                      </span>
                    </td>
                    <td className="date-text">{new Date(adm.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <button
                        onClick={() => openRoleModalForAdmin(adm)}
                        className="btn btn-xs btn-outline-warning"
                        title="Change Admin Role (PUT /api/admin/makeadmin)"
                      >
                        <Key size={12} /> Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Admin Modal (POST /api/admin/addadmin) */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><UserPlus size={19} /> Add New Administrator</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>POST /api/admin/addadmin</code>
            </p>

            <form onSubmit={handleAddAdminSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={16} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Swasthik Lead"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={16} />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. swasthik@semaphore.com"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Key className="input-icon" size={16} />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Set secure password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Role</label>
                <select
                  className="form-select"
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                >
                  <option value="admin">Standard Admin (admin)</option>
                  <option value="superadmin">Super Administrator (superadmin)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal (PUT /api/admin/makeadmin) */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Key size={19} /> Modify Admin Role</h3>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>&times;</button>
            </div>
            <p className="modal-subtitle">
              Endpoint: <code>PUT /api/admin/makeadmin</code>
            </p>

            <form onSubmit={handleMakeAdminSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Target Admin Email</label>
                <input
                  type="text"
                  className="form-input"
                  value={roleForm.email}
                  onChange={(e) => setRoleForm({ ...roleForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Admin ID</label>
                <input
                  type="text"
                  className="form-input code-font"
                  value={roleForm.adminId}
                  onChange={(e) => setRoleForm({ ...roleForm, adminId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Assigned Role</label>
                <select
                  className="form-select"
                  value={roleForm.role}
                  onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                >
                  <option value="superadmin">superadmin (Full Privileges)</option>
                  <option value="admin">admin (Standard Moderator)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRoleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning" disabled={actionLoading}>
                  {actionLoading ? 'Updating Role...' : 'Save Role Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

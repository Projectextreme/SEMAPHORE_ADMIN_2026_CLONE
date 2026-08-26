import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
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
  Check,
  Trash2,
  Search,
  X
} from 'lucide-react';
import { CountUp } from '../common/CountUp';
import { TiltCard } from '../common/TiltCard';
import './AdminManagement.css';

export const AdminManagement = () => {
  const { admin: currentAdmin, isSuperAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [adminsList, setAdminsList] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
    try {
      const profile = await apiService.getAdminProfile();
      setMyProfile(profile);

      if (isSuperAdmin || profile.role === 'superadmin') {
        const allAdmins = await apiService.getAllAdmins();
        setAdminsList(allAdmins);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch admin data');
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
    showSuccess('Admin ID copied to clipboard!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle Add Admin Submit (POST /api/admin/addadmin)
  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await apiService.addAdmin({
        ...newAdmin,
        role: 'admin'
      });
      showSuccess(`Standard Admin "${res.name}" created successfully!`);
      setShowAddModal(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Failed to add admin');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Role Change Submit (PUT /api/admin/makeadmin)
  const handleMakeAdminSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = roleForm.useEmail
        ? { email: roleForm.email, role: roleForm.role }
        : { adminId: roleForm.adminId, role: roleForm.role };

      const res = await apiService.changeAdminRole(payload);
      showSuccess(res.message || `Admin role updated to ${res.role}!`);
      setShowRoleModal(false);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Failed to update admin role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (id, name, email = '') => {
    if (!window.confirm(`Are you sure you want to remove standard admin "${name}"?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiService.deleteAdmin(id, { name, email });
      showSuccess(res?.message || `Standard admin "${name}" removed successfully.`);
      fetchAdminData();
    } catch (err) {
      showError(err.message || 'Failed to delete admin');
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModalForAdmin = (adminObj) => {
    setSelectedAdminForRole(adminObj);
    setRoleForm({
      adminId: adminObj._id,
      email: adminObj.email,
      role: 'admin',
      useEmail: false
    });
    setShowRoleModal(true);
  };

  const filteredAdminsList = adminsList.filter((adm) => {
    const term = searchTerm.toLowerCase();
    return (
      (adm.name || '').toLowerCase().includes(term) ||
      (adm.email || '').toLowerCase().includes(term) ||
      (adm.role || '').toLowerCase().includes(term) ||
      (adm._id || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="admin-mgmt-container">
      {/* Page Header */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <ShieldCheck className="title-icon text-cyan" /> Administrator & Security Access
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
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-glow-sheen">
              <UserPlus size={15} /> Add New Admin
            </button>
          )}
        </div>
      </div>

      {/* My Profile Card (GET /api/admin/profile) */}
      <TiltCard maxTilt={4} glareOpacity={0.12} className="admin-profile-tilt">
        <div className="card profile-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <UserCheck size={17} className="text-cyan" /> Active Admin Session Profile
              </h3>
              <p className="card-subtitle">Endpoint: <code>GET /api/admin/profile</code></p>
            </div>
            <span className="badge badge-success">Authenticated</span>
          </div>

          <div className="profile-details-grid">
            <div className="profile-field">
              <span className="field-label">Administrator Name</span>
              <strong className="field-value font-bold">{myProfile?.name || currentAdmin?.name || 'Super Admin'}</strong>
            </div>

            <div className="profile-field">
              <span className="field-label">Email Address</span>
              <span className="field-value">{myProfile?.email || currentAdmin?.email}</span>
            </div>

            <div className="profile-field">
              <span className="field-label">Security Role</span>
              <div>
                <span className={`role-badge ${myProfile?.role === 'superadmin' ? 'badge-superadmin' : 'badge-admin'}`}>
                  {myProfile?.role === 'superadmin' ? <Crown size={12} /> : null}
                  {myProfile?.role || currentAdmin?.role || 'admin'}
                </span>
              </div>
            </div>

            <div className="profile-field">
              <span className="field-label">Admin ID Reference</span>
              <div className="field-copy-row">
                <span className="field-value code-font">{myProfile?._id || currentAdmin?._id}</span>
                <button 
                  onClick={() => handleCopyId(myProfile?._id || currentAdmin?._id)} 
                  className="copy-btn"
                  title="Copy Admin ID"
                >
                  {copiedId ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* All Admins Table */}
      <div className="card table-card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
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

          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <div className="search-bar-wrapper">
                <Search className="search-icon" size={15} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search admin name, email, or role..."
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
              <span className="endpoint-badge">{filteredAdminsList.length} Admins</span>
            </div>
          )}
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
        ) : filteredAdminsList.length === 0 ? (
          <EmptyState
            type="users"
            title="No administrators found"
            description={searchTerm ? `No administrator accounts found matching "${searchTerm}".` : "No other administrator accounts found."}
            primaryAction={{
              label: 'Add New Admin',
              onClick: () => setShowAddModal(true)
            }}
            secondaryAction={searchTerm ? {
              label: 'Clear Search',
              onClick: () => setSearchTerm('')
            } : null}
            compact={true}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-responsive desktop-only">
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
                  {filteredAdminsList.map((adm) => (
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
                        {adm.role === 'superadmin' ? (
                          <span className="protected-badge" title="Super Admin accounts are protected and cannot be deleted or modified">
                            <Crown size={12} className="crown-icon" /> Superadmin (Protected)
                          </span>
                        ) : (
                          <div className="table-actions-cell">
                            <button
                              onClick={() => handleDeleteAdmin(adm._id, adm.name, adm.email)}
                              className="btn btn-xs btn-outline-danger"
                              title="Remove Standard Admin Account"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-cards-list mobile-only" style={{ padding: '0.75rem 0.5rem' }}>
              {filteredAdminsList.map((adm) => (
                <div key={adm._id} className={`mobile-data-card ${adm._id === currentAdmin?._id ? 'highlight-row' : ''}`}>
                  <div className="mobile-card-header">
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
                    <span className={`role-badge ${adm.role === 'superadmin' ? 'badge-superadmin' : 'badge-admin'}`}>
                      {adm.role === 'superadmin' ? <Crown size={12} /> : null}
                      {adm.role}
                    </span>
                  </div>

                  <div className="mobile-card-body">
                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Admin ID:</span>
                      <div className="mobile-id-badge">
                        <span className="code-font">{adm._id}</span>
                        <button
                          onClick={() => handleCopyId(adm._id)}
                          className="btn-copy-mini"
                          title="Copy ID"
                          aria-label="Copy ID"
                        >
                          {copiedId ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>

                    <div className="mobile-card-row">
                      <span className="mobile-card-label">Created:</span>
                      <span className="mobile-card-value" style={{ fontSize: '0.8rem' }}>
                        {new Date(adm.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="mobile-card-actions">
                    {adm.role === 'superadmin' ? (
                      <span className="protected-badge" style={{ width: '100%', justifyContent: 'center' }}>
                        <Crown size={12} className="crown-icon" /> Superadmin (Protected)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteAdmin(adm._id, adm.name, adm.email)}
                        className="btn btn-danger btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Trash2 size={13} /> Remove Admin
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Admin Modal (POST /api/admin/addadmin) */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="540px">
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
              <div className="fixed-role-badge">
                <ShieldCheck size={16} className="text-cyan" />
                <span>Standard Administrator (<code>admin</code>)</span>
              </div>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                Superadmins can provision Standard Admin accounts only. Superadmin accounts cannot be created from this panel.
              </small>
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
        </Modal>
      )}

      {/* Change Role Modal (PUT /api/admin/makeadmin) */}
      {showRoleModal && (
        <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} maxWidth="520px">
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
        </Modal>
      )}
    </div>
  );
};

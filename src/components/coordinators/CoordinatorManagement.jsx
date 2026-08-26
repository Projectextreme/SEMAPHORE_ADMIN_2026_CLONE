import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { apiService } from '../../services/apiService';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone, 
  Mail, 
  Tag, 
  Calendar, 
  X, 
  RefreshCw, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { TiltCard } from '../common/TiltCard';
import './CoordinatorManagement.css';

export const CoordinatorManagement = () => {
  const { showSuccess, showError } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [coordinators, setCoordinators] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoord, setEditingCoord] = useState(null);
  const [deletingCoord, setDeletingCoord] = useState(null);

  const [newCoord, setNewCoord] = useState({
    name: '',
    email: '',
    phone: '',
    assignedEvent: '',
    department: '',
    status: 'Active'
  });

  const showToast = (msg, isError = false) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  };

  const loadData = async (showToastNotice = false) => {
    setIsRefreshing(true);
    try {
      const [coordsData, eventsData] = await Promise.all([
        apiService.getCoordinators(),
        apiService.getAllEvents()
      ]);

      const coordsList = Array.isArray(coordsData) ? coordsData : [];
      setCoordinators(coordsList);

      const eventsList = Array.isArray(eventsData) ? eventsData : (eventsData?.events || []);
      const eventTitles = eventsList.map(e => e.title || e.name).filter(Boolean);
      
      const allEventsSet = new Set([
        ...eventTitles,
        ...coordsList.map(c => c.assignedEvent).filter(Boolean)
      ]);
      const mergedEvents = Array.from(allEventsSet);
      setAvailableEvents(mergedEvents);

      if (mergedEvents.length > 0 && !mergedEvents.includes(newCoord.assignedEvent)) {
        setNewCoord(prev => ({ ...prev, assignedEvent: prev.assignedEvent || mergedEvents[0] }));
      }

      if (showToastNotice) {
        showSuccess('Event coordinators roster reloaded successfully.');
      }
    } catch (err) {
      console.error('Failed to load coordinators:', err);
      showError('Failed to load coordinators.');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newCoord.name.trim() || !newCoord.email.trim() || !newCoord.phone.trim()) {
      showToast('Please fill in all required fields.', true);
      return;
    }
    setActionLoading(true);
    try {
      const created = await apiService.addCoordinator(newCoord);
      setCoordinators(prev => {
        const filtered = prev.filter(c => (c._id || c.id) !== (created._id || created.id) && c.email !== created.email);
        return [created, ...filtered];
      });
      setShowAddModal(false);
      const coordName = created.name;
      setNewCoord({
        name: '',
        email: '',
        phone: '',
        assignedEvent: availableEvents[0] || '',
        department: '',
        status: 'Active'
      });
      showToast(`Coordinator "${coordName}" created and assigned successfully!`);
      const refreshed = await apiService.getCoordinators();
      if (Array.isArray(refreshed) && refreshed.length > 0) {
        setCoordinators(refreshed);
      }
    } catch (err) {
      console.error('Error creating coordinator:', err);
      showToast(err.message || 'Failed to save coordinator.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCoord) return;
    setActionLoading(true);
    try {
      const updated = await apiService.updateCoordinator(editingCoord.id || editingCoord._id, editingCoord);
      setCoordinators(prev => prev.map(c => (c.id === editingCoord.id || c._id === editingCoord._id) ? updated : c));
      setEditingCoord(null);
      showToast(`Coordinator "${updated.name || editingCoord.name}" details updated!`);
      const refreshed = await apiService.getCoordinators();
      if (Array.isArray(refreshed)) {
        setCoordinators(refreshed);
      }
    } catch (err) {
      console.error('Error updating coordinator:', err);
      showToast('Failed to update coordinator.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (coord) => {
    if (!coord) return;
    const id = coord.id || coord._id;
    setActionLoading(true);
    try {
      await apiService.deleteCoordinator(id, coord);
      setCoordinators(prev => prev.filter(c => (c.id !== id && c._id !== id && c.email !== coord.email)));
      setDeletingCoord(null);
      showToast(`Coordinator "${coord?.name || 'Entry'}" removed successfully.`);
      const refreshed = await apiService.getCoordinators();
      setCoordinators(refreshed);
    } catch (err) {
      console.error('Error deleting coordinator:', err);
      showToast(err.message || 'Failed to delete coordinator.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const filterEventsList = ['All', ...new Set(coordinators.map(c => c.assignedEvent).filter(Boolean))];

  const filtered = coordinators.filter(c => {
    const matchesEvent = selectedEvent === 'All' || c.assignedEvent === selectedEvent;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (c.name || '').toLowerCase().includes(term) ||
      (c.assignedEvent || '').toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.department || '').toLowerCase().includes(term);
    return matchesEvent && matchesSearch;
  });

  return (
    <div className="coord-container">
      {/* Title */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <UserCheck className="title-icon" /> Event Coordinators & Faculty Roster
          </h2>
          <p className="page-description">
            Assign student leads and event managers to designated festival competitions and lab venues.
          </p>
        </div>

        <div className="title-actions-group">
          <button 
            onClick={() => loadData(true)} 
            className="btn btn-secondary"
            disabled={isRefreshing || loading}
            title="Refresh Coordinators Roster"
            aria-label="Refresh Coordinators"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh List'}</span>
          </button>

          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={15} /> Add Coordinator
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="card toolbar-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by coordinator name, event, or email..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={14} style={{ color: 'var(--text-dim)' }} />
              <select
                className="form-select select-compact"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {filterEventsList.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt === 'All' ? 'All Assigned Events' : evt}
                  </option>
                ))}
              </select>
            </div>
            <span className="endpoint-badge">{filtered.length} Coordinators</span>
          </div>
        </div>
      </div>

      {/* Coordinators Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
          <Loader2 size={20} className="spin-icon text-primary" />
          <span>Loading event coordinators roster...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="users"
          title="No event coordinators found"
          description={searchTerm ? `No coordinators found matching "${searchTerm}".` : "No event coordinators have been assigned."}
          primaryAction={{
            label: 'Assign Coordinator',
            onClick: () => setShowAddModal(true)
          }}
          secondaryAction={searchTerm ? {
            label: 'Clear Search',
            onClick: () => {
              setSearchTerm('');
              setSelectedEvent('All');
            }
          } : null}
        />
      ) : (
        <div className="coords-grid">
          {filtered.map((coord) => (
            <TiltCard key={coord.id || coord._id} maxTilt={5} glareOpacity={0.12} className="coord-card-tilt">
              <div className="card coord-card">
                <div className="coord-card-header">
                  <div className="coord-avatar">
                    {(coord.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="coord-meta">
                    <h4 className="coord-name">{coord.name}</h4>
                    <span className="coord-dept">{coord.department || 'Department Lead'}</span>
                  </div>
                  <span className={`status-pill status-${(coord.status || 'active').toLowerCase()}`}>
                    {coord.status || 'Active'}
                  </span>
                </div>

                <div className="coord-body">
                  <div className="coord-detail-row">
                    <Tag size={13} className="detail-icon" />
                    <span className="detail-val font-bold text-primary">{coord.assignedEvent || 'General Event'}</span>
                  </div>
                  <div className="coord-detail-row">
                    <Mail size={13} className="detail-icon" />
                    <span className="detail-val">{coord.email || 'N/A'}</span>
                  </div>
                  <div className="coord-detail-row">
                    <Phone size={13} className="detail-icon" />
                    <span className="detail-val">{coord.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="coord-card-footer">
                  <span className="coord-id-tag code-font">{coord.id || coord._id}</span>
                  <div className="coord-actions">
                    <button
                      onClick={() => setEditingCoord({ ...coord })}
                      className="btn-icon btn-edit"
                      title="Edit Coordinator Details"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingCoord(coord)}
                      className="btn-icon btn-delete"
                      title="Remove Coordinator"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="520px">
          <div className="modal-header">
            <h3><Plus size={19} /> Add New Coordinator</h3>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
          </div>
          <p className="modal-subtitle">Assign event lead duties and contact references</p>

          <form onSubmit={handleAddSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dheemanth"
                value={newCoord.name}
                onChange={(e) => setNewCoord({ ...newCoord, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. dheemanth@semaphore.com"
                value={newCoord.email}
                onChange={(e) => setNewCoord({ ...newCoord, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 98765 43210"
                value={newCoord.phone}
                onChange={(e) => setNewCoord({ ...newCoord, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assigned Event</label>
                <select
                  className="form-select"
                  value={newCoord.assignedEvent}
                  onChange={(e) => setNewCoord({ ...newCoord, assignedEvent: e.target.value })}
                >
                  {availableEvents.map((evt) => (
                    <option key={evt} value={evt}>
                      {evt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department / Year</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="MCA 2nd Year"
                  value={newCoord.department}
                  onChange={(e) => setNewCoord({ ...newCoord, department: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Assigning...' : 'Assign Coordinator'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingCoord && (
        <Modal isOpen={!!editingCoord} onClose={() => setEditingCoord(null)} maxWidth="520px">
          <div className="modal-header">
            <h3><Edit2 size={19} /> Edit Coordinator</h3>
            <button className="modal-close" onClick={() => setEditingCoord(null)}>&times;</button>
          </div>
          <p className="modal-subtitle">Update contact and event assignment for {editingCoord.name}</p>

          <form onSubmit={handleEditSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={editingCoord.name}
                onChange={(e) => setEditingCoord({ ...editingCoord, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={editingCoord.email}
                onChange={(e) => setEditingCoord({ ...editingCoord, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-input"
                value={editingCoord.phone}
                onChange={(e) => setEditingCoord({ ...editingCoord, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assigned Event</label>
                <select
                  className="form-select"
                  value={editingCoord.assignedEvent}
                  onChange={(e) => setEditingCoord({ ...editingCoord, assignedEvent: e.target.value })}
                >
                  {availableEvents.map((evt) => (
                    <option key={evt} value={evt}>
                      {evt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department / Year</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingCoord.department || ''}
                  onChange={(e) => setEditingCoord({ ...editingCoord, department: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCoord(null)} disabled={actionLoading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCoord && (
        <Modal isOpen={!!deletingCoord} onClose={() => setDeletingCoord(null)} maxWidth="480px" isDanger={true}>
          <div className="modal-header">
            <h3><AlertTriangle size={19} className="text-danger" /> Remove Coordinator</h3>
            <button className="modal-close" onClick={() => setDeletingCoord(null)}>&times;</button>
          </div>
          <p className="modal-subtitle">
            Are you sure you want to remove <strong>{deletingCoord.name}</strong> from <strong>{deletingCoord.assignedEvent || 'assigned event'}</strong>?
          </p>
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            This will dissociate the coordinator from the event roster on the server.
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setDeletingCoord(null)} disabled={actionLoading}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handleDelete(deletingCoord)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

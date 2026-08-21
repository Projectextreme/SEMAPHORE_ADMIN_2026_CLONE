import { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Mail, 
  Phone, 
  Calendar, 
  Edit2, 
  Trash2, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Award,
  RefreshCw
} from 'lucide-react';
import './CoordinatorManagement.css';

export const CoordinatorManagement = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [coordinators, setCoordinators] = useState([
    {
      id: 'COORD-01',
      name: 'Havyas K',
      email: 'havyas@semaphore.com',
      phone: '+91 98451 22341',
      assignedEvent: 'CodeFest 2026',
      department: 'MCA Final Year',
      status: 'Active'
    },
    {
      id: 'COORD-02',
      name: 'Shashidhara M',
      email: 'shashi@semaphore.com',
      phone: '+91 97410 55432',
      assignedEvent: 'CodeFest 2026',
      department: 'MCA 1st Year',
      status: 'Active'
    },
    {
      id: 'COORD-03',
      name: 'Swasthik Lead',
      email: 'swasthik@semaphore.com',
      phone: '+91 91234 56780',
      assignedEvent: 'RoboWars Arena',
      department: 'Lead Organizer',
      status: 'Active'
    },
    {
      id: 'COORD-04',
      name: 'Hanson DSouza',
      email: 'hanson@semaphore.com',
      phone: '+91 94488 12399',
      assignedEvent: 'WebCrafters',
      department: 'MCA 2nd Year',
      status: 'Active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoord, setEditingCoord] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const [newCoord, setNewCoord] = useState({
    name: '',
    email: '',
    phone: '',
    assignedEvent: 'CodeFest 2026',
    department: 'MCA',
    status: 'Active'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `COORD-0${coordinators.length + 1}`,
      ...newCoord
    };
    setCoordinators([...coordinators, created]);
    setShowAddModal(false);
    setNewCoord({
      name: '',
      email: '',
      phone: '',
      assignedEvent: 'CodeFest 2026',
      department: 'MCA',
      status: 'Active'
    });
    showToast(`Coordinator "${created.name}" assigned successfully!`);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setCoordinators(coordinators.map(c => c.id === editingCoord.id ? editingCoord : c));
    setEditingCoord(null);
    showToast('Coordinator details updated!');
  };

  const handleDelete = (id) => {
    setCoordinators(coordinators.filter(c => c.id !== id));
    showToast('Coordinator removed.');
  };

  const filtered = coordinators.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.assignedEvent.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
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
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => {
                setIsRefreshing(false);
                setToastMsg('Coordinators roster reloaded from department directory.');
                setTimeout(() => setToastMsg(null), 3000);
              }, 500);
            }} 
            className="btn btn-secondary"
            disabled={isRefreshing}
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

      {/* Toast Alert */}
      {toastMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="card toolbar-card">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={15} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by coordinator name, event, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Coordinators Grid */}
      <div className="coords-grid">
        {filtered.map((coord) => (
          <div key={coord.id} className="card coord-card">
            <div className="coord-card-header">
              <div className="coord-avatar">
                {coord.name.charAt(0)}
              </div>
              <div className="coord-name-col">
                <h3 className="coord-name">{coord.name}</h3>
                <span className="coord-id code-font">{coord.id}</span>
              </div>
              <span className="status-badge status-approved">{coord.status}</span>
            </div>

            <div className="coord-info-body">
              <div className="coord-event-tag">
                <Award size={13} />
                <span>{coord.assignedEvent}</span>
              </div>

              <div className="coord-contact-row">
                <Mail size={13} className="contact-icon" />
                <span className="contact-text">{coord.email}</span>
              </div>

              <div className="coord-contact-row">
                <Phone size={13} className="contact-icon" />
                <span className="contact-text">{coord.phone}</span>
              </div>
            </div>

            <div className="coord-card-footer">
              <span className="dept-tag">{coord.department}</span>
              <div className="action-buttons">
                <button
                  onClick={() => setEditingCoord(coord)}
                  className="btn-icon btn-edit"
                  title="Edit Coordinator"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(coord.id)}
                  className="btn-icon btn-delete"
                  title="Remove Coordinator"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
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
                    <option value="CodeFest 2026">CodeFest 2026</option>
                    <option value="RoboWars Arena">RoboWars Arena</option>
                    <option value="WebCrafters">WebCrafters</option>
                    <option value="Gaming & Esports">Gaming & Esports</option>
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
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Coordinator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCoord && (
        <div className="modal-overlay">
          <div className="modal-content">
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
                    <option value="CodeFest 2026">CodeFest 2026</option>
                    <option value="RoboWars Arena">RoboWars Arena</option>
                    <option value="WebCrafters">WebCrafters</option>
                    <option value="Gaming & Esports">Gaming & Esports</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department / Year</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingCoord.department}
                    onChange={(e) => setEditingCoord({ ...editingCoord, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCoord(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

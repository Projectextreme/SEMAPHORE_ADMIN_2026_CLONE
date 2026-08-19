import { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  MapPin,
  Search,
  AlertCircle,
  Check,
  Loader2,
  Tag,
  UserCheck
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import './EventManagement.css';

export const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [alert, setAlert] = useState(null);

  // Add Event Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Coding & Hackathon',
    fee: '₹ 500',
    maxTeamsPerCollege: 2,
    maxTeamMembers: 4,
    venue: 'Main Auditorium',
    coordinators: '',
    status: 'Active'
  });

  // Edit Event Modal State
  const [editingEvent, setEditingEvent] = useState(null);

  // Delete Confirmation Modal State
  const [deletingEvent, setDeletingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      showAlert('error', 'Failed to load events list.');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const toggleEventStatus = async (evt) => {
    const updatedStatus = evt.status === 'Active' ? 'Draft' : 'Active';
    try {
      await apiService.editEvent(evt.id, { status: updatedStatus });
      setEvents((prev) =>
        prev.map((e) => (e.id === evt.id ? { ...e, status: updatedStatus } : e))
      );
      showAlert('success', `Event "${evt.title}" status changed to ${updatedStatus}.`);
    } catch (err) {
      showAlert('error', 'Failed to update event status.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    if (!newEvent.title.trim() || !newEvent.fee.trim() || !newEvent.venue.trim()) {
      showAlert('error', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await apiService.addEvent(newEvent);
      setEvents((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewEvent({
        title: '',
        category: 'Coding & Hackathon',
        fee: '₹ 500',
        maxTeamsPerCollege: 2,
        maxTeamMembers: 4,
        venue: 'Main Auditorium',
        coordinators: '',
        status: 'Active'
      });
      showAlert('success', `Event "${created.title}" created successfully!`);
    } catch (err) {
      console.error('Error creating event:', err);
      showAlert('error', err.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (!editingEvent.title.trim() || !editingEvent.fee.trim() || !editingEvent.venue.trim()) {
      showAlert('error', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await apiService.editEvent(editingEvent.id, editingEvent);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setEditingEvent(null);
      showAlert('success', `Event "${updated.title}" updated successfully!`);
    } catch (err) {
      console.error('Error updating event:', err);
      showAlert('error', err.message || 'Failed to update event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    setSubmitting(true);
    try {
      await apiService.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setDeletingEvent(null);
      showAlert('success', 'Event removed successfully.');
    } catch (err) {
      console.error('Error deleting event:', err);
      showAlert('error', 'Failed to delete event.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="events-container">
      {/* Title */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <Calendar className="title-icon" /> Festival Events & Competition Rules
          </h2>
          <p className="page-description">
            Configure Semaphore 2026 events, maximum team capacities, venue schedules, and registration states.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={15} /> Create New Event
        </button>
      </div>

      {/* Alert Notification */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.type === 'success' ? <Check size={17} /> : <AlertCircle size={17} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Toolbar Filter & Search */}
      <div className="card events-toolbar-card">
        <div className="events-toolbar-inner">
          <div className="search-bar-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by event title, category or venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filter-wrapper">
            <Tag size={14} className="filter-icon" />
            <select
              className="form-select select-compact"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Coding & Hackathon">Coding & Hackathon</option>
              <option value="Robotics">Robotics</option>
              <option value="Web Development">Web Development</option>
              <option value="Gaming">Gaming & Esports</option>
              <option value="Flagship">Flagship Event</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="empty-state">
          <Loader2 size={24} className="spin-icon" />
          <p>Loading Semaphore Events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <Calendar size={36} />
          <h3>No events found</h3>
          <p>No events match your search or category filter.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="card event-card">
              <div className="event-card-header">
                <span className="category-pill">{evt.category}</span>
                <button
                  onClick={() => toggleEventStatus(evt)}
                  className={`status-toggle ${evt.status.toLowerCase()}`}
                  title="Click to Toggle Active / Draft"
                >
                  {evt.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  <span>{evt.status}</span>
                </button>
              </div>

              <h3 className="event-title">{evt.title}</h3>

              <div className="event-meta-grid">
                <div className="meta-item">
                  <DollarSign size={14} className="meta-icon text-success" />
                  <div className="meta-text">
                    <span className="meta-lbl">Registration Fee</span>
                    <strong>{evt.fee}</strong>
                  </div>
                </div>

                <div className="meta-item">
                  <Users size={14} className="meta-icon text-cyan" />
                  <div className="meta-text">
                    <span className="meta-lbl">Team Size Limit</span>
                    <strong>Max {evt.maxTeamMembers || 4} / Team ({evt.maxTeamsPerCollege}/College)</strong>
                  </div>
                </div>

                <div className="meta-item full-width">
                  <MapPin size={14} className="meta-icon text-primary" />
                  <div className="meta-text">
                    <span className="meta-lbl">Venue Location</span>
                    <span>{evt.venue}</span>
                  </div>
                </div>
              </div>

              <div className="event-card-footer">
                <div className="coordinators-list">
                  <UserCheck size={13} className="coord-icon" />
                  <span className="coord-names">
                    {Array.isArray(evt.coordinators)
                      ? evt.coordinators.join(', ')
                      : evt.coordinators || 'Admin Assigned'}
                  </span>
                </div>

                <div className="card-action-btns">
                  <button
                    className="btn-icon btn-edit"
                    title="Edit Event"
                    onClick={() => setEditingEvent({
                      ...evt,
                      coordinators: Array.isArray(evt.coordinators) ? evt.coordinators.join(', ') : evt.coordinators
                    })}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    title="Delete Event"
                    onClick={() => setDeletingEvent(evt)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Plus size={19} /> Create New Semaphore Event</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <p className="modal-subtitle">Configure festival event schedule and registration caps</p>

            <form onSubmit={handleCreateEvent} className="modal-form">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AI Prompt Challenge 2026"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  >
                    <option value="Coding & Hackathon">Coding & Hackathon</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Gaming">Gaming & Esports</option>
                    <option value="Flagship">Flagship Event</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Fee *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹ 500"
                    value={newEvent.fee}
                    onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Teams / College</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={newEvent.maxTeamsPerCollege}
                    onChange={(e) => setNewEvent({ ...newEvent, maxTeamsPerCollege: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Team Members</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={newEvent.maxTeamMembers}
                    onChange={(e) => setNewEvent({ ...newEvent, maxTeamMembers: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Main Auditorium, Block B"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Coordinators (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Swasthik, Havyas"
                  value={newEvent.coordinators}
                  onChange={(e) => setNewEvent({ ...newEvent, coordinators: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Status</label>
                <select
                  className="form-select"
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                >
                  <option value="Active">Active (Open for registrations)</option>
                  <option value="Draft">Draft (Hidden)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Edit2 size={19} /> Modify Event Details</h3>
              <button className="modal-close" onClick={() => setEditingEvent(null)}>&times;</button>
            </div>
            <p className="modal-subtitle">Update parameters for {editingEvent.title}</p>

            <form onSubmit={handleUpdateEvent} className="modal-form">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={editingEvent.category}
                    onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                  >
                    <option value="Coding & Hackathon">Coding & Hackathon</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Gaming">Gaming & Esports</option>
                    <option value="Flagship">Flagship Event</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Registration Fee *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEvent.fee}
                    onChange={(e) => setEditingEvent({ ...editingEvent, fee: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Teams / College</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={editingEvent.maxTeamsPerCollege}
                    onChange={(e) => setEditingEvent({ ...editingEvent, maxTeamsPerCollege: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Team Members</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={editingEvent.maxTeamMembers || 4}
                    onChange={(e) => setEditingEvent({ ...editingEvent, maxTeamMembers: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue Location *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEvent.venue}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venue: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Coordinators (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingEvent.coordinators}
                  onChange={(e) => setEditingEvent({ ...editingEvent, coordinators: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={editingEvent.status}
                  onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingEvent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal */}
      {deletingEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ color: 'var(--danger)' }}><Trash2 size={19} /> Confirm Delete Event</h3>
              <button className="modal-close" onClick={() => setDeletingEvent(null)}>&times;</button>
            </div>

            <p className="delete-warning-text">
              Are you sure you want to remove event <strong>"{deletingEvent.title}"</strong> ({deletingEvent.id})? This will unassign any scheduled slots.
            </p>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingEvent(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={submitting}
                onClick={() => handleDeleteEvent(deletingEvent.id)}
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

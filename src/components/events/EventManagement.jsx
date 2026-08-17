import { useState } from 'react';
import { Calendar, Plus, Edit2, CheckCircle2, XCircle, Users, DollarSign, MapPin } from 'lucide-react';
import './EventManagement.css';

export const EventManagement = () => {
  const [events, setEvents] = useState([
    {
      id: 'EVT-01',
      title: 'CodeFest 2026',
      category: 'Coding & Hackathon',
      fee: '₹ 500',
      maxTeamsPerCollege: 2,
      maxTeamMembers: 4,
      venue: 'Lab 301, Main Block',
      status: 'Active',
      coordinators: ['Havyas', 'Shashidhara']
    },
    {
      id: 'EVT-02',
      title: 'RoboWars Arena',
      category: 'Robotics',
      fee: '₹ 750',
      maxTeamsPerCollege: 2,
      maxTeamMembers: 5,
      venue: 'Auditorium Quadrangle',
      status: 'Active',
      coordinators: ['Swasthik']
    },
    {
      id: 'EVT-03',
      title: 'WebCrafters',
      category: 'Web Development',
      fee: '₹ 400',
      maxTeamsPerCollege: 2,
      maxTeamMembers: 3,
      venue: 'Lab 202',
      status: 'Draft',
      coordinators: ['Hanson', 'Dheemanth']
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Coding & Hackathon',
    fee: '₹ 500',
    maxTeamsPerCollege: 2,
    venue: 'Main Auditorium',
    status: 'Active'
  });

  const toggleEventStatus = (id) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === 'Active' ? 'Draft' : 'Active' } : e
      )
    );
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const created = {
      ...newEvent,
      id: `EVT-0${events.length + 1}`,
      maxTeamMembers: 4,
      coordinators: ['Admin Assigned']
    };
    setEvents([...events, created]);
    setShowAddModal(false);
    setNewEvent({
      title: '',
      category: 'Coding & Hackathon',
      fee: '₹ 500',
      maxTeamsPerCollege: 2,
      venue: 'Main Auditorium',
      status: 'Active'
    });
  };

  return (
    <div className="events-container">
      {/* Title */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <Calendar className="title-icon" /> Fest Event Management
          </h2>
          <p className="page-description">
            Configure Semaphore 2026 events, maximum team bounds, venue allocations, and registration status.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Create New Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {events.map((evt) => (
          <div key={evt.id} className="card event-card">
            <div className="event-card-header">
              <span className="category-pill">{evt.category}</span>
              <button
                onClick={() => toggleEventStatus(evt.id)}
                className={`status-toggle ${evt.status.toLowerCase()}`}
                title="Toggle Active / Draft"
              >
                {evt.status === 'Active' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                {evt.status}
              </button>
            </div>

            <h3 className="event-title">{evt.title}</h3>

            <div className="event-meta">
              <div className="meta-item">
                <DollarSign size={15} className="meta-icon" />
                <span>Fee: <strong>{evt.fee}</strong></span>
              </div>
              <div className="meta-item">
                <Users size={15} className="meta-icon" />
                <span>Max Teams/College: <strong>{evt.maxTeamsPerCollege}</strong></span>
              </div>
              <div className="meta-item">
                <MapPin size={15} className="meta-icon" />
                <span>{evt.venue}</span>
              </div>
            </div>

            <div className="event-card-footer">
              <div className="coordinators-list">
                <span className="coord-label">Coordinators:</span>
                <span className="coord-names">{evt.coordinators.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Plus size={20} /> Create New Semaphore Event</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleCreateEvent} className="modal-form">
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AI Prompt Challenge"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>

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
                <label className="form-label">Registration Fee</label>
                <input
                  type="text"
                  className="form-input"
                  value={newEvent.fee}
                  onChange={(e) => setNewEvent({ ...newEvent, fee: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Venue Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

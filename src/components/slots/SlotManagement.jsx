import { useState } from 'react';
import { 
  Clock, 
  Plus, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Edit2, 
  Trash2,
  Users,
  RefreshCw
} from 'lucide-react';
import './SlotManagement.css';

export const SlotManagement = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [slots, setSlots] = useState([
    {
      id: 'SLOT-01',
      eventName: 'CodeFest 2026',
      round: 'Round 1 (Debugging & Speed Run)',
      date: 'Aug 22, 2026',
      startTime: '09:30 AM',
      endTime: '11:30 AM',
      venue: 'Lab 301, Main Block',
      capacity: '30 Teams',
      status: 'Scheduled'
    },
    {
      id: 'SLOT-02',
      eventName: 'RoboWars Arena',
      round: 'Elimination Round A',
      date: 'Aug 22, 2026',
      startTime: '11:45 AM',
      endTime: '01:30 PM',
      venue: 'Auditorium Quadrangle',
      capacity: '16 Teams',
      status: 'Scheduled'
    },
    {
      id: 'SLOT-03',
      eventName: 'WebCrafters',
      round: 'Final Hack & Showcase',
      date: 'Aug 22, 2026',
      startTime: '02:00 PM',
      endTime: '04:30 PM',
      venue: 'Lab 202, Tech Block',
      capacity: '20 Teams',
      status: 'Scheduled'
    },
    {
      id: 'SLOT-04',
      eventName: 'Valedictory & Awards',
      round: 'Grand Ceremony',
      date: 'Aug 22, 2026',
      startTime: '05:00 PM',
      endTime: '06:30 PM',
      venue: 'Main Auditorium',
      capacity: 'All Participants',
      status: 'Upcoming'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [newSlot, setNewSlot] = useState({
    eventName: 'CodeFest 2026',
    round: '',
    date: 'Aug 22, 2026',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    venue: '',
    capacity: '25 Teams',
    status: 'Scheduled'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `SLOT-0${slots.length + 1}`,
      ...newSlot
    };
    setSlots([...slots, created]);
    setShowModal(false);
    showToast(`Slot "${created.round}" scheduled successfully!`);
  };

  const handleDelete = (id) => {
    setSlots(slots.filter(s => s.id !== id));
    showToast('Schedule slot removed.');
  };

  return (
    <div className="slots-container">
      {/* Title */}
      <div className="page-title-bar">
        <div>
          <h2 className="page-title">
            <Clock className="title-icon" /> Event Slots & Schedule Timeline
          </h2>
          <p className="page-description">
            Plan competition timelines, lab venue bookings, round durations, and valedictory ceremonies.
          </p>
        </div>

        <div className="title-actions-group">
          <button 
            onClick={() => {
              setIsRefreshing(true);
              setTimeout(() => {
                setIsRefreshing(false);
                showToast('Schedule timeline refreshed from central calendar.');
              }, 500);
            }} 
            className="btn btn-secondary"
            disabled={isRefreshing}
            title="Refresh Schedules"
            aria-label="Refresh Schedule Slots"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Slots'}</span>
          </button>

          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus size={15} /> Add Schedule Slot
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

      {/* Timeline List */}
      <div className="timeline-container">
        {slots.map((slot, index) => (
          <div key={slot.id} className="timeline-item">
            <div className="timeline-marker">
              <div className="timeline-dot"></div>
              {index < slots.length - 1 && <div className="timeline-line"></div>}
            </div>

            <div className="card timeline-card">
              <div className="slot-card-header">
                <div className="slot-time-badge">
                  <Clock size={13} />
                  <span>{slot.startTime} – {slot.endTime}</span>
                </div>
                <span className="slot-date-tag">{slot.date}</span>
                <span className="status-badge status-approved">{slot.status}</span>
              </div>

              <div className="slot-card-body">
                <h3 className="slot-title">{slot.eventName}</h3>
                <p className="slot-round">{slot.round}</p>

                <div className="slot-meta-row">
                  <div className="meta-chip">
                    <MapPin size={13} className="chip-icon" />
                    <span>{slot.venue}</span>
                  </div>
                  <div className="meta-chip">
                    <Users size={13} className="chip-icon" />
                    <span>Capacity: {slot.capacity}</span>
                  </div>
                </div>
              </div>

              <div className="slot-card-footer">
                <span className="code-font slot-id">{slot.id}</span>
                <button
                  onClick={() => handleDelete(slot.id)}
                  className="btn-icon btn-delete"
                  title="Remove Slot"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Slot Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3><Plus size={19} /> Schedule Competition Slot</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <p className="modal-subtitle">Allocate time window and venue for fest rounds</p>

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Competition Event</label>
                <select
                  className="form-select"
                  value={newSlot.eventName}
                  onChange={(e) => setNewSlot({ ...newSlot, eventName: e.target.value })}
                >
                  <option value="CodeFest 2026">CodeFest 2026</option>
                  <option value="RoboWars Arena">RoboWars Arena</option>
                  <option value="WebCrafters">WebCrafters</option>
                  <option value="Gaming & Esports">Gaming & Esports</option>
                  <option value="Valedictory & Awards">Valedictory & Awards</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Round / Session Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Semi-Finals Hack Round"
                  value={newSlot.round}
                  onChange={(e) => setNewSlot({ ...newSlot, round: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 10:00 AM"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 12:30 PM"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Venue Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lab 301"
                    value={newSlot.venue}
                    onChange={(e) => setNewSlot({ ...newSlot, venue: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Team Capacity</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 20 Teams"
                    value={newSlot.capacity}
                    onChange={(e) => setNewSlot({ ...newSlot, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

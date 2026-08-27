import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { EmptyState } from '../common/EmptyState';
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
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { TiltCard } from '../common/TiltCard';
import { Modal } from '../common/Modal';
import './SlotManagement.css';

const initialSlotFormState = {
  eventName: '',
  round: '',
  date: '',
  startTime: '10:00 AM',
  endTime: '12:30 PM',
  venue: '',
  capacity: '',
  status: 'Scheduled'
};

// Helper to parse time string into time component and period
const parseTime = (str, defaultPeriod = 'AM') => {
  if (!str) return { time: '', period: defaultPeriod };
  const s = String(str).trim();
  const isPm = /pm/i.test(s);
  const isAm = /am/i.test(s);
  const period = isPm ? 'PM' : (isAm ? 'AM' : defaultPeriod);
  const cleanTime = s.replace(/(am|pm)/gi, '').trim();
  return { time: cleanTime, period };
};

export const SlotManagement = () => {
  const { showSuccess, showError } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [slots, setSlots] = useState([]);
  const [eventOptions, setEventOptions] = useState([]);
  const [rawEvents, setRawEvents] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newSlot, setNewSlot] = useState(initialSlotFormState);

  const showToast = (msg, isError = false) => {
    if (isError) {
      showError(msg);
    } else {
      showSuccess(msg);
    }
  };

  const fetchSlots = async () => {
    setIsRefreshing(true);
    try {
      const [data, eventsData] = await Promise.all([
        apiService.getTimetable(),
        apiService.getAllEvents()
      ]);

      const eventsList = Array.isArray(eventsData) ? eventsData : (eventsData?.events || []);
      setRawEvents(eventsList);
      const titles = eventsList.map((e) => e.title || e.name).filter(Boolean);
      setEventOptions(titles);

      const eventMap = new Map();
      eventsList.forEach(e => {
        if (e._id) eventMap.set(String(e._id), e.title || e.name);
        if (e.id) eventMap.set(String(e.id), e.title || e.name);
      });

      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item, idx) => {
          const resolvedEvtName = typeof item.event === 'object' && item.event !== null 
            ? (item.event.title || item.event.name || '')
            : (eventMap.get(String(item.event)) || item.eventName || item.title || 'Scheduled Event');

          return {
            id: item._id || item.id || `SLOT-0${idx + 1}`,
            _id: item._id,
            eventName: resolvedEvtName,
            round: item.round || item.title || 'Round Session',
            date: item.date ? (item.date.includes('T') ? item.date.split('T')[0] : item.date) : '',
            formattedDate: item.date ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '',
            startTime: item.startTime || '',
            endTime: item.endTime || '',
            venue: item.location || item.venue || '',
            capacity: item.capacity || '',
            status: item.status || 'Scheduled'
          };
        });
        setSlots(mapped);
      } else if (Array.isArray(data)) {
        setSlots(data);
      }

      if (titles.length > 0 && !newSlot.eventName) {
        setNewSlot((prev) => ({ ...prev, eventName: titles[0] }));
      }
    } catch {
      console.warn('Timetable fetch fallback mode');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newSlot.round.trim() || !newSlot.venue.trim()) {
      showToast('Please fill in required fields.', true);
      return;
    }
    setActionLoading(true);
    try {
      const selectedEventName = newSlot.eventName || (eventOptions[0] || '');
      const selectedEventObj = rawEvents.find(
        (ev) => (ev.title || ev.name || '').trim().toLowerCase() === selectedEventName.trim().toLowerCase()
      );
      const eventId = selectedEventObj?._id || selectedEventObj?.id;

      const payload = {
        event: eventId || undefined,
        eventId: eventId || undefined,
        eventName: selectedEventName,
        title: newSlot.round.trim(),
        round: newSlot.round.trim(),
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        location: newSlot.venue.trim(),
        venue: newSlot.venue.trim(),
        capacity: newSlot.capacity ? Number(newSlot.capacity) : undefined,
        status: newSlot.status || 'Scheduled'
      };

      await apiService.addTimetableSlot(payload);
      setShowModal(false);
      setNewSlot(initialSlotFormState);
      showToast(`Slot "${payload.round}" scheduled successfully!`);
      await fetchSlots();
    } catch (err) {
      console.error('Error adding slot:', err);
      showToast(err.message || 'Failed to add timetable slot.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot({
      ...slot,
      date: slot.date || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSlot || !editingSlot.round?.trim() || !editingSlot.venue?.trim()) {
      showToast('Please fill in required fields.', true);
      return;
    }
    setActionLoading(true);
    try {
      const targetId = editingSlot._id || editingSlot.id;
      const selectedEventName = editingSlot.eventName || (eventOptions[0] || '');
      const selectedEventObj = rawEvents.find(
        (ev) => (ev.title || ev.name || '').trim().toLowerCase() === selectedEventName.trim().toLowerCase()
      );
      const eventId = selectedEventObj?._id || selectedEventObj?.id;

      const payload = {
        event: eventId || undefined,
        eventId: eventId || undefined,
        eventName: selectedEventName,
        title: editingSlot.round.trim(),
        round: editingSlot.round.trim(),
        date: editingSlot.date,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        location: editingSlot.venue.trim(),
        venue: editingSlot.venue.trim(),
        capacity: editingSlot.capacity ? Number(editingSlot.capacity) : undefined,
        status: editingSlot.status || 'Scheduled'
      };

      await apiService.editTimetableSlot(targetId, payload);
      setEditingSlot(null);
      showToast(`Slot "${payload.round}" updated successfully!`);
      await fetchSlots();
    } catch (err) {
      console.error('Error editing slot:', err);
      showToast(err.message || 'Failed to update timetable slot.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const slot = slots.find(s => s.id === id || s._id === id);
    const targetId = slot?._id || id;
    setActionLoading(true);
    try {
      await apiService.deleteTimetableSlot(targetId);
      setSlots((prev) => prev.filter((s) => s.id !== id && s._id !== id));
      showToast('Schedule slot removed.');
    } catch (err) {
      console.error('Error deleting slot:', err);
      showToast(err.message || 'Failed to delete slot.', true);
    } finally {
      setActionLoading(false);
    }
  };

  const dynamicEventNames = Array.from(
    new Set([
      ...slots.map((s) => s.eventName).filter(Boolean),
      ...eventOptions
    ])
  );
  const eventsList = ['All', ...dynamicEventNames];

  const filteredSlots = slots.filter((s) => {
    const matchesEvent = selectedEvent === 'All' || s.eventName === selectedEvent;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (s.eventName || '').toLowerCase().includes(term) ||
      (s.round || '').toLowerCase().includes(term) ||
      (s.venue || '').toLowerCase().includes(term);
    return matchesEvent && matchesSearch;
  });

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
              fetchSlots();
              showToast('Schedule timeline refreshed.');
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

      {/* Search Toolbar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={15} />
            <input
              type="text"
              className="search-input"
              placeholder="Search schedule by event, round, or venue..."
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
                {eventsList.map((evt) => (
                  <option key={evt} value={evt}>
                    {evt === 'All' ? 'All Scheduled Events' : evt}
                  </option>
                ))}
              </select>
            </div>
            <span className="endpoint-badge">{filteredSlots.length} Slots</span>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      {filteredSlots.length === 0 ? (
        <EmptyState
          type="events"
          title="No scheduled slots found"
          description={searchTerm ? `No schedule slots match "${searchTerm}".` : "No timetable slots configured yet."}
          primaryAction={{
            label: 'Add Schedule Slot',
            onClick: () => setShowModal(true)
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
        <div className="timeline-container">
          {filteredSlots.map((slot, index) => (
            <div key={slot.id} className="timeline-item">
              <div className="timeline-marker">
                <div className="timeline-dot"></div>
                {index < filteredSlots.length - 1 && <div className="timeline-line"></div>}
              </div>

              <TiltCard maxTilt={4} glareOpacity={0.1} className="timeline-card-tilt">
                <div className="card timeline-card">
                  <div className="slot-card-header">
                    <div className="slot-time-badge">
                      <Clock size={13} />
                      <span>{slot.startTime && slot.endTime ? `${slot.startTime} – ${slot.endTime}` : (slot.startTime || slot.endTime || 'Time TBA')}</span>
                    </div>
                    {(slot.formattedDate || slot.date) && <span className="slot-date-tag">{slot.formattedDate || slot.date}</span>}
                    <span className="status-badge status-approved">{slot.status || 'Scheduled'}</span>
                  </div>

                  <div className="slot-card-body">
                    <h3 className="slot-title">{slot.eventName}</h3>
                    <p className="slot-round">{slot.round}</p>

                    <div className="slot-meta-row">
                      {slot.venue && (
                        <div className="meta-chip">
                          <MapPin size={13} className="chip-icon" />
                          <span>{slot.venue}</span>
                        </div>
                      )}
                      {slot.capacity && (
                        <div className="meta-chip">
                          <Users size={13} className="chip-icon" />
                          <span>Capacity: {slot.capacity}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="slot-card-footer">
                    <span className="code-font slot-id">{slot.id}</span>
                    <div className="slot-actions-cluster">
                      <button
                        onClick={() => handleOpenEdit(slot)}
                        className="btn-icon btn-edit"
                        title="Edit Slot Details"
                        aria-label="Edit Slot"
                        disabled={actionLoading}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="btn-icon btn-delete"
                        title="Remove Slot"
                        aria-label="Remove Slot"
                        disabled={actionLoading}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} maxWidth="580px">
          <div className="modal-header">
            <h3><Plus size={19} /> Schedule Competition Slot</h3>
            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
          </div>
          <p className="modal-subtitle">Allocate time window and venue for fest rounds</p>

          <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Competition Event</label>
                <input
                  type="text"
                  list="slot-events-list"
                  className="form-input"
                  placeholder="e.g. Code Sprint, RoboWars..."
                  value={newSlot.eventName}
                  onChange={(e) => setNewSlot({ ...newSlot, eventName: e.target.value })}
                  required
                />
                <datalist id="slot-events-list">
                  {dynamicEventNames.map((evt) => (
                    <option key={evt} value={evt} />
                  ))}
                </datalist>
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
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newSlot.date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <div className="time-picker-wrapper">
                    <input
                      type="text"
                      className="form-input time-num-input"
                      placeholder="e.g. 10:00"
                      value={parseTime(newSlot.startTime, 'AM').time}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const current = parseTime(newSlot.startTime, 'AM');
                        const isTypedPm = /pm/i.test(raw);
                        const isTypedAm = /am/i.test(raw);
                        const period = isTypedPm ? 'PM' : (isTypedAm ? 'AM' : current.period);
                        const clean = raw.replace(/(am|pm)/gi, '').trim();
                        setNewSlot({ ...newSlot, startTime: clean ? `${clean} ${period}` : '' });
                      }}
                      required
                    />
                    <div className="am-pm-toggle-group">
                      <button
                        type="button"
                        className={`btn-am-pm btn-am ${parseTime(newSlot.startTime, 'AM').period === 'AM' ? 'active' : ''}`}
                        onClick={() => {
                          const current = parseTime(newSlot.startTime, 'AM');
                          const t = current.time || '10:00';
                          setNewSlot({ ...newSlot, startTime: `${t} AM` });
                        }}
                        title="Select AM (Morning)"
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        className={`btn-am-pm btn-pm ${parseTime(newSlot.startTime, 'AM').period === 'PM' ? 'active' : ''}`}
                        onClick={() => {
                          const current = parseTime(newSlot.startTime, 'AM');
                          const t = current.time || '10:00';
                          setNewSlot({ ...newSlot, startTime: `${t} PM` });
                        }}
                        title="Select PM (Afternoon / Evening)"
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <div className="time-picker-wrapper">
                    <input
                      type="text"
                      className="form-input time-num-input"
                      placeholder="e.g. 12:30"
                      value={parseTime(newSlot.endTime, 'PM').time}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const current = parseTime(newSlot.endTime, 'PM');
                        const isTypedPm = /pm/i.test(raw);
                        const isTypedAm = /am/i.test(raw);
                        const period = isTypedPm ? 'PM' : (isTypedAm ? 'AM' : current.period);
                        const clean = raw.replace(/(am|pm)/gi, '').trim();
                        setNewSlot({ ...newSlot, endTime: clean ? `${clean} ${period}` : '' });
                      }}
                      required
                    />
                    <div className="am-pm-toggle-group">
                      <button
                        type="button"
                        className={`btn-am-pm btn-am ${parseTime(newSlot.endTime, 'PM').period === 'AM' ? 'active' : ''}`}
                        onClick={() => {
                          const current = parseTime(newSlot.endTime, 'PM');
                          const t = current.time || '12:30';
                          setNewSlot({ ...newSlot, endTime: `${t} AM` });
                        }}
                        title="Select AM (Morning)"
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        className={`btn-am-pm btn-pm ${parseTime(newSlot.endTime, 'PM').period === 'PM' ? 'active' : ''}`}
                        onClick={() => {
                          const current = parseTime(newSlot.endTime, 'PM');
                          const t = current.time || '12:30';
                          setNewSlot({ ...newSlot, endTime: `${t} PM` });
                        }}
                        title="Select PM (Afternoon / Evening)"
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lab 301, Main Auditorium"
                  value={newSlot.venue}
                  onChange={(e) => setNewSlot({ ...newSlot, venue: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
        </Modal>
      )}

      {/* Edit Slot Modal */}
      {editingSlot && (
        <Modal isOpen={!!editingSlot} onClose={() => setEditingSlot(null)} maxWidth="580px">
          <div className="modal-header">
            <h3><Edit2 size={19} /> Edit Schedule Slot</h3>
            <button className="modal-close" onClick={() => setEditingSlot(null)}>&times;</button>
          </div>
          <p className="modal-subtitle">Modify competition timing, round details, or venue</p>

          <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Competition Event</label>
                <input
                  type="text"
                  list="slot-events-list-edit"
                  className="form-input"
                  placeholder="e.g. Code Sprint, RoboWars..."
                  value={editingSlot.eventName || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, eventName: e.target.value })}
                  required
                />
                <datalist id="slot-events-list-edit">
                  {dynamicEventNames.map((evt) => (
                    <option key={evt} value={evt} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Round / Session Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Semi-Finals Hack Round"
                  value={editingSlot.round || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, round: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editingSlot.date || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Team Capacity</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 20 Teams"
                    value={editingSlot.capacity || ''}
                    onChange={(e) => setEditingSlot({ ...editingSlot, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <div className="time-picker-wrapper">
                    <input
                      type="text"
                      className="form-input time-num-input"
                      placeholder="e.g. 10:00"
                      value={parseTime(editingSlot.startTime, 'AM').time}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const current = parseTime(editingSlot.startTime, 'AM');
                        const isTypedPm = /pm/i.test(raw);
                        const isTypedAm = /am/i.test(raw);
                        const period = isTypedPm ? 'PM' : (isTypedAm ? 'AM' : current.period);
                        const clean = raw.replace(/(am|pm)/gi, '').trim();
                        setEditingSlot({ ...editingSlot, startTime: clean ? `${clean} ${period}` : '' });
                      }}
                      required
                    />
                    <div className="am-pm-toggle-group">
                      <button
                        type="button"
                        className={`btn-am-pm btn-am ${parseTime(editingSlot.startTime, 'AM').period === 'AM' ? 'active' : ''}`}
                        onClick={() => {
                          const current = parseTime(editingSlot.startTime, 'AM');
                          const t = current.time || '10:00';
                          setEditingSlot({ ...editingSlot, startTime: `${t} AM` });
                        }}
                        title="Select AM (Morning)"
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        className={`btn-am-pm btn-pm ${parseTime(editingSlot.startTime, 'AM').period === 'PM' ? 'active' : ''}`}
                        onClick={() => {
                          const current = parseTime(editingSlot.startTime, 'AM');
                          const t = current.time || '10:00';
                          setEditingSlot({ ...editingSlot, startTime: `${t} PM` });
                        }}
                        title="Select PM (Afternoon / Evening)"
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <div className="time-picker-wrapper">
                    <input
                      type="text"
                      className="form-input time-num-input"
                      placeholder="e.g. 12:30"
                      value={parseTime(editingSlot.endTime, 'PM').time}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const current = parseTime(editingSlot.endTime, 'PM');
                        const isTypedPm = /pm/i.test(raw);
                        const isTypedAm = /am/i.test(raw);
                        const period = isTypedPm ? 'PM' : (isTypedAm ? 'AM' : current.period);
                        const clean = raw.replace(/(am|pm)/gi, '').trim();
                        setEditingSlot({ ...editingSlot, endTime: clean ? `${clean} ${period}` : '' });
                      }}
                      required
                    />
                    <div className="am-pm-toggle-group">
                      <button
                        type="button"
                        className={`btn-am-pm btn-am ${parseTime(editingSlot.endTime, 'PM').period === 'AM' ? 'active' : ''}`}
                        onClick={() => {
                          const current = parseTime(editingSlot.endTime, 'PM');
                          const t = current.time || '12:30';
                          setEditingSlot({ ...editingSlot, endTime: `${t} AM` });
                        }}
                        title="Select AM (Morning)"
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        className={`btn-am-pm btn-pm ${parseTime(editingSlot.endTime, 'PM').period === 'PM' ? 'active' : ''}`}
                        onClick={() => {
                          const current = parseTime(editingSlot.endTime, 'PM');
                          const t = current.time || '12:30';
                          setEditingSlot({ ...editingSlot, endTime: `${t} PM` });
                        }}
                        title="Select PM (Afternoon / Evening)"
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lab 301, Main Auditorium"
                  value={editingSlot.venue || ''}
                  onChange={(e) => setEditingSlot({ ...editingSlot, venue: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSlot(null)} disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

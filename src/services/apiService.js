// Service module mapping to all Semaphore 2026 Admin API Endpoints

import { API_BASE_URL, getAuthHeader } from './apiConfig';
import { initialAdmins, initialUsers, initialEvents, initialRegistrations, generateMockJWT } from '../mock/mockDatabase';

// In-memory state for mock fallback mode
let mockAdmins = [...initialAdmins];

const getStoredUsers = () => {
  try {
    const stored = localStorage.getItem('semaphore_users');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored users:', e);
  }
  localStorage.setItem('semaphore_users', JSON.stringify(initialUsers));
  return [...initialUsers];
};

const saveUsers = (users) => {
  localStorage.setItem('semaphore_users', JSON.stringify(users));
};

let mockUsers = getStoredUsers();

const getStoredRegistrations = () => {
  try {
    const stored = localStorage.getItem('semaphore_registrations');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored registrations:', e);
  }
  localStorage.setItem('semaphore_registrations', JSON.stringify(initialRegistrations));
  return [...initialRegistrations];
};

const saveRegistrations = (registrations) => {
  localStorage.setItem('semaphore_registrations', JSON.stringify(registrations));
};

const getCustomEvents = () => {
  try {
    const stored = localStorage.getItem('semaphore_custom_events');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading custom events:', e);
  }
  return [];
};

const saveCustomEvents = (events) => {
  try {
    localStorage.setItem('semaphore_custom_events', JSON.stringify(events));
  } catch (e) {
    console.warn('Error saving custom events:', e);
  }
};

const getDeletedEventIds = () => {
  try {
    const stored = localStorage.getItem('semaphore_deleted_event_ids');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading deleted event ids:', e);
  }
  return [];
};

const saveDeletedEventId = (id) => {
  try {
    const ids = getDeletedEventIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem('semaphore_deleted_event_ids', JSON.stringify(ids));
    }
  } catch (e) {
    console.warn('Error saving deleted event id:', e);
  }
};

const getEditedEventsMap = () => {
  try {
    const stored = localStorage.getItem('semaphore_edited_events_map');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch (e) {
    console.warn('Error reading edited events map:', e);
  }
  return {};
};

const saveEditedEvent = (id, eventData) => {
  try {
    const map = getEditedEventsMap();
    map[id] = { ...(map[id] || {}), ...eventData, updatedAt: new Date().toISOString() };
    localStorage.setItem('semaphore_edited_events_map', JSON.stringify(map));
  } catch (e) {
    console.warn('Error saving edited event:', e);
  }
};

const getCustomColleges = () => {
  try {
    const stored = localStorage.getItem('semaphore_custom_colleges');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading custom colleges:', e);
  }
  return [];
};

const saveCustomColleges = (colleges) => {
  try {
    localStorage.setItem('semaphore_custom_colleges', JSON.stringify(colleges));
  } catch (e) {
    console.warn('Error saving custom colleges:', e);
  }
};

const getDeletedCollegeIds = () => {
  try {
    const stored = localStorage.getItem('semaphore_deleted_college_ids');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Error reading deleted college ids:', e);
  }
  return [];
};

const saveDeletedCollegeId = (id) => {
  try {
    const ids = getDeletedCollegeIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem('semaphore_deleted_college_ids', JSON.stringify(ids));
    }
  } catch (e) {
    console.warn('Error saving deleted college id:', e);
  }
};

const getStoredEvents = () => {
  try {
    const stored = localStorage.getItem('semaphore_events');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored events, resetting to initial dataset:', e);
  }
  localStorage.setItem('semaphore_events', JSON.stringify(initialEvents));
  return [...initialEvents];
};

const saveEvents = (events) => {
  localStorage.setItem('semaphore_events', JSON.stringify(events));
};

let mockEvents = getStoredEvents();

// Helper to make API requests with fallback to local mock storage if backend is unreachable or endpoint not implemented
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('semaphore_admin_token') || 
                localStorage.getItem('token') || 
                localStorage.getItem('admin_token') || 
                localStorage.getItem('jwt');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    if (!response.ok) {
      console.warn(`Backend at ${API_BASE_URL} returned status ${response.status} for ${endpoint}. Falling back to live mock engine.`);
      return mockFallbackHandler(endpoint, options);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn(`Backend at ${API_BASE_URL} unavailable for ${endpoint}. Using live mock engine.`, err);
    return mockFallbackHandler(endpoint, options);
  }
}


// Handler for mock fallback requests matching backend contracts exactly
function mockFallbackHandler(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const authHeader = options.headers?.Authorization || getAuthHeader().Authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;

  // Find current admin from token
  const currentAdmin = mockAdmins.find(a => generateMockJWT(a) === token) || mockAdmins[0];

  // 1. POST /api/admin/login
  if (endpoint === '/api/admin/login' && method === 'POST') {
    const admin = mockAdmins.find(a => a.email.toLowerCase() === body.email?.toLowerCase());
    if (!admin || admin.password !== body.password) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }
    const tokenStr = generateMockJWT(admin);
    const { password, ...adminPublic } = admin;
    return {
      ...adminPublic,
      token: tokenStr
    };
  }

  // Auth token check helper
  if (!token && endpoint !== '/api/admin/login') {
    const error = new Error('Not authorized, no token provided');
    error.status = 401;
    throw error;
  }

  // 2. POST /api/admin/addadmin
  if (endpoint === '/api/admin/addadmin' && method === 'POST') {
    if (body.role === 'superadmin' && currentAdmin?.role !== 'superadmin') {
      const error = new Error('Only superadmin can assign superadmin role');
      error.status = 403;
      throw error;
    }
    const existing = mockAdmins.find(a => a.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      const error = new Error('Admin with this email already exists');
      error.status = 400;
      throw error;
    }
    const newAdmin = {
      _id: '67b0' + Math.random().toString(16).substr(2, 20),
      name: body.name,
      email: body.email,
      password: body.password || 'password123',
      role: 'admin', // Superadmins can only create standard admins
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockAdmins.push(newAdmin);
    const tokenStr = generateMockJWT(newAdmin);
    const { password, ...publicAdmin } = newAdmin;
    return { ...publicAdmin, token: tokenStr };
  }

  // 3. PUT /api/admin/makeadmin
  if (endpoint === '/api/admin/makeadmin' && method === 'PUT') {
    if (currentAdmin?.role !== 'superadmin') {
      const error = new Error('Access denied. Superadmin role required.');
      error.status = 403;
      throw error;
    }
    let target = null;
    if (body.adminId) {
      target = mockAdmins.find(a => a._id === body.adminId);
    } else if (body.email) {
      target = mockAdmins.find(a => a.email.toLowerCase() === body.email.toLowerCase());
    }

    if (!target) {
      const error = new Error('Admin user not found');
      error.status = 404;
      throw error;
    }

    target.role = body.role || 'superadmin';
    target.updatedAt = new Date().toISOString();

    return {
      message: `Admin role successfully updated to '${target.role}'`,
      _id: target._id,
      name: target.name,
      email: target.email,
      role: target.role,
      updatedAt: target.updatedAt
    };
  }

  // 4. GET /api/admin/me
  if (endpoint === '/api/admin/me' && method === 'GET') {
    const { password, ...publicProfile } = currentAdmin;
    return publicProfile;
  }

  // 5. GET /api/admin/all
  if (endpoint === '/api/admin/all' && method === 'GET') {
    if (currentAdmin?.role !== 'superadmin') {
      const error = new Error('Access denied. Superadmin role required.');
      error.status = 403;
      throw error;
    }
    return mockAdmins.map(({ password, ...rest }) => rest);
  }

  // 5b. DELETE /api/admin/:id
  if (endpoint.startsWith('/api/admin/') && !endpoint.includes('/users') && method === 'DELETE') {
    if (currentAdmin?.role !== 'superadmin') {
      const error = new Error('Access denied. Superadmin privileges required.');
      error.status = 403;
      throw error;
    }
    const id = endpoint.split('/')[3];
    const targetIndex = mockAdmins.findIndex(a => a._id === id);
    if (targetIndex === -1) {
      const error = new Error('Admin account not found');
      error.status = 404;
      throw error;
    }
    if (mockAdmins[targetIndex].role === 'superadmin') {
      const error = new Error('Super Admin accounts are protected and cannot be deleted.');
      error.status = 403;
      throw error;
    }
    const deleted = mockAdmins.splice(targetIndex, 1)[0];
    return { success: true, message: `Standard Admin '${deleted.name}' deleted successfully`, id };
  }

  // 6. GET /api/admin/users
  if (endpoint === '/api/admin/users' && method === 'GET') {
    return mockUsers;
  }

  // 7. GET /api/admin/users/:id
  if (endpoint.startsWith('/api/admin/users/') && method === 'GET') {
    const id = endpoint.split('/')[4];
    const user = mockUsers.find(u => u._id === id);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return user;
  }

  // 8. PUT /api/admin/users/:id
  if (endpoint.startsWith('/api/admin/users/') && method === 'PUT') {
    const id = endpoint.split('/')[4];
    const user = mockUsers.find(u => u._id === id);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    user.name = body.name !== undefined ? body.name : user.name;
    user.email = body.email !== undefined ? body.email : user.email;
    user.role = body.role !== undefined ? body.role : user.role;
    user.collegeName = body.collegeName !== undefined ? body.collegeName : user.collegeName;
    if (user.college) {
      user.college.collegeName = user.collegeName;
    }
    user.updatedAt = new Date().toISOString();
    saveUsers(mockUsers);
    return {
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        collegeName: user.collegeName,
        updatedAt: user.updatedAt
      }
    };
  }

  // 9. DELETE /api/admin/users/:id
  if (endpoint.startsWith('/api/admin/users/') && method === 'DELETE') {
    const id = endpoint.split('/')[4];
    const index = mockUsers.findIndex(u => u._id === id);
    if (index === -1) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    const deleted = mockUsers.splice(index, 1)[0];
    saveUsers(mockUsers);
    return {
      message: `User '${deleted.name}' deleted successfully`,
      _id: id
    };
  }

  // 10. GET /api/events
  if ((endpoint.startsWith('/api/events') || endpoint.startsWith('/api/admin/events')) && method === 'GET') {
    const parts = endpoint.split('?')[0].split('/');
    const id = parts[3] || parts[4];
    if (id && id !== 'all' && id !== 'events') {
      const found = mockEvents.find(evt => (evt._id === id || evt.id === id));
      if (!found) {
        const error = new Error('Event not found');
        error.status = 404;
        throw error;
      }
      return { success: true, event: found };
    }
    return { success: true, events: mockEvents };
  }

  // 11. POST /api/events (Create Event)
  if ((endpoint === '/api/events' || endpoint === '/api/admin/events') && method === 'POST') {
    const newId = body._id || body.id || `65f1${Math.random().toString(16).substr(2, 20)}`;
    const createdEvent = {
      _id: newId,
      id: newId,
      title: body.title || 'Untitled Event',
      description: body.description || '',
      location: body.location || body.venue || 'Main Auditorium',
      venue: body.location || body.venue || 'Main Auditorium',
      date: body.date || new Date().toISOString(),
      capacity: Number(body.capacity) || 100,
      registrationFee: Number(body.registrationFee !== undefined ? body.registrationFee : (typeof body.fee === 'string' ? body.fee.replace(/[^\d]/g, '') : body.fee)) || 0,
      fee: body.fee || `₹ ${body.registrationFee || 0}`,
      minParticipants: Number(body.minParticipants) || 1,
      maxParticipants: Number(body.maxParticipants || body.maxTeamMembers) || 4,
      maxTeamMembers: Number(body.maxParticipants || body.maxTeamMembers) || 4,
      maxTeamsPerCollege: Number(body.maxTeamsPerCollege) || 2,
      category: body.category || 'Coding & Hackathon',
      image: body.image || '',
      status: body.status || 'Active',
      coordinators: Array.isArray(body.coordinators)
        ? body.coordinators
        : (typeof body.coordinators === 'string' && body.coordinators.trim()
            ? body.coordinators.split(',').map(c => c.trim())
            : []),
      timings: Array.isArray(body.timings) ? body.timings : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockEvents.push(createdEvent);
    saveEvents(mockEvents);
    return { success: true, message: 'Event created successfully', event: createdEvent };
  }

  // 12. PATCH /api/events/:id/coordinators
  if ((endpoint.includes('/coordinators')) && (method === 'PATCH' || method === 'PUT')) {
    const parts = endpoint.split('/');
    const id = parts[3];
    const index = mockEvents.findIndex(evt => (evt._id === id || evt.id === id));
    if (index === -1) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }
    mockEvents[index].coordinators = Array.isArray(body.coordinators) ? body.coordinators : [];
    mockEvents[index].updatedAt = new Date().toISOString();
    saveEvents(mockEvents);
    return { success: true, message: 'Coordinators updated successfully', event: mockEvents[index] };
  }

  // 13. PATCH /api/events/:id/timings
  if ((endpoint.includes('/timings')) && (method === 'PATCH' || method === 'PUT')) {
    const parts = endpoint.split('/');
    const id = parts[3];
    const index = mockEvents.findIndex(evt => (evt._id === id || evt.id === id));
    if (index === -1) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }
    mockEvents[index].timings = Array.isArray(body.timings) ? body.timings : [];
    mockEvents[index].updatedAt = new Date().toISOString();
    saveEvents(mockEvents);
    return { success: true, message: 'Timings updated successfully', event: mockEvents[index] };
  }

  // 14. PATCH / PUT /api/events/:id (Update Event)
  if ((endpoint.startsWith('/api/events/') || endpoint.startsWith('/api/admin/events/')) && (method === 'PATCH' || method === 'PUT')) {
    const id = endpoint.split('/')[3] || endpoint.split('/')[4];
    const index = mockEvents.findIndex(evt => (evt._id === id || evt.id === id));
    if (index === -1) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }
    mockEvents[index] = {
      ...mockEvents[index],
      ...body,
      location: body.location || body.venue || mockEvents[index].location,
      venue: body.location || body.venue || mockEvents[index].venue,
      updatedAt: new Date().toISOString()
    };
    saveEvents(mockEvents);
    return { success: true, message: 'Event updated successfully', event: mockEvents[index] };
  }

  // 15. DELETE /api/events/:id (Delete Event)
  if ((endpoint.startsWith('/api/events/') || endpoint.startsWith('/api/admin/events/')) && method === 'DELETE') {
    const id = endpoint.split('/')[3] || endpoint.split('/')[4];
    const index = mockEvents.findIndex(evt => (evt._id === id || evt.id === id));
    if (index === -1) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }
    mockEvents.splice(index, 1);
    saveEvents(mockEvents);
    return { success: true, message: 'Operation successful', id };
  }

  throw new Error(`Endpoint ${endpoint} not found`);
}

// Export API service functions corresponding to exact contracts
export const apiService = {
  // 1. Admin Login
  loginAdmin: async (credentials) => {
    let result;
    try {
      result = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    } catch (err) {
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || credentials.email?.toLowerCase() === 'john@example.com') {
        result = mockFallbackHandler('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        });
      } else {
        throw err;
      }
    }

    const token = result?.token || result?.jwt || result?.accessToken;
    if (token) {
      localStorage.setItem('semaphore_admin_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('admin_token', token);
    }
    if (result) {
      localStorage.setItem('semaphore_admin_user', JSON.stringify(result));
    }
    return result;
  },

  // 2. Add New Admin (Always Standard Admin)
  addAdmin: async (adminData) => {
    return await apiRequest('/api/admin/addadmin', {
      method: 'POST',
      body: JSON.stringify({
        ...adminData,
        role: 'admin' // Superadmins can only create standard admins
      })
    });
  },

  // 3. Change Admin Role
  changeAdminRole: async (roleData) => {
    return await apiRequest('/api/admin/makeadmin', {
      method: 'PUT',
      body: JSON.stringify(roleData)
    });
  },

  // 4. Get Current Admin Profile
  getAdminProfile: async () => {
    return await apiRequest('/api/admin/me', {
      method: 'GET'
    });
  },

  // 5. Get All Admins
  getAllAdmins: async () => {
    return await apiRequest('/api/admin/all', {
      method: 'GET'
    });
  },

  // 5b. Delete Admin Account (Super Admin only, standard admins only)
  deleteAdmin: async (id) => {
    return await apiRequest(`/api/admin/${id}`, {
      method: 'DELETE'
    });
  },

  // 6. Retrieve All Users
  getAllUsers: async () => {
    return await apiRequest('/api/admin/users', {
      method: 'GET'
    });
  },

  // 7. Retrieve Single User
  getUserById: async (id) => {
    return await apiRequest(`/api/admin/users/${id}`, {
      method: 'GET'
    });
  },

  // 8. Edit User Details
  editUser: async (id, userData) => {
    return await apiRequest(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  // 9. Delete User
  deleteUser: async (id) => {
    return await apiRequest(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  // 10. Events Management (Matching Events API Documentation)
  // GET /api/events
  getAllEvents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.upcoming !== undefined) query.append('upcoming', params.upcoming);
    if (params.location) query.append('location', params.location);
    if (params.date) query.append('date', params.date);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    let remoteList = [];
    try {
      const data = await apiRequest(`/api/events${queryString}`, {
        method: 'GET'
      });
      remoteList = Array.isArray(data) ? data : (data?.events || []);
    } catch (err) {
      console.warn('API events fetch failed, using local events storage:', err);
      remoteList = getStoredEvents();
    }

    const customEvents = getCustomEvents();
    const deletedIds = getDeletedEventIds();
    const editedMap = getEditedEventsMap();

    // Map remote events with any locally saved edits
    const remoteIds = new Set(remoteList.map(e => e._id || e.id));
    const processedRemote = remoteList.map(evt => {
      const id = evt._id || evt.id;
      if (editedMap[id]) {
        return { ...evt, ...editedMap[id] };
      }
      return evt;
    });

    // Merge in newly created custom events that aren't on the remote server
    const customNotOnRemote = customEvents
      .filter(e => !remoteIds.has(e._id || e.id))
      .map(evt => {
        const id = evt._id || evt.id;
        if (editedMap[id]) {
          return { ...evt, ...editedMap[id] };
        }
        return evt;
      });

    const allEvents = [...customNotOnRemote, ...processedRemote].filter(
      evt => !deletedIds.includes(evt._id || evt.id)
    );

    mockEvents = allEvents;
    saveEvents(allEvents);
    return allEvents;
  },

  // GET /api/events/:id
  getEventById: async (id) => {
    try {
      const data = await apiRequest(`/api/events/${id}`, {
        method: 'GET'
      });
      return data?.event || data;
    } catch (err) {
      const all = await apiService.getAllEvents();
      return all.find(e => (e._id || e.id) === id);
    }
  },

  // POST /api/events
  addEvent: async (eventData) => {
    const payload = {
      title: eventData.title,
      description: eventData.description || 'Semaphore 2026 Event',
      location: eventData.location || eventData.venue || 'Main Auditorium',
      venue: eventData.location || eventData.venue || 'Main Auditorium',
      date: eventData.date || new Date().toISOString(),
      capacity: Number(eventData.capacity) || 100,
      registrationFee: Number(eventData.registrationFee !== undefined ? eventData.registrationFee : (typeof eventData.fee === 'string' ? eventData.fee.replace(/[^\d]/g, '') : eventData.fee)) || 0,
      minParticipants: Number(eventData.minParticipants) || 1,
      maxParticipants: Number(eventData.maxParticipants || eventData.maxTeamMembers) || 4,
      image: eventData.image || '',
      coordinators: Array.isArray(eventData.coordinators)
        ? eventData.coordinators
        : (typeof eventData.coordinators === 'string' && eventData.coordinators.trim()
            ? eventData.coordinators.split(',').map(c => c.trim())
            : []),
      timings: Array.isArray(eventData.timings) && eventData.timings.length > 0 ? eventData.timings : [
        {
          date: eventData.date || new Date().toISOString(),
          startTime: eventData.startTime || '09:30',
          endTime: eventData.endTime || '13:30'
        }
      ],
      category: eventData.category || 'Coding & Hackathon',
      status: eventData.status || 'Active'
    };

    let resultEvent;
    try {
      const data = await apiRequest('/api/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      resultEvent = data?.event || (data?.title ? data : null);
    } catch (err) {
      const fallback = mockFallbackHandler('/api/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      resultEvent = fallback?.event;
    }

    if (!resultEvent) {
      const fallback = mockFallbackHandler('/api/events', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      resultEvent = fallback?.event;
    }

    if (resultEvent) {
      const custom = getCustomEvents();
      const id = resultEvent._id || resultEvent.id;
      if (!custom.some(e => (e._id || e.id) === id)) {
        custom.unshift(resultEvent);
        saveCustomEvents(custom);
      }
      
      const stored = getStoredEvents();
      if (!stored.some(e => (e._id || e.id) === id)) {
        stored.unshift(resultEvent);
        saveEvents(stored);
      }
    }

    return resultEvent;
  },

  // PATCH /api/events/:id
  editEvent: async (id, eventData) => {
    saveEditedEvent(id, eventData);

    const custom = getCustomEvents();
    const customIdx = custom.findIndex(e => (e._id || e.id) === id);
    if (customIdx !== -1) {
      custom[customIdx] = { ...custom[customIdx], ...eventData, updatedAt: new Date().toISOString() };
      saveCustomEvents(custom);
    }

    const stored = getStoredEvents();
    const storedIdx = stored.findIndex(e => (e._id || e.id) === id);
    if (storedIdx !== -1) {
      stored[storedIdx] = { ...stored[storedIdx], ...eventData, updatedAt: new Date().toISOString() };
      saveEvents(stored);
    }

    const payload = {
      ...(eventData.title !== undefined && { title: eventData.title }),
      ...(eventData.description !== undefined && { description: eventData.description }),
      ...(eventData.location !== undefined || eventData.venue !== undefined) && { location: eventData.location || eventData.venue },
      ...(eventData.date !== undefined && { date: eventData.date }),
      ...(eventData.capacity !== undefined && { capacity: Number(eventData.capacity) }),
      ...(eventData.registrationFee !== undefined || eventData.fee !== undefined) && {
        registrationFee: Number(eventData.registrationFee !== undefined ? eventData.registrationFee : (typeof eventData.fee === 'string' ? eventData.fee.replace(/[^\d]/g, '') : eventData.fee)) || 0
      },
      ...(eventData.minParticipants !== undefined && { minParticipants: Number(eventData.minParticipants) }),
      ...(eventData.maxParticipants !== undefined || eventData.maxTeamMembers !== undefined) && {
        maxParticipants: Number(eventData.maxParticipants || eventData.maxTeamMembers)
      },
      ...(eventData.image !== undefined && { image: eventData.image }),
      ...(eventData.status !== undefined && { status: eventData.status }),
      ...(eventData.category !== undefined && { category: eventData.category })
    };

    try {
      const data = await apiRequest(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      return data?.event || data || (storedIdx !== -1 ? stored[storedIdx] : eventData);
    } catch (err) {
      return storedIdx !== -1 ? stored[storedIdx] : eventData;
    }
  },

  // PATCH /api/events/:id/coordinators
  updateCoordinators: async (id, coordinators) => {
    return await apiRequest(`/api/events/${id}/coordinators`, {
      method: 'PATCH',
      body: JSON.stringify({ coordinators: Array.isArray(coordinators) ? coordinators : [coordinators] })
    });
  },

  // PATCH /api/events/:id/timings
  updateTimings: async (id, timings) => {
    return await apiRequest(`/api/events/${id}/timings`, {
      method: 'PATCH',
      body: JSON.stringify({ timings: Array.isArray(timings) ? timings : [timings] })
    });
  },

  // DELETE /api/events/:id
  deleteEvent: async (id) => {
    saveDeletedEventId(id);

    const custom = getCustomEvents().filter(e => (e._id || e.id) !== id);
    saveCustomEvents(custom);

    const stored = getStoredEvents().filter(e => (e._id || e.id) !== id);
    saveEvents(stored);

    try {
      return await apiRequest(`/api/events/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      return { success: true, id };
    }
  },

  // 11. Colleges Management (Full CRUD)
  getColleges: async () => {
    let remoteList = [];
    try {
      const data = await apiRequest('/api/colleges', {
        method: 'GET'
      });
      remoteList = Array.isArray(data) ? data : (data?.colleges || []);
    } catch (err) {
      console.warn('API colleges fetch failed, using local storage:', err);
    }

    const customColleges = getCustomColleges();
    const deletedIds = getDeletedCollegeIds();

    const remoteIds = new Set(remoteList.map(c => c._id || c.id));
    const customNotOnRemote = customColleges.filter(c => !remoteIds.has(c._id || c.id));

    const allColleges = [...customNotOnRemote, ...remoteList].filter(
      c => !deletedIds.includes(c._id || c.id)
    );
    return allColleges;
  },

  addCollege: async (collegeData) => {
    const payload = {
      collegeName: collegeData.collegeName,
      totalTeams: Number(collegeData.totalTeams) || 0
    };

    let resultCollege;
    try {
      const data = await apiRequest('/api/colleges', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      resultCollege = data?.college || data;
    } catch (err) {
      resultCollege = {
        _id: '6a88' + Math.random().toString(16).substr(2, 20),
        collegeName: payload.collegeName,
        totalTeams: payload.totalTeams,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    if (resultCollege) {
      const custom = getCustomColleges();
      const id = resultCollege._id || resultCollege.id;
      if (!custom.some(c => (c._id || c.id) === id)) {
        custom.unshift(resultCollege);
        saveCustomColleges(custom);
      }
    }

    return resultCollege;
  },

  editCollege: async (id, collegeData) => {
    const custom = getCustomColleges();
    const customIdx = custom.findIndex(c => (c._id || c.id) === id);
    if (customIdx !== -1) {
      custom[customIdx] = { ...custom[customIdx], ...collegeData, updatedAt: new Date().toISOString() };
      saveCustomColleges(custom);
    }

    try {
      const data = await apiRequest(`/api/colleges/${id}`, {
        method: 'PUT',
        body: JSON.stringify(collegeData)
      });
      return data?.college || data || (customIdx !== -1 ? custom[customIdx] : collegeData);
    } catch (err) {
      return customIdx !== -1 ? custom[customIdx] : collegeData;
    }
  },

  deleteCollege: async (id) => {
    saveDeletedCollegeId(id);

    const custom = getCustomColleges().filter(c => (c._id || c.id) !== id);
    saveCustomColleges(custom);

    try {
      return await apiRequest(`/api/colleges/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      return { success: true, id };
    }
  },

  // 12. Event Registrations & Payment Approvals (Docs: GET /api/registrations/all, PUT /api/registrations/:id/payment-status)
  getRegistrations: async () => {
    try {
      const data = await apiRequest('/api/registrations/all', {
        method: 'GET'
      });
      const list = Array.isArray(data) ? data : (data?.registrations || []);
      if (list.length > 0) return list;
    } catch (err) {
      try {
        const fallbackData = await apiRequest('/api/registrations', {
          method: 'GET'
        });
        const fallbackList = Array.isArray(fallbackData) ? fallbackData : (fallbackData?.registrations || []);
        if (fallbackList.length > 0) return fallbackList;
      } catch (e) {
        console.warn('Registrations API fetch fallback:', e);
      }
    }
    return getStoredRegistrations();
  },

  editRegistration: async (id, regData) => {
    const list = getStoredRegistrations();
    const idx = list.findIndex(r => (r._id || r.id) === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...regData, updatedAt: new Date().toISOString() };
      saveRegistrations(list);
    }

    try {
      const data = await apiRequest(`/api/registrations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(regData)
      });
      return data?.registration || data || (idx !== -1 ? list[idx] : regData);
    } catch {
      return idx !== -1 ? list[idx] : regData;
    }
  },

  deleteRegistration: async (id) => {
    const list = getStoredRegistrations().filter(r => (r._id || r.id) !== id);
    saveRegistrations(list);

    try {
      return await apiRequest(`/api/registrations/${id}`, {
        method: 'DELETE'
      });
    } catch {
      return { success: true, id };
    }
  },

  approveRegistrationPayment: async (id, status = 'approved') => {
    const normStatus = status.toLowerCase();
    const displayStatus = normStatus.charAt(0).toUpperCase() + normStatus.slice(1);
    const list = getStoredRegistrations();
    const idx = list.findIndex(r => (r._id || r.id) === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], paymentStatus: displayStatus, updatedAt: new Date().toISOString() };
      saveRegistrations(list);
    }

    try {
      // Documented Endpoint: PUT /api/registrations/:id/payment-status
      const data = await apiRequest(`/api/registrations/${id}/payment-status`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus: normStatus })
      });
      return data?.registration || (idx !== -1 ? list[idx] : { id, paymentStatus: displayStatus });
    } catch (err) {
      try {
        const altData = await apiRequest(`/api/registrations/${id}/payment`, {
          method: 'PATCH',
          body: JSON.stringify({ paymentStatus: normStatus })
        });
        return altData?.registration || (idx !== -1 ? list[idx] : { id, paymentStatus: displayStatus });
      } catch {
        return idx !== -1 ? list[idx] : { id, paymentStatus: displayStatus };
      }
    }
  },

  // 13. Timetable API (Docs: GET, POST, PUT, DELETE /api/timetable)
  getTimetable: async (params = {}) => {
    const query = params.date ? `?date=${params.date}` : '';
    try {
      const data = await apiRequest(`/api/timetable${query}`, {
        method: 'GET'
      });
      return Array.isArray(data) ? data : (data?.timetable || []);
    } catch (err) {
      console.warn('Timetable fetch error:', err);
      return [];
    }
  },

  addTimetableSlot: async (slotData) => {
    return await apiRequest('/api/timetable', {
      method: 'POST',
      body: JSON.stringify(slotData)
    });
  },

  editTimetableSlot: async (id, slotData) => {
    return await apiRequest(`/api/timetable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(slotData)
    });
  },

  deleteTimetableSlot: async (id) => {
    return await apiRequest(`/api/timetable/${id}`, {
      method: 'DELETE'
    });
  }
};



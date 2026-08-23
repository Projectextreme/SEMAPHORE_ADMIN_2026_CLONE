// Service module mapping to all Semaphore 2026 Admin API Endpoints

import { API_BASE_URL, getAuthHeader } from './apiConfig';
import { initialAdmins, initialUsers, initialEvents, initialRegistrations, initialPayments, initialCoordinators, generateMockJWT, DEFAULT_RECEIPT_PLACEHOLDER } from '../mock/mockDatabase';

// In-memory state for mock fallback mode
let mockAdmins = [...initialAdmins];

const COORDINATORS_STORAGE_KEY = 'semaphore_coordinators_v1';

const getStoredCoordinators = () => {
  try {
    const stored = localStorage.getItem(COORDINATORS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored coordinators:', e);
  }
  localStorage.setItem(COORDINATORS_STORAGE_KEY, JSON.stringify(initialCoordinators || []));
  return [...(initialCoordinators || [])];
};

const saveCoordinators = (coordinators) => {
  localStorage.setItem(COORDINATORS_STORAGE_KEY, JSON.stringify(coordinators));
};

const getStoredPayments = () => {
  try {
    const stored = localStorage.getItem('semaphore_payments');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored payments:', e);
  }
  localStorage.setItem('semaphore_payments', JSON.stringify(initialPayments || []));
  return [...(initialPayments || [])];
};

const savePayments = (payments) => {
  try {
    localStorage.setItem('semaphore_payments', JSON.stringify(payments));
  } catch (e) {
    console.warn('Error saving payments:', e);
  }
};

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

const REGISTRATIONS_STORAGE_KEY = 'semaphore_registrations_v3';

const getStoredRegistrations = () => {
  try {
    // Clear outdated legacy keys with stale mock data
    localStorage.removeItem('semaphore_registrations');
    localStorage.removeItem('semaphore_registrations_v2');

    const stored = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored registrations:', e);
  }
  localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(initialRegistrations));
  return [...initialRegistrations];
};

const saveRegistrations = (registrations) => {
  localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations));
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

const defaultColleges = [
  { _id: "67b0c110e4b0987654321def", collegeName: "MIT Tech", totalTeams: 2, createdAt: "2026-08-16T10:00:00.000Z" },
  { _id: "67b0c110e4b0987654321deg", collegeName: "NMAM Institute of Technology", totalTeams: 1, createdAt: "2026-08-16T11:15:00.000Z" },
  { _id: "67b0c110e4b0987654321deh", collegeName: "RV College of Engineering", totalTeams: 2, createdAt: "2026-08-16T12:30:00.000Z" },
  { _id: "67b0c110e4b0987654321dei", collegeName: "BMS College of Engineering", totalTeams: 1, createdAt: "2026-08-17T02:15:00.000Z" },
  { _id: "67b0c110e4b0987654321dej", collegeName: "PES University", totalTeams: 2, createdAt: "2026-08-18T04:30:00.000Z" },
  { _id: "67b0c110e4b0987654321dek", collegeName: "St. Joseph Engineering College", totalTeams: 0, createdAt: "2026-08-19T09:00:00.000Z" },
  { _id: "67b0c110e4b0987654321del", collegeName: "Canara Engineering College", totalTeams: 1, createdAt: "2026-08-19T10:30:00.000Z" }
];

const getCustomColleges = () => {
  try {
    const stored = localStorage.getItem('semaphore_custom_colleges');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading custom colleges:', e);
  }
  localStorage.setItem('semaphore_custom_colleges', JSON.stringify(defaultColleges));
  return [...defaultColleges];
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
      if (options.noMockFallback) {
        const error = new Error(`Request to ${endpoint} failed with status ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return mockFallbackHandler(endpoint, options);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    if (options.noMockFallback) {
      throw err;
    }
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

  // 16. GET /api/colleges
  if (endpoint === '/api/colleges' && method === 'GET') {
    const list = getCustomColleges();
    const deleted = getDeletedCollegeIds();
    return { colleges: list.filter(c => !deleted.includes(c._id || c.id)) };
  }

  // 17. POST /api/colleges
  if (endpoint === '/api/colleges' && method === 'POST') {
    const newCollege = {
      _id: '67b0' + Math.random().toString(16).substr(2, 20),
      collegeName: body.collegeName,
      totalTeams: Number(body.totalTeams) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const list = getCustomColleges();
    list.unshift(newCollege);
    saveCustomColleges(list);
    return { success: true, message: 'College added successfully', college: newCollege };
  }

  // 18. PUT / PATCH /api/colleges/:id
  if (endpoint.startsWith('/api/colleges/') && (method === 'PUT' || method === 'PATCH')) {
    const id = endpoint.split('/')[3];
    const list = getCustomColleges();
    const index = list.findIndex(c => (c._id === id || c.id === id));
    if (index !== -1) {
      list[index] = { ...list[index], ...body, updatedAt: new Date().toISOString() };
      saveCustomColleges(list);
      return { success: true, message: 'College updated successfully', college: list[index] };
    }
    return { success: true, message: 'College updated', college: { _id: id, ...body } };
  }

  // 19. DELETE /api/colleges/:id
  if (endpoint.startsWith('/api/colleges/') && method === 'DELETE') {
    const id = endpoint.split('/')[3];
    saveDeletedCollegeId(id);
    const list = getCustomColleges().filter(c => (c._id !== id && c.id !== id));
    saveCustomColleges(list);
    return { success: true, message: 'College removed successfully', id };
  }

  // 20. GET /api/registrations/all, /api/registrations, /all
  if ((endpoint.startsWith('/api/registrations') || endpoint === '/all' || endpoint === '/registrations') && method === 'GET') {
    return getStoredRegistrations();
  }

  // 21. GET /api/payments, /api/admin/payments
  if ((endpoint.startsWith('/api/payments') || endpoint.startsWith('/api/admin/payments')) && method === 'GET') {
    return getStoredRegistrations();
  }

  // 22. PUT / PATCH /api/registrations/:id/payment-status
  if (endpoint.includes('/payment') && (method === 'PUT' || method === 'PATCH')) {
    const list = getStoredRegistrations();
    const id = endpoint.split('/')[3] || endpoint.split('/')[2];
    const item = list.find(r => (
      r._id === id || 
      r.id === id || 
      (r.paymentId && (r.paymentId._id === id || r.paymentId.id === id || r.paymentId === id))
    ));
    if (item) {
      const rawStatus = body.paymentStatus || body.status || 'Approved';
      const normStatus = rawStatus.toLowerCase();
      const displayStatus = normStatus.charAt(0).toUpperCase() + normStatus.slice(1);
      item.paymentStatus = displayStatus;
      item.status = normStatus;
      if (item.paymentId && typeof item.paymentId === 'object') {
        item.paymentId.status = normStatus;
      }
      saveRegistrations(list);
      return { success: true, registration: item };
    }
    return { success: true, message: 'Status updated' };
  }

  throw new Error(`Endpoint ${endpoint} not found`);
}

// Export API service functions corresponding to exact contracts
export const apiService = {
  // 0. Server Health Check (Ping backend)
  checkServerHealth: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'GET',
        signal: controller.signal
      }).catch(async () => {
        return await fetch(`${API_BASE_URL}/api/admin/profile`, {
          method: 'GET',
          headers: getAuthHeader(),
          signal: controller.signal
        });
      });
      clearTimeout(timeoutId);
      // If server responds with any HTTP status (even 401 Unauthorized or 200 OK), the server is alive
      return !!(res && (res.status >= 200 && res.status < 500));
    } catch {
      return false;
    }
  },

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

  // 10b. Coordinators Roster API with Event Sync and Persistent Storage
  getCoordinators: async () => {
    const list = getStoredCoordinators();
    try {
      const events = await apiService.getAllEvents();
      (events || []).forEach(evt => {
        const evtTitle = evt.title || evt.name || 'Event';
        const coords = Array.isArray(evt.coordinators) 
          ? evt.coordinators 
          : (typeof evt.coordinators === 'string' && evt.coordinators ? evt.coordinators.split(',').map(c => c.trim()) : []);
        coords.forEach((cName, cIdx) => {
          const nameStr = typeof cName === 'object' ? (cName.name || cName.userName || cName._id) : cName;
          if (nameStr && !list.some(item => (item.name || '').toLowerCase() === String(nameStr).toLowerCase() && (item.assignedEvent || '').toLowerCase() === evtTitle.toLowerCase())) {
            list.push({
              id: `COORD-EVT-${(evt._id || evt.id || 'E').slice(-4)}-${cIdx + 1}`,
              _id: `coord_evt_${(evt._id || evt.id || 'E').slice(-4)}_${cIdx + 1}`,
              name: nameStr,
              email: `${nameStr.toLowerCase().replace(/\s+/g, '.')}@semaphore.com`,
              phone: '+91 98860 ' + Math.floor(10000 + Math.random() * 90000),
              assignedEvent: evtTitle,
              department: 'Event Department',
              status: 'Active',
              createdAt: new Date().toISOString()
            });
          }
        });
      });
      saveCoordinators(list);
    } catch (e) {
      console.warn('Error syncing event coordinators:', e);
    }
    return list;
  },

  addCoordinator: async (coordData) => {
    const list = getStoredCoordinators();
    const newId = `COORD-${String(list.length + 1).padStart(2, '0')}`;
    const newEntry = {
      id: newId,
      _id: `coord_${Date.now()}`,
      status: 'Active',
      department: 'MCA',
      createdAt: new Date().toISOString(),
      ...coordData
    };
    list.push(newEntry);
    saveCoordinators(list);

    // Sync to backend event coordinators array if assigned to an event
    if (newEntry.assignedEvent) {
      try {
        const events = await apiService.getAllEvents();
        const targetEvt = events.find(e => (e.title || '').toLowerCase() === newEntry.assignedEvent.toLowerCase());
        if (targetEvt && (targetEvt._id || targetEvt.id)) {
          const evtId = targetEvt._id || targetEvt.id;
          const currentCoords = Array.isArray(targetEvt.coordinators) 
            ? targetEvt.coordinators.map(c => typeof c === 'object' ? (c.name || c._id) : c) 
            : [];
          if (!currentCoords.some(c => String(c).toLowerCase() === newEntry.name.toLowerCase())) {
            currentCoords.push(newEntry.name);
            await apiService.updateCoordinators(evtId, currentCoords).catch(() => {});
          }
        }
      } catch (e) {}
    }

    return newEntry;
  },

  updateCoordinator: async (id, updatedData) => {
    const list = getStoredCoordinators();
    const idx = list.findIndex(c => (c.id === id || c._id === id));
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedData, updatedAt: new Date().toISOString() };
      saveCoordinators(list);
      return list[idx];
    }
    return updatedData;
  },

  deleteCoordinator: async (id) => {
    const list = getStoredCoordinators().filter(c => (c.id !== id && c._id !== id));
    saveCoordinators(list);
    return { success: true, id };
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
    let rawList = [];
    try {
      const data = await apiRequest('/api/registrations/all', {
        method: 'GET'
      });
      if (Array.isArray(data)) rawList = data;
      else if (Array.isArray(data?.registrations)) rawList = data.registrations;
      else if (Array.isArray(data?.data)) rawList = data.data;
    } catch (err) {
      try {
        const fallbackData = await apiRequest('/api/registrations', {
          method: 'GET'
        });
        if (Array.isArray(fallbackData)) rawList = fallbackData;
        else if (Array.isArray(fallbackData?.registrations)) rawList = fallbackData.registrations;
      } catch (e) {
        console.warn('Registrations API fetch fallback:', e);
      }
    }

    if (!rawList) {
      rawList = [];
    }

    // Fetch live users, live payments, and live events to build relational lookup maps
    let liveUsers = [];
    try {
      const uRes = await apiRequest('/api/admin/users', { method: 'GET', noMockFallback: true })
        .catch(() => apiRequest('/api/users', { method: 'GET', noMockFallback: true }))
        .catch(() => apiRequest('/api/admin/all-users', { method: 'GET', noMockFallback: true }));
      liveUsers = Array.isArray(uRes) ? uRes : (uRes?.users || uRes?.data || []);
    } catch (e) {}

    let livePayments = [];
    try {
      const pRes = await apiRequest('/api/payments', { method: 'GET', noMockFallback: true })
        .catch(() => apiRequest('/api/admin/payments', { method: 'GET', noMockFallback: true }))
        .catch(() => apiRequest('/api/payments/all', { method: 'GET', noMockFallback: true }))
        .catch(() => apiRequest('/api/payment/all', { method: 'GET', noMockFallback: true }))
        .catch(() => apiRequest('/api/admin/payment', { method: 'GET', noMockFallback: true }))
        .catch(() => apiRequest('/api/admin/all-payments', { method: 'GET', noMockFallback: true }));
      livePayments = Array.isArray(pRes) ? pRes : (pRes?.payments || pRes?.data || pRes?.allPayments || []);
    } catch (e) {}

    let liveEvents = [];
    try {
      const eRes = await apiRequest('/api/events', { method: 'GET', noMockFallback: true })
        .catch(() => apiRequest('/api/events/all', { method: 'GET', noMockFallback: true }));
      liveEvents = Array.isArray(eRes) ? eRes : (eRes?.events || eRes?.data || []);
    } catch (e) {}

    const colleges = getCustomColleges();
    
    const usersMap = {};
    liveUsers.forEach(u => {
      if (u._id) usersMap[u._id] = u;
      if (u.id) usersMap[u.id] = u;
      if (u.email) usersMap[u.email.toLowerCase()] = u;
      if (u.name) usersMap[u.name.toLowerCase()] = u;
    });

    const paymentsMap = {};
    const paymentsMapByUser = {};
    const paymentsMapByReg = {};
    const paymentsMapByUserAndEvent = {};

    livePayments.forEach(p => {
      const pId = p._id || p.id;
      if (pId) paymentsMap[pId] = p;
      if (p.utr) paymentsMap[p.utr] = p;

      const uId = typeof p.user === 'object' ? (p.user?._id || p.user?.id) : (p.user || p.userId || p.user_id);
      if (uId) {
        paymentsMapByUser[uId] = p;
      }

      const regRef = typeof p.registration === 'object' ? (p.registration?._id || p.registration?.id) : (p.registration || p.registrationId || p.regId || p.reg);
      if (regRef) {
        paymentsMapByReg[regRef] = p;
      }

      const eId = typeof p.event === 'object' ? (p.event?._id || p.event?.id) : (p.event || p.eventId || p.event_id);
      if (uId && eId) {
        paymentsMapByUserAndEvent[`${uId}_${eId}`] = p;
      }
    });

    // Extract embedded payment objects from live rawList
    rawList.forEach(r => {
      const pItems = Array.isArray(r.paymentId) ? r.paymentId : (Array.isArray(r.payment) ? r.payment : [r.paymentId || r.payment].filter(Boolean));
      pItems.forEach(pObj => {
        if (pObj && typeof pObj === 'object') {
          if (pObj._id) paymentsMap[pObj._id] = pObj;
          if (pObj.id) paymentsMap[pObj.id] = pObj;
          if (pObj.utr) paymentsMap[pObj.utr] = pObj;
          if (pObj.user) paymentsMapByUser[pObj.user] = pObj;
          if (r.user) paymentsMapByUser[r.user] = pObj;
          if (r.userId?._id) paymentsMapByUser[r.userId._id] = pObj;
          if (r.userid?._id) paymentsMapByUser[r.userid._id] = pObj;
          if (r._id) paymentsMapByReg[r._id] = pObj;
          if (r.id) paymentsMapByReg[r.id] = pObj;
        }
      });
    });

    // Auto-fetch unpopulated payment ObjectIds in parallel (e.g. if paymentId is a 24-hex string)
    const unpopulatedPaymentIds = rawList
      .map(r => typeof r.paymentId === 'string' ? r.paymentId : (typeof r.payment === 'string' ? r.payment : null))
      .filter(pId => pId && /^[0-9a-fA-F]{24}$/.test(pId) && !paymentsMap[pId]);

    if (unpopulatedPaymentIds.length > 0) {
      await Promise.all(
        [...new Set(unpopulatedPaymentIds)].slice(0, 30).map(async (pId) => {
          try {
            const pData = await apiRequest(`/api/payments/${pId}`, { method: 'GET', noMockFallback: true })
              .catch(() => apiRequest(`/api/admin/payments/${pId}`, { method: 'GET', noMockFallback: true }))
              .catch(() => apiRequest(`/api/payment/${pId}`, { method: 'GET', noMockFallback: true }));
            const p = pData?.payment || pData?.data || pData;
            if (p && (p._id || p.utr || p.imageUrl || p.amount)) {
              paymentsMap[pId] = p;
              if (p._id) paymentsMap[p._id] = p;
              if (p.utr) paymentsMap[p.utr] = p;
              const uId = typeof p.user === 'object' ? (p.user?._id || p.user?.id) : p.user;
              if (uId) paymentsMapByUser[uId] = p;
            }
          } catch (e) {}
        })
      );
    }

    const eventsMap = {};
    liveEvents.forEach(ev => {
      if (ev._id) eventsMap[ev._id] = ev;
      if (ev.id) eventsMap[ev.id] = ev;
      if (ev.title) eventsMap[ev.title.toLowerCase()] = ev;
    });

    const collegesMap = {};
    colleges.forEach(c => {
      if (c._id) collegesMap[c._id] = c;
      if (c.id) collegesMap[c.id] = c;
      if (c.collegeName) collegesMap[c.collegeName.toLowerCase()] = c;
    });

    // Universal normalizer strictly using database properties
    return rawList.map((r, rIdx) => {
      const id = r._id || r.id || (r.paymentId && typeof r.paymentId === 'object' ? r.paymentId._id : null) || `reg_${rIdx}`;
      const userRef = r.user || r.userId || r.userid || r.leader || r.leaderId || r.participant || r.student;
      let userObj = typeof userRef === 'object' && userRef !== null ? userRef : null;
      if (!userObj && typeof userRef === 'string') {
        userObj = usersMap[userRef] || (r.email ? usersMap[r.email.toLowerCase()] : null);
      }

      const eventRef = r.event || r.eventId || r.eventid || r.event_id;
      let eventObj = typeof eventRef === 'object' && eventRef !== null ? eventRef : null;
      if (!eventObj && typeof eventRef === 'string') {
        eventObj = eventsMap[eventRef] || eventsMap[eventRef.toLowerCase()];
      }

      // 1. Resolve raw participants list from database
      let rawParticipants = Array.isArray(r.participants) ? r.participants : [];
      rawParticipants = rawParticipants.map(p => {
        if (typeof p === 'string' && usersMap[p]) {
          return usersMap[p];
        }
        return p;
      });

      if (rawParticipants.length === 0 && userObj) {
        rawParticipants = [userObj];
      }

      const firstParticipant = rawParticipants[0] || userObj || {};

      // 2. Resolve Payment Object from database (cross-referencing multi-index, handling Array / Object / unpopulated)
      let paymentObj = null;
      if (Array.isArray(r.paymentId) && r.paymentId.length > 0) {
        paymentObj = typeof r.paymentId[0] === 'object' ? r.paymentId[0] : (paymentsMap[r.paymentId[0]] || null);
      } else if (r.paymentId && typeof r.paymentId === 'object') {
        paymentObj = r.paymentId;
      } else if (Array.isArray(r.payment) && r.payment.length > 0) {
        paymentObj = typeof r.payment[0] === 'object' ? r.payment[0] : (paymentsMap[r.payment[0]] || null);
      } else if (r.payment && typeof r.payment === 'object') {
        paymentObj = r.payment;
      } else if (typeof r.paymentDetails === 'object' && r.paymentDetails !== null) {
        paymentObj = r.paymentDetails;
      }

      if (!paymentObj || (!paymentObj.utr && !paymentObj.imageUrl && !paymentObj.status)) {
        const pIdStr = typeof r.paymentId === 'string' ? r.paymentId : (typeof r.payment === 'string' ? r.payment : null);
        const uIdStr = typeof r.user === 'string' ? r.user : (userObj?._id || userObj?.id);
        const eIdStr = typeof r.event === 'string' ? r.event : (eventObj?._id || eventObj?.id);

        if (pIdStr && paymentsMap[pIdStr]) {
          paymentObj = paymentsMap[pIdStr];
        } else if (r._id && paymentsMapByReg[r._id]) {
          paymentObj = paymentsMapByReg[r._id];
        } else if (r.id && paymentsMapByReg[r.id]) {
          paymentObj = paymentsMapByReg[r.id];
        } else if (uIdStr && eIdStr && paymentsMapByUserAndEvent[`${uIdStr}_${eIdStr}`]) {
          paymentObj = paymentsMapByUserAndEvent[`${uIdStr}_${eIdStr}`];
        } else if (uIdStr && paymentsMapByUser[uIdStr]) {
          paymentObj = paymentsMapByUser[uIdStr];
        } else if (r._id && paymentsMap[r._id]) {
          paymentObj = paymentsMap[r._id];
        }
      }
      paymentObj = paymentObj || {};

      // 3. Resolve Leader / Participant Name from database
      let resolvedLeader =
        (typeof firstParticipant === 'object' ? (firstParticipant.name || firstParticipant.userName || firstParticipant.fullName) : null) ||
        r.leaderName ||
        r.leader_name ||
        r.participantName ||
        r.participant_name ||
        r.studentName ||
        (typeof r.leader === 'string' && !/^[0-9a-fA-F]{24}$/.test(r.leader) ? r.leader : null) ||
        r.leader?.name ||
        r.name ||
        userObj?.name ||
        userObj?.userName ||
        (r.email ? r.email.split('@')[0] : (firstParticipant?.email ? firstParticipant.email.split('@')[0] : ''));

      if (resolvedLeader && typeof resolvedLeader === 'string' && resolvedLeader.includes('(Lead)')) {
        resolvedLeader = resolvedLeader.replace('(Lead)', '').trim();
      }

      // 4. Resolve Contact Email from database
      const resolvedEmail =
        (typeof firstParticipant === 'object' ? firstParticipant.email : null) ||
        r.email ||
        r.leaderEmail ||
        userObj?.email ||
        '';

      // 5. Resolve Contact Phone from database
      const resolvedPhone =
        (typeof firstParticipant === 'object' ? firstParticipant.phone : null) ||
        r.phone ||
        r.contactNumber ||
        userObj?.phone ||
        '';

      // 6. Deep Multi-Property UTR Extraction from database
      const extractUtr = (rec, pay) => {
        const candidates = [
          pay?.utr,
          pay?.UTR,
          pay?.utrNumber,
          pay?.utr_number,
          pay?.utrNo,
          pay?.utr_no,
          pay?.transactionId,
          pay?.transaction_id,
          pay?.transactionNo,
          pay?.transaction_no,
          pay?.txnId,
          pay?.txn_id,
          pay?.transactionNumber,
          pay?.transactionRef,
          pay?.txnRef,
          pay?.referenceId,
          pay?.reference_id,
          pay?.referenceNo,
          pay?.reference_no,
          pay?.refId,
          pay?.ref_id,
          pay?.refNo,
          pay?.ref_no,
          pay?.paymentReference,
          pay?.payment_reference,
          pay?.paymentRef,
          pay?.payment_ref,
          pay?.paymentUtr,
          pay?.payment_utr,
          pay?.receiptUtr,
          pay?.receipt_utr,
          pay?.upiRef,
          pay?.upi_ref,
          pay?.upiReference,
          pay?.upiTransactionId,
          pay?.upiId,
          pay?.receiptId,
          pay?.receiptNo,
          pay?.bankRef,
          pay?.rrn,
          pay?.RRN,
          pay?.orderId,
          rec?.utr,
          rec?.UTR,
          rec?.utrNumber,
          rec?.utr_number,
          rec?.utrNo,
          rec?.utr_no,
          rec?.transactionId,
          rec?.transaction_id,
          rec?.transactionNo,
          rec?.transaction_no,
          rec?.txnId,
          rec?.txn_id,
          rec?.referenceId,
          rec?.reference_id,
          rec?.referenceNo,
          rec?.reference_no,
          rec?.refId,
          rec?.refNo,
          rec?.paymentReference,
          rec?.payment_reference,
          rec?.paymentRef,
          rec?.payment_ref,
          rec?.paymentUtr,
          rec?.payment_utr,
          rec?.receiptUtr,
          rec?.upiRef,
          rec?.upi_ref,
          rec?.rrn,
          rec?.RRN,
          rec?.paymentDetails?.utr,
          rec?.paymentDetails?.UTR,
          rec?.paymentDetails?.transactionId,
          rec?.paymentDetails?.txnId,
          rec?.paymentDetails?.referenceId,
          rec?.paymentId?.utr,
          rec?.paymentId?.UTR,
          rec?.paymentId?.transactionId,
          rec?.paymentId?.txnId,
          rec?.paymentProof?.utr,
          rec?.paymentProof?.transactionId
        ];

        for (const c of candidates) {
          if (c !== undefined && c !== null) {
            const str = String(c).trim();
            if (str && str.toLowerCase() !== 'null' && str.toLowerCase() !== 'undefined' && str.toLowerCase() !== 'n/a' && str.toLowerCase() !== 'none') {
              return str;
            }
          }
        }

        // Check if any key on pay or rec includes 'utr' or 'txn'
        const checkObjectKeys = (obj) => {
          if (!obj || typeof obj !== 'object') return '';
          for (const [k, v] of Object.entries(obj)) {
            const lowerK = k.toLowerCase();
            if (lowerK.includes('utr') || lowerK.includes('txn') || lowerK.includes('upi') || lowerK.includes('reference') || lowerK.includes('receipt')) {
              if (typeof v === 'string' && v.trim() && v.toLowerCase() !== 'null' && v.toLowerCase() !== 'undefined' && !/^[0-9a-fA-F]{24}$/.test(v)) {
                return v.trim();
              }
              if (typeof v === 'number') {
                return String(v);
              }
            }
          }
          return '';
        };

        const fromPayKeys = checkObjectKeys(pay);
        if (fromPayKeys) return fromPayKeys;

        const fromRecKeys = checkObjectKeys(rec);
        if (fromRecKeys) return fromRecKeys;

        return '';
      };

      const resolvedUtr = extractUtr(r, paymentObj);

      // 7. Resolve Numeric Amount & Formatted Amount from database
      let rawAmt =
        paymentObj.amount !== undefined ? paymentObj.amount :
        (r.registrationFee !== undefined ? r.registrationFee :
        (r.fee !== undefined ? r.fee : r.amount));

      let amountNumber = 0;
      if (typeof rawAmt === 'number') {
        amountNumber = rawAmt;
      } else if (typeof rawAmt === 'string') {
        const parsed = Number(rawAmt.replace(/[^0-9.]/g, ''));
        amountNumber = isNaN(parsed) ? 0 : parsed;
      } else if (eventObj && (eventObj.registrationFee !== undefined || eventObj.fee !== undefined)) {
        const evAmt = eventObj.registrationFee !== undefined ? eventObj.registrationFee : eventObj.fee;
        amountNumber = typeof evAmt === 'number' ? evAmt : (Number(String(evAmt).replace(/[^0-9.]/g, '')) || 0);
      }

      const formattedAmount = `₹ ${amountNumber.toLocaleString()}`;

      // 8. Resolve Payment Status from database
      const rawStatus = (paymentObj.status || r.paymentStatus || r.payment_status || r.status || 'Pending').toLowerCase();
      let resolvedPaymentStatus = 'Pending';
      if (rawStatus.includes('app') || rawStatus === 'success' || rawStatus === 'verified') {
        resolvedPaymentStatus = 'Approved';
      } else if (rawStatus.includes('rej')) {
        resolvedPaymentStatus = 'Rejected';
      }

      // 9. Resolve Image Proof / Receipt URL from database (Cloudinary)
      let resolvedImageUrl =
        paymentObj.imageUrl ||
        paymentObj.image_url ||
        paymentObj.image ||
        paymentObj.proofUrl ||
        paymentObj.proof_url ||
        paymentObj.receiptUrl ||
        paymentObj.receipt_url ||
        paymentObj.receipt ||
        paymentObj.url ||
        paymentObj.secure_url ||
        paymentObj.screenshot ||
        paymentObj.paymentProof ||
        paymentObj.payment_proof ||
        r.imageUrl ||
        r.image_url ||
        r.proofUrl ||
        r.proof_url ||
        r.receiptUrl ||
        r.receipt_url ||
        r.receipt ||
        r.paymentProof ||
        r.payment_proof ||
        r.paymentScreenshot ||
        r.screenshot ||
        r.secure_url ||
        (r.image && typeof r.image === 'string' && (r.image.startsWith('http') || r.image.startsWith('data:')) ? r.image : '') ||
        '';

      // 10. Resolve College Name from database
      let resolvedCollege =
        (typeof firstParticipant === 'object' ? firstParticipant.college : null) ||
        r.collegeName ||
        r.college_name ||
        r.institution ||
        r.institutionName ||
        r.college?.collegeName ||
        r.college?.name ||
        (typeof r.college === 'string' && !/^[0-9a-fA-F]{24}$/.test(r.college) ? r.college : null) ||
        userObj?.collegeName ||
        userObj?.college?.collegeName ||
        userObj?.college?.name ||
        (typeof userObj?.college === 'string' && !/^[0-9a-fA-F]{24}$/.test(userObj.college) ? userObj.college : null) ||
        (r.collegeId && collegesMap[r.collegeId]?.collegeName) ||
        (r.college && collegesMap[r.college]?.collegeName) ||
        '';

      // 11. Resolve Team Name from database
      let resolvedTeam =
        r.teamName ||
        r.team_name ||
        (typeof r.team === 'string' ? r.team : null) ||
        r.team?.name ||
        r.team?.teamName ||
        (resolvedLeader ? `Team-${resolvedLeader.replace(/\s+/g, '')}` : (id ? `Team-${id.slice(-4).toUpperCase()}` : ''));

      // 12. Resolve Event Name from database
      let resolvedEvent =
        r.title ||
        r.eventName ||
        r.event_name ||
        r.eventTitle ||
        r.event_title ||
        (typeof r.event === 'object' && r.event !== null ? (r.event.title || r.event.name) : (typeof r.event === 'string' && r.event !== 'Event' && !/^[0-9a-fA-F]{24}$/.test(r.event) ? r.event : null)) ||
        r.event?.title ||
        r.event?.name ||
        eventObj?.title ||
        eventObj?.name ||
        'Event';

      // 12. Resolve Members
      const membersList = rawParticipants.length > 0
        ? rawParticipants.map(p => typeof p === 'object' ? (p.name || p.userName || p.email || 'Member') : p)
        : (Array.isArray(r.members) && r.members.length > 0
            ? r.members.map(m => typeof m === 'object' ? (m.name || m.userName || m.fullName || 'Member') : m)
            : [resolvedLeader]);

      // 13. Resolve Timestamps
      const paymentTimestamp = paymentObj.timestamp || paymentObj.createdAt || '';
      const registeredAt = r.addedAt || r.createdAt || paymentTimestamp || new Date().toISOString();

      return {
        ...r,
        _id: id,
        id: id,
        collegeName: resolvedCollege,
        college: resolvedCollege,
        leaderName: resolvedLeader,
        name: resolvedLeader,
        teamName: resolvedTeam,
        team: resolvedTeam,
        event: resolvedEvent,
        eventName: resolvedEvent,
        email: resolvedEmail,
        phone: resolvedPhone,
        paymentStatus: resolvedPaymentStatus,
        amount: formattedAmount,
        amountNumber: amountNumber,
        utr: resolvedUtr,
        proofUrl: resolvedImageUrl,
        imageUrl: resolvedImageUrl,
        paymentId: paymentObj,
        paymentIdStr: paymentObj._id || (typeof r.paymentId === 'string' ? r.paymentId : id),
        paymentTimestamp: paymentTimestamp,
        registeredAt: registeredAt,
        membersCount: membersList.length,
        members: membersList,
        participants: rawParticipants.length > 0 ? rawParticipants : membersList.map(m => ({ name: m, email: resolvedEmail, phone: resolvedPhone })),
        quotaStatus: r.quotaStatus || 'Under Quota'
      };
    });
  },

  // 12b. Retrieve Payments Queue (Unified payment records from registrations & payments)
  getPayments: async () => {
    try {
      const regs = await apiService.getRegistrations();
      return regs.map((reg, idx) => {
        const paymentIdVal = reg.paymentId?._id || reg.paymentIdStr || reg._id || `PAY-${8920 + idx}`;
        return {
          id: paymentIdVal,
          _id: paymentIdVal,
          regId: reg._id || reg.id,
          utr: reg.utr || 'N/A',
          teamName: reg.teamName,
          leaderName: reg.leaderName,
          email: reg.email,
          phone: reg.phone,
          collegeName: reg.collegeName,
          amount: reg.amount,
          amountNumber: reg.amountNumber,
          event: reg.event || reg.eventName,
          date: reg.paymentTimestamp 
            ? new Date(reg.paymentTimestamp).toLocaleString() 
            : (reg.registeredAt ? new Date(reg.registeredAt).toLocaleString() : 'N/A'),
          status: reg.paymentStatus,
          proofUrl: reg.proofUrl || reg.imageUrl || '',
          imageUrl: reg.imageUrl || reg.proofUrl || '',
          participants: reg.participants || [],
          members: reg.members || [],
          paymentIdObj: reg.paymentId || {}
        };
      });
    } catch (err) {
      console.warn('Get payments failed:', err);
      return [];
    }
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

  approveRegistrationPayment: async (id, status = 'approved', regObj = null) => {
    const normStatus = status.toLowerCase();
    const displayStatus = normStatus.charAt(0).toUpperCase() + normStatus.slice(1);

    // Extract potential payment ID from passed registration object or ID
    const payId = regObj?.paymentIdStr || 
                  (regObj?.paymentId && typeof regObj.paymentId === 'object' ? (regObj.paymentId._id || regObj.paymentId.id) : null) || 
                  (Array.isArray(regObj?.paymentId) && regObj.paymentId[0] ? (regObj.paymentId[0]._id || regObj.paymentId[0].id) : null) ||
                  (typeof regObj?.paymentId === 'string' ? regObj.paymentId : null);

    const list = getStoredRegistrations();
    const idx = list.findIndex(r => (
      r._id === id || 
      r.id === id || 
      (payId && (r._id === payId || r.id === payId)) ||
      (r.paymentId && (r.paymentId._id === id || r.paymentId.id === id || r.paymentId === id || (Array.isArray(r.paymentId) && r.paymentId[0]?._id === id)))
    ));
    if (idx !== -1) {
      list[idx] = { 
        ...list[idx], 
        paymentStatus: displayStatus, 
        status: normStatus,
        updatedAt: new Date().toISOString() 
      };
      if (list[idx].paymentId) {
        if (Array.isArray(list[idx].paymentId) && list[idx].paymentId.length > 0) {
          list[idx].paymentId[0].status = normStatus;
          list[idx].paymentId[0].updatedAt = new Date().toISOString();
        } else if (typeof list[idx].paymentId === 'object') {
          list[idx].paymentId.status = normStatus;
          list[idx].paymentId.updatedAt = new Date().toISOString();
        }
      }
      saveRegistrations(list);
    }

    // Try live backend: Priority 1: Payment ID, Priority 2: Reg ID
    const idsToTry = [...new Set([payId, id])].filter(Boolean);
    let successData = null;

    for (const targetId of idsToTry) {
      try {
        const data = await apiRequest(`/api/registrations/${targetId}/payment-status`, {
          method: 'PUT',
          body: JSON.stringify({ paymentStatus: normStatus, status: normStatus })
        });
        if (data && (data.success || data.message || data.payment || data.registration)) {
          successData = data;
          break;
        }
      } catch (err) {
        console.warn(`Failed /api/registrations/${targetId}/payment-status:`, err);
      }
    }

    if (successData) {
      return successData.registration || successData.payment || (idx !== -1 ? list[idx] : { id, paymentStatus: displayStatus });
    }

    // Fallback attempts
    for (const targetId of idsToTry) {
      try {
        const altData = await apiRequest(`/api/registrations/${targetId}/payment`, {
          method: 'PATCH',
          body: JSON.stringify({ paymentStatus: normStatus, status: normStatus })
        });
        if (altData) return altData.registration || altData.payment || (idx !== -1 ? list[idx] : { id, paymentStatus: displayStatus });
      } catch (e) {}
    }

    return idx !== -1 ? list[idx] : { id, paymentStatus: displayStatus };
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
  },

  // 14. Admin Recent Payments & Status API (Docs: GET /api/admin/recent-payments, POST /api/admin/payment-status, GET /api/admin/payment-details/:paymentId)
  getRecentPayments: async () => {
    try {
      const data = await apiRequest('/api/admin/recent-payments', {
        method: 'GET'
      });
      return {
        count: data?.count || (data?.payments ? data.payments.length : 0),
        payments: data?.payments || (Array.isArray(data) ? data : [])
      };
    } catch (err) {
      console.warn('Backend recent payments API offline, using local store fallback:', err);
      const list = getStoredPayments();
      return {
        count: list.length,
        payments: list
      };
    }
  },

  updatePaymentStatus: async (paymentId, status, message = '') => {
    const normStatus = (status || '').toLowerCase(); // 'approved' or 'rejected'
    try {
      const data = await apiRequest('/api/admin/payment-status', {
        method: 'POST',
        body: JSON.stringify({ paymentId, status: normStatus, message })
      });
      return data;
    } catch (err) {
      console.warn('Backend payment status update API offline, updating local store:', err);
      const list = getStoredPayments();
      const idx = list.findIndex(p => (p.paymentid || p._id) === paymentId);
      
      let currentAdmin = { _id: 'admin_1', name: 'Super Admin', email: 'admin@example.com', role: 'superadmin' };
      try {
        const storedAdmin = localStorage.getItem('semaphore_admin_user');
        if (storedAdmin) {
          const parsed = JSON.parse(storedAdmin);
          if (parsed && parsed.name) currentAdmin = parsed;
        }
      } catch (e) {}

      const defaultMsg = normStatus === 'approved' ? 'Payment verified via UTR bank statement' : 'Invalid UTR transaction reference';

      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          status: normStatus,
          message: message || defaultMsg,
          approvedBy: currentAdmin,
          updatedAt: new Date().toISOString()
        };
        savePayments(list);
        return {
          message: `Payment status updated to '${normStatus}' successfully`,
          payment: list[idx]
        };
      }
      return {
        message: `Payment status updated to '${normStatus}' successfully`,
        payment: { paymentid: paymentId, _id: paymentId, status: normStatus, message: message || defaultMsg, approvedBy: currentAdmin }
      };
    }
  },

  getPaymentDetails: async (paymentId) => {
    try {
      let data;
      try {
        data = await apiRequest(`/api/admin/payment-details/${paymentId}`, { method: 'GET' });
      } catch (_e1) {
        data = await apiRequest(`/api/admin/payments/${paymentId}`, { method: 'GET' });
      }
      return data;
    } catch (err) {
      console.warn('Backend payment details API offline, deriving from local store:', err);
      const list = getStoredPayments();
      const item = list.find(p => (p.paymentid || p._id) === paymentId) || list[0];
      
      const rawEvents = item?.events || [
        {
          registrationId: "66c89f1e1a2b3c4d5e6f7r01",
          eventId: "66c89f1e1a2b3c4d5e6f7b01",
          title: "CodeSprint Hackathon",
          description: "24-hour coding marathon",
          actualPrice: 500,
          registrationFee: 500,
          location: "Auditorium Hall A",
          date: "2026-09-15T09:00:00.000Z",
          minParticipants: 1,
          maxParticipants: 4,
          participantsCount: 2,
          participants: [
            { name: "Alex Johnson", phone: "+19876543210" },
            { name: "Sam Lee", phone: "+19876543211" }
          ],
          createdAt: "2026-08-23T13:12:00.000Z"
        },
        {
          registrationId: "66c89f1e1a2b3c4d5e6f7r02",
          eventId: "66c89f1e1a2b3c4d5e6f7b02",
          title: "Robo Wars",
          description: "Bot combat tournament",
          actualPrice: 500,
          registrationFee: 500,
          location: "Robotics Lab B",
          date: "2026-09-16T10:00:00.000Z",
          minParticipants: 1,
          maxParticipants: 2,
          participantsCount: 1,
          participants: [
            { name: item?.user?.name || "John Doe", phone: "+19876543212" }
          ],
          createdAt: "2026-08-23T13:12:00.000Z"
        }
      ];

      const formattedEvents = rawEvents.map(evt => ({
        registrationId: evt.registrationId || evt._id || evt.id,
        eventId: evt.eventId || evt._id || evt.id,
        title: evt.title || evt.name || 'Event Registration',
        description: evt.description || '',
        actualPrice: evt.actualPrice || evt.registrationFee || evt.fee || 500,
        registrationFee: evt.registrationFee || evt.actualPrice || evt.fee || 500,
        location: evt.location || 'Auditorium Hall A',
        date: evt.date || '2026-09-15T09:00:00.000Z',
        minParticipants: evt.minParticipants || 1,
        maxParticipants: evt.maxParticipants || 4,
        participantsCount: evt.participantsCount || (evt.participants ? evt.participants.length : 1),
        participants: evt.participants || [
          { name: item?.user?.name || item?.leaderName || 'Student Participant', phone: '+19876543210' }
        ],
        createdAt: evt.createdAt || new Date().toISOString()
      }));

      return {
        payment: {
          paymentid: item?.paymentid || item?._id || paymentId,
          _id: item?._id || item?.paymentid || paymentId,
          amount: item?.amount || 1000,
          utr: item?.utr || 'UTR987654321012',
          imageUrl: item?.imageUrl || item?.imageurl || 'https://res.cloudinary.com/demo/image/upload/v1724419200/payment.jpg',
          imageurl: item?.imageurl || item?.imageUrl || 'https://res.cloudinary.com/demo/image/upload/v1724419200/payment.jpg',
          status: item?.status || 'approved',
          message: item?.message || 'Payment verified via bank statement',
          approvedBy: item?.approvedBy || { _id: '66c89f1e1a2b3c4d5e6f7admin1', name: 'Super Admin', email: 'admin@example.com', role: 'superadmin' },
          approved_by: item?.approvedBy || { _id: '66c89f1e1a2b3c4d5e6f7admin1', name: 'Super Admin', email: 'admin@example.com', role: 'superadmin' },
          timestamp: item?.timestamp || item?.createdAt || new Date().toISOString(),
          createdAt: item?.createdAt || new Date().toISOString(),
          updatedAt: item?.updatedAt || new Date().toISOString()
        },
        user: {
          _id: item?.user?._id || '66c89f1e1a2b3c4d5e6f7a80',
          name: item?.user?.name || item?.userName || item?.leaderName || 'John Doe',
          email: item?.user?.email || item?.userEmail || item?.email || 'john@example.com',
          avatar: item?.user?.avatar || item?.userAvatar || item?.avatar || 'https://lh3.googleusercontent.com/a/avatar',
          collegeName: item?.user?.collegeName || item?.collegeName || 'Stanford University'
        },
        college: item?.user?.college || {
          _id: '66c89f1e1a2b3c4d5e6f7c00',
          collegeName: item?.user?.collegeName || item?.collegeName || 'Stanford University',
          totalTeams: 1
        },
        team: item?.user?.team || {
          _id: '66c89f1e1a2b3c4d5e6f7a81',
          name: item?.user?.team?.name || item?.teamName || 'CyberKnights',
          teamid: item?.user?.team?.teamid || 'TEAM-1724419200000-4821'
        },
        eventsCount: formattedEvents.length,
        events: formattedEvents,
        associatedEvents: formattedEvents
      };
    }
  },

  // 15. Get Event Participants (Docs: GET /api/admin/event-participants/:eventId/:userId)
  getEventParticipants: async (eventId, userId) => {
    try {
      const data = await apiRequest(`/api/admin/event-participants/${eventId}/${userId}`, {
        method: 'GET'
      });
      return data;
    } catch (err) {
      console.warn('Primary event-participants API offline/error, trying alias endpoints:', err);
      try {
        const altData = await apiRequest(`/api/admin/participants/event/${eventId}/user/${userId}`, {
          method: 'GET'
        });
        return altData;
      } catch (e2) {
        try {
          const queryData = await apiRequest(`/api/admin/event-participants?eventId=${eventId}&userId=${userId}`, {
            method: 'GET'
          });
          return queryData;
        } catch (e3) {
          console.warn('Using offline mock fallback for event participants:', e3);
          return {
            registrationId: `reg_${eventId}_${userId}`,
            event: {
              _id: eventId || '66c89f1e1a2b3c4d5e6f7b01',
              title: eventId === 'evt_102' ? 'Robo Wars Arena' : 'CodeSprint Hackathon',
              description: eventId === 'evt_102' ? 'Heavyweight combat robot arena battles' : '24-hour speed coding and algorithm optimization marathon',
              actualPrice: 500,
              registrationFee: 500,
              location: 'Auditorium Hall A, Tech Campus',
              date: '2026-09-15T09:00:00.000Z',
              capacity: 100,
              minParticipants: 1,
              maxParticipants: 4
            },
            user: {
              _id: userId || '66c89f1e1a2b3c4d5e6f7a80',
              name: 'John Doe',
              email: 'john@example.com',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
              collegeName: 'Stanford University'
            },
            college: {
              _id: '66c89f1e1a2b3c4d5e6f7c00',
              collegeName: 'Stanford University',
              totalTeams: 1
            },
            team: {
              _id: '66c89f1e1a2b3c4d5e6f7a81',
              name: 'CyberKnights',
              teamid: 'TEAM-1724419200000-4821'
            },
            participantsCount: 2,
            participants: [
              {
                _id: userId || '66c89f1e1a2b3c4d5e6f7a80',
                name: 'John Doe (Lead)',
                email: 'john@example.com',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
                collegeName: 'Stanford University',
                role: 'Team Leader'
              },
              {
                _id: '66c89f1e1a2b3c4d5e6f7a82',
                name: 'Jane Smith',
                email: 'jane@example.com',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
                collegeName: 'Stanford University',
                role: 'Team Member'
              }
            ],
            payments: [
              {
                _id: '66c89f1e1a2b3c4d5e6f7p99',
                amount: 1000,
                utr: 'UTR987654321012',
                imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
                status: 'approved',
                message: 'Payment verified via bank statement'
              }
            ],
            createdAt: new Date().toISOString()
          };
        }
      }
    }
  },

  // 16. Get User Full Details (Docs: GET /api/admin/user-full-details/:userId)
  getUserFullDetails: async (userId) => {
    try {
      const data = await apiRequest(`/api/admin/user-full-details/${userId}`, {
        method: 'GET'
      });
      return data;
    } catch (err) {
      console.warn('Primary user-full-details API error, trying alias endpoints:', err);
      try {
        const altData = await apiRequest(`/api/admin/users/${userId}/full-details`, {
          method: 'GET'
        });
        return altData;
      } catch (e2) {
        try {
          const queryData = await apiRequest(`/api/admin/user-details/${userId}`, {
            method: 'GET'
          });
          return queryData;
        } catch (e3) {
          console.warn('Using offline mock fallback for user full details:', e3);
          return {
            user: {
              _id: userId || '66c89f1e1a2b3c4d5e6f7a80',
              name: 'John Doe',
              email: 'john@example.com',
              role: 'user',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
              googleId: '109876543210987654321',
              collegeName: 'Stanford University',
              createdAt: '2026-08-20T10:00:00.000Z',
              updatedAt: '2026-08-23T14:00:00.000Z'
            },
            college: {
              _id: '66c89f1e1a2b3c4d5e6f7c00',
              collegeName: 'Stanford University',
              totalTeams: 1,
              createdAt: '2026-08-20T09:00:00.000Z',
              updatedAt: '2026-08-20T09:00:00.000Z'
            },
            team: {
              _id: '66c89f1e1a2b3c4d5e6f7a81',
              name: 'CyberKnights',
              teamid: 'TEAM-1724419200000-4821',
              createdAt: '2026-08-23T13:10:00.000Z',
              updatedAt: '2026-08-23T13:10:00.000Z'
            },
            teamName: 'CyberKnights',
            hasTeam: true,
            teamMembers: [
              {
                _id: userId || '66c89f1e1a2b3c4d5e6f7a80',
                name: 'John Doe',
                email: 'john@example.com',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
                collegeName: 'Stanford University',
                createdAt: '2026-08-20T10:00:00.000Z'
              },
              {
                _id: '66c89f1e1a2b3c4d5e6f7a82',
                name: 'Jane Smith',
                email: 'jane@example.com',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
                collegeName: 'Stanford University',
                createdAt: '2026-08-21T11:00:00.000Z'
              }
            ],
            registeredEvents: [
              {
                registrationId: '66c89f1e1a2b3c4d5e6f7r01',
                eventId: '66c89f1e1a2b3c4d5e6f7b01',
                title: 'CodeSprint Hackathon',
                description: '24-hour coding marathon and algorithm optimization challenge',
                registrationFee: 500,
                actualPrice: 500,
                image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80',
                location: 'Auditorium Hall A, Tech Block',
                date: '2026-09-15T09:00:00.000Z',
                timings: '09:00 AM - 05:00 PM',
                coordinators: [
                  {
                    name: 'Dr. Alan Turing',
                    phone: '+1234567890'
                  }
                ],
                minParticipants: 1,
                maxParticipants: 4,
                payments: [
                  {
                    _id: '66c89f1e1a2b3c4d5e6f7p99',
                    amount: 1000,
                    utr: 'UTR987654321012',
                    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
                    status: 'approved',
                    message: 'Payment verified via bank statement',
                    approvedBy: {
                      _id: '66c89f1e1a2b3c4d5e6f7admin1',
                      name: 'Super Admin',
                      email: 'admin@example.com',
                      role: 'superadmin'
                    }
                  }
                ],
                createdAt: '2026-08-23T13:12:00.000Z',
                updatedAt: '2026-08-23T13:15:00.000Z'
              }
            ],
            payments: [
              {
                _id: '66c89f1e1a2b3c4d5e6f7p99',
                amount: 1000,
                utr: 'UTR987654321012',
                imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
                status: 'approved',
                message: 'Payment verified via bank statement',
                approvedBy: {
                  _id: '66c89f1e1a2b3c4d5e6f7admin1',
                  name: 'Super Admin',
                  email: 'admin@example.com',
                  role: 'superadmin'
                },
                createdAt: '2026-08-23T13:12:00.000Z'
              }
            ],
            summary: {
              totalEventsRegistered: 1,
              totalPaymentsSubmitted: 1,
              totalAmountPaid: 1000
            }
          };
        }
      }
    }
  }
};



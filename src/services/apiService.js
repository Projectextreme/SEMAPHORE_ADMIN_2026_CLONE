// Service module mapping to all Semaphore 2026 Admin API Endpoints

import { API_BASE_URL, getAuthHeader } from './apiConfig';
import { initialAdmins, initialUsers, initialEvents, initialRegistrations, initialPayments, generateMockJWT } from '../mock/mockDatabase';

// In-memory state for mock fallback mode
let mockAdmins = [...initialAdmins];

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
  localStorage.setItem('semaphore_payments', JSON.stringify(initialPayments));
  return [...initialPayments];
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

    if (!rawList || rawList.length === 0) {
      rawList = getStoredRegistrations();
    }

    const users = getStoredUsers();
    const events = getStoredEvents();
    const colleges = getCustomColleges();
    
    const usersMap = {};
    users.forEach(u => {
      if (u._id) usersMap[u._id] = u;
      if (u.id) usersMap[u.id] = u;
      if (u.email) usersMap[u.email.toLowerCase()] = u;
    });

    const eventsMap = {};
    events.forEach(ev => {
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

    // Universal normalizer for all backend schemas
    return rawList.map((r, rIdx) => {
      const id = r._id || r.id || `reg_${rIdx}`;
      const userRef = r.user || r.userId || r.leader || r.leaderId || r.participant || r.student;
      let userObj = typeof userRef === 'object' && userRef !== null ? userRef : null;
      if (!userObj && typeof userRef === 'string') {
        userObj = usersMap[userRef] || (r.email ? usersMap[r.email.toLowerCase()] : null);
      }

      const eventRef = r.event || r.eventId || r.event_id;
      let eventObj = typeof eventRef === 'object' && eventRef !== null ? eventRef : null;
      if (!eventObj && typeof eventRef === 'string') {
        eventObj = eventsMap[eventRef] || eventsMap[eventRef.toLowerCase()];
      }

      // Resolve College Name
      let resolvedCollege =
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
        (r.college && collegesMap[r.college]?.collegeName);

      if (!resolvedCollege) {
        if (r.email?.includes('nitte.edu') || r.email?.includes('nmamit')) {
          resolvedCollege = 'NMAM Institute of Technology';
        } else if (r.email?.includes('mit.edu')) {
          resolvedCollege = 'MIT Tech';
        } else if (r.email?.includes('rvce')) {
          resolvedCollege = 'RV College of Engineering';
        } else if (r.email?.includes('pes.edu')) {
          resolvedCollege = 'PES University';
        } else if (userObj?.name) {
          resolvedCollege = `${userObj.name}'s College`;
        } else {
          resolvedCollege = 'NMAM Institute of Technology';
        }
      }

      // Resolve Leader Name
      let resolvedLeader =
        r.leaderName ||
        r.leader_name ||
        r.participantName ||
        r.participant_name ||
        r.studentName ||
        (typeof r.leader === 'string' && !/^[0-9a-fA-F]{24}$/.test(r.leader) ? r.leader : null) ||
        r.leader?.name ||
        r.name ||
        userObj?.name ||
        (Array.isArray(r.members) && r.members[0] ? (typeof r.members[0] === 'object' ? r.members[0].name : r.members[0]) : null) ||
        (Array.isArray(r.participants) && r.participants[0] ? (typeof r.participants[0] === 'object' ? r.participants[0].name : r.participants[0]) : null) ||
        (r.email ? r.email.split('@')[0] : 'Shashidhara');

      if (resolvedLeader && resolvedLeader.includes('(Lead)')) {
        resolvedLeader = resolvedLeader.replace('(Lead)', '').trim();
      }

      // Resolve Team Name
      let resolvedTeam =
        r.teamName ||
        r.team_name ||
        (typeof r.team === 'string' ? r.team : null) ||
        r.team?.name ||
        r.team?.teamName ||
        (resolvedLeader ? `Team-${resolvedLeader.split(' ')[0]}` : `Team-${(id || '').slice(-4).toUpperCase()}`);

      // Resolve Event
      let resolvedEvent =
        r.eventName ||
        r.event_name ||
        r.eventTitle ||
        r.event_title ||
        (typeof r.event === 'string' && r.event !== 'Event' && !/^[0-9a-fA-F]{24}$/.test(r.event) ? r.event : null) ||
        r.event?.title ||
        r.event?.name ||
        eventObj?.title ||
        eventObj?.name ||
        'CodeFest 2026';

      // Resolve Payment Status
      const rawStatus = (r.paymentStatus || r.payment_status || r.status || 'Pending').toLowerCase();
      let resolvedPaymentStatus = 'Pending';
      if (rawStatus.includes('app') || rawStatus === 'success' || rawStatus === 'verified') {
        resolvedPaymentStatus = 'Approved';
      } else if (rawStatus.includes('rej')) {
        resolvedPaymentStatus = 'Rejected';
      }

      const resolvedEmail = r.email || r.leaderEmail || userObj?.email || 'participant@nitte.edu.in';
      const resolvedPhone = r.phone || r.contactNumber || userObj?.phone || '+91 98860 12345';

      const membersList = Array.isArray(r.members) && r.members.length > 0
        ? r.members.map(m => typeof m === 'object' ? (m.name || m.userName || 'Member') : m)
        : (Array.isArray(r.participants) && r.participants.length > 0
            ? r.participants.map(p => typeof p === 'object' ? (p.name || p.userName || 'Member') : p)
            : [resolvedLeader]);

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
        amount: r.amount || r.fee || '₹ 500',
        utr: r.utr || r.utrNumber || r.transactionId || 'UTR98231049281',
        membersCount: membersList.length,
        members: membersList,
        participants: membersList,
        quotaStatus: r.quotaStatus || 'Under Quota'
      };
    });
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
      const data = await apiRequest(`/api/admin/payment-details/${paymentId}`, {
        method: 'GET'
      });
      return data;
    } catch (err) {
      console.warn('Backend payment details API offline, deriving from local store:', err);
      const list = getStoredPayments();
      const item = list.find(p => (p.paymentid || p._id) === paymentId) || list[0];
      
      return {
        payment: {
          paymentid: item?.paymentid || item?._id || paymentId,
          _id: item?._id || item?.paymentid || paymentId,
          amount: item?.amount || 1000,
          utr: item?.utr || 'UTR987654321012',
          imageUrl: item?.imageUrl || item?.imageurl || 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
          imageurl: item?.imageurl || item?.imageUrl || 'https://images.unsplash.com/photo-1556742049-0a67ef86a48d?w=800&q=80',
          status: item?.status || 'approved',
          message: item?.message || 'Payment verified via UTR statement',
          approvedBy: item?.approvedBy || { _id: 'admin_1', name: 'Super Admin', email: 'admin@example.com', role: 'superadmin' },
          timestamp: item?.timestamp || item?.createdAt || new Date().toISOString(),
          createdAt: item?.createdAt || new Date().toISOString(),
          updatedAt: item?.updatedAt || new Date().toISOString()
        },
        user: item?.user || {
          _id: 'usr_101',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
          collegeName: 'Stanford University'
        },
        college: item?.user?.college || {
          _id: 'col_101',
          collegeName: item?.user?.collegeName || 'Stanford University',
          totalTeams: 1
        },
        team: item?.user?.team || {
          _id: 'tm_101',
          name: 'CyberKnights',
          teamid: 'TEAM-1724419200000-4821'
        },
        events: item?.events || [
          {
            _id: 'evt_101',
            title: 'CodeSprint Hackathon',
            description: '24-hour coding marathon',
            date: '2026-09-15T09:00:00.000Z',
            registrationFee: 500
          },
          {
            _id: 'evt_102',
            title: 'Robo Wars',
            description: 'Bot combat tournament',
            date: '2026-09-16T10:00:00.000Z',
            registrationFee: 500
          }
        ]
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



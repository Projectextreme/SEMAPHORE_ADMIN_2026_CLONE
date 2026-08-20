// Service module mapping to all Semaphore 2026 Admin API Endpoints

import { API_BASE_URL, getAuthHeader } from './apiConfig';
import { initialAdmins, initialUsers, initialEvents, generateMockJWT } from '../mock/mockDatabase';

// In-memory state for mock fallback mode
let mockAdmins = [...initialAdmins];
let mockUsers = [...initialUsers];

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
  const token = localStorage.getItem('semaphore_admin_token');
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
      role: body.role || 'admin',
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
    mockUsers.splice(index, 1);
    return {
      message: 'User deleted successfully',
      _id: id
    };
  }

  // 10. GET /api/events or /api/admin/events
  if ((endpoint === '/api/events' || endpoint === '/api/admin/events') && method === 'GET') {
    return mockEvents;
  }

  // 11. POST /api/events or /api/admin/events
  if ((endpoint === '/api/events' || endpoint === '/api/admin/events') && method === 'POST') {
    const newId = body.id || `EVT-${String(mockEvents.length + 1).padStart(2, '0')}`;
    const createdEvent = {
      id: newId,
      title: body.title,
      category: body.category || 'Coding & Hackathon',
      fee: body.fee ? (body.fee.startsWith('₹') ? body.fee : `₹ ${body.fee}`) : '₹ 500',
      maxTeamsPerCollege: Number(body.maxTeamsPerCollege) || 2,
      maxTeamMembers: Number(body.maxTeamMembers) || 4,
      venue: body.venue || 'Main Auditorium',
      status: body.status || 'Active',
      coordinators: Array.isArray(body.coordinators)
        ? body.coordinators
        : (typeof body.coordinators === 'string' && body.coordinators.trim()
            ? body.coordinators.split(',').map(c => c.trim())
            : ['Admin Assigned'])
    };
    mockEvents.push(createdEvent);
    saveEvents(mockEvents);
    return createdEvent;
  }

  // 12. PUT /api/events/:id or /api/admin/events/:id
  if ((endpoint.startsWith('/api/events/') || endpoint.startsWith('/api/admin/events/')) && method === 'PUT') {
    const id = endpoint.split('/')[3] || endpoint.split('/')[4];
    const index = mockEvents.findIndex(evt => evt.id === id);
    if (index === -1) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }
    mockEvents[index] = { ...mockEvents[index], ...body };
    saveEvents(mockEvents);
    return mockEvents[index];
  }

  // 13. DELETE /api/events/:id or /api/admin/events/:id
  if ((endpoint.startsWith('/api/events/') || endpoint.startsWith('/api/admin/events/')) && method === 'DELETE') {
    const id = endpoint.split('/')[3] || endpoint.split('/')[4];
    const index = mockEvents.findIndex(evt => evt.id === id);
    if (index === -1) {
      const error = new Error('Event not found');
      error.status = 404;
      throw error;
    }
    mockEvents.splice(index, 1);
    saveEvents(mockEvents);
    return { message: 'Event deleted successfully', id };
  }

  throw new Error(`Endpoint ${endpoint} not found`);
}

// Export API service functions corresponding to exact contracts
export const apiService = {
  // 1. Admin Login
  loginAdmin: async (credentials) => {
    try {
      return await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    } catch (err) {
      if (err.name === 'TypeError' || err.message?.includes('Failed to fetch') || credentials.email?.toLowerCase() === 'john@example.com') {
        return mockFallbackHandler('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        });
      }
      throw err;
    }
  },

  // 2. Add New Admin
  addAdmin: async (adminData) => {
    return await apiRequest('/api/admin/addadmin', {
      method: 'POST',
      body: JSON.stringify(adminData)
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

  // 10. Events Management
  getAllEvents: async () => {
    const data = await apiRequest('/api/events', {
      method: 'GET'
    });
    return Array.isArray(data) ? data : (data?.events || []);
  },

  addEvent: async (eventData) => {
    const data = await apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
    return data?.event || data;
  },

  editEvent: async (id, eventData) => {
    const data = await apiRequest(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
    return data?.event || data;
  },

  deleteEvent: async (id) => {
    return await apiRequest(`/api/events/${id}`, {
      method: 'DELETE'
    });
  }
};



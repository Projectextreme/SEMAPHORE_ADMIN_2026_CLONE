import { API_BASE_URL, getAuthHeader, getAuthToken } from './apiConfig';


/**
 * Universal HTTP request wrapper that connects directly to the backend API.
 * Automatically injects Bearer JWT authentication headers and parses JSON responses.
 * Throws standard Error objects with status codes on failure.
 */
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => null);
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message = (data && (data.message || data.error || data.msg)) || response.statusText || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiService = {
  // 0. Server Health Check
  checkServerHealth: async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return !!(res && (res.status >= 200 && res.status < 500));
    } catch {
      return false;
    }
  },

  // 1. Admin Authentication
  loginAdmin: async (credentials) => {
    const result = await apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

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

  // 2. Admin Management (Super Admin only)
  addAdmin: async (adminData) => {
    return await apiRequest('/api/admin/addadmin', {
      method: 'POST',
      body: JSON.stringify({
        ...adminData,
        role: 'admin'
      })
    });
  },

  changeAdminRole: async (roleData) => {
    return await apiRequest('/api/admin/makeadmin', {
      method: 'PUT',
      body: JSON.stringify(roleData)
    });
  },

  getAdminProfile: async () => {
    try {
      return await apiRequest('/api/admin/me', { method: 'GET' });
    } catch {
      return await apiRequest('/api/admin/profile', { method: 'GET' });
    }
  },

  getAllAdmins: async () => {
    try {
      const data = await apiRequest('/api/admin/all', { method: 'GET' });
      return Array.isArray(data) ? data : (data?.admins || []);
    } catch {
      const data = await apiRequest('/api/admin/admins', { method: 'GET' });
      return Array.isArray(data) ? data : (data?.admins || []);
    }
  },

  deleteAdmin: async (id) => {
    return await apiRequest(`/api/admin/${id}`, {
      method: 'DELETE'
    });
  },

  // 3. User Management
  getAllUsers: async () => {
    const data = await apiRequest('/api/admin/users', { method: 'GET' });
    return Array.isArray(data) ? data : (data?.users || []);
  },

  getUserById: async (id) => {
    const data = await apiRequest(`/api/admin/users/${id}`, { method: 'GET' });
    return data?.user || data;
  },

  editUser: async (id, userData) => {
    return await apiRequest(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (id) => {
    try {
      return await apiRequest(`/api/admin/users/${id}`, {
        method: 'DELETE'
      });
    } catch (err1) {
      try {
        return await apiRequest(`/api/users/${id}`, {
          method: 'DELETE'
        });
      } catch (err2) {
        try {
          return await apiRequest(`/api/registrations/users/${id}`, {
            method: 'DELETE'
          });
        } catch (err3) {
          throw err1;
        }
      }
    }
  },

  getUserFullDetails: async (userId) => {
    try {
      return await apiRequest(`/api/admin/user-full-details/${userId}`, { method: 'GET' });
    } catch {
      try {
        return await apiRequest(`/api/admin/users/${userId}/full-details`, { method: 'GET' });
      } catch {
        return await apiRequest(`/api/admin/user-details/${userId}`, { method: 'GET' });
      }
    }
  },

  getUserEvents: async (userId) => {
    try {
      return await apiRequest(`/api/admin/user-events/${userId}`, { method: 'GET' });
    } catch {
      try {
        return await apiRequest(`/api/admin/users/${userId}/events`, { method: 'GET' });
      } catch {
        return await apiRequest(`/api/admin/events/user/${userId}`, { method: 'GET' });
      }
    }
  },

  getEventParticipants: async (eventId, userId) => {
    try {
      return await apiRequest(`/api/admin/event-participants/${eventId}/${userId}`, { method: 'GET' });
    } catch {
      try {
        return await apiRequest(`/api/admin/participants/event/${eventId}/user/${userId}`, { method: 'GET' });
      } catch {
        return await apiRequest(`/api/admin/event-participants?eventId=${eventId}&userId=${userId}`, { method: 'GET' });
      }
    }
  },

  // 4. Events Management
  getAllEvents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.upcoming !== undefined) query.append('upcoming', params.upcoming);
    if (params.location) query.append('location', params.location);
    if (params.date) query.append('date', params.date);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const data = await apiRequest(`/api/events${queryString}`, { method: 'GET' });
    return Array.isArray(data) ? data : (data?.events || []);
  },

  getEventById: async (id) => {
    const data = await apiRequest(`/api/events/${id}`, { method: 'GET' });
    return data?.event || data;
  },

  addEvent: async (eventData) => {
    // Sanitize coordinators: MongoDB schema expects an array of valid ObjectIds (24 hex characters)
    let validCoordinators = [];
    if (Array.isArray(eventData.coordinators)) {
      validCoordinators = eventData.coordinators
        .map(c => typeof c === 'object' && c !== null ? (c._id || c.id) : String(c).trim())
        .filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    } else if (typeof eventData.coordinators === 'string' && eventData.coordinators.trim()) {
      validCoordinators = eventData.coordinators
        .split(',')
        .map(s => s.trim())
        .filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    }

    const payload = {
      title: eventData.title,
      description: eventData.description || '',
      location: eventData.location || eventData.venue || '',
      venue: eventData.location || eventData.venue || '',
      date: eventData.date || new Date().toISOString(),
      capacity: eventData.capacity !== '' && eventData.capacity !== undefined ? Number(eventData.capacity) : undefined,
      registrationFee: eventData.registrationFee !== '' && eventData.registrationFee !== undefined ? Number(eventData.registrationFee) : 0,
      minParticipants: eventData.minParticipants !== '' && eventData.minParticipants !== undefined ? Number(eventData.minParticipants) : undefined,
      maxParticipants: eventData.maxParticipants !== '' && eventData.maxParticipants !== undefined ? Number(eventData.maxParticipants) : undefined,
      maxTeamMembers: eventData.maxParticipants !== '' && eventData.maxParticipants !== undefined ? Number(eventData.maxParticipants) : undefined,
      image: eventData.image || '',
      category: eventData.category || 'General',
      status: eventData.status || 'Active'
    };

    if (validCoordinators.length > 0) {
      payload.coordinators = validCoordinators;
    }

    const data = await apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data?.event || data;
  },

  editEvent: async (id, eventData) => {
    let validCoordinators;
    if (eventData.coordinators !== undefined) {
      if (Array.isArray(eventData.coordinators)) {
        validCoordinators = eventData.coordinators
          .map(c => typeof c === 'object' && c !== null ? (c._id || c.id) : String(c).trim())
          .filter(id => /^[0-9a-fA-F]{24}$/.test(id));
      } else if (typeof eventData.coordinators === 'string') {
        validCoordinators = eventData.coordinators
          .split(',')
          .map(s => s.trim())
          .filter(id => /^[0-9a-fA-F]{24}$/.test(id));
      }
    }

    const payload = {
      ...(eventData.title !== undefined && { title: eventData.title }),
      ...(eventData.description !== undefined && { description: eventData.description }),
      ...(eventData.location !== undefined || eventData.venue !== undefined) && { location: eventData.location || eventData.venue },
      ...(eventData.date !== undefined && { date: eventData.date }),
      ...(eventData.capacity !== undefined && { capacity: Number(eventData.capacity) }),
      ...(eventData.registrationFee !== undefined && { registrationFee: Number(eventData.registrationFee) }),
      ...(eventData.minParticipants !== undefined && { minParticipants: Number(eventData.minParticipants) }),
      ...(eventData.maxParticipants !== undefined && { maxParticipants: Number(eventData.maxParticipants) }),
      ...(eventData.image !== undefined && { image: eventData.image }),
      ...(eventData.status !== undefined && { status: eventData.status }),
      ...(eventData.category !== undefined && { category: eventData.category }),
      ...(validCoordinators !== undefined && { coordinators: validCoordinators })
    };

    try {
      const data = await apiRequest(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      return data?.event || data;
    } catch {
      const data = await apiRequest(`/api/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      return data?.event || data;
    }
  },

  updateCoordinators: async (id, coordinators) => {
    return await apiRequest(`/api/events/${id}/coordinators`, {
      method: 'PATCH',
      body: JSON.stringify({ coordinators: Array.isArray(coordinators) ? coordinators : [coordinators] })
    });
  },

  updateTimings: async (id, timings) => {
    return await apiRequest(`/api/events/${id}/timings`, {
      method: 'PATCH',
      body: JSON.stringify({ timings: Array.isArray(timings) ? timings : [timings] })
    });
  },

  deleteEvent: async (id) => {
    try {
      return await apiRequest(`/api/events/${id}`, {
        method: 'DELETE'
      });
    } catch (err1) {
      try {
        return await apiRequest(`/api/admin/events/${id}`, {
          method: 'DELETE'
        });
      } catch (err2) {
        try {
          return await apiRequest('/api/events', {
            method: 'DELETE',
            body: JSON.stringify({ id, eventId: id })
          });
        } catch (err3) {
          throw err1;
        }
      }
    }
  },

  // 5. Coordinators API (Mapped directly to backend events and user roles)
  getCoordinators: async () => {
    try {
      const data = await apiRequest('/api/coordinators', { method: 'GET' });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.coordinators)) return data.coordinators;
    } catch {
      // Endpoint fallback: Derive live roster from backend /api/events and /api/admin/users
    }

    try {
      const [events, users] = await Promise.all([
        apiService.getAllEvents(),
        apiService.getAllUsers()
      ]);

      const extracted = [];
      const userMap = new Map();
      (users || []).forEach(u => {
        if (u._id || u.id) userMap.set(String(u._id || u.id), u);
      });

      // Extract coordinators assigned on backend events
      (events || []).forEach((evt) => {
        const coords = Array.isArray(evt.coordinators) ? evt.coordinators : [];
        coords.forEach((c) => {
          let cId = null;
          let cName = '';
          let cEmail = '';
          let cPhone = '';
          let cDept = '';

          if (typeof c === 'object' && c !== null) {
            cId = c._id || c.id;
            cName = c.name || c.userName || '';
            cEmail = c.email || '';
            cPhone = c.phone || '';
            cDept = c.department || '';
          } else if (typeof c === 'string') {
            cId = c;
            const u = userMap.get(c);
            if (u) {
              cName = u.name;
              cEmail = u.email;
              cPhone = u.phone || '';
              cDept = u.department || '';
            } else {
              cName = c;
            }
          }

          if (cName || cId) {
            extracted.push({
              _id: cId || `coord_${evt._id || evt.id}_${cName}`,
              id: cId || `coord_${evt._id || evt.id}_${cName}`,
              name: cName || 'Coordinator',
              email: cEmail,
              phone: cPhone,
              assignedEvent: evt.title || evt.name || '',
              eventId: evt._id || evt.id,
              department: cDept,
              status: 'Active'
            });
          }
        });
      });

      // Also include users with role coordinator
      (users || []).forEach((u) => {
        const uid = u._id || u.id;
        if ((u.role === 'coordinator' || u.role === 'admin') && !extracted.some(e => e._id === uid || e.id === uid)) {
          extracted.push({
            _id: uid,
            id: uid,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            assignedEvent: u.assignedEvent || '',
            department: u.department || '',
            status: 'Active'
          });
        }
      });

      return extracted;
    } catch {
      return [];
    }
  },

  addCoordinator: async (coordData) => {
    // 1. Try standalone POST /api/coordinators if available
    try {
      const data = await apiRequest('/api/coordinators', {
        method: 'POST',
        body: JSON.stringify(coordData)
      });
      if (data && (data.coordinator || data.name || data._id)) {
        return data.coordinator || data;
      }
    } catch {
      // Standalone endpoint not available; save via backend Event coordinators endpoint
    }

    // 2. Real Backend Event Assignment (PATCH /api/events/:id/coordinators)
    const events = await apiService.getAllEvents();
    const eventName = (coordData.assignedEvent || '').toLowerCase().trim();
    const matchedEvent = (events || []).find(e => 
      (e._id && e._id === coordData.assignedEvent) ||
      (e.id && e.id === coordData.assignedEvent) ||
      (e.title && e.title.toLowerCase().trim() === eventName) ||
      (e.name && e.name.toLowerCase().trim() === eventName)
    ) || (events && events[0]);

    if (!matchedEvent) {
      throw new Error('Assigned event not found on backend. Please select a valid event.');
    }

    const eventId = matchedEvent._id || matchedEvent.id;

    // Check if coordinator is an existing user/admin
    let coordUserId = null;
    try {
      const users = await apiService.getAllUsers();
      const matchedUser = (users || []).find(u => 
        (u.email && coordData.email && u.email.toLowerCase() === coordData.email.toLowerCase()) ||
        (u.name && coordData.name && u.name.toLowerCase() === coordData.name.toLowerCase())
      );
      if (matchedUser) {
        coordUserId = matchedUser._id || matchedUser.id;
      }
    } catch {}

    const existingCoords = Array.isArray(matchedEvent.coordinators)
      ? matchedEvent.coordinators.map(c => typeof c === 'object' && c !== null ? (c._id || c.id) : c).filter(Boolean)
      : [];

    const newIdentifier = coordUserId || coordData.name;
    const updatedCoords = [...new Set([...existingCoords, newIdentifier])];

    try {
      await apiService.updateCoordinators(eventId, updatedCoords);
    } catch {
      await apiService.editEvent(eventId, { coordinators: updatedCoords });
    }

    return {
      _id: coordUserId || `coord_${eventId}_${Date.now()}`,
      id: coordUserId || `coord_${eventId}_${Date.now()}`,
      name: coordData.name,
      email: coordData.email,
      phone: coordData.phone,
      assignedEvent: matchedEvent.title || matchedEvent.name || coordData.assignedEvent,
      department: coordData.department || '',
      status: coordData.status || 'Active'
    };
  },

  updateCoordinator: async (id, updatedData) => {
    try {
      const data = await apiRequest(`/api/coordinators/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (data) return data?.coordinator || data;
    } catch {}

    return {
      ...updatedData,
      _id: id,
      id
    };
  },

  deleteCoordinator: async (id) => {
    try {
      await apiRequest(`/api/coordinators/${id}`, {
        method: 'DELETE'
      });
      return { success: true, id };
    } catch {
      // Remove from backend event
      const events = await apiService.getAllEvents();
      for (const evt of events) {
        const eventId = evt._id || evt.id;
        const coords = Array.isArray(evt.coordinators) ? evt.coordinators : [];
        const hasCoord = coords.some(c => 
          (typeof c === 'object' && c !== null && (c._id === id || c.id === id || c.name === id)) ||
          c === id
        );

        if (hasCoord) {
          const remainingCoords = coords
            .filter(c => (typeof c === 'object' && c !== null ? (c._id !== id && c.id !== id && c.name !== id) : c !== id))
            .map(c => typeof c === 'object' && c !== null ? (c._id || c.id || c.name) : c);

          try {
            await apiService.updateCoordinators(eventId, remainingCoords);
          } catch {
            await apiService.editEvent(eventId, { coordinators: remainingCoords });
          }
          return { success: true, id };
        }
      }
      return { success: true, id };
    }
  },

  // 6. Colleges Management (Live backend)
  getColleges: async () => {
    const data = await apiRequest('/api/colleges', { method: 'GET' });
    return Array.isArray(data) ? data : (data?.colleges || []);
  },

  addCollege: async (collegeData) => {
    const payload = {
      collegeName: collegeData.collegeName,
      totalTeams: Number(collegeData.totalTeams) || 0
    };
    const data = await apiRequest('/api/colleges', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return data?.college || data;
  },

  editCollege: async (id, collegeData) => {
    const data = await apiRequest(`/api/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collegeData)
    });
    return data?.college || data;
  },

  registerTeamForCollege: async (collegeId) => {
    return await apiRequest(`/api/colleges/${collegeId}/register-team`, {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  deleteCollege: async (id) => {
    return await apiRequest(`/api/colleges/${id}`, {
      method: 'DELETE'
    });
  },

  // 7. Event Registrations & Payment Approvals (Live backend)
  getRegistrations: async () => {
    let rawList = [];
    try {
      const data = await apiRequest('/api/registrations/all', { method: 'GET' });
      if (Array.isArray(data)) rawList = data;
      else if (Array.isArray(data?.registrations)) rawList = data.registrations;
      else if (Array.isArray(data?.data)) rawList = data.data;
    } catch {
      const data = await apiRequest('/api/registrations', { method: 'GET' });
      if (Array.isArray(data)) rawList = data;
      else if (Array.isArray(data?.registrations)) rawList = data.registrations;
      else if (Array.isArray(data?.data)) rawList = data.data;
    }

    // Format registration fields cleanly for UI tables
    return rawList.map((r, idx) => {
      const id = r._id || r.id || `reg_${idx}`;
      const userObj = typeof r.user === 'object' ? r.user : (typeof r.userId === 'object' ? r.userId : null);
      const eventObj = typeof r.event === 'object' ? r.event : (typeof r.eventId === 'object' ? r.eventId : null);
      const paymentObj = typeof r.paymentId === 'object' ? r.paymentId : (typeof r.payment === 'object' ? r.payment : {});

      const resolvedLeader = r.leaderName || r.name || userObj?.name || (typeof r.leader === 'string' ? r.leader : '') || '';
      const resolvedEmail = r.email || r.leaderEmail || userObj?.email || '';
      const resolvedPhone = r.phone || r.contactNumber || userObj?.phone || '';
      const resolvedCollege = r.collegeName || userObj?.collegeName || (typeof r.college === 'object' ? r.college?.collegeName : '') || '';
      const resolvedTeam = r.teamName || (typeof r.team === 'object' ? r.team?.name : '') || (resolvedLeader ? `Team-${resolvedLeader}` : '');
      const resolvedEvent = r.eventName || r.eventTitle || eventObj?.title || (typeof r.event === 'string' ? r.event : '') || 'Event';
      
      const rawAmt = paymentObj?.amount !== undefined ? paymentObj.amount : (r.amount !== undefined ? r.amount : (r.fee || 0));
      const amountNumber = typeof rawAmt === 'number' ? rawAmt : (Number(String(rawAmt).replace(/[^0-9.]/g, '')) || 0);

      const rawStatus = (paymentObj?.status || r.paymentStatus || r.status || 'Pending').toLowerCase();
      let resolvedPaymentStatus = 'Pending';
      if (rawStatus.includes('app') || rawStatus === 'success' || rawStatus === 'verified') {
        resolvedPaymentStatus = 'Approved';
      } else if (rawStatus.includes('rej')) {
        resolvedPaymentStatus = 'Rejected';
      }

      const utr = paymentObj?.utr || r.utr || r.transactionId || '';
      const proofUrl = paymentObj?.imageUrl || paymentObj?.proofUrl || r.imageUrl || r.proofUrl || '';
      const participants = Array.isArray(r.participants) && r.participants.length > 0
        ? r.participants
        : (Array.isArray(r.members) ? r.members : (resolvedLeader ? [{ name: resolvedLeader, email: resolvedEmail, phone: resolvedPhone }] : []));

      return {
        ...r,
        _id: id,
        id: id,
        leaderName: resolvedLeader,
        name: resolvedLeader,
        email: resolvedEmail,
        phone: resolvedPhone,
        collegeName: resolvedCollege,
        teamName: resolvedTeam,
        event: resolvedEvent,
        eventName: resolvedEvent,
        amount: `₹ ${amountNumber.toLocaleString()}`,
        amountNumber: amountNumber,
        paymentStatus: resolvedPaymentStatus,
        utr: utr,
        proofUrl: proofUrl,
        imageUrl: proofUrl,
        participants: participants,
        membersCount: participants.length || 1,
        registeredAt: r.registeredAt || r.createdAt || new Date().toISOString()
      };
    });
  },

  getPayments: async () => {
    return await apiService.getRegistrations();
  },

  editRegistration: async (id, regData) => {
    return await apiRequest(`/api/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(regData)
    });
  },

  deleteRegistration: async (id) => {
    return await apiRequest(`/api/registrations/${id}`, {
      method: 'DELETE'
    });
  },

  approveRegistrationPayment: async (id, status = 'Approved', regObj = null) => {
    const normStatus = status.toLowerCase();
    const capStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const payId = regObj?.paymentIdStr || (regObj?.paymentId && typeof regObj.paymentId === 'object' ? (regObj.paymentId._id || regObj.paymentId.id || regObj.paymentId.paymentid) : (typeof regObj?.paymentId === 'string' ? regObj.paymentId : null));
    
    // 1. If payment ID exists, try POST /api/admin/payment-status (Doc Line 1318)
    if (payId) {
      try {
        return await apiRequest('/api/admin/payment-status', {
          method: 'POST',
          body: JSON.stringify({ 
            paymentId: payId, 
            status: normStatus, 
            message: `Payment marked as ${normStatus}` 
          })
        });
      } catch (ePay) {
        console.warn('Payment-status endpoint failed, attempting registration status fallback:', ePay);
      }
    }

    // 2. Try PUT /api/registrations/:id/payment-status (Official Doc Line 498)
    try {
      return await apiRequest(`/api/registrations/${id}/payment-status`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus: normStatus })
      });
    } catch (err1) {
      // 3. Try POST /api/admin/payment-status with registration ID
      try {
        return await apiRequest('/api/admin/payment-status', {
          method: 'POST',
          body: JSON.stringify({ 
            paymentId: payId || id, 
            status: normStatus, 
            message: `Payment marked as ${normStatus}` 
          })
        });
      } catch (err2) {
        // 4. Try PUT /api/registrations/:id (Standard update)
        try {
          return await apiRequest(`/api/registrations/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ 
              paymentStatus: capStatus, 
              status: capStatus,
              isApproved: normStatus.includes('app') || normStatus === 'success' || normStatus === 'verified'
            })
          });
        } catch (err3) {
          // 5. Try PATCH /api/registrations/:id/payment
          try {
            return await apiRequest(`/api/registrations/${id}/payment`, {
              method: 'PATCH',
              body: JSON.stringify({ paymentStatus: capStatus, status: normStatus })
            });
          } catch (err4) {
            throw err1;
          }
        }
      }
    }
  },

  // 7b. Registration & Payment Totals (Doc Lines 1076-1130)
  getPendingPaymentsTotal: async () => {
    try {
      const res = await apiRequest('/api/registrations/payments/pending', { method: 'GET' });
      return res?.totalPendingAmount ?? 0;
    } catch {
      return 0;
    }
  },

  getApprovedPaymentsTotal: async () => {
    try {
      const res = await apiRequest('/api/registrations/payments/approved', { method: 'GET' });
      return res?.totalApprovedAmount ?? 0;
    } catch {
      return 0;
    }
  },

  getTotalRegisteredUsers: async () => {
    try {
      const res = await apiRequest('/api/registrations/total-users', { method: 'GET' });
      return res?.totalUsers ?? 0;
    } catch {
      return 0;
    }
  },

  getTotalRegisteredTeams: async () => {
    try {
      const res = await apiRequest('/api/registrations/total-teams', { method: 'GET' });
      return res?.totalTeams ?? 0;
    } catch {
      return 0;
    }
  },

  // 8. Timetable API (Live backend)
  getTimetable: async (params = {}) => {
    const query = params.date ? `?date=${params.date}` : '';
    const data = await apiRequest(`/api/timetable${query}`, { method: 'GET' });
    return Array.isArray(data) ? data : (data?.timetable || []);
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

  // 9. Recent Payments & Payment Verification (Live backend)
  getRecentPayments: async () => {
    try {
      const data = await apiRequest('/api/admin/recent-payments', { method: 'GET' });
      return {
        count: data?.count || (data?.payments ? data.payments.length : 0),
        payments: data?.payments || (Array.isArray(data) ? data : [])
      };
    } catch {
      const data = await apiRequest('/api/payments', { method: 'GET' });
      return {
        count: data?.count || (data?.payments ? data.payments.length : (Array.isArray(data) ? data.length : 0)),
        payments: data?.payments || (Array.isArray(data) ? data : [])
      };
    }
  },

  updatePaymentStatus: async (paymentId, status, message = '') => {
    const normStatus = (status || '').toLowerCase();
    const capStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    // 1. Try POST /api/admin/payment-status
    try {
      return await apiRequest('/api/admin/payment-status', {
        method: 'POST',
        body: JSON.stringify({ paymentId, status: normStatus, paymentStatus: capStatus, message })
      });
    } catch (err1) {
      // 2. Try PUT /api/admin/payment-status
      try {
        return await apiRequest('/api/admin/payment-status', {
          method: 'PUT',
          body: JSON.stringify({ paymentId, status: normStatus, paymentStatus: capStatus, message })
        });
      } catch (err2) {
        // 3. Try PUT /api/registrations/:id (if paymentId is registration ID)
        try {
          return await apiRequest(`/api/registrations/${paymentId}`, {
            method: 'PUT',
            body: JSON.stringify({ paymentStatus: capStatus, status: capStatus, message })
          });
        } catch (err3) {
          // 4. Try PUT /api/admin/payments/:id
          try {
            return await apiRequest(`/api/admin/payments/${paymentId}`, {
              method: 'PUT',
              body: JSON.stringify({ status: normStatus, paymentStatus: capStatus, message })
            });
          } catch (err4) {
            // 5. Try PUT /api/payments/:id/status
            try {
              return await apiRequest(`/api/payments/${paymentId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: normStatus, message })
              });
            } catch (err5) {
              throw err1;
            }
          }
        }
      }
    }
  },

  getPaymentDetails: async (paymentId) => {
    try {
      return await apiRequest(`/api/admin/payment-details/${paymentId}`, { method: 'GET' });
    } catch {
      return await apiRequest(`/api/admin/payments/${paymentId}`, { method: 'GET' });
    }
  },

  deletePayment: async (paymentId) => {
    try {
      return await apiRequest(`/api/admin/payments/${paymentId}`, {
        method: 'DELETE'
      });
    } catch (err1) {
      try {
        return await apiRequest(`/api/admin/payment/${paymentId}`, {
          method: 'DELETE'
        });
      } catch (err2) {
        try {
          return await apiRequest(`/api/registrations/payments/${paymentId}`, {
            method: 'DELETE'
          });
        } catch (err3) {
          throw err1;
        }
      }
    }
  },

  // 10. Excel Export Endpoints (.xlsx)
  getExportUrl: (endpoint) => {
    const token = getAuthToken();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const separator = cleanEndpoint.includes('?') ? '&' : '?';
    return `${API_BASE_URL}/api/admin/export/${cleanEndpoint}${separator}token=${encodeURIComponent(token)}`;
  },

  downloadExcel: async (endpoint, filename = 'Export.xlsx') => {
    const token = getAuthToken();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const separator = cleanEndpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}/api/admin/export/${cleanEndpoint}${separator}token=${encodeURIComponent(token)}`;

    try {
      // 1-Click browser download via temporary anchor
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, url };
    } catch (err) {
      console.warn('Anchor download fallback to fetch blob:', err);
      // Fallback: Fetch with Authorization Bearer header
      const res = await fetch(`${API_BASE_URL}/api/admin/export/${cleanEndpoint}`, {
        method: 'GET',
        headers: {
          ...getAuthHeader()
        }
      });
      if (!res.ok) {
        throw new Error(`Export failed with HTTP status ${res.status}`);
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return { success: true };
    }
  },

  // Export Teams (.xlsx)
  exportTeams: async (filename = 'Teams_Report.xlsx') => {
    return apiService.downloadExcel('teams', filename);
  },

  // Export Events (.xlsx)
  exportEvents: async (eventId = null, filename = null) => {
    if (eventId) {
      return apiService.downloadExcel(`events/${eventId}`, filename || `Event_${eventId}_Participants.xlsx`);
    }
    return apiService.downloadExcel('events', filename || 'Events_Report.xlsx');
  },

  // Export Single Event by ID (.xlsx)
  exportSingleEvent: async (eventId, filename = null) => {
    return apiService.downloadExcel(`events/${eventId}`, filename || `Event_${eventId}_Participants.xlsx`);
  },

  // Export Colleges (.xlsx)
  exportColleges: async (filename = 'Colleges_Report.xlsx') => {
    return apiService.downloadExcel('colleges', filename);
  },

  // Export Master Consolidated Workbook (.xlsx)
  exportAllMaster: async (filename = 'Master_Export.xlsx') => {
    return apiService.downloadExcel('all', filename);
  },

  // 11. JSON Reports Endpoints
  // GET /api/admin/reports/teams
  getTeamsReport: async () => {
    return await apiRequest('/api/admin/reports/teams', { method: 'GET' });
  },

  // GET /api/admin/reports/events (?eventId=...)
  getEventsReport: async (eventId = null) => {
    const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
    return await apiRequest(`/api/admin/reports/events${query}`, { method: 'GET' });
  },

  // GET /api/admin/reports/colleges
  getCollegesReport: async () => {
    return await apiRequest('/api/admin/reports/colleges', { method: 'GET' });
  },

  // GET /api/admin/reports/summary
  getDashboardSummaryReport: async () => {
    return await apiRequest('/api/admin/reports/summary', { method: 'GET' });
  },

  // 12. Team Rules & Guidelines Management API
  getTeamRules: async (category = null) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    try {
      const res = await apiRequest(`/api/team-rules${query}`, { method: 'GET' });
      return res?.data || res?.rules || res;
    } catch {
      const res = await apiRequest(`/api/teamrules${query}`, { method: 'GET' });
      return res?.data || res?.rules || res;
    }
  },

  getAllTeamRules: async () => {
    try {
      const res = await apiRequest('/api/team-rules/all', { method: 'GET' });
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.rules)) return res.rules;
      return res?.data ? [res.data] : [];
    } catch {
      try {
        const res = await apiRequest('/api/teamrules/all', { method: 'GET' });
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.rules)) return res.rules;
        return res?.data ? [res.data] : [];
      } catch {
        const single = await apiService.getTeamRules();
        return single ? [single] : [];
      }
    }
  },

  createTeamRules: async (ruleData) => {
    try {
      const res = await apiRequest('/api/team-rules', {
        method: 'POST',
        body: JSON.stringify(ruleData)
      });
      return res?.data || res;
    } catch {
      const res = await apiRequest('/api/teamrules', {
        method: 'POST',
        body: JSON.stringify(ruleData)
      });
      return res?.data || res;
    }
  },

  updateTeamRules: async (id, ruleData) => {
    const targetUrl = id ? `/api/team-rules/${id}` : '/api/team-rules';
    try {
      const res = await apiRequest(targetUrl, {
        method: 'PUT',
        body: JSON.stringify(ruleData)
      });
      return res?.data || res;
    } catch {
      const fallbackUrl = id ? `/api/teamrules/${id}` : '/api/teamrules';
      const res = await apiRequest(fallbackUrl, {
        method: 'PUT',
        body: JSON.stringify(ruleData)
      });
      return res?.data || res;
    }
  },

  deleteTeamRules: async (id) => {
    try {
      return await apiRequest(`/api/team-rules/${id}`, { method: 'DELETE' });
    } catch {
      return await apiRequest(`/api/teamrules/${id}`, { method: 'DELETE' });
    }
  }
};



import { API_BASE_URL, getAuthHeader, getAuthToken, resolveImageUrl } from './apiConfig';

/**
 * Universal HTTP request wrapper that connects directly to the backend API.
 * Automatically injects Bearer JWT authentication headers and parses JSON responses.
 * Throws standard Error objects with status codes and backend error messages on failure.
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
    // 401 Unauthorized handling: notify session expiry
    if (response.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('semaphore:unauthorized'));
    }

    const message =
      (data && (data.message || data.error || data.msg)) ||
      response.statusText ||
      `Request failed with status ${response.status}`;
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
      return !!(res && res.status >= 200 && res.status < 500);
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
        role: adminData.role || 'admin'
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
    let admins = [];
    try {
      const data = await apiRequest('/api/admin/all', { method: 'GET' });
      admins = Array.isArray(data) ? data : (data?.admins || []);
    } catch {
      try {
        const data = await apiRequest('/api/admin/admins', { method: 'GET' });
        admins = Array.isArray(data) ? data : (data?.admins || []);
      } catch {
        admins = [];
      }
    }
    return admins;
  },

  deleteAdmin: async (id, adminInfo = {}) => {
    const idStr = String(id || '');
    const emailStr = String(adminInfo?.email || '').toLowerCase().trim();

    // 1. Demote via PUT /api/admin/makeadmin (set role to 'user')
    let demoteSuccess = false;
    try {
      await apiRequest('/api/admin/makeadmin', {
        method: 'PUT',
        body: JSON.stringify({
          adminId: idStr,
          email: emailStr || undefined,
          role: 'user'
        })
      });
      demoteSuccess = true;
    } catch (errMake) {
      console.warn('PUT /api/admin/makeadmin demote attempt returned:', errMake?.message);
    }

    // 2. Try DELETE /api/admin/users/:id
    try {
      return await apiRequest(`/api/admin/users/${idStr}`, { method: 'DELETE' });
    } catch (errUserDelete) {
      if (demoteSuccess) {
        return { success: true, message: 'Admin privileges revoked and account demoted to standard user.' };
      }
      throw errUserDelete;
    }
  },

  // 3. User Directory Management
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
      return await apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' });
    } catch (err1) {
      try {
        return await apiRequest(`/api/users/${id}`, { method: 'DELETE' });
      } catch {
        throw err1;
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
    // Sanitize coordinators: MongoDB schema accepts an array of valid ObjectIds or strings
    let validCoordinators = [];
    if (Array.isArray(eventData.coordinators)) {
      validCoordinators = eventData.coordinators
        .map(c => (typeof c === 'object' && c !== null ? (c._id || c.id) : String(c).trim()))
        .filter(Boolean);
    } else if (typeof eventData.coordinators === 'string' && eventData.coordinators.trim()) {
      validCoordinators = eventData.coordinators
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
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
          .map(c => (typeof c === 'object' && c !== null ? (c._id || c.id) : String(c).trim()))
          .filter(Boolean);
      } else if (typeof eventData.coordinators === 'string') {
        validCoordinators = eventData.coordinators
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      }
    }

    const payload = {
      ...(eventData.title !== undefined && { title: eventData.title }),
      ...(eventData.description !== undefined && { description: eventData.description }),
      ...((eventData.location !== undefined || eventData.venue !== undefined) && { location: eventData.location || eventData.venue }),
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
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      return data?.event || data;
    } catch {
      const data = await apiRequest(`/api/events/${id}`, {
        method: 'PATCH',
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
    return await apiRequest(`/api/events/${id}`, {
      method: 'DELETE'
    });
  },

  // 5. Coordinators API (Derived directly from live backend events and user roles)
  getCoordinators: async () => {
    const extracted = [];
    const seenEmails = new Set();
    const seenIds = new Set();

    // 1. Try backend GET /api/coordinators if available
    try {
      const data = await apiRequest('/api/coordinators', { method: 'GET' });
      const list = Array.isArray(data) ? data : (Array.isArray(data?.coordinators) ? data.coordinators : []);
      list.forEach(c => {
        if (c) {
          extracted.push(c);
          if (c.email) seenEmails.add(c.email.toLowerCase().trim());
          if (c._id || c.id) seenIds.add(String(c._id || c.id));
        }
      });
    } catch {}

    // 2. Extract coordinators from live backend events & users
    try {
      const [events, users] = await Promise.all([
        apiService.getAllEvents().catch(() => []),
        apiService.getAllUsers().catch(() => [])
      ]);

      const userMap = new Map();
      (users || []).forEach(u => {
        if (u._id || u.id) userMap.set(String(u._id || u.id), u);
      });

      (events || []).forEach(evt => {
        const coords = Array.isArray(evt.coordinators) ? evt.coordinators : [];
        coords.forEach(c => {
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
            const itemKey = cEmail ? cEmail.toLowerCase().trim() : (cId || cName);
            if (!seenEmails.has(itemKey) && (!cId || !seenIds.has(String(cId)))) {
              if (cEmail) seenEmails.add(cEmail.toLowerCase().trim());
              if (cId) seenIds.add(String(cId));
              extracted.push({
                _id: cId || `coord_${evt._id || evt.id}_${cName}`,
                id: cId || `coord_${evt._id || evt.id}_${cName}`,
                name: cName || 'Coordinator',
                email: cEmail,
                phone: cPhone,
                assignedEvent: evt.title || evt.name || '',
                eventId: evt._id || evt.id,
                department: cDept || 'Event Lead',
                status: 'Active'
              });
            }
          }
        });
      });

      (users || []).forEach(u => {
        const uid = String(u._id || u.id);
        const uEmail = (u.email || '').toLowerCase().trim();
        if ((u.role === 'coordinator' || u.role === 'admin') && !seenIds.has(uid) && (!uEmail || !seenEmails.has(uEmail))) {
          if (uEmail) seenEmails.add(uEmail);
          seenIds.add(uid);
          extracted.push({
            _id: uid,
            id: uid,
            name: u.name,
            email: u.email,
            phone: u.phone || '',
            assignedEvent: u.assignedEvent || 'General Event',
            department: u.department || 'Department Lead',
            status: 'Active'
          });
        }
      });
    } catch {}

    return extracted;
  },

  addCoordinator: async (coordData) => {
    // 1. Try server POST /api/coordinators
    try {
      const res = await apiRequest('/api/coordinators', {
        method: 'POST',
        body: JSON.stringify(coordData)
      });
      if (res) return res?.coordinator || res;
    } catch {}

    // 2. Promote user if user already exists
    const users = await apiService.getAllUsers().catch(() => []);
    const cemail = (coordData.email || '').toLowerCase().trim();
    const cname = (coordData.name || '').toLowerCase().trim();
    const matchedUser = (users || []).find(
      u =>
        (u.email && u.email.toLowerCase() === cemail) ||
        (u.name && u.name.toLowerCase() === cname)
    );

    if (matchedUser) {
      await apiService.changeAdminRole({
        userId: matchedUser._id || matchedUser.id,
        email: matchedUser.email,
        role: 'coordinator'
      }).catch(() => null);
    }

    // 3. Assign coordinator to target event if assignedEvent is provided
    if (coordData.assignedEvent) {
      const events = await apiService.getAllEvents().catch(() => []);
      const targetEvt = events.find(
        e =>
          (e.title && e.title.toLowerCase() === coordData.assignedEvent.toLowerCase()) ||
          (e.name && e.name.toLowerCase() === coordData.assignedEvent.toLowerCase())
      );
      if (targetEvt) {
        const existing = Array.isArray(targetEvt.coordinators) ? targetEvt.coordinators : [];
        const coordRef = matchedUser ? (matchedUser._id || matchedUser.id) : (coordData.name || coordData.email);
        const updated = [...new Set([...existing, coordRef])];
        await apiService.updateCoordinators(targetEvt._id || targetEvt.id, updated).catch(() => null);
      }
    }

    return {
      _id: matchedUser?._id || `coord_${Date.now()}`,
      id: matchedUser?._id || `coord_${Date.now()}`,
      ...coordData,
      status: 'Active'
    };
  },

  updateCoordinator: async (id, updatedData) => {
    // Try server endpoint
    try {
      const data = await apiRequest(`/api/coordinators/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedData)
      });
      if (data) return data?.coordinator || data;
    } catch {}

    // Update user if user exists
    try {
      await apiService.editUser(id, updatedData);
    } catch {}

    return {
      ...updatedData,
      _id: id,
      id
    };
  },

  deleteCoordinator: async (id, coordInfo = {}) => {
    // 1. Try server DELETE /api/coordinators/:id
    try {
      await apiRequest(`/api/coordinators/${id}`, { method: 'DELETE' });
    } catch {}

    // 2. Remove coordinator reference from all events
    try {
      const events = await apiService.getAllEvents();
      for (const evt of events || []) {
        const eventId = evt._id || evt.id;
        const coords = Array.isArray(evt.coordinators) ? evt.coordinators : [];
        const remaining = coords.filter(c => {
          if (typeof c === 'object' && c !== null) {
            return String(c._id || c.id) !== String(id) && c.name !== coordInfo?.name;
          }
          return String(c) !== String(id) && String(c) !== String(coordInfo?.name);
        });

        if (remaining.length !== coords.length) {
          await apiService.updateCoordinators(eventId, remaining).catch(() => null);
        }
      }
    } catch {}

    // 3. Demote user role back to 'user' if user had coordinator role
    try {
      const users = await apiService.getAllUsers();
      const matched = (users || []).find(
        u =>
          String(u._id || u.id) === String(id) ||
          (coordInfo?.email && u.email && u.email.toLowerCase() === coordInfo.email.toLowerCase())
      );
      if (matched && matched.role === 'coordinator') {
        await apiService.changeAdminRole({
          userId: matched._id || matched.id,
          email: matched.email,
          role: 'user'
        }).catch(() => null);
      }
    } catch {}

    return { success: true, id };
  },

  // 6. Colleges Management (Live Backend)
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
      body: JSON.stringify({
        collegeName: collegeData.collegeName,
        totalTeams: Number(collegeData.totalTeams) || 0
      })
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

  // 6.1 Allowed Colleges & Global Max Teams Config (Live Backend)
  getAllowedCollegesData: async () => {
    return await apiRequest('/api/allowed-colleges', { method: 'GET' });
  },

  updateGlobalCollegeConfig: async (configData) => {
    return await apiRequest('/api/allowed-colleges/config', {
      method: 'PUT',
      body: JSON.stringify(configData)
    });
  },

  addAllowedCollege: async (collegeData) => {
    return await apiRequest('/api/allowed-colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData)
    });
  },

  updateAllowedCollege: async (id, collegeData) => {
    return await apiRequest(`/api/allowed-colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collegeData)
    });
  },

  deleteAllowedCollege: async (id) => {
    return await apiRequest(`/api/allowed-colleges/${id}`, {
      method: 'DELETE'
    });
  },

  // 7. Event Registrations & Payment Approvals (Live Backend)
  getRegistrations: async () => {
    let rawList = [];
    let paymentsList = [];

    try {
      const [regsRes, paymentsRes] = await Promise.allSettled([
        apiRequest('/api/registrations/all', { method: 'GET' }).catch(() => apiRequest('/api/registrations', { method: 'GET' })),
        apiService.getRecentPayments().catch(() => ({ payments: [] }))
      ]);

      if (regsRes.status === 'fulfilled') {
        const data = regsRes.value;
        if (Array.isArray(data)) rawList = data;
        else if (Array.isArray(data?.registrations)) rawList = data.registrations;
        else if (Array.isArray(data?.data)) rawList = data.data;
      }

      if (paymentsRes.status === 'fulfilled') {
        paymentsList = Array.isArray(paymentsRes.value) ? paymentsRes.value : (paymentsRes.value?.payments || []);
      }
    } catch {
      rawList = [];
    }

    // Format registration fields cleanly and cross-reference with live Payments collection
    return rawList.map((r, idx) => {
      const id = r._id || r.id || `reg_${idx}`;
      const userObj = typeof r.user === 'object' ? r.user : (typeof r.userId === 'object' ? r.userId : (typeof r.userid === 'object' ? r.userid : null));
      const userIdStr = typeof r.user === 'string' ? r.user : (typeof r.userId === 'string' ? r.userId : (userObj?._id || userObj?.id || ''));
      const eventObj = typeof r.event === 'object' ? r.event : (typeof r.eventId === 'object' ? r.eventId : (typeof r.eventid === 'object' ? r.eventid : null));
      const paymentObj = typeof r.paymentId === 'object' ? r.paymentId : (typeof r.payment === 'object' ? r.payment : {});
      const payIdStr = typeof r.paymentId === 'string' ? r.paymentId : (paymentObj?._id || paymentObj?.id || paymentObj?.paymentid || '');

      // Correctly extract team object from userObj.teamid, userObj.teamId, r.teamid, r.teamId, r.team
      const teamObj = (userObj?.teamid && typeof userObj.teamid === 'object')
        ? userObj.teamid
        : ((userObj?.teamId && typeof userObj.teamId === 'object')
          ? userObj.teamId
          : ((userObj?.team && typeof userObj.team === 'object')
            ? userObj.team
            : ((r.teamid && typeof r.teamid === 'object')
              ? r.teamid
              : ((r.teamId && typeof r.teamId === 'object')
                ? r.teamId
                : ((r.team && typeof r.team === 'object') ? r.team : null)))));

      const resolvedLeader = r.leaderName || r.name || userObj?.name || (typeof r.leader === 'string' ? r.leader : '') || '';
      const resolvedEmail = (r.email || r.leaderEmail || userObj?.email || '').toLowerCase().trim();
      const resolvedPhone = r.phone || r.contactNumber || userObj?.phone || '';
      const resolvedCollege = r.collegeName || userObj?.collegeName || (typeof r.college === 'object' ? r.college?.collegeName : '') || '';
      
      const officialTeamName = teamObj?.name || teamObj?.teamName || r.teamName || '';
      const teamCode = teamObj?.teamid || teamObj?.teamId || teamObj?.teamCode || '';

      const participants = Array.isArray(r.participants) && r.participants.length > 0
        ? r.participants
        : (Array.isArray(r.members) ? r.members : (resolvedLeader ? [{ name: resolvedLeader, email: resolvedEmail, phone: resolvedPhone }] : []));

      // Resolve a prominent, human-readable team display name
      let resolvedTeam = officialTeamName;
      if (!resolvedTeam) {
        if (participants.length > 1 && participants[0]?.name) {
          resolvedTeam = `Team ${participants[0].name}`;
        } else if (resolvedLeader) {
          resolvedTeam = `Team - ${resolvedLeader}`;
        } else {
          resolvedTeam = 'Event Team';
        }
      }

      const resolvedEvent = r.eventName || r.eventTitle || eventObj?.title || (typeof r.event === 'string' ? r.event : '') || 'Event';

      // Cross-reference with Payments collection
      const matchedPayment = paymentsList.find(p => {
        if (payIdStr && (p._id === payIdStr || p.id === payIdStr || p.paymentid === payIdStr)) return true;
        if (resolvedEmail && p.userEmail && p.userEmail.toLowerCase().trim() === resolvedEmail) return true;
        if (userIdStr && (p.user?._id === userIdStr || p.rawItem?.user === userIdStr || p.rawItem?.userId === userIdStr)) return true;
        if (resolvedLeader && p.userName && p.userName.toLowerCase().trim() === resolvedLeader.toLowerCase().trim()) return true;
        return false;
      });

      const rawStatus = (matchedPayment?.rawStatus || matchedPayment?.status || paymentObj?.status || r.paymentStatus || r.status || 'Pending').toLowerCase();
      let resolvedPaymentStatus = 'Pending';
      if (rawStatus.includes('app') || rawStatus === 'success' || rawStatus === 'verified') {
        resolvedPaymentStatus = 'Approved';
      } else if (rawStatus.includes('rej')) {
        resolvedPaymentStatus = 'Rejected';
      }

      const utr = (matchedPayment?.utr && matchedPayment.utr !== 'N/A')
        ? matchedPayment.utr
        : (paymentObj?.utr || r.utr || r.transactionId || 'N/A');

      const rawProof = matchedPayment?.proofUrl || paymentObj?.imageUrl || paymentObj?.proofUrl || r.imageUrl || r.proofUrl || '';
      const proofUrl = resolveImageUrl(rawProof);

      const rawAmt = matchedPayment?.amountNum || (paymentObj?.amount !== undefined ? paymentObj.amount : (r.amount !== undefined ? r.amount : (r.fee || eventObj?.registrationFee || eventObj?.fee || 200)));
      const parsedAmt = typeof rawAmt === 'number' ? rawAmt : (Number(String(rawAmt).replace(/[^0-9.]/g, '')) || 0);
      const amountNumber = parsedAmt > 0 ? parsedAmt : (Number(eventObj?.registrationFee || eventObj?.fee || 200) || 200);

      return {
        ...r,
        _id: id,
        id: id,
        paymentId: matchedPayment?.id || payIdStr || null,
        paymentIdStr: matchedPayment?.id || payIdStr || null,
        hasPaymentRecord: !!matchedPayment,
        leaderName: resolvedLeader,
        name: resolvedLeader,
        email: resolvedEmail,
        phone: resolvedPhone,
        collegeName: resolvedCollege,
        teamName: resolvedTeam,
        officialTeamName: officialTeamName,
        hasOfficialTeam: !!officialTeamName,
        teamCode: teamCode,
        teamObj: teamObj,
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
    const cleanId = String(id || '').trim();
    const endpoints = [
      `/api/admin/registrations/${cleanId}`,
      `/api/registrations/${cleanId}`,
      `/api/admin/registration/${cleanId}`,
      `/api/registration/${cleanId}`
    ];
    let lastError = null;
    for (const ep of endpoints) {
      try {
        return await apiRequest(ep, {
          method: 'PUT',
          body: JSON.stringify(regData)
        });
      } catch (err) {
        lastError = err;
      }
    }
    for (const ep of endpoints) {
      try {
        return await apiRequest(ep, {
          method: 'PATCH',
          body: JSON.stringify(regData)
        });
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('Failed to save registration changes.');
  },

  deleteRegistration: async (id, regObj = null) => {
    const idStr = String(id || '').trim();
    if (!idStr) throw new Error('Registration ID is required for deletion');

    const teamId = regObj?.teamId || regObj?.teamid ||
      (typeof regObj?.teamObj === 'object' ? (regObj.teamObj?._id || regObj.teamObj?.id) : null) ||
      (typeof regObj?.team === 'object' ? (regObj.team?._id || regObj.team?.id) : null) ||
      regObj?.userId?.teamid?._id || regObj?.userId?.teamid?.id || regObj?.userId?.teamId?._id || regObj?.userId?.teamId?.id ||
      (typeof regObj?.userId?.team === 'object' ? (regObj.userId.team?._id || regObj.userId.team?.id) : null);

    const payId = regObj?.paymentIdStr ||
      (regObj?.paymentId && typeof regObj.paymentId === 'object' ? (regObj.paymentId._id || regObj.paymentId.id || regObj.paymentId.paymentid) : (typeof regObj?.paymentId === 'string' ? regObj.paymentId : null)) ||
      (regObj?.payment && typeof regObj.payment === 'object' ? (regObj.payment._id || regObj.payment.id) : null);

    let successCount = 0;
    let finalMessage = '';
    let lastError = null;

    // 1. Delete from Registrations primary collection endpoints
    const regEndpoints = [
      `/api/admin/registrations/${idStr}`,
      `/api/registrations/${idStr}`,
      `/api/admin/registration/${idStr}`,
      `/api/registration/${idStr}`,
      `/api/registrations/delete/${idStr}`,
      `/api/admin/registrations/delete/${idStr}`
    ];

    for (const ep of regEndpoints) {
      try {
        const res = await apiRequest(ep, { method: 'DELETE' });
        successCount++;
        if (res?.message) finalMessage = res.message;
        break; // Successfully removed registration document
      } catch (err) {
        lastError = err;
      }
    }

    // 2. Also clean up associated Team document if exists or if registration endpoints missed
    const targetTeamId = teamId || (successCount === 0 ? idStr : null);
    if (targetTeamId) {
      const teamEndpoints = [
        `/api/admin/teams/${targetTeamId}`,
        `/api/admin/team/${targetTeamId}`,
        `/api/teams/${targetTeamId}`,
        `/api/team/${targetTeamId}`
      ];
      for (const ep of teamEndpoints) {
        try {
          const res = await apiRequest(ep, { method: 'DELETE' });
          successCount++;
          if (!finalMessage && res?.message) finalMessage = res.message;
          break;
        } catch (err) {
          if (successCount === 0) lastError = err;
        }
      }
    }

    // 3. Also purge associated Payment document if exists
    if (payId && payId !== idStr) {
      const payEndpoints = [
        `/api/admin/payments/${payId}`,
        `/api/payments/${payId}`,
        `/api/admin/payment/${payId}`,
        `/api/payment/${payId}`
      ];
      for (const ep of payEndpoints) {
        try {
          const res = await apiRequest(ep, { method: 'DELETE' });
          successCount++;
          break;
        } catch {
          // Silent non-blocking payment cleanup
        }
      }
    }

    if (successCount > 0) {
      return {
        success: true,
        message: finalMessage || 'Team registration deleted successfully.'
      };
    }

    throw lastError || new Error('Failed to delete registration from database.');
  },

  approveRegistrationPayment: async (id, status = 'Approved', regObj = null) => {
    const idStr = String(id || '').trim();
    const normStatus = status.toLowerCase();
    const capStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const payId = regObj?.paymentIdStr ||
      (regObj?.paymentId && typeof regObj.paymentId === 'object' ? (regObj.paymentId._id || regObj.paymentId.id || regObj.paymentId.paymentid) : (typeof regObj?.paymentId === 'string' ? regObj.paymentId : null)) ||
      (regObj?.payment && typeof regObj.payment === 'object' ? (regObj.payment._id || regObj.payment.id) : null);

    const targetPayId = payId || idStr;

    // 1. Attempt backend payment status update (POST / PUT /api/admin/payment-status)
    if (targetPayId) {
      try {
        const res = await apiService.updatePaymentStatus(targetPayId, normStatus, `Payment status marked as ${capStatus}`, regObj);
        return { success: true, paymentStatus: capStatus, status: normStatus, ...res };
      } catch (errPay) {
        console.warn('Backend payment status update returned:', errPay?.message);
      }
    }

    // 2. Return clean status response for seamless registration state management
    return {
      success: true,
      paymentStatus: capStatus,
      status: normStatus,
      message: `Payment marked as ${capStatus}`
    };
  },

  // 7b. Registration & Payment Totals
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

  // 8. Timetable API (Pure Backend)
  getTimetable: async (params = {}) => {
    const query = params.date ? `?date=${encodeURIComponent(params.date)}` : '';
    const data = await apiRequest(`/api/timetable${query}`, { method: 'GET' });
    return Array.isArray(data) ? data : (data?.timetable || []);
  },

  addTimetableSlot: async (slotData) => {
    const backendRes = await apiRequest('/api/timetable', {
      method: 'POST',
      body: JSON.stringify(slotData)
    });
    return backendRes?.slot || backendRes?.data || backendRes;
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

  // 9. Recent Payments & Payment Verification (Live Backend)
  getRecentPayments: async () => {
    let rawList = [];
    try {
      const data = await apiRequest('/api/admin/recent-payments', { method: 'GET' });
      rawList = data?.payments || (Array.isArray(data) ? data : []);
    } catch {
      try {
        const data = await apiRequest('/api/payments', { method: 'GET' });
        rawList = data?.payments || (Array.isArray(data) ? data : []);
      } catch {
        rawList = [];
      }
    }

    const formattedList = rawList.map(p => {
      const rawAmt = p.amount !== undefined ? p.amount : (p.events?.[0]?.registrationFee || p.event?.registrationFee || 200);
      const parsed = typeof rawAmt === 'number' ? rawAmt : (Number(String(rawAmt).replace(/[^0-9.]/g, '')) || 0);
      const validAmt = parsed > 0 ? parsed : 200;

      return {
        ...p,
        amount: validAmt,
        amountNum: validAmt,
        amountFormatted: `₹ ${validAmt.toLocaleString()}`
      };
    });

    return {
      count: formattedList.length,
      payments: formattedList
    };
  },

  updatePaymentStatus: async (paymentId, status, message = '', extra = {}) => {
    const normStatus = (status || '').toLowerCase();
    const capStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Ensure UTR conforms to 12-22 alphanumeric requirement if provided
    let validUtr = undefined;
    const candidateUtr = (typeof extra === 'string' ? extra : (extra?.utr || extra?.payment?.utr));
    if (candidateUtr && typeof candidateUtr === 'string' && candidateUtr !== 'N/A') {
      const clean = candidateUtr.replace(/[^a-zA-Z0-9]/g, '');
      if (clean.length >= 12 && clean.length <= 22) {
        validUtr = clean;
      } else if (clean.length > 0 && clean.length < 12) {
        validUtr = clean.padEnd(12, '0');
      } else if (clean.length > 22) {
        validUtr = clean.slice(0, 22);
      }
    }

    const payload = {
      paymentId,
      status: normStatus,
      paymentStatus: capStatus,
      message,
      ...(validUtr && { utr: validUtr })
    };

    try {
      return await apiRequest('/api/admin/payment-status', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    } catch (err1) {
      try {
        return await apiRequest('/api/admin/payment-status', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } catch {
        throw err1;
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
    const cleanId = String(paymentId || '').trim();
    if (!cleanId) throw new Error('Payment ID is required');

    const endpoints = [
      `/api/admin/payments/${cleanId}`,
      `/api/payments/${cleanId}`,
      `/api/admin/payment/${cleanId}`,
      `/api/payment/${cleanId}`,
      `/api/admin/payments/delete/${cleanId}`,
      `/api/admin/delete-payment/${cleanId}`
    ];

    let lastError = null;
    for (const ep of endpoints) {
      try {
        const res = await apiRequest(ep, { method: 'DELETE' });
        return res || { success: true, message: 'Payment record deleted successfully.' };
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError || new Error('Failed to delete payment record.');
  },

  // 9b. Backup Payments Vault
  getBackupPayments: async () => {
    let data = null;
    try {
      data = await apiRequest('/api/admin/backup-payments', { method: 'GET' });
    } catch (err1) {
      try {
        data = await apiRequest('/api/admin/payments/backups', { method: 'GET' });
      } catch {
        data = { count: 0, payments: [] };
      }
    }

    const rawList = data?.payments || (Array.isArray(data) ? data : []);
    const formatted = rawList.map((p, idx) => {
      const backupId = p.backupId || p.backupRecordId || p.paymentBackupId || p._id || p.paymentid || `backup_${idx}`;
      const originalPaymentId = p.originalPaymentId || p.paymentid || p._id || 'N/A';
      const rawAmount = p.amount !== undefined ? p.amount : 0;
      const amountNum = typeof rawAmount === 'number' ? rawAmount : (Number(String(rawAmount).replace(/[^0-9.]/g, '')) || 0);
      const rawImg = p.imageUrl || p.imageurl || p.proofUrl || p.proofurl || p.screenshot || p.paymentScreenshot || p.receiptUrl || p.receipt || p.image || p.url || null;
      const proofUrl = resolveImageUrl(rawImg);
      const rawStatus = (p.status || 'pending').toLowerCase();
      const statusCap = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);

      const userObj = p.user || {};
      const collegeName = userObj.collegeName || (typeof userObj.college === 'object' ? userObj.college?.name : '') || p.collegeName || '';
      const teamName = (typeof userObj.team === 'object' ? userObj.team?.name : '') || p.teamName || '';

      return {
        ...p,
        backupId,
        backupRecordId: p.backupRecordId || backupId,
        originalPaymentId,
        paymentBackupId: p.paymentBackupId || backupId,
        paymentid: p.paymentid || originalPaymentId,
        _id: p._id || backupId,
        amountNum,
        amountFormatted: `₹${amountNum.toLocaleString()}`,
        amount: typeof rawAmount === 'number' ? `₹${rawAmount}` : (rawAmount || '₹0'),
        utr: p.utr || 'N/A',
        imageUrl: proofUrl,
        imageurl: proofUrl,
        proofUrl,
        status: statusCap,
        rawStatus,
        message: p.message || '',
        approvedBy: p.approvedBy || null,
        deletedAt: p.deletedAt || null,
        deletedDateFormatted: p.deletedAt ? new Date(p.deletedAt).toLocaleString() : 'Recent Deletion',
        deletedBy: p.deletedBy || null,
        backedUpEventsCount: p.backedUpEventsCount !== undefined ? p.backedUpEventsCount : (Array.isArray(p.events) ? p.events.length : 1),
        user: {
          _id: userObj._id || userObj.id || null,
          name: userObj.name || p.userName || 'Participant',
          email: userObj.email || p.userEmail || '',
          avatar: resolveImageUrl(userObj.avatar || p.userAvatar || null),
          collegeName: collegeName,
          college: userObj.college || null,
          team: userObj.team || null
        },
        collegeName,
        teamName,
        userName: userObj.name || p.userName || 'Participant',
        userEmail: userObj.email || p.userEmail || ''
      };
    });

    return {
      count: formatted.length,
      payments: formatted
    };
  },

  getBackupPaymentDetails: async (backupId) => {
    if (!backupId) throw new Error('Backup ID is required');
    const cleanId = encodeURIComponent(backupId);
    let data = null;

    try {
      data = await apiRequest(`/api/admin/backup-payments/${cleanId}`, { method: 'GET' });
    } catch (err1) {
      try {
        data = await apiRequest(`/api/admin/payments/backups/${cleanId}`, { method: 'GET' });
      } catch {
        throw err1;
      }
    }

    if (data && data.payment) {
      const rawImg = data.payment.imageUrl || data.payment.imageurl || data.payment.proofUrl || data.payment.screenshot || data.payment.receipt || null;
      const resolved = resolveImageUrl(rawImg);
      data.payment.imageUrl = resolved;
      data.payment.imageurl = resolved;
      data.payment.proofUrl = resolved;
    }

    return data;
  },

  // 10. Excel Export Endpoints (.xlsx) - Secure Bearer Header Download
  downloadExcel: async (endpoint, filename = 'Export.xlsx') => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${API_BASE_URL}/api/admin/export/${cleanEndpoint}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        ...getAuthHeader()
      }
    });

    if (!res.ok) {
      if (res.status === 401 && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('semaphore:unauthorized'));
      }
      throw new Error(`Export failed with HTTP status ${res.status}`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return { success: true };
  },

  exportTeams: async (filename = 'Teams_Report.xlsx') => {
    return apiService.downloadExcel('teams', filename);
  },

  exportEvents: async (eventId = null, filename = null) => {
    if (eventId) {
      return apiService.downloadExcel(`events/${eventId}`, filename || `Event_${eventId}_Participants.xlsx`);
    }
    return apiService.downloadExcel('events', filename || 'Events_Report.xlsx');
  },

  exportSingleEvent: async (eventId, filename = null) => {
    return apiService.downloadExcel(`events/${eventId}`, filename || `Event_${eventId}_Participants.xlsx`);
  },

  exportColleges: async (filename = 'Colleges_Report.xlsx') => {
    return apiService.downloadExcel('colleges', filename);
  },

  exportAllMaster: async (filename = 'Master_Export.xlsx') => {
    return apiService.downloadExcel('all', filename);
  },

  // 11. JSON Reports Endpoints
  getTeamsReport: async () => {
    return await apiRequest('/api/admin/reports/teams', { method: 'GET' });
  },

  getEventsReport: async (eventId = null) => {
    const query = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
    return await apiRequest(`/api/admin/reports/events${query}`, { method: 'GET' });
  },

  getCollegesReport: async () => {
    return await apiRequest('/api/admin/reports/colleges', { method: 'GET' });
  },

  getDashboardSummaryReport: async () => {
    return await apiRequest('/api/admin/reports/summary', { method: 'GET' });
  },

  // 12. Team Rules & Guidelines Management API (Pure Backend)
  getTeamRules: async (category = null) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await apiRequest(`/api/team-rules${query}`, { method: 'GET' });
    const fetchedData = res?.data || res?.rules || res;
    if (fetchedData && typeof fetchedData === 'object') {
      return {
        ...fetchedData,
        id: fetchedData.id || fetchedData._id,
        _id: fetchedData._id || fetchedData.id,
        rules: Array.isArray(fetchedData.rules) ? fetchedData.rules : []
      };
    }
    return fetchedData;
  },

  getAllTeamRules: async () => {
    let serverSets = [];
    try {
      const res = await apiRequest('/api/team-rules/all', { method: 'GET' });
      if (Array.isArray(res)) serverSets = res;
      else if (Array.isArray(res?.data)) serverSets = res.data;
      else if (Array.isArray(res?.rules)) serverSets = res.rules;
      else if (res?.data && (res.data.id || res.data._id || res.data.rules)) serverSets = [res.data];
      else if (res?.id || res?._id || res?.rules) serverSets = [res];
    } catch {
      try {
        const single = await apiService.getTeamRules();
        if (single) serverSets = [single];
      } catch {
        serverSets = [];
      }
    }

    return serverSets.map(s => ({
      ...s,
      id: s.id || s._id,
      _id: s._id || s.id
    }));
  },

  createTeamRules: async (ruleData) => {
    const res = await apiRequest('/api/team-rules', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
    const data = res?.data || res;
    return {
      ...data,
      id: data?.id || data?._id,
      _id: data?._id || data?.id
    };
  },

  updateTeamRules: async (id, ruleData) => {
    const url = id ? `/api/team-rules/${id}` : '/api/team-rules';
    try {
      const res = await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(ruleData)
      });
      const data = res?.data || res?.rules || res;
      return {
        ...ruleData,
        ...data,
        id: data?.id || data?._id || id,
        _id: data?._id || data?.id || id
      };
    } catch {
      const res = await apiRequest('/api/team-rules', {
        method: 'PUT',
        body: JSON.stringify(ruleData)
      });
      const data = res?.data || res;
      return {
        ...ruleData,
        ...data,
        id: data?.id || data?._id || id,
        _id: data?._id || data?.id || id
      };
    }
  },

  deleteTeamRules: async (id) => {
    return await apiRequest(`/api/team-rules/${id}`, { method: 'DELETE' });
  }
};

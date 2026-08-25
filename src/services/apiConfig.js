// API Configuration for Semaphore 2026 Admin Panel

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


export const getAuthToken = () => {
  return localStorage.getItem('semaphore_admin_token') || 
         localStorage.getItem('token') || 
         localStorage.getItem('adminToken') || 
         localStorage.getItem('admin_token') || 
         localStorage.getItem('jwt') || '';
};

export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};


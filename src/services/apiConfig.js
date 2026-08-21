// API Configuration for Semaphore 2026 Admin Panel

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://13.201.89.79';

export const getAuthHeader = () => {
  const token = localStorage.getItem('semaphore_admin_token') || 
                localStorage.getItem('token') || 
                localStorage.getItem('admin_token') || 
                localStorage.getItem('jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

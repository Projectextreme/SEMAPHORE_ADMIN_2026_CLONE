export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://13.201.89.79';


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

/**
 * Resolves absolute or relative image URLs to load correctly from the backend or CDNs.
 */
export const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'N/A' || trimmed === 'none') {
    return null;
  }
  if (
    trimmed.startsWith('http://') || 
    trimmed.startsWith('https://') || 
    trimmed.startsWith('data:image/') || 
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${baseUrl}${cleanPath}`;
};



export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.semaphore2k26.in').replace(/\/+$/, '');


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
 * Securely resolves image URLs to load correctly from the backend or CDNs.
 * Sanitizes input to prevent XSS, javascript: URI execution, and protocol-relative bypasses.
 */
export const resolveImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined' || trimmed === 'N/A' || trimmed === 'none') {
    return null;
  }

  // Strictly reject dangerous executable schemes (XSS prevention)
  if (/^(javascript|vbscript|data(?!:image\/))/i.test(trimmed)) {
    return null;
  }

  // Reject protocol-relative URLs (//attacker.com)
  if (trimmed.startsWith('//')) {
    return null;
  }

  // Allow verified safe absolute URLs and data/blob image sources
  if (
    trimmed.startsWith('http://') || 
    trimmed.startsWith('https://') || 
    trimmed.startsWith('data:image/') || 
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Sanitize relative path (prevent directory traversal tricks)
  const sanitizedPath = trimmed.replace(/\.\./g, '').replace(/^\/+/, '');
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  return `${baseUrl}/${sanitizedPath}`;
};



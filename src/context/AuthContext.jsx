import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check existing token on initial load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('semaphore_admin_token') || 
                    localStorage.getItem('token') || 
                    localStorage.getItem('admin_token') || 
                    localStorage.getItem('jwt');
      if (token) {
        try {
          const profile = await apiService.getAdminProfile();
          setAdmin({ ...profile, token });
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          localStorage.removeItem('semaphore_admin_token');
          localStorage.removeItem('token');
          localStorage.removeItem('admin_token');
          localStorage.removeItem('jwt');
          localStorage.removeItem('semaphore_admin_user');
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Listen for 401 unauthorized events to gracefully clear expired sessions
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      setAuthError('Your session has expired. Please sign in again.');
    };

    window.addEventListener('semaphore:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('semaphore:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await apiService.loginAdmin({ email, password });
      const token = response?.token || response?.jwt || response?.accessToken;
      if (token) {
        localStorage.setItem('semaphore_admin_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('admin_token', token);
      }
      if (response) {
        localStorage.setItem('semaphore_admin_user', JSON.stringify(response));
      }
      setAdmin(response);
      return response;
    } catch (err) {
      const msg = err.message || 'Login failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('semaphore_admin_token');
    localStorage.removeItem('token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('semaphore_admin_user');
    setAdmin(null);
    setAuthError(null);
  };

  const isSuperAdmin = admin?.role === 'superadmin';

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        authError,
        setAuthError,
        login,
        logout,
        isSuperAdmin,
        isAuthenticated: !!admin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
      const token = localStorage.getItem('semaphore_admin_token');
      if (token) {
        try {
          const profile = await apiService.getAdminProfile();
          setAdmin({ ...profile, token });
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          localStorage.removeItem('semaphore_admin_token');
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await apiService.loginAdmin({ email, password });
      if (response.token) {
        localStorage.setItem('semaphore_admin_token', response.token);
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

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((messageOrConfig, options = {}) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    let toastItem;
    if (typeof messageOrConfig === 'string') {
      const isError = options.isError || options.type === 'error';
      const type = options.type || (isError ? 'error' : 'success');
      toastItem = {
        id,
        title: options.title || (type === 'error' ? 'Action Failed' : type === 'warning' ? 'Attention' : 'Success'),
        message: messageOrConfig,
        type,
        duration: options.duration || 4200,
        action: options.action || null
      };
    } else {
      toastItem = {
        id,
        title: messageOrConfig.title || 'Notification',
        message: messageOrConfig.message || messageOrConfig.text || '',
        type: messageOrConfig.type || (messageOrConfig.isError ? 'error' : 'success'),
        duration: messageOrConfig.duration || 4200,
        action: messageOrConfig.action || null
      };
    }

    setToasts((prev) => [toastItem, ...prev.slice(0, 4)]); // Keep max 5 toasts stacked
    return id;
  }, []);

  const showSuccess = useCallback((message, title) => {
    return showToast(message, { type: 'success', title: title || 'Success' });
  }, [showToast]);

  const showError = useCallback((message, title) => {
    return showToast(message, { type: 'error', title: title || 'Error Occurred' });
  }, [showToast]);

  const showWarning = useCallback((message, title) => {
    return showToast(message, { type: 'warning', title: title || 'Notice' });
  }, [showToast]);

  const showInfo = useCallback((message, title) => {
    return showToast(message, { type: 'info', title: title || 'Information' });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

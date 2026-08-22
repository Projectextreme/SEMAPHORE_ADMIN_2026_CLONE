import { useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';
import './ToastContainer.css';

const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const renderIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertTriangle className="toast-icon text-danger" size={18} />;
      case 'warning':
        return <AlertCircle className="toast-icon text-warning" size={18} />;
      case 'info':
        return <Info className="toast-icon text-cyan" size={18} />;
      case 'success':
      default:
        return <CheckCircle2 className="toast-icon text-success" size={18} />;
    }
  };

  return (
    <div 
      className={`toast-card toast-${toast.type || 'success'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="toast-glow" />
      <div className="toast-icon-wrap">
        {renderIcon()}
      </div>
      <div className="toast-body">
        {toast.title && <h4 className="toast-title">{toast.title}</h4>}
        <p className="toast-message">{toast.message}</p>
      </div>
      {toast.action && (
        <button 
          className="toast-action-btn"
          onClick={() => {
            if (typeof toast.action.onClick === 'function') {
              toast.action.onClick();
            }
            onRemove(toast.id);
          }}
        >
          {toast.action.label}
        </button>
      )}
      <button 
        className="toast-close-btn" 
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
      {toast.duration > 0 && (
        <div 
          className="toast-progress-bar" 
          style={{ animationDuration: `${toast.duration}ms` }} 
        />
      )}
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-viewport-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

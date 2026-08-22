import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Universal Portal Modal Component
 * Renders modal directly into document.body to guarantee it is always centered
 * in the active viewport, completely immune to parent container scrolling or CSS transforms.
 */
export const Modal = ({
  isOpen = true,
  onClose = () => {},
  children,
  className = '',
  maxWidth = '560px',
  isDanger = false
}) => {
  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal-content ${isDanger ? 'modal-danger' : ''} ${className}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

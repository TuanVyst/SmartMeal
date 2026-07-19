import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiLoader
} from 'react-icons/fi';
import './SmartMealDialog.css';

const typeConfig = {
  success: {
    theme: 'smd-theme-success',
    icon: <FiCheckCircle />,
    defaultTitle: 'Success',
  },
  error: {
    theme: 'smd-theme-error',
    icon: <FiXCircle />,
    defaultTitle: 'Error',
  },
  confirm: {
    theme: 'smd-theme-warning',
    icon: <FiAlertTriangle />,
    defaultTitle: 'Confirmation',
  },
  info: {
    theme: 'smd-theme-info',
    icon: <FiInfo />,
    defaultTitle: 'Information',
  },
  loading: {
    theme: 'smd-theme-loading',
    icon: <FiLoader />,
    defaultTitle: 'Please wait',
  },
};

export function SmartMealDialog({
  type = 'info',
  title,
  message = '',
  details = '',
  primaryLabel = 'OK',
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  danger = false,
  onClose,
}) {
  const config = typeConfig[type] || typeConfig.info;
  const overlayRef = useRef(null);
  const primaryRef = useRef(null);
  const cancelRef = useRef(null);

  const handleClose = useCallback((value) => {
    if (type === 'loading') return;
    onClose?.(value);
  }, [type, onClose]);

  useEffect(() => {
    const handleKey = (e) => {
      if (type === 'loading') return;
      if (e.key === 'Escape') {
        if (type === 'confirm') return;
        handleClose(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [type, handleClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (type === 'confirm') {
        cancelRef.current?.focus();
      } else if (type !== 'loading') {
        primaryRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [type]);

  useEffect(() => {
    if (type === 'loading') return;
    const handleFocus = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        if (type === 'confirm') {
          cancelRef.current?.focus();
        } else {
          primaryRef.current?.focus();
        }
      }
    };
    window.addEventListener('focus', handleFocus, true);
    return () => window.removeEventListener('focus', handleFocus, true);
  }, [type]);

  const renderIcon = () => {
    if (type === 'loading') {
      return <div className="smd-spinner" />;
    }
    return config.icon;
  };

  const renderActions = () => {
    if (type === 'loading') return null;

    if (type === 'confirm') {
      return (
        <div className="smd-footer">
          <button
            ref={cancelRef}
            className="smd-btn smd-btn-cancel"
            onClick={() => handleClose(false)}
          >
            {cancelLabel}
          </button>
          <button
            ref={primaryRef}
            className={`smd-btn ${danger ? 'smd-btn-danger' : 'smd-btn-primary'}`}
            onClick={() => handleClose(true)}
          >
            {confirmLabel}
          </button>
        </div>
      );
    }

    return (
      <div className="smd-footer">
        <button
          ref={primaryRef}
          className="smd-btn smd-btn-primary"
          onClick={() => handleClose(null)}
        >
          {primaryLabel}
        </button>
      </div>
    );
  };

  return createPortal(
    <div className={`smd-overlay ${config.theme}`} ref={overlayRef}>
      <div className="smd-card" role="dialog" aria-modal="true" aria-label={title || config.defaultTitle}>
        <div className="smd-body">
          <div className="smd-icon-wrap">
            <div className="smd-icon">{renderIcon()}</div>
          </div>
          <h2 className="smd-title">{title || config.defaultTitle}</h2>
          {message && <p className="smd-message">{message}</p>}
          {details && <pre className="smd-details">{details}</pre>}
        </div>
        {renderActions()}
      </div>
    </div>,
    document.body
  );
}

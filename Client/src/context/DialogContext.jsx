import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { SmartMealDialog } from '../components/common/SmartMealDialog';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const hide = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(null);
      resolveRef.current = null;
    }
    setDialog(null);
  }, []);

  const show = useCallback((config) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog(config);
    });
  }, []);

  const success = useCallback((title, message) => {
    return show({ type: 'success', title, message, primaryLabel: 'OK' });
  }, [show]);

  const error = useCallback((title, message, details) => {
    return show({ type: 'error', title, message, details, primaryLabel: 'OK' });
  }, [show]);

  const info = useCallback((title, message) => {
    return show({ type: 'info', title, message, primaryLabel: 'OK' });
  }, [show]);

  const confirm = useCallback(({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false }) => {
    return show({ type: 'confirm', title, message, confirmLabel, cancelLabel, danger });
  }, [show]);

  const showLoading = useCallback((message = 'Loading...') => {
    setDialog({ type: 'loading', message });
  }, []);

  const hideLoading = useCallback(() => {
    setDialog(null);
  }, []);

  const resolve = useCallback((value) => {
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
    setDialog(null);
  }, []);

  return (
    <DialogContext.Provider value={{ show, success, error, info, confirm, showLoading, hideLoading, hide, resolve }}>
      {children}
      {dialog && (
        <SmartMealDialog
          {...dialog}
          onClose={(val) => {
            if (resolveRef.current) {
              resolveRef.current(val ?? null);
              resolveRef.current = null;
            }
            setDialog(null);
          }}
        />
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider');
  return ctx;
}

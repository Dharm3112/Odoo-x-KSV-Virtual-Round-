import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = nextId++;
    const t = {
      id,
      kind: toast.kind || 'info',
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration ?? 4000,
    };
    setToasts((arr) => [...arr, t]);
    if (t.duration > 0) {
      setTimeout(() => dismiss(id), t.duration);
    }
    return id;
  }, [dismiss]);

  const value = {
    toasts,
    dismiss,
    push,
    success: (msg, title) => push({ kind: 'success', message: msg, title }),
    error: (msg, title) => push({ kind: 'error', message: msg, title, duration: 6000 }),
    info: (msg, title) => push({ kind: 'info', message: msg, title }),
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
};

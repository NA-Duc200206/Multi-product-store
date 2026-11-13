import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const STATUS_ICONS = {
  success: <CheckCircle2 size={15} color="#10b981" strokeWidth={2.3} />,
  error: <AlertCircle size={15} color="#ef4444" strokeWidth={2.3} />,
  warning: <AlertTriangle size={15} color="#f59e0b" strokeWidth={2.3} />,
  info: <Info size={15} color="#2454F4" strokeWidth={2.3} />,
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const showToast = (message, type = 'success', duration = 2200) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type };

    // Show only the latest status pill cleanly at top-center instead of stacking bottom-right bars
    setToasts([newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="status-pill-container" role="status" aria-live="polite">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`status-pill status-pill-${toast.type}`}
              onClick={() => removeToast(toast.id)}
            >
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {STATUS_ICONS[toast.type] || STATUS_ICONS.info}
              </span>
              <span>{toast.message}</span>
              <X size={13} style={{ opacity: 0.55, marginLeft: '2px', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

import React, { createContext, useState, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`min-w-[300px] shadow-lg rounded-xl p-4 flex items-center gap-3 transition-all duration-300 pointer-events-auto transform
              ${toast.type === 'error' ? 'bg-error text-on-error' : 'bg-inverse-surface text-inverse-on-surface'}`}
          >
            <span className="material-symbols-outlined">
              {toast.type === 'error' ? 'error' : 'info'}
            </span>
            <p className="text-body-md font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="material-symbols-outlined opacity-70 hover:opacity-100">
              close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

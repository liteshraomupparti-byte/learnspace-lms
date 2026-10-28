import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColors = {
    info: 'bg-[#13233b] text-white',
    success: 'bg-[#0f766e] text-white',
    error: 'bg-[#b91c1c] text-white',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-200 transform translate-y-0 opacity-100 flex items-center gap-2 ${bgColors[type]}`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white/80 hover:text-white text-base leading-none focus:outline-none"
        aria-label="Dismiss toast"
      >
        ×
      </button>
    </div>
  );
};

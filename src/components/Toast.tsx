import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';
import type { ToastProps } from '../types/components';

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  action,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-accent" />;
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 pointer-events-none">
      <div className="bg-primary-bg-800/95 backdrop-blur-xl border border-accent/20 rounded-lg shadow-2xl p-4 pointer-events-auto transform transition-all duration-300 animate-slideUp">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {getIcon()}
            <div className="flex-1">
              <p className="text-text-primary text-sm font-medium">{message}</p>
              {action && (
                <button
                  onClick={action.onClick}
                  className="mt-2 text-accent hover:text-accent-hover text-sm font-medium transition-colors duration-200"
                >
                  {action.label} →
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;

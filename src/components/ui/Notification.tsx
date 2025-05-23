import React from 'react';
import { Bell, Check, XCircle } from 'lucide-react';

interface NotificationToastProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
  isVisible?: boolean;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  title,
  message,
  type = 'info',
  onClose,
  isVisible = false
}) => {
  const typeClasses = {
    info: 'bg-blue-50 border-blue-500 text-blue-800',
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800'
  };

  const iconByType = {
    info: <Bell size={18} className="text-blue-500" />,
    success: <Check size={18} className="text-green-500" />,
    error: <XCircle size={18} className="text-red-500" />
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`notification-enter fixed top-4 right-4 z-50 w-80 border-l-4 p-4 rounded shadow-md ${typeClasses[type]}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {iconByType[type]}
        </div>
        <div className="flex-1">
          <div className="font-medium">{title}</div>
          <div className="text-sm mt-1">{message}</div>
        </div>
        <button 
          onClick={onClose} 
          className="flex-shrink-0 ml-2 hover:text-gray-700"
          aria-label="Close notification"
        >
          <XCircle size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { User } from '../../types';

interface NotificationBellProps {
  currentUser: User;
  onClick: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ currentUser, onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      const count = await apiService.getUnreadNotificationCount(currentUser.id);
      setUnreadCount(count);
    };

    loadUnreadCount();

    // Use Socket.IO connection for real-time notifications
    const socket = apiService.connectToChat(currentUser.id);

    socket.on('notification', (notification) => {
      if (notification.userId === currentUser.id && !notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('notification');
      apiService.disconnectFromChat();
    };
  }, [currentUser]);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell; 
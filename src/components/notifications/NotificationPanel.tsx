import React, { useEffect, useState } from 'react';
import { X, Bell, MessageCircle, Gift, Info } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { User } from '../../types';
import { Card } from '../ui/Card';

interface NotificationPanelProps {
  currentUser: User;
  onClose: () => void;
}

interface Notification {
  id: string;
  userId: string;
  type: 'new_donation' | 'donation_accepted' | 'donation_completed' | 'new_message';
  title: string;
  message: string;
  donationId?: string;
  chatId?: string;
  read: boolean;
  createdAt: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ currentUser, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const userNotifications = await apiService.getNotifications(currentUser.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Use Socket.IO connection for real-time notifications
    const socket = apiService.connectToChat(currentUser.id);

    socket.on('notification', (notification: Notification) => {
      if (notification.userId === currentUser.id) {
        setNotifications(prev => [notification, ...prev]);
      }
    });

    return () => {
      socket.off('notification');
      apiService.disconnectFromChat();
    };
  }, [currentUser]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await apiService.markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_donation':
        return <Gift className="w-5 h-5 text-blue-500" />;
      case 'new_message':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case 'donation_accepted':
      case 'donation_completed':
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card className="absolute right-0 mt-2 w-96 max-h-[80vh] overflow-hidden shadow-lg z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close notifications"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(80vh-4rem)]">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex items-start gap-3 p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(notification.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default NotificationPanel; 
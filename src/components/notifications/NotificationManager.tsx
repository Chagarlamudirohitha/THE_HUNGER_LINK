import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import useAuthStore from '../../store/authStore';
import NotificationToast from './NotificationToast';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const NotificationManager: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Connect to socket for real-time notifications
    const socket = apiService.connectToChat(user.id);

    // Listen for new messages
    socket.on('newMessage', (data: { chatId: string; message: { senderName: string, content: string } }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: `New message from ${data.message.senderName}: ${data.message.content}`,
        type: 'info'
      };
      setNotifications(prev => [...prev, notification]);
    });

    // Listen for new chats
    socket.on('newChat', () => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: 'New chat conversation started',
        type: 'info'
      };
      setNotifications(prev => [...prev, notification]);
    });

    // Listen for donation updates
    socket.on('donationUpdate', (data: { status: string, donationId: string }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: `Donation ${data.donationId} status updated to ${data.status}`,
        type: 'success'
      };
      setNotifications(prev => [...prev, notification]);
    });

    return () => {
      socket.off('newMessage');
      socket.off('newChat');
      socket.off('donationUpdate');
      apiService.disconnectFromChat();
    };
  }, [user]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          message={notification.message}
          type={notification.type}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};

export default NotificationManager; 
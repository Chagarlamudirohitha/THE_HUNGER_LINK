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

class NotificationService {
  private readonly SERVER_URL = 'http://localhost:5000';

  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await fetch(`${this.SERVER_URL}/api/notifications/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async sendNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<void> {
    try {
      await fetch(`${this.SERVER_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await fetch(`${this.SERVER_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await fetch(`${this.SERVER_URL}/api/notifications/${userId}/unread`);
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }
      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
}

export const notificationService = new NotificationService(); 
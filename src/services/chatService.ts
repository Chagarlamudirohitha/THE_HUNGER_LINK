import { io, Socket } from 'socket.io-client';
import { User } from '../types';

interface Message {
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

class ChatService {
  private socket: Socket | null = null;
  private readonly SERVER_URL = 'http://localhost:5000';

  connect(user: User) {
    this.socket = io(this.SERVER_URL, {
      query: {
        userId: user.id,
        role: user.role
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async sendMessage(recipientId: string, content: string): Promise<void> {
    if (!this.socket) {
      throw new Error('Not connected to chat server');
    }

    const message = {
      recipientId,
      content,
      timestamp: new Date().toISOString()
    };

    // Emit through socket for real-time delivery
    this.socket.emit('message', message);
  }

  onMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('message', callback);
    }
  }

  async getMessages(userId: string): Promise<Message[]> {
    try {
      const response = await fetch(`${this.SERVER_URL}/api/messages/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await fetch(`${this.SERVER_URL}/api/messages/${messageId}/read`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
}

export const chatService = new ChatService(); 
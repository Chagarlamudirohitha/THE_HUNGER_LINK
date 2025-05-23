import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import type { User, Donation, Chat, Message } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    config.headers.Authorization = `Bearer ${userData.token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
);

// Socket connection management
const connectToChat = (userId: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    query: { userId },
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('Connected to chat server');
    reconnectAttempts = 0;
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from chat server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    reconnectAttempts++;
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      socket?.disconnect();
    }
  });

  socket.on('reconnect_attempt', () => {
    console.log('Attempting to reconnect...');
  });

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect to chat server');
  });

  return socket;
};

const disconnectFromChat = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
  }
};

export const apiService = {
  // Socket operations
  connectToChat,
  disconnectFromChat,

  // User operations
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get('/users');
      return response.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  saveUser: async (user: User): Promise<boolean> => {
    try {
      await api.post('/users', user);
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  findUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const users = await apiService.getUsers();
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  },

  // Donation operations
  getDonations: async (ngoId?: string): Promise<Donation[]> => {
    try {
      const params = ngoId ? { ngoId } : {};
      const response = await api.get('/donations', { params });
      return response;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  },

  saveDonation: async (donation: Donation): Promise<boolean> => {
    try {
      await api.post('/donations', donation);
      return true;
    } catch (error) {
      console.error('Error saving donation:', error);
      return false;
    }
  },

  updateDonation: async (updatedDonation: Donation): Promise<boolean> => {
    try {
      await api.put(`/donations/${updatedDonation.id}`, updatedDonation);
      return true;
    } catch (error) {
      console.error('Error updating donation:', error);
      return false;
    }
  },

  getDonationsByDonor: async (donorId: string): Promise<Donation[]> => {
    try {
      const response = await api.get(`/donations/donor/${donorId}`);
      return response;
    } catch (error) {
      console.error('Error fetching donor donations:', error);
      throw error;
    }
  },

  getDonationsByNGO: async (ngoId: string): Promise<Donation[]> => {
    try {
      const response = await api.get(`/donations/ngo/${ngoId}`);
      return response;
    } catch (error) {
      console.error('Error fetching NGO donations:', error);
      throw error;
    }
  },

  // Chat operations
  getChats: async (userId: string): Promise<Chat[]> => {
    try {
      const response = await api.get(`/chats/${userId}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  getChatById: async (chatId: string): Promise<Chat | null> => {
    try {
      const response = await api.get(`/chats/by-id/${chatId}`);
      return response.data || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching chat:', error);
      throw error;
    }
  },

  getChatByDonationId: async (donationId: string): Promise<Chat | null> => {
    try {
      const response = await api.get(`/chats/by-donation/${donationId}`);
      return response || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching chat:', error);
      throw error;
    }
  },

  createChat: async (chatData: Partial<Chat>): Promise<Chat | null> => {
    try {
      const response = await api.post('/chats', {
        ...chatData,
        messages: chatData.messages || [],
        createdAt: new Date().toISOString()
      });

      // Notify participants about new chat
      if (socket && response) {
        socket.emit('newChat', {
          chatId: response.id,
          participantIds: chatData.participantIds
        });
      }

      return response || null;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  sendMessage: async (chatId: string, messageData: Partial<Message>): Promise<Message | null> => {
    try {
      // Ensure chatId starts with 'chat_'
      const formattedChatId = chatId.startsWith('chat_') ? chatId : `chat_${chatId}`;
      
      // Emit the message through socket for real-time delivery
      if (socket) {
        socket.emit('message', {
          chatId: formattedChatId,
          content: messageData.content,
          senderId: messageData.senderId,
          senderName: messageData.senderName,
          receiverId: messageData.receiverId
        });
      }

      return messageData as Message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  markMessagesAsRead: async (chatId: string, userId: string): Promise<boolean> => {
    try {
      // Ensure chatId starts with 'chat_'
      const formattedChatId = chatId.startsWith('chat_') ? chatId : `chat_${chatId}`;
      
      const response = await api.put(`/chats/${formattedChatId}/messages/read`, { userId });
      return response?.success || false;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  },

  // Auth endpoints
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: any) => {
    try {
      console.log('Sending registration request:', userData);
      const response = await api.post('/auth/register', {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message === 'Email already registered') {
        throw new Error('This email is already registered. Please use a different email.');
      }
      throw error;
    }
  },

  getCurrentUser: async () => {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return null;
    try {
      return JSON.parse(currentUser);
    } catch (error) {
      console.error('Error parsing current user:', error);
      return null;
    }
  },

  // Message endpoints
  getMessages: async (userId: string) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Notification endpoints
  getNotifications: async (userId: string) => {
    try {
      const response = await api.get(`/notifications/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  getUnreadNotificationCount: async (userId: string) => {
    try {
      const response = await api.get(`/notifications/${userId}/unread`);
      return response.count;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      return 0;
    }
  },

  // Stats endpoint
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // User endpoints
  getUser: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }
};

export default apiService; 
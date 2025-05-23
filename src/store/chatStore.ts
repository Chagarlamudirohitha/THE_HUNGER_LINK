import { create } from 'zustand';
import { Chat, Message } from '../types';
import { apiService } from '../services/apiService';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  getChats: (userId: string) => Promise<void>;
  getChatById: (chatId: string) => Promise<void>;
  createChat: (participantIds: string[], donationId: string) => Promise<void>;
  sendMessage: (chatId: string, message: Partial<Message>) => Promise<void>;
  markMessagesAsRead: (chatId: string, userId: string) => Promise<void>;
}

const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
  
  getChats: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const chats = await apiService.getChats(userId);
      set({ chats, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while fetching chats'
      });
    }
  },
  
  getChatById: async (chatId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const chat = await apiService.getChatById(chatId);
      set({ currentChat: chat, isLoading: false });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while fetching chat'
      });
    }
  },
  
  createChat: async (participantIds: string[], donationId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if chat already exists for this donation
      const existingChat = await apiService.getChatByDonationId(donationId);
      if (existingChat) {
        set({ currentChat: existingChat, isLoading: false });
        return;
      }
      
      const newChat = await apiService.createChat({
        participantIds,
        donationId,
        messages: []
      });
      
      if (!newChat) {
        throw new Error('Failed to create chat');
      }
      
      set(state => ({
        chats: [...state.chats, newChat],
        currentChat: newChat,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating chat'
      });
    }
  },
  
  sendMessage: async (chatId: string, messageData: Partial<Message>) => {
    set({ isLoading: true, error: null });
    
    try {
      const newMessage = await apiService.sendMessage(chatId, messageData);
      
      if (!newMessage) {
        throw new Error('Failed to send message');
      }
      
      set(state => {
        const updatedChats = state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage
            };
          }
          return chat;
        });
        
        return {
          chats: updatedChats,
          currentChat: state.currentChat?.id === chatId ? {
            ...state.currentChat,
            messages: [...state.currentChat.messages, newMessage],
            lastMessage: newMessage
          } : state.currentChat,
          isLoading: false
        };
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while sending message'
      });
    }
  },
  
  markMessagesAsRead: async (chatId: string, userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const success = await apiService.markMessagesAsRead(chatId, userId);
      
      if (!success) {
        throw new Error('Failed to mark messages as read');
      }
      
      set(state => {
        const updatedChats = state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: chat.messages.map(msg => {
                if (msg.receiverId === userId && !msg.isRead) {
                  return { ...msg, isRead: true };
                }
                return msg;
              })
            };
          }
          return chat;
        });
        
        return {
          chats: updatedChats,
          currentChat: state.currentChat?.id === chatId ? {
            ...state.currentChat,
            messages: state.currentChat.messages.map(msg => {
              if (msg.receiverId === userId && !msg.isRead) {
                return { ...msg, isRead: true };
              }
              return msg;
            })
          } : state.currentChat,
          isLoading: false
        };
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An error occurred while marking messages as read'
      });
    }
  }
}));

export default useChatStore; 
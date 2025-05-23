import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useChatStore from '../../store/chatStore';
import { apiService } from '../../services/apiService';
import type { Message } from '../../types';

interface ChatWindowProps {
  chatId: string;
  recipientName: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, recipientName, onClose }) => {
  const { user } = useAuthStore();
  const { currentChat, getChatById, sendMessage, markMessagesAsRead } = useChatStore();
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await getChatById(chatId);
        
        // Connect to socket if user exists
        if (user) {
          const socket = apiService.connectToChat(user.id);
          
          // Listen for new messages
          socket.on('message', (data: { chatId: string; message: Message }) => {
            if (data.chatId === chatId) {
              console.log('Received new message:', data);
              getChatById(chatId); // Refresh chat to get new message
            }
          });

          // Add error handling for socket
          socket.on('error', (error: any) => {
            console.error('Socket error:', error);
            setError('Connection error occurred');
          });

          // Add reconnection handling
          socket.on('reconnect', () => {
            console.log('Reconnected to chat server');
            setError(null);
            getChatById(chatId);
          });
        }
      } catch (err) {
        console.error('Chat initialization error:', err);
        setError('Failed to load chat messages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup socket connection and event listeners
    return () => {
      if (user) {
        const socket = apiService.connectToChat(user.id);
        socket.off('message');
        socket.off('error');
        socket.off('reconnect');
      }
      apiService.disconnectFromChat();
    };
  }, [chatId, getChatById, user]);
  
  useEffect(() => {
    if (currentChat && user) {
      markMessagesAsRead(currentChat.id, user.id);
    }
  }, [currentChat, user, markMessagesAsRead]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !user || !currentChat) return;
    
    const recipientId = currentChat.participantIds.find(id => id !== user.id);
    if (!recipientId) return;
    
    try {
      setError(null);
      await sendMessage(currentChat.id, {
        senderId: user.id,
        senderName: user.username,
        receiverId: recipientId,
        content: messageText.trim(),
        createdAt: new Date().toISOString(),
        isRead: false
      });
      
      setMessageText('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="flex flex-col h-[500px] w-[400px] bg-white rounded-lg shadow-xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white rounded-t-lg">
        <div>
          <h3 className="font-semibold text-gray-800">{recipientName}</h3>
          {currentChat && (
            <p className="text-xs text-gray-500">
              Donation ID: {currentChat.donationId}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close chat window"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : !currentChat || currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentChat.messages.map((message) => {
              const isOwnMessage = message.senderId === user.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading || !!error}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || isLoading || !!error}
            className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 
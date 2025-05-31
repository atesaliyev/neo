import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  read: boolean;
}

interface MessagingContextType {
  messages: Message[];
  sendMessage: (content: string, senderId: string, receiverId: string) => void;
  markMessageAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  getUnreadCount: (userId: string) => number;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('messages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (content: string, senderId: string, receiverId: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      senderId,
      receiverId,
      createdAt: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const markMessageAsRead = (id: string) => {
    setMessages(prev =>
      prev.map(msg => msg.id === id ? { ...msg, read: true } : msg)
    );
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const getUnreadCount = (userId: string) => {
    return messages.filter(msg => msg.receiverId === userId && !msg.read).length;
  };

  return (
    <MessagingContext.Provider value={{
      messages,
      sendMessage,
      markMessageAsRead,
      deleteMessage,
      getUnreadCount
    }}>
      {children}
    </MessagingContext.Provider>
  );
};
import { create } from 'zustand';
import { ChatSession, ChatMessage } from '@/types';

interface ChatState {
  // State
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  unreadCount: number;
  isTyping: boolean;
  publicKeys: Record<string, string>; // userId -> publicKey

  // Actions
  setSessions: (sessions: ChatSession[]) => void;
  addSession: (session: ChatSession) => void;
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  setCurrentSession: (session: ChatSession | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  markMessagesAsRead: (sessionId: string) => void;
  setPublicKey: (userId: string, publicKey: string) => void;
  getPublicKey: (userId: string) => string | undefined;
  setIsLoading: (isLoading: boolean) => void;
  setIsSending: (isSending: boolean) => void;
  setError: (error: string | null) => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  setIsTyping: (isTyping: boolean) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  unreadCount: 0,
  isTyping: false,
  publicKeys: {},
};

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  ...initialState,

  // Set all sessions
  setSessions: (sessions) => set({ sessions }),

  // Add a new session
  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),

  // Update a session
  updateSession: (sessionId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, ...updates } : session
      ),
    })),

  // Set current session
  setCurrentSession: (session) => set({ currentSession: session }),

  // Set all messages
  setMessages: (messages) => set({ messages }),

  // Add a new message
  addMessage: (message) =>
    set((state) => {
      // Check if message already exists
      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }

      // Update session's last message if applicable
      const updatedSessions = state.sessions.map((session) => {
        if (
          session.id ===
          (state.currentSession?.id || message.senderId + message.receiverId)
        ) {
          return {
            ...session,
            lastMessage: message,
            lastMessageAt: message.createdAt,
          };
        }
        return session;
      });

      return {
        messages: [...state.messages, message],
        sessions: updatedSessions,
      };
    }),

  // Update a message
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === messageId ? { ...message, ...updates } : message
      ),
    })),

  // Mark messages as read in a session
  markMessagesAsRead: (sessionId) =>
    set((state) => ({
      messages: state.messages.map((message) => {
        if (
          message.senderId !== state.currentSession?.studentId &&
          message.senderId !== state.currentSession?.therapistId &&
          !message.isRead
        ) {
          return { ...message, isRead: true, readAt: new Date().toISOString() };
        }
        return message;
      }),
      sessions: state.sessions.map((session) =>
        session.id === sessionId ? { ...session, unreadCount: 0 } : session
      ),
    })),

  // Set public key for a user
  setPublicKey: (userId, publicKey) =>
    set((state) => ({
      publicKeys: { ...state.publicKeys, [userId]: publicKey },
    })),

  // Get public key for a user
  getPublicKey: (userId) => get().publicKeys[userId],

  // Set loading state
  setIsLoading: (isLoading) => set({ isLoading }),

  // Set sending state
  setIsSending: (isSending) => set({ isSending }),

  // Set error
  setError: (error) => set({ error }),

  // Set unread count
  setUnreadCount: (count) => set({ unreadCount: count }),

  // Increment unread count
  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  // Set typing state
  setIsTyping: (isTyping) => set({ isTyping }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset state
  reset: () => set(initialState),
}));

export default useChatStore;

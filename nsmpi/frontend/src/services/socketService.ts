import { io, Socket } from 'socket.io-client';
import { ChatMessage, ChatSession } from '@/types';
import { useChatStore } from '@/stores/chatStore';
import { decryptMessageFromSender } from '@/utils/encryption';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  /**
   * Initialize socket connection
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Chat events
    this.socket.on('message:received', this.handleMessageReceived.bind(this));
    this.socket.on('message:sent', this.handleMessageSent.bind(this));
    this.socket.on('message:read', this.handleMessageRead.bind(this));
    this.socket.on('typing:start', this.handleTypingStart.bind(this));
    this.socket.on('typing:stop', this.handleTypingStop.bind(this));
    this.socket.on('session:updated', this.handleSessionUpdated.bind(this));
    this.socket.on('notification:new', this.handleNotification.bind(this));
  }

  /**
   * Handle incoming message
   */
  private async handleMessageReceived(data: {
    message: ChatMessage;
    session: ChatSession;
  }): Promise<void> {
    const { message, session } = data;
    const chatStore = useChatStore.getState();

    // Update session
    const existingSession = chatStore.sessions.find((s) => s.id === session.id);
    if (existingSession) {
      chatStore.updateSession(session.id, {
        lastMessage: message,
        lastMessageAt: message.createdAt,
        unreadCount: (existingSession.unreadCount || 0) + 1,
      });
    } else {
      chatStore.addSession({ ...session, unreadCount: 1 });
    }

    // Decrypt message if we have the private key
    const privateKey = localStorage.getItem('privateKey');
    if (privateKey) {
      try {
        const decryptedContent = await decryptMessageFromSender(
          {
            encryptedContent: message.encryptedContent,
            encryptedKey: message.encryptedKey,
            iv: message.iv,
          },
          privateKey
        );

        // Add decrypted message to store
        chatStore.addMessage({
          ...message,
          encryptedContent: decryptedContent, // Store decrypted content temporarily
        } as ChatMessage);
      } catch (error) {
        console.error('Failed to decrypt message:', error);
        // Add encrypted message anyway
        chatStore.addMessage(message);
      }
    } else {
      chatStore.addMessage(message);
    }

    // Increment unread count if not in current session
    if (chatStore.currentSession?.id !== session.id) {
      chatStore.incrementUnreadCount();
    }
  }

  /**
   * Handle sent message confirmation
   */
  private handleMessageSent(data: { message: ChatMessage; tempId: string }): void {
    const { message, tempId } = data;
    const chatStore = useChatStore.getState();

    // Update the temporary message with the real one
    chatStore.updateMessage(tempId, message);
  }

  /**
   * Handle message read receipt
   */
  private handleMessageRead(data: { messageId: string; readAt: string }): void {
    const { messageId, readAt } = data;
    const chatStore = useChatStore.getState();

    chatStore.updateMessage(messageId, { isRead: true, readAt });
  }

  /**
   * Handle typing indicator start
   */
  private handleTypingStart(data: { userId: string }): void {
    const chatStore = useChatStore.getState();
    chatStore.setIsTyping(true);
  }

  /**
   * Handle typing indicator stop
   */
  private handleTypingStop(data: { userId: string }): void {
    const chatStore = useChatStore.getState();
    chatStore.setIsTyping(false);
  }

  /**
   * Handle session update
   */
  private handleSessionUpdated(session: ChatSession): void {
    const chatStore = useChatStore.getState();
    chatStore.updateSession(session.id, session);

    // Update current session if it's the same
    if (chatStore.currentSession?.id === session.id) {
      chatStore.setCurrentSession(session);
    }
  }

  /**
   * Handle notification
   */
  private handleNotification(data: { type: string; message: string }): void {
    // You can integrate with a notification system here
    console.log('Notification:', data);
  }

  /**
   * Join a chat session
   */
  joinSession(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('session:join', { sessionId });
    }
  }

  /**
   * Leave a chat session
   */
  leaveSession(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('session:leave', { sessionId });
    }
  }

  /**
   * Send a message
   */
  sendMessage(
    sessionId: string,
    message: {
      encryptedContent: string;
      encryptedKey: string;
      iv: string;
      receiverId: string;
      tempId: string;
    }
  ): void {
    if (this.socket?.connected) {
      this.socket.emit('message:send', { sessionId, message });
    }
  }

  /**
   * Mark messages as read
   */
  markAsRead(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message:read', { sessionId });
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(sessionId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      this.socket.emit(isTyping ? 'typing:start' : 'typing:stop', { sessionId });
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const socketService = new SocketService();

export default socketService;

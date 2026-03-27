/**
 * Chat and Messaging Types for MindTrackEDU
 */

export enum MessageType {
  TEXT = 'TEXT',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  VIDEO_CALL_INVITE = 'VIDEO_CALL_INVITE'
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  sessionId: string;
  content: string; // Encrypted content
  type: MessageType;
  isRead: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  studentId: string;
  therapistId: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'PENDING';
  lastMessageAt: Date;
  encryptionPublicKey: string; // For E2EE
}

export interface ChatNotification {
  userId: string;
  messageId: string;
  title: string;
  body: string;
  payload: any;
}

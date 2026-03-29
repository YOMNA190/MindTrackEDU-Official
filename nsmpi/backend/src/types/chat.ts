/**
 * Chat and Messaging Types for MindTrackEDU
 */

export enum MessageType {
  TEXT             = 'TEXT',
  FILE             = 'FILE',
  IMAGE            = 'IMAGE',
  VIDEO_CALL_INVITE = 'VIDEO_CALL_INVITE',
}

export interface ChatMessage {
  id:        string;
  senderId:  string;
  receiverId: string;
  sessionId: string;
  /** AES-256-GCM encrypted content — see utils/encryption.ts */
  content:   string;
  type:      MessageType;
  isRead:    boolean;
  createdAt: Date;
  /** Strongly-typed optional metadata instead of `any` */
  metadata?: ChatMessageMetadata;
}

export interface ChatMessageMetadata {
  /** For FILE / IMAGE messages */
  fileName?:    string;
  fileSize?:    number;
  mimeType?:    string;
  storageKey?:  string;
  /** For VIDEO_CALL_INVITE messages */
  callRoomId?:  string;
  callType?:    'video' | 'audio';
  /** Delivery receipt timestamp */
  deliveredAt?: Date;
}

export interface ChatSession {
  id:          string;
  studentId:   string;
  therapistId: string;
  status:      'ACTIVE' | 'ARCHIVED' | 'PENDING';
  lastMessageAt: Date;
  /**
   * RSA-4096 public key in PEM format used by the sender to encrypt the AES
   * session key for each message (envelope encryption pattern).
   */
  encryptionPublicKey: string;
}

export interface ChatNotification {
  userId:    string;
  messageId: string;
  title:     string;
  body:      string;
  /** Typed payload — eliminates the `any` anti-pattern */
  payload:   ChatNotificationPayload;
}

export interface ChatNotificationPayload {
  sessionId:   string;
  messageType: MessageType;
  senderName?: string;
  /** ISO timestamp so the client can display relative time without a DB call */
  timestamp:   string;
}

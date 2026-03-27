import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { chatApi, authApi } from '@/utils/api';
import { socketService } from '@/services/socketService';
import { encryptMessageForRecipient } from '@/utils/encryption';
import { ChatMessage, ChatSession } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Paperclip,
  Lock,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatComponentProps {
  sessionId?: string;
  receiverId?: string;
  receiverName?: string;
  onSessionCreated?: (session: ChatSession) => void;
}

export function ChatComponent({
  sessionId: propSessionId,
  receiverId,
  receiverName,
  onSessionCreated,
}: ChatComponentProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const chatStore = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [receiverPublicKey, setReceiverPublicKey] = useState<string | null>(null);

  const currentSession = chatStore.currentSession;
  const messages = chatStore.messages;
  const isTyping = chatStore.isTyping;

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      if (propSessionId) {
        // Load existing session
        setIsLoading(true);
        try {
          const response = await chatApi.getSessionById(propSessionId);
          chatStore.setCurrentSession(response.data as ChatSession);

          // Load messages
          const messagesResponse = await chatApi.getMessages(propSessionId);
          chatStore.setMessages(messagesResponse.data.data as ChatMessage[]);

          // Join socket room
          socketService.joinSession(propSessionId);

          // Mark messages as read
          socketService.markAsRead(propSessionId);

          // Get receiver's public key
          const otherUser =
            (response.data as ChatSession).studentId === user?.id
              ? (response.data as ChatSession).therapistId
              : (response.data as ChatSession).studentId;

          if (otherUser) {
            const keyResponse = await authApi.getPublicKey(otherUser);
            setReceiverPublicKey(keyResponse.data.publicKey);
            chatStore.setPublicKey(otherUser, keyResponse.data.publicKey);
          }
        } catch (error) {
          console.error('Failed to load chat session:', error);
        } finally {
          setIsLoading(false);
        }
      } else if (receiverId) {
        // Create new session or find existing
        setIsLoading(true);
        try {
          // Get receiver's public key
          const keyResponse = await authApi.getPublicKey(receiverId);
          setReceiverPublicKey(keyResponse.data.publicKey);
          chatStore.setPublicKey(receiverId, keyResponse.data.publicKey);

          // Check if session already exists
          const sessionsResponse = await chatApi.getSessions();
          const existingSession = (sessionsResponse.data as ChatSession[]).find(
            (s) =>
              (s.studentId === user?.id && s.therapistId === receiverId) ||
              (s.studentId === receiverId && s.therapistId === user?.id)
          );

          if (existingSession) {
            chatStore.setCurrentSession(existingSession);
            const messagesResponse = await chatApi.getMessages(existingSession.id);
            chatStore.setMessages(messagesResponse.data.data as ChatMessage[]);
            socketService.joinSession(existingSession.id);
          }
        } catch (error) {
          console.error('Failed to initialize chat:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    initChat();

    return () => {
      if (currentSession?.id) {
        socketService.leaveSession(currentSession.id);
      }
      chatStore.setCurrentSession(null);
      chatStore.setMessages([]);
    };
  }, [propSessionId, receiverId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (currentSession?.id) {
      socketService.sendTyping(currentSession.id, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socketService.sendTyping(currentSession.id, false);
      }, 2000);
    }
  }, [currentSession?.id]);

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !receiverPublicKey) return;

    const tempId = `temp-${Date.now()}`;
    const messageContent = message.trim();

    try {
      // Encrypt message
      const encrypted = await encryptMessageForRecipient(messageContent, receiverPublicKey);

      // Add temporary message to UI
      const tempMessage: ChatMessage = {
        id: tempId,
        senderId: user!.id,
        receiverId: receiverId || currentSession?.studentId || currentSession?.therapistId || '',
        encryptedContent: messageContent, // Show original until confirmed
        encryptedKey: encrypted.encryptedKey,
        iv: encrypted.iv,
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      chatStore.addMessage(tempMessage);
      setMessage('');

      // Send via socket if session exists, otherwise create session first
      if (currentSession?.id) {
        socketService.sendMessage(currentSession.id, {
          ...encrypted,
          receiverId: tempMessage.receiverId,
          tempId,
        });
      } else if (receiverId) {
        // Create session first
        // This would require a separate API call to create session
        // For now, we'll just show the temp message
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle file attachment
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSession?.id) return;

    if (file.size > 10 * 1024 * 1024) {
      alert(t('chat.fileTooLarge'));
      return;
    }

    try {
      await chatApi.uploadAttachment(currentSession.id, file);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  // Get other participant's name
  const getOtherParticipantName = () => {
    if (receiverName) return receiverName;
    if (!currentSession) return '';

    const otherUser =
      currentSession.studentId === user?.id ? currentSession.therapist : currentSession.student;

    return otherUser?.name || t('chat.encrypted');
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render message status
  const renderMessageStatus = (msg: ChatMessage) => {
    if (msg.senderId !== user?.id) return null;

    if (msg.id.startsWith('temp-')) {
      return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
    }

    return msg.isRead ? (
      <CheckCheck className="h-3 w-3 text-blue-500" />
    ) : (
      <Check className="h-3 w-3 text-muted-foreground" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(getOtherParticipantName())}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{getOtherParticipantName()}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>{t('chat.encrypted')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Lock className="h-12 w-12 mb-4 opacity-50" />
            <p>{t('chat.noMessages')}</p>
            <p className="text-sm">{t('chat.startConversation')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isOwn = msg.senderId === user?.id;
              const showDate =
                index === 0 ||
                new Date(msg.createdAt).toDateString() !==
                  new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <Badge variant="secondary" className="text-xs">
                        {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                      </Badge>
                    </div>
                  )}
                  <div
                    className={cn(
                      'flex',
                      isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] px-4 py-2 rounded-2xl',
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      )}
                    >
                      <p className="text-sm">
                        {msg.encryptedContent || '[Encrypted]'}
                      </p>
                      <div
                        className={cn(
                          'flex items-center gap-1 mt-1',
                          isOwn ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <span className="text-xs opacity-70">
                          {format(new Date(msg.createdAt), 'h:mm a')}
                        </span>
                        {renderMessageStatus(msg)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm">
                  <span className="text-sm text-muted-foreground">
                    {t('chat.typing')}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={t('chat.typeMessage')}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !receiverPublicKey}
          >
            <Send className="h-4 w-4 mr-2" />
            {t('chat.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChatComponent;

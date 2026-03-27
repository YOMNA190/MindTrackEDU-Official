import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { chatApi } from '@/utils/api';
import { ChatComponent } from '@/components/chat/ChatComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  studentId: string;
  therapistId: string;
  therapist?: {
    name: string;
  };
  student?: {
    name: string;
  };
  lastMessageAt?: string;
  unreadCount?: number;
  isActive: boolean;
  lastMessage?: {
    encryptedContent: string;
    createdAt: string;
  };
}

export function StudentChat() {
  const { t } = useTranslation();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await chatApi.getSessions();
        setSessions(response.data as ChatSession[]);
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Sessions List */}
          <Card className="lg:col-span-1 h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('nav.chat')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4 pb-4">
                {sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedSession?.id === session.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(session.therapist?.name || 'T')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {session.therapist?.name || 'Therapist'}
                            </p>
                            {session.unreadCount ? (
                              <Badge variant="default" className="ml-2">
                                {session.unreadCount}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {session.lastMessage
                              ? session.lastMessage.encryptedContent.substring(0, 50)
                              : 'No messages yet'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.lastMessageAt
                              ? format(new Date(session.lastMessageAt), 'MMM d, h:mm a')
                              : ''}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-2">
                      No active chat sessions
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Request therapy to get matched with a therapist
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 h-full flex flex-col">
            {selectedSession ? (
              <ChatComponent
                sessionId={selectedSession.id}
                receiverId={selectedSession.therapistId}
                receiverName={selectedSession.therapist?.name}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">
                  Choose a therapist from the list to start chatting
                </p>
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

export default StudentChat;

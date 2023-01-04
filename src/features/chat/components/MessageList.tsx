/**
 * MessageList Component
 *
 * لیست پیام‌ها با auto-scroll و بارگذاری پیام‌های قدیمی
 *
 * @module features/chat/components/MessageList
 */

import { useEffect, useRef, useMemo } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useMessages } from '../hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { TypingIndicator } from './TypingIndicator';
import { useAuth } from '@/features/auth';
import type { Message } from '../types';

interface MessageListProps {
  roomId: string;
}

/**
 * Group messages by date for separators
 */
function groupMessagesByDate(messages: Message[]): Array<{ type: 'separator' | 'message'; key: string; message?: Message; date?: string }> {
  const items: Array<{ type: 'separator' | 'message'; key: string; message?: Message; date?: string }> = [];
  let lastDate: string | null = null;

  messages.forEach((message) => {
    const messageDate = new Date(message.createdAt).toLocaleDateString('fa-IR');

    if (messageDate !== lastDate) {
      items.push({
        type: 'separator',
        key: `separator-${messageDate}-${message.id}`,
        date: messageDate,
      });
      lastDate = messageDate;
    }

    items.push({
      type: 'message',
      key: message.id,
      message,
    });
  });

  return items;
}

export const MessageList: React.FC<MessageListProps> = ({ roomId }) => {
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    error,
    typingUsers,
    loadOlderMessages,
  } = useMessages(roomId);

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);

  /**
   * Filter out typing users who are not the current user
   */
  const activeTypingUsers = useMemo(() => {
    if (!user) return {};

    return Object.fromEntries(
      Object.entries(typingUsers).filter(([uid]) => uid !== user.uid)
    );
  }, [typingUsers, user]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({
        behavior: isFirstLoadRef.current ? 'auto' : 'smooth',
      });
      isFirstLoadRef.current = false;
    }
  }, [messages.length]);

  /**
   * Reset first load flag when room changes
   */
  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [roomId]);

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#e5ddd5',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: '#e5ddd5',
          p: 3,
        }}
      >
        <Typography color="error">{error.message}</Typography>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          تلاش مجدد
        </Button>
      </Box>
    );
  }

  const groupedItems = groupMessagesByDate(messages);

  return (
    <Box
      ref={containerRef}
      className="chat-background"
      sx={{
        flex: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Load older messages button */}
      {hasMoreMessages && messages.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={loadOlderMessages}
            disabled={isLoadingMore}
            startIcon={isLoadingMore ? <CircularProgress size={16} /> : null}
          >
            {isLoadingMore ? 'در حال بارگذاری...' : 'پیام‌های قدیمی‌تر'}
          </Button>
        </Box>
      )}

      {/* Empty state */}
      {messages.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            هنوز پیامی ارسال نشده. اولین پیام را ارسال کنید! 👋
          </Typography>
        </Box>
      )}

      {/* Messages with date separators */}
      {groupedItems.map((item) =>
        item.type === 'separator' ? (
          <DateSeparator key={item.key} date={item.date!} />
        ) : (
          <MessageBubble
            key={item.key}
            message={item.message!}
            isOwn={item.message!.senderId === user?.uid}
          />
        )
      )}

      {/* Typing indicator */}
      {Object.keys(activeTypingUsers).length > 0 && (
        <TypingIndicator users={activeTypingUsers} />
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </Box>
  );
};
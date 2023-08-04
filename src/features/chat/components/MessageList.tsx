/**
 * MessageList Component
 *
 * لیست پیام‌ها با Virtualization برای پرفورمنس بالا و auto-scroll
 *
 * @module features/chat/components/MessageList
 */

import { useEffect, useRef, useMemo } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
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

  const parentRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);

  const groupedItems = useMemo(() => groupMessagesByDate(messages), [messages]);

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
   * Virtualizer setup for high-performance rendering
   */
  const virtualizer = useVirtualizer({
    count: groupedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of a message bubble
    overscan: 5, // Render 5 extra items above and below the viewport
    paddingStart: 16,
    paddingEnd: 16,
  });

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (messages.length > 0 && !isLoadingMore) {
      virtualizer.scrollToIndex(groupedItems.length - 1, {
        align: 'end',
        behavior: isFirstLoadRef.current ? 'auto' : 'smooth',
      });
      isFirstLoadRef.current = false;
    }
  }, [messages.length, isLoadingMore, groupedItems.length, virtualizer]);

  /**
   * Reset first load flag when room changes
   */
  useEffect(() => {
    isFirstLoadRef.current = true;
  }, [roomId]);

  /**
   * Handle scroll to load older messages
   */
  const handleScroll = () => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const isNearTop = scrollElement.scrollTop < 150;
    if (isNearTop && hasMoreMessages && !isLoadingMore) {
      loadOlderMessages();
    }
  };

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

  return (
    <Box
      ref={parentRef}
      className="chat-background"
      onScroll={handleScroll}
      sx={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Load older messages button */}
      {hasMoreMessages && messages.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, pt: 1 }}>
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

      {/* Virtualized Messages List */}
      <Box
        sx={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = groupedItems[virtualItem.index];
          
          return (
            <Box
              key={item.key}
              ref={virtualizer.measureElement}
              data-index={virtualItem.index}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {item.type === 'separator' ? (
                <DateSeparator date={item.date!} />
              ) : (
                <MessageBubble
                  message={item.message!}
                  isOwn={item.message!.senderId === user?.uid}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Typing indicator */}
      {Object.keys(activeTypingUsers).length > 0 && (
        <Box sx={{ p: 1, bgcolor: 'transparent' }}>
          <TypingIndicator users={activeTypingUsers} />
        </Box>
      )}
    </Box>
  );
};
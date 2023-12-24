/**
 * MessageBubble Component
 *
 * حباب پیام با پشتیبانی از متن، تصویر و صدا
 *
 * @module features/chat/components/MessageBubble
 */

import { memo } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { Done as DoneIcon, DoneAll as DoneAllIcon, Error as ErrorIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import type { Message } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

/**
 * Message Status Icon
 */
const MessageStatus: React.FC<{ message: Message }> = ({ message }) => {
  if (message.isPending) {
    return <DoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />;
  }

  if (message.isFailed) {
    return <ErrorIcon sx={{ fontSize: 14, color: 'error.main' }} />;
  }

  if (message.seenBy.length > 1) {
    return <DoneAllIcon sx={{ fontSize: 14, color: '#53bdeb' }} />;
  }

  return <DoneAllIcon sx={{ fontSize: 14, color: 'text.secondary' }} />;
};

/**
 * Message Bubble Component (memoized for performance)
 */
export const MessageBubble = memo<MessageBubbleProps>(({ message, isOwn }) => {
  const time = format(new Date(message.createdAt), 'HH:mm', {
    locale: faIR,
  });

  const bubbleColor = isOwn ? '#dcf8c6' : '#ffffff';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
        px: 1,
      }}
    >
      {/* Sender avatar for others */}
      {!isOwn && (
        <Avatar
          src={message.senderPhoto || undefined}
          alt={message.senderName}
          sx={{ width: 32, height: 32, ml: 1, alignSelf: 'flex-end' }}
        >
          {message.senderName.charAt(0)}
        </Avatar>
      )}

      {/* Bubble */}
      <Box
        sx={{
          maxWidth: { xs: '85%', sm: '65%', md: '45%' },
          bgcolor: bubbleColor,
          borderRadius: 2,
          borderTopRightRadius: isOwn ? 0 : 8,
          borderTopLeftRadius: isOwn ? 8 : 0,
          p: 1,
          boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
          opacity: message.isPending ? 0.7 : 1,
          position: 'relative',
        }}
      >
        {/* Sender name (only for others) */}
        {!isOwn && (
          <Typography
            variant="caption"
            sx={{
              color: 'primary.dark',
              fontWeight: 'bold',
              display: 'block',
              mb: 0.5,
            }}
          >
            {message.senderName}
          </Typography>
        )}

        {/* Content based on type */}
        {message.type === 'text' && (
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              direction: 'rtl',
            }}
          >
            {message.content}
          </Typography>
        )}

        {message.type === 'image' && (
          <Box>
            <img
              src={message.content}
              alt="تصویر ارسالی"
              loading="lazy"
              style={{
                maxWidth: '100%',
                borderRadius: 8,
                display: 'block',
                cursor: 'pointer',
              }}
              onClick={() => window.open(message.content, '_blank')}
            />
          </Box>
        )}

        {message.type === 'audio' && (
          <AudioPlayer src={message.content} duration={message.duration || 0} />
        )}

        {/* Time and status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
            mt: 0.5,
          }}
        >
          <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary' }}>
            {time}
          </Typography>
          {isOwn && <MessageStatus message={message} />}
        </Box>
      </Box>
    </Box>
  );
});

MessageBubble.displayName = 'MessageBubble';
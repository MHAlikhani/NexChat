import { memo, useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import {
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { enUS, de } from 'date-fns/locale';
import type { Message } from '../types';
import { LinkPreview } from './LinkPreview';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  searchQuery?: string;
}

const localeMap: Record<string, Locale> = {
  fa: faIR,
  en: enUS,
  de: de,
};

const MessageStatus: React.FC<{ message: Message }> = ({ message }) => {
  if (message.isPending) {
    return <DoneIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />;
  }

  if (message.isFailed) {
    return <ErrorIcon sx={{ fontSize: 14, color: '#FF453A' }} />;
  }

  if (message.seenBy.length > 1) {
    return <DoneAllIcon sx={{ fontSize: 14, color: '#0A84FF' }} />;
  }

  return <DoneAllIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />;
};

const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

/**
 * Maximum message content length for which text highlighting is performed.
 * Messages longer than this threshold skip highlighting to avoid
 * performance degradation from creating many React elements.
 */
const MAX_HIGHLIGHT_LENGTH = 500;

export const MessageBubble = memo<MessageBubbleProps>(
  ({ message, isOwn, onReply, onDelete, searchQuery = '' }) => {
    const { t, i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const menuAnchorRef = useRef<HTMLButtonElement>(null);

    const time = format(new Date(message.createdAt), 'HH:mm', {
      locale: localeMap[i18n.language] || enUS,
    });

    /**
     * Memoized highlighted content.
     *
     * Only performs highlighting for messages under MAX_HIGHLIGHT_LENGTH
     * characters to avoid performance degradation on long messages.
     * The result is memoized to prevent unnecessary re-renders when
     * other props change.
     */
    const highlightedContent = useMemo(() => {
      // Skip highlighting for long messages to maintain performance
      if (!searchQuery || message.content.length > MAX_HIGHLIGHT_LENGTH) {
        return message.content;
      }

      const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = message.content.split(regex);

      return parts.map((part, i) =>
        regex.test(part) ? (
          <Box
            component="span"
            key={i}
            sx={{
              bgcolor: 'rgba(255, 159, 10, 0.3)',
              color: '#FF9F0A',
              borderRadius: 1,
              px: 0.5,
              fontWeight: 600,
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      );
    }, [message.content, searchQuery]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleReply = () => {
      onReply?.(message);
      handleMenuClose();
    };

    const handleDelete = () => {
      onDelete?.(message.id);
      handleMenuClose();
    };

    const urls = message.type === 'text' ? extractUrls(message.content) : [];
    const isSingleUrl =
      message.type === 'text' && urls.length === 1 && message.content.trim() === urls[0];

    return (
      <>
        <Box
          sx={{
            display: 'flex',
            justifyContent: isOwn ? 'flex-end' : 'flex-start',
            mb: 1,
            px: 2,
            position: 'relative',
            '&:hover .message-actions': {
              opacity: 1,
            },
          }}
        >
          {!isOwn && (
            <Avatar
              src={message.senderPhoto || undefined}
              alt={message.senderName}
              sx={{
                width: 32,
                height: 32,
                mr: 1.5,
                alignSelf: 'flex-end',
                bgcolor: 'rgba(94, 92, 230, 0.3)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {message.senderName.charAt(0)}
            </Avatar>
          )}

          <Box
            className={isOwn ? 'bubble-sent' : 'bubble-received'}
            sx={{
              maxWidth: { xs: '80%', sm: '60%', md: '45%' },
              px: 2,
              py: 1.5,
              opacity: message.isPending ? 0.7 : 1,
              position: 'relative',
              animation: 'slideUpFade 0.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
            }}
          >
            {/* Reply Quote */}
            {message.replyTo && (
              <Box
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  bgcolor: isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  borderLeft: isOwn ? 'none' : '3px solid #5E5CE6',
                  borderRight: isOwn ? '3px solid rgba(255,255,255,0.4)' : 'none',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: isOwn ? 'rgba(255,255,255,0.9)' : '#0A84FF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.75rem',
                  }}
                >
                  <ReplyIcon sx={{ fontSize: 12 }} />
                  {message.replyToSenderName || t('chat.user')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    color: isOwn ? 'rgba(255,255,255,0.7)' : '#8E8E93',
                    mt: 0.5,
                    lineHeight: 1.4,
                    fontSize: '0.8rem',
                  }}
                >
                  {message.replyToContent || t('chat.deletedMessage')}
                </Typography>
              </Box>
            )}

            {!isOwn && (
              <Typography
                variant="caption"
                sx={{
                  color: '#5E5CE6',
                  fontWeight: 600,
                  display: 'block',
                  mb: 0.5,
                  fontSize: '0.75rem',
                }}
              >
                {message.senderName}
              </Typography>
            )}

            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                direction: i18n.dir(),
                color: isOwn ? '#FFFFFF' : '#FFFFFF',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                fontWeight: 400,
              }}
            >
              {highlightedContent}
            </Typography>

            {/* Link Preview for single URL messages */}
            {isSingleUrl && (
              <Box sx={{ mt: 1 }}>
                <LinkPreview url={message.content} />
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                mt: 0.75,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  color: isOwn ? 'rgba(255,255,255,0.6)' : '#636366',
                  fontWeight: 500,
                }}
              >
                {time}
              </Typography>
              {isOwn && <MessageStatus message={message} />}
            </Box>

            {/* Action Menu for Own Messages */}
            {isOwn && !message.isPending && (
              <IconButton
                ref={menuAnchorRef}
                size="small"
                className="message-actions"
                onClick={handleMenuOpen}
                sx={{
                  position: 'absolute',
                  top: -8,
                  left: -8,
                  opacity: 0,
                  transition: 'opacity 0.15s ease',
                  bgcolor: 'rgba(28, 28, 30, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  color: '#8E8E93',
                  width: 28,
                  height: 28,
                  '&:hover': {
                    bgcolor: 'rgba(44, 44, 46, 0.95)',
                    color: '#FFFFFF',
                  },
                }}
              >
                <MoreVertIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2.5,
                bgcolor: 'rgba(28, 28, 30, 0.95)',
                backdropFilter: 'blur(30px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                minWidth: 140,
                mt: 0.5,
              },
            },
          }}
        >
          <MenuItem
            onClick={handleReply}
            sx={{
              py: 1.25,
              color: '#0A84FF',
              '&:hover': { bgcolor: 'rgba(10, 132, 255, 0.1)' },
            }}
          >
            <ReplyIcon fontSize="small" sx={{ mr: 1.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {t('chat.reply')}
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{
              py: 1.25,
              color: '#FF453A',
              '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.1)' },
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
              {t('common.delete')}
            </Typography>
          </MenuItem>
        </Menu>
      </>
    );
  }
);

MessageBubble.displayName = 'MessageBubble';

import { memo, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import type { Message } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { LinkPreview } from './LinkPreview';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  searchQuery?: string;
}

const MessageStatus: React.FC<{ message: Message }> = ({ message }) => {
  if (message.isPending) {
    return <DoneIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />;
  }

  if (message.isFailed) {
    return <ErrorIcon sx={{ fontSize: 14, color: '#FF6B6B' }} />;
  }

  if (message.seenBy.length > 1) {
    return <DoneAllIcon sx={{ fontSize: 14, color: '#00F0FF' }} />;
  }

  return <DoneAllIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }} />;
};

const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <Box component="span" key={i} sx={{ 
        bgcolor: 'rgba(255, 165, 0, 0.3)', 
        color: '#FFA500', 
        borderRadius: 1, 
        px: 0.5,
        fontWeight: 600,
        border: '1px solid rgba(255, 165, 0, 0.5)'
      }}>
        {part}
      </Box>
    ) : (
      part
    )
  );
};

const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

export const MessageBubble = memo<MessageBubbleProps>(({ message, isOwn, onReply, onDelete, searchQuery = '' }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const menuAnchorRef = useRef<HTMLButtonElement>(null);

  const time = format(new Date(message.createdAt), 'HH:mm', {
    locale: faIR,
  });

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
  const isSingleUrl = message.type === 'text' && urls.length === 1 && message.content.trim() === urls[0];

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: isOwn ? 'flex-start' : 'flex-end',
          mb: 1.5,
          px: 1,
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
              width: 36, 
              height: 36, 
              ml: 1.5, 
              alignSelf: 'flex-end',
              border: '2px solid rgba(112, 0, 255, 0.5)',
              boxShadow: '0 0 15px rgba(112, 0, 255, 0.2)',
              bgcolor: 'rgba(112, 0, 255, 0.2)'
            }}
          >
            {message.senderName.charAt(0)}
          </Avatar>
        )}

        <Box
          className={isOwn ? 'bubble-sent' : 'bubble-received'}
          sx={{
            maxWidth: { xs: '85%', sm: '65%', md: '45%' },
            p: 2,
            opacity: message.isPending ? 0.7 : 1,
            position: 'relative',
            animation: 'slideUpFade 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          {/* Reply Quote */}
          {message.replyTo && (
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                bgcolor: isOwn ? 'rgba(255,255,255,0.1)' : 'rgba(0, 240, 255, 0.05)',
                borderRadius: 2,
                borderRight: isOwn ? '3px solid rgba(0, 240, 255, 0.6)' : '3px solid #7000FF',
                backdropFilter: 'blur(5px)',
              }}
            >
              <Typography variant="caption" sx={{ 
                fontWeight: 700, 
                color: isOwn ? '#00F0FF' : '#9D4DFF', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                fontSize: '0.75rem',
                letterSpacing: '0.02em'
              }}>
                <ReplyIcon sx={{ fontSize: 14 }} />
                {message.replyToSenderName || 'کاربر'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  color: isOwn ? 'rgba(255,255,255,0.8)' : '#94A3B8',
                  mt: 0.5,
                  lineHeight: 1.5,
                  fontSize: '0.8rem',
                }}
              >
                {message.replyToContent || 'پیام حذف شده یا رسانه'}
              </Typography>
            </Box>
          )}

          {!isOwn && (
            <Typography
              variant="caption"
              sx={{
                color: '#9D4DFF',
                fontWeight: 700,
                display: 'block',
                mb: 1,
                fontSize: '0.8rem',
                letterSpacing: '0.02em',
              }}
            >
              {message.senderName}
            </Typography>
          )}

          {message.type === 'text' && (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                direction: 'rtl',
                color: isOwn ? '#F8FAFC' : '#E2E8F0',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              {highlightText(message.content, searchQuery)}
            </Typography>
          )}

          {message.type === 'image' && (
            <Box sx={{ mt: 1 }}>
              <img
                src={message.content}
                alt="تصویر ارسالی"
                loading="lazy"
                style={{
                  maxWidth: '100%',
                  borderRadius: 12,
                  display: 'block',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s ease',
                }}
                onClick={() => window.open(message.content, '_blank')}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </Box>
          )}

          {message.type === 'audio' && (
            <Box sx={{ mt: 1 }}>
              <AudioPlayer src={message.content} duration={message.duration || 0} />
            </Box>
          )}

          {/* Link Preview for single URL messages */}
          {isSingleUrl && (
            <Box sx={{ mt: 1.5 }}>
              <LinkPreview url={message.content} />
            </Box>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.75,
              mt: 1.5,
            }}
          >
            <Typography variant="caption" sx={{ 
              fontSize: '0.7rem', 
              color: isOwn ? 'rgba(255,255,255,0.6)' : '#64748B', 
              fontWeight: 500,
              letterSpacing: '0.02em'
            }}>
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
                top: -10,
                left: -10,
                opacity: 0,
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                color: '#94A3B8',
                '&:hover': { 
                  bgcolor: 'rgba(0, 240, 255, 0.1)',
                  color: '#00F0FF',
                  borderColor: 'rgba(0, 240, 255, 0.3)',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
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
              borderRadius: 3,
              bgcolor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.1)',
              minWidth: 150,
              mt: 1,
            }
          }
        }}
      >
        <MenuItem 
          onClick={handleReply}
          sx={{ 
            py: 1.5,
            color: '#00F0FF',
            '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.08)' }
          }}
        >
          <ReplyIcon fontSize="small" sx={{ ml: 1.5 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>پاسخ</Typography>
        </MenuItem>
        <MenuItem 
          onClick={handleDelete} 
          sx={{ 
            py: 1.5,
            color: '#FF6B6B',
            '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.08)' }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ ml: 1.5 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>حذف</Typography>
        </MenuItem>
      </Menu>
    </>
  );
});

MessageBubble.displayName = 'MessageBubble';
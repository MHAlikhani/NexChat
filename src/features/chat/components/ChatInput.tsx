import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, TextField, IconButton, Tooltip, Typography } from '@mui/material';
import { Send as SendIcon, Close as CloseIcon, Reply as ReplyIcon } from '@mui/icons-material';
import { useSendMessage } from '../hooks/useSendMessage';

import type { Message } from '../types';

interface ChatInputProps {
  roomId: string;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ roomId, replyingTo, onCancelReply }) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { sendTextMessage } = useSendMessage();

  /**
   * Use refs to track the latest values of state variables
   * without causing the callback to be recreated on every change.
   * This prevents unnecessary re-renders of child components that
   * depend on this callback (e.g., the send button).
   */
  const textRef = useRef(text);
  textRef.current = text;

  const isSendingRef = useRef(isSending);
  isSendingRef.current = isSending;

  /**
   * Send the current text message.
   *
   * Optimized to use refs for state values, so this callback
   * is NOT recreated on every keystroke. It only recreates when
   * roomId, sendTextMessage, replyingTo, or onCancelReply change.
   */
  const handleSendText = useCallback(async (): Promise<void> => {
    const trimmedText = textRef.current.trim();
    if (!trimmedText || isSendingRef.current) return;

    setText('');
    const currentReplyingTo = replyingTo;
    if (onCancelReply) onCancelReply();

    try {
      setIsSending(true);
      await sendTextMessage(
        roomId,
        trimmedText,
        currentReplyingTo
          ? {
              id: currentReplyingTo.id,
              content: currentReplyingTo.content,
              senderName: currentReplyingTo.senderName,
            }
          : undefined
      );
    } finally {
      setIsSending(false);
    }
  }, [roomId, sendTextMessage, replyingTo, onCancelReply]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        void handleSendText();
      }
    },
    [handleSendText]
  );

  return (
    <Box
      className="glass-panel"
      sx={{
        p: 2,
        mx: 2,
        mb: 2,
        borderRadius: 3,
      }}
    >
      {replyingTo && (
        <Box
          sx={{
            mb: 1.5,
            p: 1.5,
            bgcolor: 'rgba(10, 132, 255, 0.08)',
            borderRadius: 2,
            borderLeft: '3px solid #0A84FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'slideUpFade 0.15s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
          }}
        >
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: '#0A84FF',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.75rem',
              }}
            >
              <ReplyIcon sx={{ fontSize: 12 }} />
              {t('chat.replyTo', { name: replyingTo.senderName })}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: '#8E8E93',
                mt: 0.25,
                lineHeight: 1.4,
                fontSize: '0.8rem',
              }}
            >
              {replyingTo.content}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onCancelReply}
            sx={{
              ml: 1,
              color: '#8E8E93',
              '&:hover': {
                bgcolor: 'rgba(255, 69, 58, 0.1)',
                color: '#FF453A',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder={t('chat.typeMessage')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          inputProps={{ maxLength: 2000 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              bgcolor: 'rgba(118, 118, 128, 0.12)',
              border: 'none',
              transition: 'background-color 0.15s ease',
              '& fieldset': { border: 'none' },
              '&:hover': {
                bgcolor: 'rgba(118, 118, 128, 0.18)',
              },
              '&.Mui-focused': {
                bgcolor: 'rgba(118, 118, 128, 0.24)',
              },
              '& .MuiInputBase-input': {
                color: '#FFFFFF',
                py: 1.25,
                '&::placeholder': { color: '#636366', opacity: 1 },
              },
            },
          }}
        />

        <Tooltip title={t('chat.sendMessage')}>
          <span>
            <IconButton
              aria-label={t('chat.sendMessage')}
              onClick={() => void handleSendText()}
              disabled={isSending || !text.trim()}
              sx={{
                bgcolor: '#0A84FF',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#0A84FF',
                  opacity: 0.85,
                },
                transition: 'opacity 0.15s ease',
                mb: 0.25,
                '&.Mui-disabled': {
                  bgcolor: 'rgba(10, 132, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

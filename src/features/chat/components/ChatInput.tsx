import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, TextField, IconButton, Tooltip, Typography } from '@mui/material';
import {
  Send as SendIcon,
  PhotoCamera as CameraIcon,
  Mic as MicIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useSendMessage } from '../hooks/useSendMessage';
import {
  useAudioRecorder,
  MAX_RECORD_DURATION,
} from '../hooks/useAudioRecorder';
import { formatDuration } from '../utils/format';

import type { Message } from '../types';

interface ChatInputProps {
  roomId: string;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  roomId,
  replyingTo,
  onCancelReply,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingAudioRef = useRef(false);

  const { sendTextMessage, sendImageMessage, sendAudioMessage } =
    useSendMessage();

  const {
    isRecording,
    duration,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const handleSendText = useCallback(async (): Promise<void> => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

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
  }, [text, roomId, sendTextMessage, isSending, replyingTo, onCancelReply]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        void handleSendText();
      }
    },
    [handleSendText]
  );

  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error(t('chat.imageOnly'));
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    },
    [t]
  );

  const handleSendImage = useCallback(async (): Promise<void> => {
    if (!selectedImage || isSending) return;
    const file = selectedImage;

    try {
      setIsSending(true);
      await sendImageMessage(roomId, file);
    } finally {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setSelectedImage(null);
      setImagePreview(null);
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [selectedImage, imagePreview, roomId, sendImageMessage, isSending]);

  const handleCancelImage = useCallback((): void => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [imagePreview]);

  const handleStopRecording = useCallback(async (): Promise<void> => {
    if (isProcessingAudioRef.current) return;
    isProcessingAudioRef.current = true;

    try {
      const result = await stopRecording();
      if (result && result.duration >= 1) {
        await sendAudioMessage(roomId, result.blob, result.duration);
      } else {
        toast(t('chat.voiceTooShort'), { icon: '⚠️' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('chat.voiceError');
      toast.error(message);
    } finally {
      isProcessingAudioRef.current = false;
    }
  }, [stopRecording, sendAudioMessage, roomId, t]);

  useEffect(() => {
    if (isRecording && duration >= MAX_RECORD_DURATION) {
      void handleStopRecording();
    }
  }, [isRecording, duration, handleStopRecording]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (isRecording) {
    return (
      <Box
        className="glass-panel"
        sx={{
          p: 2,
          mx: 2,
          mb: 2,
          borderRadius: 3,
          border: '0.5px solid rgba(255, 69, 58, 0.3)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={t('chat.cancelRecording')}>
            <IconButton
              aria-label={t('chat.cancelRecording')}
              onClick={cancelRecording}
              disabled={isSending}
              sx={{
                color: '#FF453A',
                bgcolor: 'rgba(255, 69, 58, 0.12)',
                '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.2)' },
              }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: '#FF453A',
                animation: 'pulse-glow 1.5s infinite ease-in-out',
              }}
            />
            <Typography
              variant="body1"
              fontWeight="600"
              sx={{ color: '#FFFFFF' }}
            >
              {t('chat.recording')} {formatDuration(duration)}
            </Typography>
            {duration >= MAX_RECORD_DURATION - 10 && (
              <Typography
                variant="caption"
                sx={{ color: '#FF9F0A', fontWeight: 600, mr: 1 }}
              >
                {t('chat.secondsLeft', {
                  count: MAX_RECORD_DURATION - duration,
                })}
              </Typography>
            )}
          </Box>

          <Tooltip title={t('chat.sendVoice')}>
            <IconButton
              aria-label={t('chat.sendVoice')}
              onClick={() => void handleStopRecording()}
              disabled={isSending}
              sx={{
                bgcolor: '#0A84FF',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#0A84FF',
                  opacity: 0.85,
                },
                transition: 'opacity 0.15s ease',
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  }

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
              {replyingTo.type === 'text' ? replyingTo.content : t('chat.media')}
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

      {imagePreview && (
        <Box
          sx={{
            mb: 1.5,
            display: 'inline-block',
            animation: 'slideUpFade 0.15s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={imagePreview}
              alt={t('chat.imagePreview')}
              style={{
                maxWidth: 200,
                maxHeight: 160,
                borderRadius: 10,
                display: 'block',
                objectFit: 'cover',
              }}
            />
            <IconButton
              size="small"
              onClick={handleCancelImage}
              sx={{
                position: 'absolute',
                top: 6,
                left: 6,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                width: 24,
                height: 24,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Tooltip title={t('chat.sendImage')}>
              <IconButton
                onClick={() => void handleSendImage()}
                disabled={isSending}
                sx={{
                  bgcolor: '#0A84FF',
                  color: '#FFFFFF',
                  '&:hover': {
                    bgcolor: '#0A84FF',
                    opacity: 0.85,
                  },
                  transition: 'opacity 0.15s ease',
                }}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('common.cancel')}>
              <IconButton
                onClick={handleCancelImage}
                disabled={isSending}
                sx={{
                  color: '#FF453A',
                  bgcolor: 'rgba(255, 69, 58, 0.12)',
                  '&:hover': { bgcolor: 'rgba(255, 69, 58, 0.2)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />

        <Tooltip title={t('chat.sendImage')}>
          <IconButton
            aria-label={t('chat.sendImage')}
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            sx={{
              color: '#0A84FF',
              bgcolor: 'rgba(10, 132, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(10, 132, 255, 0.18)',
              },
              transition: 'background-color 0.15s ease',
              mb: 0.25,
            }}
          >
            <CameraIcon />
          </IconButton>
        </Tooltip>

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

        {text.trim() ? (
          <Tooltip title={t('chat.sendMessage')}>
            <IconButton
              aria-label={t('chat.sendMessage')}
              onClick={() => void handleSendText()}
              disabled={isSending}
              sx={{
                bgcolor: '#0A84FF',
                color: '#FFFFFF',
                '&:hover': {
                  bgcolor: '#0A84FF',
                  opacity: 0.85,
                },
                transition: 'opacity 0.15s ease',
                mb: 0.25,
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip
            title={
              isSupported ? t('chat.recordVoice') : t('chat.noVoiceSupport')
            }
          >
            <span>
              <IconButton
                aria-label={
                  isSupported ? t('chat.recordVoice') : t('chat.noVoiceSupport')
                }
                onClick={() => void startRecording()}
                disabled={isSending || !isSupported}
                sx={{
                  color: '#0A84FF',
                  bgcolor: 'rgba(10, 132, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(10, 132, 255, 0.18)',
                  },
                  transition: 'background-color 0.15s ease',
                  mb: 0.25,
                }}
              >
                <MicIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

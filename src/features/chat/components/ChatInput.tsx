import { useState, useRef, useCallback, useEffect } from 'react';

import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
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

export const ChatInput: React.FC<ChatInputProps> = ({ roomId, replyingTo, onCancelReply }) => {
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isProcessingAudioRef = useRef(false);

  const { sendTextMessage, sendImageMessage, sendAudioMessage } = useSendMessage();

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
        toast.error('لطفاً فقط فایل تصویری انتخاب کنید');
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    },
    []
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
        toast('پیام صوتی خیلی کوتاه است (حداقل ۱ ثانیه)', { icon: '⚠️' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'خطا در ارسال پیام صوتی';
      toast.error(message);
    } finally {
      isProcessingAudioRef.current = false;
    }
  }, [stopRecording, sendAudioMessage, roomId]);

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
          p: 2.5,
          mx: 3,
          mb: 3,
          borderRadius: 4,
          border: '1px solid rgba(255, 107, 107, 0.3)',
          boxShadow: '0 8px 32px rgba(255, 107, 107, 0.15)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="لغو ضبط">
            <IconButton
              aria-label="لغو ضبط"
              onClick={cancelRecording}
              disabled={isSending}
              sx={{
                color: '#FF6B6B',
                bgcolor: 'rgba(255, 107, 107, 0.1)',
                border: '1px solid rgba(255, 107, 107, 0.2)',
                '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.2)' }
              }}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: '#FF6B6B',
                animation: 'pulse-glow 1.5s infinite',
              }}
            />
            <Typography variant="body1" fontWeight="700" sx={{ color: '#F8FAFC', letterSpacing: '0.02em' }}>
              در حال ضبط... {formatDuration(duration)}
            </Typography>
            {duration >= MAX_RECORD_DURATION - 10 && (
              <Typography variant="caption" sx={{ color: '#FFA500', fontWeight: 700, mr: 1 }}>
                {MAX_RECORD_DURATION - duration} ثانیه باقی‌مانده
              </Typography>
            )}
          </Box>

          <Tooltip title="ارسال پیام صوتی">
            <IconButton
              aria-label="ارسال پیام صوتی"
              onClick={() => void handleStopRecording()}
              disabled={isSending}
              sx={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FFA500 100%)',
                color: '#0B0F19',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF8E8E 0%, #FFB833 100%)',
                  boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
        p: 2.5,
        mx: 3,
        mb: 3,
        borderRadius: 4,
        transition: 'all 0.3s ease',
      }}
    >
      {replyingTo && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            bgcolor: 'rgba(0, 240, 255, 0.05)',
            borderRadius: 2,
            borderRight: '3px solid #00F0FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'slideUpFade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}
        >
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#00F0FF', display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem' }}>
              <ReplyIcon sx={{ fontSize: 14 }} />
              پاسخ به {replyingTo.senderName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: '#94A3B8',
                mt: 0.5,
                lineHeight: 1.4,
                fontSize: '0.85rem',
              }}
            >
              {replyingTo.type === 'text' ? replyingTo.content : 'رسانه'}
            </Typography>
          </Box>
          <IconButton 
            size="small" 
            onClick={onCancelReply} 
            sx={{ 
              ml: 1,
              color: '#94A3B8',
              '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {imagePreview && (
        <Box sx={{ mb: 2, display: 'inline-block', animation: 'slideUpFade 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}>
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={imagePreview}
              alt="پیش‌نمایش تصویر"
              style={{
                maxWidth: 240,
                maxHeight: 180,
                borderRadius: 16,
                display: 'block',
                objectFit: 'cover',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            />
            <IconButton
              size="small"
              onClick={handleCancelImage}
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
                color: '#FF6B6B',
                border: '1px solid rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.2)', color: '#FF6B6B' },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
            <Tooltip title="ارسال تصویر">
              <IconButton
                onClick={() => void handleSendImage()}
                disabled={isSending}
                sx={{
                  background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
                  color: '#0B0F19',
                  boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66F9FF 0%, #9D4DFF 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 240, 255, 0.4)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="لغو">
              <IconButton
                onClick={handleCancelImage}
                disabled={isSending}
                sx={{
                  color: '#FF6B6B',
                  bgcolor: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  '&:hover': { bgcolor: 'rgba(255, 107, 107, 0.2)' },
                  transition: 'all 0.2s ease',
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />

        <Tooltip title="ارسال تصویر">
          <IconButton
            aria-label="ارسال تصویر"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            sx={{
              color: '#00F0FF',
              bgcolor: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              '&:hover': { bgcolor: 'rgba(0, 240, 255, 0.15)', transform: 'translateY(-2px)' },
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              mb: 0.5,
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
          placeholder="پیام خود را بنویسید..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          inputProps={{ maxLength: 2000 }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.3s ease',
              '& fieldset': { border: 'none' },
              '&:hover': { 
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
              },
              '&.Mui-focused': {
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid #00F0FF',
                boxShadow: '0 0 0 4px rgba(0, 240, 255, 0.1)',
              },
              '& .MuiInputBase-input': {
                color: '#F8FAFC',
                '&::placeholder': { color: '#64748B', opacity: 1 },
              }
            },
          }}
        />

        {text.trim() ? (
          <Tooltip title="ارسال پیام">
            <IconButton
              aria-label="ارسال پیام"
              onClick={() => void handleSendText()}
              disabled={isSending}
              sx={{
                background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
                color: '#0B0F19',
                boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #66F9FF 0%, #9D4DFF 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 240, 255, 0.4)',
                },
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                mb: 0.5,
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={isSupported ? 'ضبط پیام صوتی' : 'مرورگر شما از ضبط صدا پشتیبانی نمی‌کند'}>
            <span>
              <IconButton
                aria-label={isSupported ? 'ضبط پیام صوتی' : 'مرورگر شما از ضبط صدا پشتیبانی نمی‌کند'}
                onClick={() => void startRecording()}
                disabled={isSending || !isSupported}
                sx={{
                  color: '#00F0FF',
                  bgcolor: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  '&:hover': { 
                    bgcolor: 'rgba(0, 240, 255, 0.15)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  mb: 0.5,
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
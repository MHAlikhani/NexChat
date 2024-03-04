import { useState, useRef, useCallback, useEffect } from 'react';

import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  Paper,
} from '@mui/material';
import {
  Send as SendIcon,
  PhotoCamera as CameraIcon,
  Mic as MicIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useSendMessage } from '../hooks/useSendMessage';
import {
  useAudioRecorder,
  MAX_RECORD_DURATION,
} from '../hooks/useAudioRecorder';
import { formatDuration } from '../utils/format';

interface ChatInputProps {
  roomId: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ roomId }) => {
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

    try {
      setIsSending(true);
      await sendTextMessage(roomId, trimmedText);
    } finally {
      setIsSending(false);
    }
  }, [text, roomId, sendTextMessage, isSending]);

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
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setSelectedImage(null);
      setImagePreview(null);
      setIsSending(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectedImage, imagePreview, roomId, sendImageMessage, isSending]);

  const handleCancelImage = useCallback((): void => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [imagePreview]);

  const handleStopRecording = useCallback(async (): Promise<void> => {
    if (isProcessingAudioRef.current) return;
    isProcessingAudioRef.current = true;

    try {
      const result = await stopRecording();

      if (result && result.duration >= 1) {
        await sendAudioMessage(roomId, result.blob, result.duration);
      } else {
        toast('پیام صوتی خیلی کوتاه است (حداقل ۱ ثانیه)', {
          icon: '⚠️',
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'خطا در ارسال پیام صوتی';
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
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (isRecording) {
    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="لغو ضبط">
            <IconButton
              aria-label="لغو ضبط"
              color="error"
              onClick={cancelRecording}
              disabled={isSending}
            >
              <CancelIcon />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: 'error.main',
                animation: 'pulse 1s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.3 },
                  '100%': { opacity: 1 },
                },
              }}
            />

            <Typography variant="body1" fontWeight="bold">
              در حال ضبط... {formatDuration(duration)}
            </Typography>

            {duration >= MAX_RECORD_DURATION - 10 && (
              <Typography
                variant="caption"
                color="warning.main"
                sx={{ mr: 1 }}
              >
                {MAX_RECORD_DURATION - duration} ثانیه باقی‌مانده
              </Typography>
            )}
          </Box>

          <Tooltip title="ارسال پیام صوتی">
            <IconButton
              aria-label="ارسال پیام صوتی"
              color="primary"
              onClick={() => void handleStopRecording()}
              disabled={isSending}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 1.5 }}>
      {imagePreview && (
        <Box sx={{ mb: 1.5, display: 'inline-block' }}>
          <Box sx={{ position: 'relative' }}>
            <img
              src={imagePreview}
              alt="پیش‌نمایش تصویر"
              style={{
                maxWidth: 220,
                maxHeight: 160,
                borderRadius: 12,
                display: 'block',
                objectFit: 'cover',
              }}
            />

            <IconButton
              size="small"
              onClick={handleCancelImage}
              sx={{
                position: 'absolute',
                top: 4,
                left: 4,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Tooltip title="ارسال تصویر">
              <IconButton
                color="primary"
                onClick={() => void handleSendImage()}
                disabled={isSending}
              >
                <SendIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="لغو">
              <IconButton
                color="error"
                onClick={handleCancelImage}
                disabled={isSending}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
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
            },
          }}
        />

        {text.trim() ? (
          <Tooltip title="ارسال پیام">
            <IconButton
              aria-label="ارسال پیام"
              color="primary"
              onClick={() => void handleSendText()}
              disabled={isSending}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip
            title={
              isSupported
                ? 'ضبط پیام صوتی'
                : 'مرورگر شما از ضبط صدا پشتیبانی نمی‌کند'
            }
          >
            <span>
              <IconButton
                aria-label={isSupported ? 'ضبط پیام صوتی' : 'مرورگر شما از ضبط صدا پشتیبانی نمی‌کند'}
                color="primary"
                onClick={() => void startRecording()}
                disabled={isSending || !isSupported}
              >
                <MicIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
};

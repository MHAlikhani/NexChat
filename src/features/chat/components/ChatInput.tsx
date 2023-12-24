/**
 * ChatInput Component
 *
 * ورودی چت با پشتیبانی از:
 * - ارسال پیام متنی (با پشتیبانی از Enter و Shift+Enter)
 * - ارسال تصویر با پیش‌نمایش
 * - ضبط و ارسال پیام صوتی (با توقف خودکار در ۶۰ ثانیه)
 *
 * @module features/chat/components/ChatInput
 */

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
  /** شناسه اتاق فعال */
  roomId: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ roomId }) => {
  // ============================================
  // Local State
  // ============================================
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // ============================================
  // Refs
  // ============================================
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * جلوگیری از ارسال همزمان/دوبل پیام صوتی
   * (مثلاً وقتی کلیک کاربر و توقف خودکار همزمان رخ می‌دهند)
   */
  const isProcessingAudioRef = useRef(false);

  // ============================================
  // Hooks
  // ============================================
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

  // ============================================
  // Handlers: Text Message
  // ============================================

  /**
   * ارسال پیام متنی
   */
  const handleSendText = useCallback(async (): Promise<void> => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    // پاک کردن ورودی قبل از ارسال (برای تجربه کاربری سریع‌تر)
    setText('');

    try {
      setIsSending(true);
      await sendTextMessage(roomId, trimmedText);
    } finally {
      setIsSending(false);
    }
  }, [text, roomId, sendTextMessage, isSending]);

  /**
   * مدیریت کلیدها:
   * - Enter: ارسال پیام
   * - Shift+Enter: خط جدید
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        void handleSendText();
      }
    },
    [handleSendText]
  );

  // ============================================
  // Handlers: Image Message
  // ============================================

  /**
   * انتخاب تصویر از گالری
   */
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

  /**
   * ارسال تصویر انتخاب شده
   */
  const handleSendImage = useCallback(async (): Promise<void> => {
    if (!selectedImage || isSending) return;

    const file = selectedImage;

    try {
      setIsSending(true);
      await sendImageMessage(roomId, file);
    } finally {
      // پاکسازی حالت
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

  /**
   * لغو انتخاب تصویر
   */
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

  // ============================================
  // Handlers: Audio Message
  // ============================================

  /**
   * توقف ضبط و ارسال پیام صوتی
   *
   * از isProcessingAudioRef برای جلوگیری از ارسال دوبل استفاده می‌شود
   * (مثلاً وقتی توقف خودکار و کلیک کاربر همزمان رخ می‌دهند).
   */
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

  /**
   * توقف و ارسال خودکار وقتی ضبط به سقف ۶۰ ثانیه می‌رسد
   */
  useEffect(() => {
    if (isRecording && duration >= MAX_RECORD_DURATION) {
      void handleStopRecording();
    }
  }, [isRecording, duration, handleStopRecording]);

  // ============================================
  // Cleanup: آزادسازی پیش‌نمایش تصویر هنگام حذف
  // ============================================
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ============================================
  // Render: Recording Mode
  // ============================================
  if (isRecording) {
    return (
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* لغو ضبط */}
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

          {/* نشانگر ضبط */}
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

            {/* هشدار نزدیک شدن به سقف */}
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

          {/* ارسال پیام صوتی */}
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

  // ============================================
  // Render: Normal Mode
  // ============================================
  return (
    <Paper elevation={2} sx={{ p: 1.5 }}>
      {/* پیش‌نمایش تصویر انتخاب شده */}
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

            {/* دکمه حذف روی تصویر */}
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

          {/* دکمه‌های ارسال/لغو تصویر */}
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

      {/* ردیف ورودی اصلی */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {/* ورودی فایل مخفی */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />

        {/* دکمه انتخاب تصویر */}
        <Tooltip title="ارسال تصویر">
          <IconButton
            aria-label="ارسال تصویر"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <CameraIcon />
          </IconButton>
        </Tooltip>

        {/* ورودی متن */}
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

        {/* دکمه ارسال یا میکروفن */}
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
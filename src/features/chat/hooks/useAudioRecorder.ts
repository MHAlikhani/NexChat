/**
 * useAudioRecorder Hook
 *
 * ضبط صدا با استفاده از MediaRecorder API
 *
 * ویژگی‌ها:
 * - توقف خودکار در سقف ۶۰ ثانیه (محدودیت ذخیره در Firestore)
 * - مدیریت صحیح منابع (جلوگیری از نشت حافظه)
 * - استفاده از durationRef برای دسترسی به زمان دقیق در لحظه توقف
 * - پشتیبانی از لغو ضبط
 *
 * ⚠️ محدودیت: حداکثر ۶۰ ثانیه ضبط، به دلیل ذخیره در Firestore
 * (هر سند حداکثر ۱ مگابایت و ۶۰ ثانیه وبم ≈ ۳۰۰-۵۰۰ کیلوبایت)
 *
 * @module features/chat/hooks/useAudioRecorder
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * حداکثر مدت ضبط صدا (ثانیه)
 */
export const MAX_RECORD_DURATION = 60;

/**
 * نتیجه ضبط موفق
 */
export interface RecordingResult {
  blob: Blob;
  duration: number;
}

/**
 * useAudioRecorder Return Type
 */
export interface UseAudioRecorderReturn {
  /** آیا در حال ضبط است؟ */
  isRecording: boolean;

  /** مدت زمان ضبط به ثانیه */
  duration: number;

  /** خطای ضبط (در صورت وجود) */
  error: string | null;

  /** آیا مرورگر از ضبط پشتیبانی می‌کند؟ */
  isSupported: boolean;

  /** آیا به سقف مدت ضبط رسیده‌ایم؟ */
  isMaxDurationReached: boolean;

  /** شروع ضبط */
  startRecording: () => Promise<void>;

  /** توقف ضبط و بازگرداندن نتیجه */
  stopRecording: () => Promise<RecordingResult | null>;

  /** لغو ضبط (بدون بازگرداندن نتیجه) */
  cancelRecording: () => void;
}

/**
 * useAudioRecorder Hook
 *
 * @example
 * ```tsx
 * const { isRecording, duration, startRecording, stopRecording } = useAudioRecorder();
 * ```
 */
export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * durationRef برای دسترسی به زمان دقیق در لحظه توقف.
   * چون state به صورت ناهمگام به‌روز می‌شود، ممکن است مقدار
   * `duration` در زمان اجرای `stopRecording` قدیمی باشد.
   */
  const durationRef = useRef(0);

  /**
   * بررسی پشتیبانی مرورگر
   */
  const isSupported =
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia;

  /**
   * آیا به سقف مدت ضبط رسیده‌ایم؟
   */
  const isMaxDurationReached = duration >= MAX_RECORD_DURATION;

  /**
   * Helper: توقف تایمر
   */
  const cleanupTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * Helper: آزادسازی میکروفن
   */
  const cleanupStream = useCallback((): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  /**
   * Helper: بازنشانی کامل حالت هوک
   */
  const resetState = useCallback((): void => {
    setIsRecording(false);
    setDuration(0);
    durationRef.current = 0;
    chunksRef.current = [];
  }, []);

  /**
   * شروع ضبط صدا
   */
  const startRecording = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      const message = 'مرورگر شما از ضبط صدا پشتیبانی نمی‌کند';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setError(null);

      // درخواست دسترسی به میکروفن
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      // ایجاد ضبط‌کننده
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // جمع‌آوری داده‌های صوتی هر ۱۰۰ میلی‌ثانیه
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);
      durationRef.current = 0;

      // تایمر برای نمایش مدت ضبط
      timerRef.current = window.setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'دسترسی به میکروفن رد شد. لطفاً در تنظیمات مرورگر اجازه دهید.'
          : 'خطا در شروع ضبط صدا';

      setError(message);
      toast.error(message);
      cleanupStream();
    }
  }, [isSupported, cleanupStream]);

  /**
   * توقف ضبط و بازگرداندن نتیجه
   *
   * @returns فایل صوتی و مدت زمان، یا `null` در صورت لغو/خطا
   */
  const stopRecording = useCallback((): Promise<RecordingResult | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      // اگر ضبط‌کننده‌ای وجود ندارد یا از قبل متوقف شده
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        cleanupTimer();
        cleanupStream();
        resetState();
        resolve(null);
        return;
      }

      // ذخیره مدت زمان دقیق قبل از بازنشانی
      const finalDuration = durationRef.current;

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        cleanupTimer();
        cleanupStream();
        resetState();

        // اگر فایل خالی است (ضبط کمتر از ۱ ثانیه)
        if (blob.size === 0) {
          resolve(null);
          return;
        }

        resolve({ blob, duration: finalDuration });
      };

      mediaRecorder.stop();
    });
  }, [cleanupTimer, cleanupStream, resetState]);

  /**
   * لغو ضبط بدون بازگرداندن نتیجه
   */
  const cancelRecording = useCallback((): void => {
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      // جلوگیری از اجرای onstop
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
    }

    cleanupTimer();
    cleanupStream();
    resetState();

    toast('ضبط لغو شد', { icon: '🚫' });
  }, [cleanupTimer, cleanupStream, resetState]);

  /**
   * پاکسازی کامل منابع هنگام حذف هوک
   * (جلوگیری از نشت حافظه و باز ماندن میکروفن)
   */
  useEffect(() => {
    return () => {
      cleanupTimer();
      cleanupStream();

      const mediaRecorder = mediaRecorderRef.current;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = null;
        mediaRecorder.stop();
      }
    };
  }, [cleanupTimer, cleanupStream]);

  return {
    isRecording,
    duration,
    error,
    isSupported,
    isMaxDurationReached,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
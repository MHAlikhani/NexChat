import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

export const MAX_RECORD_DURATION = 60;

export interface RecordingResult {
  blob: Blob;
  duration: number;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  duration: number;
  error: string | null;
  isSupported: boolean;
  isMaxDurationReached: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordingResult | null>;
  cancelRecording: () => void;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const durationRef = useRef(0);

  const isSupported =
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia;

  const isMaxDurationReached = duration >= MAX_RECORD_DURATION;

  const cleanupTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback((): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const resetState = useCallback((): void => {
    setIsRecording(false);
    setDuration(0);
    durationRef.current = 0;
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      const message = 'مرورگر شما از ضبط صدا پشتیبانی نمی‌کند';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);
      durationRef.current = 0;

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

  const stopRecording = useCallback((): Promise<RecordingResult | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        cleanupTimer();
        cleanupStream();
        resetState();
        resolve(null);
        return;
      }

      const finalDuration = durationRef.current;

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });

        cleanupTimer();
        cleanupStream();
        resetState();

        if (blob.size === 0) {
          resolve(null);
          return;
        }

        resolve({ blob, duration: finalDuration });
      };

      mediaRecorder.stop();
    });
  }, [cleanupTimer, cleanupStream, resetState]);

  const cancelRecording = useCallback((): void => {
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = null;
      mediaRecorder.stop();
    }

    cleanupTimer();
    cleanupStream();
    resetState();

    toast('ضبط لغو شد', { icon: '🚫' });
  }, [cleanupTimer, cleanupStream, resetState]);

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

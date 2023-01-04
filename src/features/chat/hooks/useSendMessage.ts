/**
 * useSendMessage Hook
 *
 * ارسال پیام با Optimistic Updates
 * نسخه جدید: رسانه‌ها به صورت Base64 در Firestore ذخیره می‌شوند
 *
 * @module features/chat/hooks/useSendMessage
 */

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '../stores/chatStore';
import { messagesService } from '../services/messages.service';
import { mediaService } from '../services/media.service';
import { useAuth } from '@/features/auth';
import type { Message, MessageType } from '../types';

/**
 * useSendMessage Return Type
 */
export interface UseSendMessageReturn {
  sendTextMessage: (roomId: string, text: string) => Promise<void>;
  sendImageMessage: (roomId: string, file: File) => Promise<void>;
  sendAudioMessage: (
    roomId: string,
    audioBlob: Blob,
    duration: number
  ) => Promise<void>;
}

/**
 * useSendMessage Hook
 */
export const useSendMessage = (): UseSendMessageReturn => {
  const { user } = useAuth();

  /**
   * Create an optimistic message
   */
  const createOptimisticMessage = useCallback(
    (
      roomId: string,
      content: string,
      type: MessageType,
      extra: Partial<Message> = {}
    ): Message => {
      return {
        id: `temp-${uuidv4()}`,
        roomId,
        senderId: user?.uid || '',
        senderName: user?.displayName || 'کاربر',
        senderPhoto: user?.photoURL || null,
        type,
        content,
        createdAt: new Date().toISOString(),
        seenBy: [user?.uid || ''],
        isPending: true,
        isFailed: false,
        ...extra,
      };
    },
    [user]
  );

  /**
   * Send text message with optimistic update
   */
  const sendTextMessage = useCallback(
    async (roomId: string, text: string): Promise<void> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      // Step 1: Add optimistic message
      const optimisticMessage = createOptimisticMessage(
        roomId,
        trimmedText,
        'text'
      );

      useChatStore.getState().addMessage(optimisticMessage);

      try {
        // Step 2: Send to server
        const realMessageId = await messagesService.send(
          { roomId, content: trimmedText, type: 'text' },
          {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }
        );

        // Step 3: Replace optimistic message with real one
        useChatStore.getState().updateMessage(optimisticMessage.id, {
          id: realMessageId,
          isPending: false,
        });
      } catch (error) {
        // Step 4: Mark as failed on error
        useChatStore.getState().updateMessage(optimisticMessage.id, {
          isPending: false,
          isFailed: true,
        });

        const message =
          error instanceof Error ? error.message : 'ارسال ناموفق بود';
        toast.error(message);
      }
    },
    [user, createOptimisticMessage]
  );

  /**
   * Send image message (Base64 storage)
   */
  const sendImageMessage = useCallback(
    async (roomId: string, file: File): Promise<void> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      const toastId = toast.loading('در حال فشرده‌سازی و ارسال تصویر...');

      // نمایش فوری پیش‌نمایش محلی (Optimistic)
      const localUrl = URL.createObjectURL(file);
      const optimisticMessage = createOptimisticMessage(
        roomId,
        localUrl,
        'image',
        { fileName: file.name, fileSize: file.size } as Partial<Message>
      );

      useChatStore.getState().addMessage(optimisticMessage);

      try {
        // فشرده‌سازی و تبدیل به Data URL (بدون نیاز به Storage)
        const { url, size } = await mediaService.uploadImage(file);

        // ارسال پیام با Data URL در فیلد content
        const realMessageId = await messagesService.send(
          {
            roomId,
            content: url,
            type: 'image',
            fileName: file.name,
            fileSize: size,
          },
          {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }
        );

        // آزادسازی حافظه پیش‌نمایش محلی
        URL.revokeObjectURL(localUrl);

        // جایگزینی پیام خوش‌بینانه با پیام واقعی
        useChatStore.getState().updateMessage(optimisticMessage.id, {
          id: realMessageId,
          content: url,
          isPending: false,
        });

        toast.success('تصویر ارسال شد', { id: toastId });
      } catch (error) {
        URL.revokeObjectURL(localUrl);

        useChatStore.getState().updateMessage(optimisticMessage.id, {
          isPending: false,
          isFailed: true,
        });

        const message =
          error instanceof Error ? error.message : 'ارسال تصویر ناموفق بود';
        toast.error(message, { id: toastId });
      }
    },
    [user, createOptimisticMessage]
  );

  /**
   * Send audio message (Base64 storage)
   */
  const sendAudioMessage = useCallback(
    async (
      roomId: string,
      audioBlob: Blob,
      duration: number
    ): Promise<void> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      const toastId = toast.loading('در حال ارسال پیام صوتی...');

      const localUrl = URL.createObjectURL(audioBlob);
      const optimisticMessage = createOptimisticMessage(
        roomId,
        localUrl,
        'audio',
        { duration } as Partial<Message>
      );

      useChatStore.getState().addMessage(optimisticMessage);

      try {
        // تبدیل به Data URL (بدون نیاز به Storage)
        const { url, size } = await mediaService.uploadAudio(audioBlob);

        const realMessageId = await messagesService.send(
          {
            roomId,
            content: url,
            type: 'audio',
            fileSize: size,
            duration,
          },
          {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }
        );

        URL.revokeObjectURL(localUrl);

        useChatStore.getState().updateMessage(optimisticMessage.id, {
          id: realMessageId,
          content: url,
          isPending: false,
        });

        toast.success('پیام صوتی ارسال شد', { id: toastId });
      } catch (error) {
        URL.revokeObjectURL(localUrl);

        useChatStore.getState().updateMessage(optimisticMessage.id, {
          isPending: false,
          isFailed: true,
        });

        const message =
          error instanceof Error ? error.message : 'ارسال صوت ناموفق بود';
        toast.error(message, { id: toastId });
      }
    },
    [user, createOptimisticMessage]
  );

  return {
    sendTextMessage,
    sendImageMessage,
    sendAudioMessage,
  };
};
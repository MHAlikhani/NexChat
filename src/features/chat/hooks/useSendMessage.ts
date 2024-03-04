/**
 * useSendMessage Hook
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

export interface UseSendMessageReturn {
  sendTextMessage: (roomId: string, text: string) => Promise<void>;
  sendImageMessage: (roomId: string, file: File) => Promise<void>;
  sendAudioMessage: (
    roomId: string,
    audioBlob: Blob,
    duration: number
  ) => Promise<void>;
}

export const useSendMessage = (): UseSendMessageReturn => {
  const { user } = useAuth();

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

  const sendTextMessage = useCallback(
    async (roomId: string, text: string): Promise<void> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      const optimisticMessage = createOptimisticMessage(
        roomId,
        trimmedText,
        'text'
      );

      useChatStore.getState().addMessage(optimisticMessage);

      try {
        const realMessageId = await messagesService.send(
          { roomId, content: trimmedText, type: 'text' },
          {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
          }
        );

        useChatStore.getState().updateMessage(optimisticMessage.id, {
          id: realMessageId,
          isPending: false,
        });
      } catch (error) {
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

  const sendImageMessage = useCallback(
    async (roomId: string, file: File): Promise<void> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      const toastId = toast.loading('در حال فشرده‌سازی و ارسال تصویر...');

      const localUrl = URL.createObjectURL(file);
      const optimisticMessage = createOptimisticMessage(
        roomId,
        localUrl,
        'image',
        { fileName: file.name, fileSize: file.size } as Partial<Message>
      );

      useChatStore.getState().addMessage(optimisticMessage);

      try {
        const { url, size } = await mediaService.uploadImage(file);

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

        URL.revokeObjectURL(localUrl);

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

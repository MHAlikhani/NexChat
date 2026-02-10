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
import { useAuth } from '@/features/auth';
import type { Message, MessageType } from '../types';

export interface UseSendMessageReturn {
  sendTextMessage: (
    roomId: string,
    text: string,
    replyTo?: { id: string; content: string; senderName: string }
  ) => Promise<void>;
  deleteMessage: (roomId: string, messageId: string) => Promise<void>;
}

export const useSendMessage = (): UseSendMessageReturn => {
  const { user } = useAuth();

  const createOptimisticMessage = useCallback(
    (roomId: string, content: string, type: MessageType, extra: Partial<Message> = {}): Message => {
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
    async (
      roomId: string,
      text: string,
      replyTo?: { id: string; content: string; senderName: string }
    ): Promise<void> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      const optimisticMessage = createOptimisticMessage(
        roomId,
        trimmedText,
        'text',
        replyTo
          ? {
              replyTo: replyTo.id,
              replyToContent: replyTo.content,
              replyToSenderName: replyTo.senderName,
            }
          : undefined
      );

      useChatStore.getState().addMessage(optimisticMessage);

      try {
        const realMessageId = await messagesService.send(
          {
            roomId,
            content: trimmedText,
            type: 'text',
            replyTo: replyTo?.id,
            replyToContent: replyTo?.content,
            replyToSenderName: replyTo?.senderName,
          },
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

        const message = error instanceof Error ? error.message : 'ارسال ناموفق بود';
        toast.error(message);
      }
    },
    [user, createOptimisticMessage]
  );

  const deleteMessage = useCallback(
    async (roomId: string, messageId: string): Promise<void> => {
      if (!user) {
        toast.error('لطفاً ابتدا وارد شوید');
        return;
      }

      try {
        await messagesService.delete(roomId, messageId);
        useChatStore.getState().removeMessage(messageId);
        toast.success('پیام حذف شد');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'حذف ناموفق بود';
        toast.error(message);
      }
    },
    [user]
  );

  return {
    sendTextMessage,
    deleteMessage,
  };
};

/**
 * useMessages Hook
 *
 * @module features/chat/hooks/useMessages
 */

import { useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useChatStore, chatSelectors } from '../stores/chatStore';
import { messagesService } from '../services/messages.service';
import { useAuth } from '@/features/auth';
import type { Message } from '../types';

export interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  error: Error | null;
  typingUsers: Record<string, string>;
  loadOlderMessages: () => Promise<void>;
}

export const useMessages = (roomId: string | null): UseMessagesReturn => {
  const { user } = useAuth();

  const {
    messages,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    error,
    typingUsers,
  } = useChatStore(
    useShallow((state) => ({
      messages: chatSelectors.selectMessages(state),
      isLoading: chatSelectors.selectIsLoading(state),
      isLoadingMore: chatSelectors.selectIsLoadingMore(state),
      hasMoreMessages: chatSelectors.selectHasMoreMessages(state),
      error: chatSelectors.selectError(state),
      typingUsers: chatSelectors.selectTypingUsers(state),
    }))
  );

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const state = useChatStore.getState();
    state.setLoading(true);
    state.clearMessages();

    const unsubscribe = messagesService.subscribeToLatest(
      roomId,
      (newMessages) => {
        const currentState = useChatStore.getState();
        currentState.setMessages(newMessages);
        currentState.setLoading(false);
        currentState.setError(null);
      }
    );

    return () => {
      unsubscribe();
      useChatStore.getState().clearMessages();
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !user || messages.length === 0) {
      return;
    }

    const unseenIds = messages
      .filter(
        (m) => m.senderId !== user.uid && !m.seenBy.includes(user.uid)
      )
      .map((m) => m.id);

    if (unseenIds.length > 0) {
      messagesService.markAsSeen(roomId, unseenIds, user.uid);
    }
  }, [roomId, user, messages]);

  const loadOlderMessages = useCallback(async () => {
    if (!roomId) return;

    const state = useChatStore.getState();

    if (state.isLoadingMore || !state.hasMoreMessages) {
      return;
    }

    const currentMessages = state.messages;
    const firstMessage = currentMessages[0];

    if (!firstMessage) return;

    try {
      state.setLoadingMore(true);

      const result = await messagesService.loadOlderMessages(
        roomId,
        firstMessage.id
      );

      const currentState = useChatStore.getState();
      currentState.prependMessages(result.messages);
      currentState.setHasMoreMessages(result.hasMore);
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      useChatStore.getState().setLoadingMore(false);
    }
  }, [roomId]);

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMoreMessages,
    error,
    typingUsers,
    loadOlderMessages,
  };
};

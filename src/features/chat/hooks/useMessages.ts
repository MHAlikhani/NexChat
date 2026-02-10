/**
 * useMessages Hook
 *
 * @module features/chat/hooks/useMessages
 */

import { useEffect, useCallback, useRef } from 'react';
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

  const { messages, isLoading, isLoadingMore, hasMoreMessages, error, typingUsers } = useChatStore(
    useShallow((state) => ({
      messages: chatSelectors.selectMessages(state),
      isLoading: chatSelectors.selectIsLoading(state),
      isLoadingMore: chatSelectors.selectIsLoadingMore(state),
      hasMoreMessages: chatSelectors.selectHasMoreMessages(state),
      error: chatSelectors.selectError(state),
      typingUsers: chatSelectors.selectTypingUsers(state),
    }))
  );

  /**
   * Track which message IDs have already been marked as seen.
   *
   * This ref prevents redundant `markAsSeen` calls on every messages
   * array change (e.g., when new messages arrive or when typing
   * indicators cause re-renders). We only process NEW unseen IDs
   * that haven't been sent to the server yet.
   */
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  /**
   * Reset the seen tracker when the room changes, since message IDs
   * are specific to each room.
   */
  useEffect(() => {
    seenMessageIdsRef.current = new Set();
  }, [roomId]);

  /**
   * Subscribe to real-time message updates for the active room.
   * Clears messages when the room changes or the component unmounts.
   */
  useEffect(() => {
    if (!roomId) {
      return;
    }

    const state = useChatStore.getState();
    state.setLoading(true);
    state.clearMessages();

    const unsubscribe = messagesService.subscribeToLatest(roomId, (newMessages) => {
      const currentState = useChatStore.getState();
      currentState.setMessages(newMessages);
      currentState.setLoading(false);
      currentState.setError(null);
    });

    return () => {
      unsubscribe();
      useChatStore.getState().clearMessages();
    };
  }, [roomId]);

  /**
   * Mark newly received messages as seen.
   *
   * Optimized to only process messages that:
   * 1. Were NOT sent by the current user
   * 2. Have NOT already been marked as seen (tracked via ref)
   * 3. Are not already in the seenBy array
   *
   * Uses a ref to track processed IDs so this effect doesn't
   * re-fire unnecessarily when the messages array reference changes
   * due to Zustand updates or re-renders.
   */
  useEffect(() => {
    if (!roomId || !user || messages.length === 0) {
      return;
    }

    const newUnseenIds = messages
      .filter(
        (m) =>
          m.senderId !== user.uid &&
          !m.seenBy.includes(user.uid) &&
          !seenMessageIdsRef.current.has(m.id)
      )
      .map((m) => m.id);

    if (newUnseenIds.length > 0) {
      // Track these IDs as "being processed" to avoid duplicate calls
      newUnseenIds.forEach((id) => seenMessageIdsRef.current.add(id));

      messagesService.markAsSeen(roomId, newUnseenIds, user.uid);
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

      const result = await messagesService.loadOlderMessages(roomId, firstMessage.id);

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

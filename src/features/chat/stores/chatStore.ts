/**
 * Chat Store (Zustand)
 *
 * @module features/chat/stores/chatStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Message } from '../types';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  error: Error | null;
  typingUsers: Record<string, string>;
}

interface ChatActions {
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  prependMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setLoadingMore: (isLoadingMore: boolean) => void;
  setHasMoreMessages: (hasMore: boolean) => void;
  setError: (error: Error | null) => void;
  setTypingUser: (userId: string, displayName: string | null) => void;
  clearMessages: () => void;
}

type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isLoadingMore: false,
  hasMoreMessages: true,
  error: null,
  typingUsers: {},
};

export const useChatStore = create<ChatStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((state) => {
          const exists = state.messages.some((m) => m.id === message.id);
          if (exists) {
            return {
              messages: state.messages.map((m) =>
                m.id === message.id ? message : m
              ),
            };
          }
          return { messages: [...state.messages, message] };
        }),

      prependMessages: (olderMessages) =>
        set((state) => ({
          messages: [...olderMessages, ...state.messages],
        })),

      updateMessage: (messageId, updates) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
        })),

      removeMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setLoadingMore: (isLoadingMore) => set({ isLoadingMore }),

      setHasMoreMessages: (hasMore) => set({ hasMoreMessages: hasMore }),

      setError: (error) => set({ error }),

      setTypingUser: (userId, displayName) =>
        set((state) => {
          const rest = { ...state.typingUsers };
          delete rest[userId];

          if (displayName) {
            return { typingUsers: { ...rest, [userId]: displayName } };
          }

          return { typingUsers: rest };
        }),

      clearMessages: () => set({ messages: [], hasMoreMessages: true }),
    }),
    { name: 'ChatStore' }
  )
);

export const chatSelectors = {
  selectMessages: (state: ChatStore) => state.messages,
  selectIsLoading: (state: ChatStore) => state.isLoading,
  selectIsLoadingMore: (state: ChatStore) => state.isLoadingMore,
  selectHasMoreMessages: (state: ChatStore) => state.hasMoreMessages,
  selectError: (state: ChatStore) => state.error,
  selectTypingUsers: (state: ChatStore) => state.typingUsers,

  selectUnseenMessageIds: (state: ChatStore) => (currentUserId: string) =>
    state.messages
      .filter(
        (m) =>
          m.senderId !== currentUserId && !m.seenBy.includes(currentUserId)
      )
      .map((m) => m.id),
};

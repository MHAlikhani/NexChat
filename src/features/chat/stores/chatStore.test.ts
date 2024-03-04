/**
 * Chat Store Tests
 *
 * @module features/chat/stores/chatStore.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore, chatSelectors } from './chatStore';
import type { Message } from '../types';

describe('Chat Store', () => {
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      roomId: 'room-1',
      content: 'Hello!',
      senderId: 'user-1',
      senderName: 'Alice',
      senderPhoto: null,
      createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
      type: 'text',
      seenBy: ['user-1'],
    },
    {
      id: 'msg-2',
      roomId: 'room-1',
      content: 'Hi there!',
      senderId: 'user-2',
      senderName: 'Bob',
      senderPhoto: null,
      createdAt: new Date('2024-01-01T10:01:00Z').toISOString(),
      type: 'text',
      seenBy: ['user-2'],
    },
  ];

  beforeEach(() => {
    useChatStore.setState({
      messages: [],
      isLoading: false,
      isLoadingMore: false,
      hasMoreMessages: true,
      error: null,
      typingUsers: {},
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.hasMoreMessages).toBe(true);
      expect(state.typingUsers).toEqual({});
    });
  });

  describe('Message Management', () => {
    it('should set messages', () => {
      useChatStore.getState().setMessages(mockMessages);
      expect(useChatStore.getState().messages).toEqual(mockMessages);
    });

    it('should add a new message to the end', () => {
      useChatStore.getState().setMessages([mockMessages[0]]);

      const newMessage: Message = {
        id: 'msg-3',
        roomId: 'room-1',
        content: 'New message',
        senderId: 'user-1',
        senderName: 'Alice',
        senderPhoto: null,
        createdAt: new Date('2024-01-01T10:02:00Z').toISOString(),
        type: 'text',
        seenBy: [],
      };

      useChatStore.getState().addMessage(newMessage);

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(2);
      expect(state.messages[1]).toEqual(newMessage);
    });

    it('should prevent duplicate messages (optimistic update handling)', () => {
      useChatStore.getState().setMessages([mockMessages[0]]);

      const updatedMessage: Message = {
        ...mockMessages[0],
        content: 'Hello! (Updated)',
        seenBy: ['user-1', 'user-2'],
      };

      useChatStore.getState().addMessage(updatedMessage);

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].content).toBe('Hello! (Updated)');
      expect(state.messages[0].seenBy).toEqual(['user-1', 'user-2']);
    });

    it('should prepend older messages for pagination', () => {
      useChatStore.getState().setMessages([mockMessages[1]]);

      const olderMessages: Message[] = [mockMessages[0]];
      useChatStore.getState().prependMessages(olderMessages);

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(2);
      expect(state.messages[0].id).toBe('msg-1');
      expect(state.messages[1].id).toBe('msg-2');
    });

    it('should update an existing message', () => {
      useChatStore.getState().setMessages(mockMessages);

      useChatStore.getState().updateMessage('msg-1', {
        content: 'Edited message',
      });

      const state = useChatStore.getState();
      expect(state.messages[0].content).toBe('Edited message');
      expect(state.messages[1].content).toBe('Hi there!');
    });

    it('should remove a message', () => {
      useChatStore.getState().setMessages(mockMessages);

      useChatStore.getState().removeMessage('msg-1');

      const state = useChatStore.getState();
      expect(state.messages).toHaveLength(1);
      expect(state.messages[0].id).toBe('msg-2');
    });

    it('should clear all messages and reset hasMoreMessages', () => {
      useChatStore.getState().setMessages(mockMessages);
      useChatStore.getState().setHasMoreMessages(false);

      useChatStore.getState().clearMessages();

      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.hasMoreMessages).toBe(true);
    });
  });

  describe('Loading and Error States', () => {
    it('should manage loading states independently', () => {
      useChatStore.getState().setLoading(true);
      expect(useChatStore.getState().isLoading).toBe(true);

      useChatStore.getState().setLoadingMore(true);
      expect(useChatStore.getState().isLoadingMore).toBe(true);

      useChatStore.getState().setLoading(false);
      expect(useChatStore.getState().isLoading).toBe(false);
      expect(useChatStore.getState().isLoadingMore).toBe(true);
    });

    it('should set and clear errors', () => {
      const mockError = new Error('Network error');
      useChatStore.getState().setError(mockError);
      expect(useChatStore.getState().error).toBe(mockError);

      useChatStore.getState().setError(null);
      expect(useChatStore.getState().error).toBeNull();
    });
  });

  describe('Typing Users Management', () => {
    it('should add a typing user', () => {
      useChatStore.getState().setTypingUser('user-2', 'Bob');
      expect(useChatStore.getState().typingUsers).toEqual({ 'user-2': 'Bob' });
    });

    it('should update an existing typing user', () => {
      useChatStore.getState().setTypingUser('user-2', 'Bob');
      useChatStore.getState().setTypingUser('user-2', 'Robert');
      expect(useChatStore.getState().typingUsers).toEqual({ 'user-2': 'Robert' });
    });

    it('should remove a typing user when displayName is null', () => {
      useChatStore.getState().setTypingUser('user-2', 'Bob');
      useChatStore.getState().setTypingUser('user-3', 'Alice');

      useChatStore.getState().setTypingUser('user-2', null);

      expect(useChatStore.getState().typingUsers).toEqual({ 'user-3': 'Alice' });
    });
  });

  describe('Selectors', () => {
    it('selectUnseenMessageIds should return correct unseen messages', () => {
      const messagesWithSeen: Message[] = [
        {
          id: 'msg-1',
          roomId: 'room-1',
          content: 'Hello',
          senderId: 'user-2',
          senderName: 'Bob',
          senderPhoto: null,
          createdAt: new Date().toISOString(),
          type: 'text',
          seenBy: [],
        },
        {
          id: 'msg-2',
          roomId: 'room-1',
          content: 'Hi',
          senderId: 'user-1',
          senderName: 'Alice',
          senderPhoto: null,
          createdAt: new Date().toISOString(),
          type: 'text',
          seenBy: ['user-1'],
        },
        {
          id: 'msg-3',
          roomId: 'room-1',
          content: 'How are you?',
          senderId: 'user-2',
          senderName: 'Bob',
          senderPhoto: null,
          createdAt: new Date().toISOString(),
          type: 'text',
          seenBy: ['user-1'],
        },
      ];

      useChatStore.getState().setMessages(messagesWithSeen);

      const unseen = chatSelectors.selectUnseenMessageIds(useChatStore.getState())('user-1');
      expect(unseen).toEqual(['msg-1']);
    });
  });
});

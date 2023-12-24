/**
 * Chat Store Tests
 *
 * تست‌های جامع برای Zustand Chat Store
 * بررسی مدیریت پیام‌ها، وضعیت تایپ کردن و بهینه‌سازی‌ها
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
      content: 'Hello!',
      senderId: 'user-1',
      senderName: 'Alice',
      timestamp: new Date('2024-01-01T10:00:00Z'),
      type: 'text',
      seenBy: ['user-1'],
    },
    {
      id: 'msg-2',
      content: 'Hi there!',
      senderId: 'user-2',
      senderName: 'Bob',
      timestamp: new Date('2024-01-01T10:01:00Z'),
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
        content: 'New message',
        senderId: 'user-1',
        senderName: 'Alice',
        timestamp: new Date('2024-01-01T10:02:00Z'),
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
      
      // تلاش برای اضافه کردن پیام با همان ID اما با محتوای به‌روز شده (مثلاً پس از تأیید سرور)
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
      expect(state.messages[0].id).toBe('msg-1'); // قدیمی‌تر اول باشد
      expect(state.messages[1].id).toBe('msg-2');
    });

    it('should update an existing message', () => {
      useChatStore.getState().setMessages(mockMessages);
      
      useChatStore.getState().updateMessage('msg-1', {
        content: 'Edited message',
        isEdited: true,
      });
      
      const state = useChatStore.getState();
      expect(state.messages[0].content).toBe('Edited message');
      expect((state.messages[0] as any).isEdited).toBe(true);
      expect(state.messages[1].content).toBe('Hi there!'); // بدون تغییر
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
      expect(useChatStore.getState().isLoadingMore).toBe(true); // باید بدون تغییر بماند
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
          content: 'Hello',
          senderId: 'user-2',
          senderName: 'Bob',
          timestamp: new Date(),
          type: 'text',
          seenBy: [], // دیده نشده
        },
        {
          id: 'msg-2',
          content: 'Hi',
          senderId: 'user-1', // پیام خود کاربر
          senderName: 'Alice',
          timestamp: new Date(),
          type: 'text',
          seenBy: ['user-1'],
        },
        {
          id: 'msg-3',
          content: 'How are you?',
          senderId: 'user-2',
          senderName: 'Bob',
          timestamp: new Date(),
          type: 'text',
          seenBy: ['user-1'], // دیده شده
        },
      ];
      
      useChatStore.getState().setMessages(messagesWithSeen);
      
      const unseen = chatSelectors.selectUnseenMessageIds(useChatStore.getState())('user-1');
      expect(unseen).toEqual(['msg-1']);
    });
  });
});

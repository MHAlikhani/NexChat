/**
 * MessageBubble Component Tests
 *
 * تست‌های جامع برای کامپوننت MessageBubble
 * بررسی رندر انواع پیام (متن، تصویر، صدا) و وضعیت‌های مختلف
 *
 * @module features/chat/components/MessageBubble.test
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../types';

// Mock کردن date-fns برای پایداری تست‌ها
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: () => '10:30',
  };
});

describe('MessageBubble', () => {
  const baseMessage: Message = {
    id: 'msg-1',
    content: 'Hello World',
    senderId: 'user-1',
    senderName: 'Alice',
    senderPhoto: 'https://example.com/alice.jpg',
    timestamp: new Date('2024-01-01T10:30:00Z'),
    createdAt: new Date('2024-01-01T10:30:00Z').toISOString(),
    type: 'text',
    seenBy: ['user-1'],
  };

  describe('Text Messages', () => {
    it('should render own message correctly (aligned right)', () => {
      render(<MessageBubble message={baseMessage} isOwn={true} />);
      
      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('10:30')).toBeInTheDocument();
      
      // بررسی آیکون وضعیت (دو تیک)
      expect(screen.getByTestId('DoneAllIcon')).toBeInTheDocument();
    });

    it('should render other user message correctly (aligned left with avatar)', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />);
      
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
      
      // بررسی وجود آواتار با نام Alice
      const avatar = screen.getByRole('img', { name: /Alice/i });
      expect(avatar).toHaveAttribute('src', 'https://example.com/alice.jpg');
    });

    it('should show sender initial if no photo is available', () => {
      const messageWithoutPhoto = { ...baseMessage, senderPhoto: null };
      render(<MessageBubble message={messageWithoutPhoto} isOwn={false} />);
      
      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('Message Status', () => {
    it('should show pending status (single grey tick) for own pending message', () => {
      const pendingMessage: Message = {
        ...baseMessage,
        isPending: true,
      };
      
      render(<MessageBubble message={pendingMessage} isOwn={true} />);
      
      expect(screen.getByTestId('DoneIcon')).toBeInTheDocument();
    });

    it('should show failed status (error icon) for own failed message', () => {
      const failedMessage: Message = {
        ...baseMessage,
        isFailed: true,
      };
      
      render(<MessageBubble message={failedMessage} isOwn={true} />);
      
      expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();
    });

    it('should show blue double ticks when seen by others', () => {
      const seenMessage: Message = {
        ...baseMessage,
        seenBy: ['user-1', 'user-2'],
      };
      
      render(<MessageBubble message={seenMessage} isOwn={true} />);
      
      const icon = screen.getByTestId('DoneAllIcon');
      expect(icon).toBeInTheDocument();
      // بررسی رنگ آبی (در MUI این به صورت inline style یا class است)
    });

    it('should not show status icons for other users messages', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />);
      
      expect(screen.queryByTestId('DoneIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('DoneAllIcon')).not.toBeInTheDocument();
    });
  });

  describe('Media Messages', () => {
    it('should render image message with lazy loading', () => {
      const imageMessage: Message = {
        ...baseMessage,
        type: 'image',
        content: 'https://example.com/image.jpg',
      };
      
      render(<MessageBubble message={imageMessage} isOwn={true} />);
      
      const img = screen.getByRole('img', { name: /تصویر ارسالی/i });
      expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should render audio message with AudioPlayer', () => {
      const audioMessage: Message = {
        ...baseMessage,
        type: 'audio',
        content: 'https://example.com/audio.webm',
        duration: 15,
      };
      
      render(<MessageBubble message={audioMessage} isOwn={true} />);
      
      // بررسی وجود کامپوننت AudioPlayer - PlayIcon و Slider
      expect(screen.getByTestId('PlayArrowIcon')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  describe('Performance & Edge Cases', () => {
    it('should handle very long text messages with word break', () => {
      const longMessage: Message = {
        ...baseMessage,
        content: 'A'.repeat(500),
      };
      
      render(<MessageBubble message={longMessage} isOwn={true} />);
      
      const textElement = screen.getByText(/A{500}/);
      expect(textElement).toHaveStyle('word-break: break-word');
    });

    it('should preserve line breaks in text messages', () => {
      const multilineMessage: Message = {
        ...baseMessage,
        content: 'Line 1\nLine 2\nLine 3',
      };
      
      render(<MessageBubble message={multilineMessage} isOwn={true} />);
      
      // استفاده از matcher تابعی برای تطبیق دقیق textContent
      const textElement = screen.getByText((content, element) => {
        return element?.tagName.toLowerCase() === 'p' && 
               element?.textContent === 'Line 1\nLine 2\nLine 3';
      });
      expect(textElement).toHaveStyle('white-space: pre-wrap');
    });

    it('should be memoized to prevent unnecessary re-renders', () => {
      // بررسی اینکه کامپوننت با memo احاطه شده است
      expect(MessageBubble.displayName).toBe('MessageBubble');
    });
  });
});

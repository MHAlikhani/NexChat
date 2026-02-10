import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../types';

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
    roomId: 'room-1',
    content: 'Hello World',
    senderId: 'user-1',
    senderName: 'Alice',
    senderPhoto: 'https://example.com/alice.jpg',
    createdAt: new Date('2024-01-01T10:30:00Z').toISOString(),
    type: 'text',
    seenBy: ['user-1'],
  };

  describe('Text Messages', () => {
    it('should render own message correctly (aligned right)', () => {
      render(<MessageBubble message={baseMessage} isOwn={true} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('10:30')).toBeInTheDocument();
      expect(screen.getByTestId('DoneAllIcon')).toBeInTheDocument();
    });

    it('should render other user message correctly (aligned left with avatar)', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();

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
    });

    it('should not show status icons for other users messages', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />);

      expect(screen.queryByTestId('DoneIcon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('DoneAllIcon')).not.toBeInTheDocument();
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

      const textElement = screen.getByText((_content, element) => {
        return (
          element?.tagName.toLowerCase() === 'p' &&
          element?.textContent === 'Line 1\nLine 2\nLine 3'
        );
      });
      expect(textElement).toHaveStyle('white-space: pre-wrap');
    });

    it('should be memoized to prevent unnecessary re-renders', () => {
      expect(MessageBubble.displayName).toBe('MessageBubble');
    });
  });
});

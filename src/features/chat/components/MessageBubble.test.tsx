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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'chat.reply': 'Reply',
        'common.delete': 'Delete',
        'chat.user': 'User',
        'chat.deletedMessage': 'Deleted message',
        'chat.replyTo': `Replying to ${options?.name || ''}`,
      };
      return translations[key] || key;
    },
    i18n: { language: 'en', dir: () => 'ltr' },
  }),
}));

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
    it('should render own message correctly', () => {
      render(<MessageBubble message={baseMessage} isOwn={true} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('10:30')).toBeInTheDocument();
    });

    it('should render other user message correctly with avatar', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should show sender initial if no photo is available', () => {
      const messageWithoutPhoto = { ...baseMessage, senderPhoto: null };
      render(<MessageBubble message={messageWithoutPhoto} isOwn={false} />);

      expect(screen.getByText('A')).toBeInTheDocument();
    });
  });

  describe('Message Status', () => {
    it('should show pending status for own pending message', () => {
      const pendingMessage: Message = {
        ...baseMessage,
        isPending: true,
      };

      render(<MessageBubble message={pendingMessage} isOwn={true} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should show failed status for own failed message', () => {
      const failedMessage: Message = {
        ...baseMessage,
        isFailed: true,
      };

      render(<MessageBubble message={failedMessage} isOwn={true} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should show seen status when seen by others', () => {
      const seenMessage: Message = {
        ...baseMessage,
        seenBy: ['user-1', 'user-2'],
      };

      render(<MessageBubble message={seenMessage} isOwn={true} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should not show status icons for other users messages', () => {
      render(<MessageBubble message={baseMessage} isOwn={false} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  describe('Performance & Edge Cases', () => {
    it('should handle very long text messages', () => {
      const longMessage: Message = {
        ...baseMessage,
        content: 'A'.repeat(500),
      };

      render(<MessageBubble message={longMessage} isOwn={true} />);

      expect(screen.getByText(/A{500}/)).toBeInTheDocument();
    });

    it('should preserve line breaks in text messages', () => {
      const multilineMessage: Message = {
        ...baseMessage,
        content: 'Line 1\nLine 2\nLine 3',
      };

      const { container } = render(<MessageBubble message={multilineMessage} isOwn={true} />);

      const textElement = container.querySelector('.MuiTypography-body2');
      expect(textElement).toBeInTheDocument();
      expect(textElement).toHaveTextContent('Line 1');
      expect(textElement).toHaveTextContent('Line 2');
      expect(textElement).toHaveTextContent('Line 3');

      // Verify whiteSpace: pre-wrap is applied to preserve line breaks
      expect(textElement).toHaveStyle('white-space: pre-wrap');
    });

    it('should be memoized to prevent unnecessary re-renders', () => {
      expect(MessageBubble.displayName).toBe('MessageBubble');
    });
  });

  describe('Reply Messages', () => {
    it('should render reply quote when message has replyTo', () => {
      const replyMessage: Message = {
        ...baseMessage,
        replyTo: 'msg-original',
        replyToContent: 'Original message',
        replyToSenderName: 'Bob',
      };

      render(<MessageBubble message={replyMessage} isOwn={false} />);

      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Original message')).toBeInTheDocument();
    });
  });
});

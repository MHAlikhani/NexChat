import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInput } from './ChatInput';
import { useSendMessage } from '../hooks/useSendMessage';

vi.mock('../hooks/useSendMessage', () => ({
  useSendMessage: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'chat.typeMessage': 'Type a message...',
        'chat.sendMessage': 'Send Message',
      };
      return translations[key] || key;
    },
    i18n: { language: 'en', dir: () => 'ltr' },
  }),
}));

describe('ChatInput', () => {
  const mockSendTextMessage = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    (useSendMessage as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      sendTextMessage: mockSendTextMessage,
      deleteMessage: vi.fn(),
    });
  });

  it('should render correctly with text input and send button', () => {
    render(<ChatInput roomId="room-1" />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  describe('Text Messaging', () => {
    it('should send text message on Enter key', async () => {
      render(<ChatInput roomId="room-1" />);

      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'Hello World' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(mockSendTextMessage).toHaveBeenCalledWith('room-1', 'Hello World', undefined);
      });

      expect(input).toHaveValue('');
    });

    it('should NOT send message on Shift+Enter (allow new line)', async () => {
      render(<ChatInput roomId="room-1" />);

      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'Hello\nWorld' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });

      expect(mockSendTextMessage).not.toHaveBeenCalled();
    });

    it('should not send empty message', async () => {
      render(<ChatInput roomId="room-1" />);

      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(mockSendTextMessage).not.toHaveBeenCalled();
    });

    it('should send message when send button is clicked', async () => {
      render(<ChatInput roomId="room-1" />);

      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'Hello' } });

      const sendButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockSendTextMessage).toHaveBeenCalledWith('room-1', 'Hello', undefined);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should disable inputs while sending', async () => {
      mockSendTextMessage.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ChatInput roomId="room-1" />);

      const input = screen.getByPlaceholderText('Type a message...');
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(input).toBeDisabled();
    });
  });
});

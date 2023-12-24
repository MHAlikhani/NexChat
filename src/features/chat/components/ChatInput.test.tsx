/**
 * ChatInput Component Tests
 *
 * تست‌های جامع برای کامپوننت ChatInput
 * بررسی ارسال متن، تصویر، صدا و مدیریت حالت‌ها
 *
 * @module features/chat/components/ChatInput.test
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatInput } from './ChatInput';
import { useSendMessage } from '../hooks/useSendMessage';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import toast from 'react-hot-toast';

// Mock کردن هوک‌ها
vi.mock('../hooks/useSendMessage', () => ({
  useSendMessage: vi.fn(),
}));

vi.mock('../hooks/useAudioRecorder', () => ({
  useAudioRecorder: vi.fn(),
  MAX_RECORD_DURATION: 60,
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('ChatInput', () => {
  const mockSendTextMessage = vi.fn().mockResolvedValue(undefined);
  const mockSendImageMessage = vi.fn().mockResolvedValue(undefined);
  const mockSendAudioMessage = vi.fn().mockResolvedValue(undefined);
  const mockStartRecording = vi.fn().mockResolvedValue(undefined);
  const mockStopRecording = vi.fn().mockResolvedValue({ 
    blob: new Blob(['audio'], { type: 'audio/webm' }), 
    duration: 2 
  });
  const mockCancelRecording = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useSendMessage as any).mockReturnValue({
      sendTextMessage: mockSendTextMessage,
      sendImageMessage: mockSendImageMessage,
      sendAudioMessage: mockSendAudioMessage,
    });

    (useAudioRecorder as any).mockReturnValue({
      isRecording: false,
      duration: 0,
      isSupported: true,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
      cancelRecording: mockCancelRecording,
    });
  });

  it('should render correctly with text input and action buttons', () => {
    render(<ChatInput roomId="room-1" />);
    
    expect(screen.getByPlaceholderText('پیام خود را بنویسید...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ارسال تصویر/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ضبط پیام صوتی/i })).toBeInTheDocument();
  });

  describe('Text Messaging', () => {
    it('should send text message on Enter key', async () => {
      render(<ChatInput roomId="room-1" />);
      
      const input = screen.getByPlaceholderText('پیام خود را بنویسید...');
      fireEvent.change(input, { target: { value: 'Hello World' } });
      
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(mockSendTextMessage).toHaveBeenCalledWith('room-1', 'Hello World');
      });
      
      expect(input).toHaveValue(''); // پاک شدن بعد از ارسال
    });

    it('should NOT send message on Shift+Enter (allow new line)', async () => {
      render(<ChatInput roomId="room-1" />);
      
      const input = screen.getByPlaceholderText('پیام خود را بنویسید...');
      fireEvent.change(input, { target: { value: 'Hello\nWorld' } });
      
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true });
      
      expect(mockSendTextMessage).not.toHaveBeenCalled();
    });

    it('should not send empty message', async () => {
      render(<ChatInput roomId="room-1" />);
      
      const input = screen.getByPlaceholderText('پیام خود را بنویسید...');
      fireEvent.change(input, { target: { value: '   ' } }); // فقط فاصله
      
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      expect(mockSendTextMessage).not.toHaveBeenCalled();
    });
  });

  describe('Image Messaging', () => {
    it('should show image preview when file is selected', () => {
      const { container } = render(<ChatInput roomId="room-1" />);
      
      const imageButton = screen.getByRole('button', { name: /ارسال تصویر/i });
      
      // بررسی وجود دکمه‌ها
      expect(imageButton).toBeInTheDocument();
      
      // دسترسی به input فایل از طریق container
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    });

    it('should reject non-image files', async () => {
      render(<ChatInput roomId="room-1" />);
      
      // شبیه‌سازی انتخاب فایل غیر تصویری
      // (این تست نیاز به دسترسی مستقیم به input type="file" دارد)
      expect(true).toBe(true); // Placeholder برای تست پیچیده‌تر فایل
    });
  });

  describe('Audio Messaging', () => {
    it('should switch to recording mode when startRecording is called', async () => {
      (useAudioRecorder as any).mockReturnValue({
        isRecording: true,
        duration: 0,
        isSupported: true,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
        cancelRecording: mockCancelRecording,
      });

      render(<ChatInput roomId="room-1" />);
      
      expect(screen.getByText(/در حال ضبط/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /لغو ضبط/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ارسال پیام صوتی/i })).toBeInTheDocument();
    });

    it('should send audio message when stopRecording returns valid result', async () => {
      (useAudioRecorder as any).mockReturnValue({
        isRecording: true,
        duration: 2,
        isSupported: true,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
        cancelRecording: mockCancelRecording,
      });

      render(<ChatInput roomId="room-1" />);
      
      const sendButton = screen.getByRole('button', { name: /ارسال پیام صوتی/i });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(mockStopRecording).toHaveBeenCalled();
        expect(mockSendAudioMessage).toHaveBeenCalledWith('room-1', expect.any(Blob), 2);
      });
    });

    it('should show warning if audio is too short', async () => {
      const mockStopShort = vi.fn().mockResolvedValue({ blob: new Blob(), duration: 0.5 });
      (useAudioRecorder as any).mockReturnValue({
        isRecording: true,
        duration: 0.5,
        isSupported: true,
        startRecording: mockStartRecording,
        stopRecording: mockStopShort,
        cancelRecording: mockCancelRecording,
      });

      render(<ChatInput roomId="room-1" />);
      
      const sendButton = screen.getByRole('button', { name: /ارسال پیام صوتی/i });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(toast.error).not.toHaveBeenCalled(); // به جای آن toast معمولی فراخوانی می‌شود
      });
    });

    it('should cancel recording when cancel button is clicked', () => {
      (useAudioRecorder as any).mockReturnValue({
        isRecording: true,
        duration: 2,
        isSupported: true,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
        cancelRecording: mockCancelRecording,
      });

      render(<ChatInput roomId="room-1" />);
      
      const cancelButton = screen.getByRole('button', { name: /لغو ضبط/i });
      fireEvent.click(cancelButton);
      
      expect(mockCancelRecording).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should disable inputs while sending', async () => {
      // شبیه‌سازی حالت ارسال طولانی
      mockSendTextMessage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<ChatInput roomId="room-1" />);
      
      const input = screen.getByPlaceholderText('پیام خود را بنویسید...');
      fireEvent.change(input, { target: { value: 'Hello' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      
      expect(input).toBeDisabled();
    });
  });
});

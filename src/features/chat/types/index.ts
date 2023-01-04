/**
 * Chat Domain Types
 *
 * تمام تایپ‌های مربوط به فیچر پیام‌رسانی
 *
 * @module features/chat/types
 */

/**
 * Message Type
 */
export type MessageType = 'text' | 'image' | 'audio' | 'system';

/**
 * Message Entity - Domain Model
 */
export interface Message {
  /** شناسه یکتای پیام */
  id: string;

  /** شناسه اتاق */
  roomId: string;

  /** شناسه فرستنده */
  senderId: string;

  /** نام فرستنده (برای نمایش سریع) */
  senderName: string;

  /** آواتار فرستنده */
  senderPhoto: string | null;

  /** نوع پیام */
  type: MessageType;

  /** محتوای پیام (متن یا URL فایل) */
  content: string;

  /** تاریخ ارسال (ISO 8601) */
  createdAt: string;

  /** لیست کاربرانی که پیام را دیده‌اند */
  seenBy: string[];

  /** آیا پیام در حال ارسال است؟ (فقط برای Optimistic UI) */
  isPending?: boolean;

  /** آیا ارسال با خطا مواجه شد؟ */
  isFailed?: boolean;
}

/**
 * Message With Media - Extended Message
 */
export interface MediaMessage extends Message {
  type: 'image' | 'audio';

  /** نام فایل اصلی */
  fileName?: string;

  /** حجم فایل به بایت */
  fileSize?: number;

  /** مدت زمان صدا به ثانیه */
  duration?: number;

  /** ابعاد تصویر */
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Send Message Input
 */
export interface SendMessageInput {
  roomId: string;
  content: string;
  type: MessageType;
  fileName?: string;
  fileSize?: number;
  duration?: number;
}

/**
 * Chat State
 */
export interface ChatState {
  /** پیام‌های اتاق فعال */
  messages: Message[];

  /** آیا در حال بارگذاری پیام‌های اولیه است؟ */
  isLoading: boolean;

  /** آیا پیام‌های قدیمی‌تری وجود دارد؟ */
  hasMoreMessages: boolean;

  /** آیا در حال بارگذاری پیام‌های قدیمی است؟ */
  isLoadingMore: boolean;

  /** خطای چت */
  error: Error | null;

  /** کاربرانی که در حال تایپ هستند */
  typingUsers: Record<string, string>; // uid -> displayName
}

/**
 * Audio Recorder State
 */
export interface AudioRecorderState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}
/**
 * Rooms Domain Types
 *
 * تمام تایپ‌های مربوط به فیچر اتاق‌های چت
 *
 * @module features/rooms/types
 */

/**
 * Room Entity - Domain Model
 */
export interface Room {
  /** شناسه یکتای اتاق (Firestore Document ID) */
  id: string;

  /** نام اتاق */
  name: string;

  /** توضیحات اتاق */
  description?: string;

  /** URL آواتار اتاق */
  avatarUrl?: string;

  /** شناسه کاربر سازنده */
  creatorId: string;

  /** لیست شناسه اعضای اتاق */
  members: string[];

  /** تعداد اعضا (cached برای performance) */
  memberCount: number;

  /** نوع اتاق */
  type: RoomType;

  /** تاریخ ایجاد (ISO 8601) */
  createdAt: string;

  /** تاریخ آخرین فعالیت */
  lastActivityAt: string;

  /** آخرین پیام (cached برای preview) */
  lastMessage?: LastMessage;

  /** آیا اتاق فعال است؟ */
  isActive: boolean;
}

/**
 * Room Type
 */
export type RoomType = 'public' | 'private' | 'direct';

/**
 * Last Message Preview
 */
export interface LastMessage {
  /** شناسه پیام */
  id: string;

  /** محتوای پیام (متن کوتاه شده) */
  content: string;

  /** شناسه فرستنده */
  senderId: string;

  /** نام فرستنده (برای نمایش) */
  senderName: string;

  /** نوع پیام */
  type: MessageType;

  /** تاریخ ارسال */
  timestamp: string;
}

/**
 * Message Type (Shared with chat feature)
 */
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'system';

/**
 * Room Member
 */
export interface RoomMember {
  /** شناسه کاربر */
  uid: string;

  /** نام نمایشی */
  displayName: string;

  /** ایمیل */
  email: string;

  /** آواتار */
  photoURL: string | null;

  /** نقش در اتاق */
  role: 'creator' | 'admin' | 'member';

  /** تاریخ عضویت */
  joinedAt: string;

  /** وضعیت آنلاین */
  status: 'online' | 'offline' | 'away';

  /** آخرین بازدید */
  lastSeenAt: string;
}

/**
 * Room State
 */
export interface RoomState {
  /** اتاق انتخاب شده فعلی */
  activeRoomId: string | null;

  /** لیست اتاق‌ها (cached) */
  rooms: Room[];

  /** آیا در حال بارگذاری است؟ */
  isLoading: boolean;

  /** خطای بارگذاری */
  error: RoomError | null;

  /** آیا مودال ایجاد اتاق باز است؟ */
  isCreateModalOpen: boolean;

  /** متن جستجو */
  searchQuery: string;
}

/**
 * Room Error
 */
export interface RoomError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Create Room Input
 */
export interface CreateRoomInput {
  name: string;
  description?: string;
  type: RoomType;
  avatarFile?: File;
  initialMembers?: string[];
}

/**
 * Update Room Input
 */
export interface UpdateRoomInput {
  name?: string;
  description?: string;
  avatarUrl?: string;
  type?: RoomType;
  isActive?: boolean;
}
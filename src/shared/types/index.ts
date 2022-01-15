/**
 * Shared Type Definitions for NexChat
 * این فایل شامل تمام تایپ‌های مشترک بین فیچرهای مختلف است.
 */

// ==========================================
// User Types
// ==========================================
export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  lastSeen?: string;
  status: 'online' | 'offline' | 'away';
}

// ==========================================
// Room Types
// ==========================================
export interface Room {
  id: string;
  name: string;
  description?: string;
  creatorUid: string;
  participants: string[]; // Array of user UIDs
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  unreadCount: number;
}

// ==========================================
// Message Types
// ==========================================
export type MessageType = 'text' | 'image' | 'audio';

export interface Message {
  id: string;
  roomId: string;
  senderUid: string;
  content: string; // Text content or URL for media
  type: MessageType;
  timestamp: string;
  isRead: boolean;
  metadata?: {
    duration?: number; // For audio messages (in seconds)
    width?: number;    // For image messages
    height?: number;   // For image messages
  };
}

// ==========================================
// Error Types
// ==========================================
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ==========================================
// Utility Types
// ==========================================
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncReturnType<T extends (...args: any[]) => Promise<any>> = 
  T extends (...args: any[]) => Promise<infer R> ? R : any;
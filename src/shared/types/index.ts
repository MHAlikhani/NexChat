/**
 * Shared Type Definitions for NexChat
 *
 * @module shared/types
 */

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  lastSeen?: string;
  status: 'online' | 'offline' | 'away';
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  creatorUid: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  unreadCount: number;
}

export type MessageType = 'text' | 'image' | 'audio';

export interface Message {
  id: string;
  roomId: string;
  senderUid: string;
  content: string;
  type: MessageType;
  timestamp: string;
  isRead: boolean;
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
  };
}

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

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

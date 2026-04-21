/**
 * Shared Type Definitions for NexChat
 *
 * @module shared/types
 */

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string | null;
  createdAt: string;
  lastSeenAt?: string;
  status: 'online' | 'offline' | 'away';
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  members: string[];
  memberCount: number;
  createdAt: string;
  lastActivityAt: string;
  lastMessage?: LastMessage;
  isActive: boolean;
}

export type MessageType = 'text' | 'system';

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string | null;
  type: MessageType;
  content: string;
  createdAt: string;
  seenBy: string[];
  isPending?: boolean;
  isFailed?: boolean;
  replyTo?: string | null;
  replyToContent?: string | null;
  replyToSenderName?: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  timestamp: string;
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
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = T extends (
  ...args: unknown[]
) => Promise<infer R>
  ? R
  : never;

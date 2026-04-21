/**
 * Rooms Domain Types
 *
 * @module features/rooms/types
 */

export interface Room {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  creatorId: string;
  members: string[];
  memberCount: number;
  type: RoomType;
  createdAt: string;
  lastActivityAt: string;
  lastMessage?: LastMessage;
  isActive: boolean;
}

export type RoomType = 'public' | 'private' | 'direct';

export interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  timestamp: string;
}

export type MessageType = 'text' | 'system';

export interface CreateRoomInput {
  name: string;
  description?: string;
  type: RoomType;
  initialMembers?: string[];
}

export interface UpdateRoomInput {
  name?: string;
  description?: string;
  avatarUrl?: string;
  type?: RoomType;
  isActive?: boolean;
}

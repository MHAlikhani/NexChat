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

export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'system';

export interface RoomMember {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: 'creator' | 'admin' | 'member';
  joinedAt: string;
  status: 'online' | 'offline' | 'away';
  lastSeenAt: string;
}

export interface RoomState {
  activeRoomId: string | null;
  rooms: Room[];
  isLoading: boolean;
  error: RoomError | null;
  isCreateModalOpen: boolean;
  searchQuery: string;
}

export interface RoomError {
  code: string;
  message: string;
  details?: unknown;
}

export interface CreateRoomInput {
  name: string;
  description?: string;
  type: RoomType;
  avatarFile?: File;
  initialMembers?: string[];
}

export interface UpdateRoomInput {
  name?: string;
  description?: string;
  avatarUrl?: string;
  type?: RoomType;
  isActive?: boolean;
}

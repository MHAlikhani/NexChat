/**
 * Chat Domain Types
 *
 * @module features/chat/types
 */

export type MessageType = 'text' | 'image' | 'audio' | 'system';

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
  duration?: number;
  timestamp?: Date;
}

export interface MediaMessage extends Message {
  type: 'image' | 'audio';
  fileName?: string;
  fileSize?: number;
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface SendMessageInput {
  roomId: string;
  content: string;
  type: MessageType;
  fileName?: string;
  fileSize?: number;
  duration?: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  typingUsers: Record<string, string>;
}

export interface AudioRecorderState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
}

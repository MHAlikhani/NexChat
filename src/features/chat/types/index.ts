/**
 * Chat Domain Types
 *
 * @module features/chat/types
 */

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
  timestamp?: Date;
  editedAt?: string | null;
  // Reply/Quote fields
  replyTo?: string | null;
  replyToContent?: string | null;
  replyToSenderName?: string | null;
}

export interface SendMessageInput {
  roomId: string;
  content: string;
  type: MessageType;
  replyTo?: string;
  replyToContent?: string;
  replyToSenderName?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  typingUsers: Record<string, string>;
}

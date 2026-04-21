/**
 * Message Mappers (Adapter Pattern)
 *
 * @module features/chat/utils/mappers
 */

import type { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import type { Message } from '../types';

/**
 * Fallback sender name when not available in Firestore.
 * Using a constant here since mappers are called outside React context.
 */
const FALLBACK_SENDER_NAME = 'User';

/**
 * Map Firestore Document to Domain Message
 */
export const mapFirestoreDocToMessage = (
  docSnap: QueryDocumentSnapshot,
  roomId: string
): Message => {
  const data = docSnap.data() as Record<string, unknown>;

  return {
    id: docSnap.id,
    roomId,
    senderId: (data.senderId as string) || '',
    senderName: (data.senderName as string) || FALLBACK_SENDER_NAME,
    senderPhoto: (data.senderPhoto as string) || null,
    type: (data.type as Message['type']) || 'text',
    content: (data.content as string) || '',
    createdAt: convertTimestamp(data.createdAt as Timestamp) ?? new Date().toISOString(),
    seenBy: (data.seenBy as string[]) || [],
    isPending: false,
    isFailed: false,
    replyTo: (data.replyTo as string) || null,
    replyToContent: (data.replyToContent as string) || null,
    replyToSenderName: (data.replyToSenderName as string) || null,
    editedAt: convertTimestamp(data.editedAt as Timestamp),
  };
};

/**
 * Convert Firestore Timestamp to ISO string or null
 */
const convertTimestamp = (timestamp: unknown): string | null => {
  if (!timestamp) {
    return null;
  }

  if (typeof timestamp === 'string') {
    return timestamp;
  }

  if (typeof timestamp === 'object' && 'toDate' in (timestamp as object)) {
    return (timestamp as Timestamp).toDate().toISOString();
  }

  return null;
};

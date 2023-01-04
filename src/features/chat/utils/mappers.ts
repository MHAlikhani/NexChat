/**
 * Message Mappers (Adapter Pattern)
 *
 * @module features/chat/utils/mappers
 */

import type { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import type { Message } from '../types';

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
    senderName: (data.senderName as string) || 'کاربر ناشناس',
    senderPhoto: (data.senderPhoto as string) || null,
    type: (data.type as Message['type']) || 'text',
    content: (data.content as string) || '',
    createdAt: convertTimestamp(data.createdAt as Timestamp),
    seenBy: (data.seenBy as string[]) || [],
    isPending: false,
    isFailed: false,
  };
};

/**
 * Convert Firestore Timestamp to ISO string
 */
const convertTimestamp = (timestamp: unknown): string => {
  if (!timestamp) {
    return new Date().toISOString();
  }

  if (typeof timestamp === 'string') {
    return timestamp;
  }

  if (typeof timestamp === 'object' && 'toDate' in (timestamp as object)) {
    return (timestamp as Timestamp).toDate().toISOString();
  }

  return new Date().toISOString();
};
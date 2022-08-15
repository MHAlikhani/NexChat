/**
 * Room Mappers (Adapter Pattern)
 *
 * تبدیل بین Firestore Document و Domain Room
 *
 * @module features/rooms/utils/mappers
 */

import type { DocumentSnapshot } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';
import type { Room, LastMessage } from '../types';

/**
 * Map Firestore Document to Domain Room
 */
export const mapFirestoreDocToRoom = (
  doc: DocumentSnapshot
): Room => {
  const data = doc.data() as Record<string, unknown>;

  return {
    id: doc.id,
    name: data.name as string,
    description: (data.description as string) || '',
    avatarUrl: (data.avatarUrl as string) || undefined,
    creatorId: data.creatorId as string,
    members: (data.members as string[]) || [],
    memberCount: (data.memberCount as number) || 0,
    type: (data.type as Room['type']) || 'public',
    createdAt: convertTimestamp(data.createdAt as Timestamp),
    lastActivityAt: convertTimestamp(data.lastActivityAt as Timestamp),
    lastMessage: data.lastMessage ? mapLastMessage(data.lastMessage as Record<string, unknown>) : undefined,
    isActive: (data.isActive as boolean) ?? true,
  };
};

/**
 * Map Firestore timestamp to ISO string
 */
const convertTimestamp = (timestamp: Timestamp | null | undefined): string => {
  if (!timestamp) {
    return new Date().toISOString();
  }

  if (typeof timestamp === 'string') {
    return timestamp;
  }

  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as Timestamp).toDate().toISOString();
  }

  return new Date().toISOString();
};

/**
 * Map last message data
 */
const mapLastMessage = (data: Record<string, unknown>): LastMessage => {
  return {
    id: (data.id as string) || '',
    content: (data.content as string) || '',
    senderId: (data.senderId as string) || '',
    senderName: (data.senderName as string) || '',
    type: (data.type as LastMessage['type']) || 'text',
    timestamp: convertTimestamp(data.timestamp as Timestamp),
  };
};
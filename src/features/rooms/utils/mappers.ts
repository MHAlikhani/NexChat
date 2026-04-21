/**
 * Room Mappers (Adapter Pattern)
 *
 * @module features/rooms/utils/mappers
 */

import type { QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';
import type { Room } from '../types';

/**
 * Map Firestore Document to Domain Room
 */
export const mapFirestoreDocToRoom = (docSnap: QueryDocumentSnapshot): Room => {
  const data = docSnap.data() as Record<string, unknown>;

  return {
    id: docSnap.id,
    name: (data.name as string) || '',
    description: (data.description as string) || undefined,
    avatarUrl: (data.avatarUrl as string) || undefined,
    creatorId: (data.creatorId as string) || '',
    members: (data.members as string[]) || [],
    memberCount: (data.memberCount as number) || 0,
    type: (data.type as Room['type']) || 'public',
    createdAt: convertTimestamp(data.createdAt as Timestamp) ?? new Date().toISOString(),
    lastActivityAt: convertTimestamp(data.lastActivityAt as Timestamp) ?? new Date().toISOString(),
    lastMessage: (data.lastMessage as Room['lastMessage']) || undefined,
    isActive: (data.isActive as boolean) ?? true,
  };
};

/**
 * Convert Firestore Timestamp to ISO string or null
 */
const convertTimestamp = (timestamp: unknown): string | null => {
  if (!timestamp) return null;

  if (typeof timestamp === 'string') return timestamp;

  if (typeof timestamp === 'object' && 'toDate' in (timestamp as object)) {
    return (timestamp as Timestamp).toDate().toISOString();
  }

  return null;
};

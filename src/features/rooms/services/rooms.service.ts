/**
 * Rooms Service (Repository Pattern)
 *
 * @module features/rooms/services/rooms
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAt,
  endAt,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Room, CreateRoomInput, UpdateRoomInput, LastMessage } from '../types';
import { mapFirestoreDocToRoom } from '../utils/mappers';

const ROOMS_COLLECTION = 'rooms';

const ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'شما مجوز انجام این عملیات را ندارید',
  'not-found': 'اتاق مورد نظر یافت نشد',
  'already-exists': 'اتاقی با این نام از قبل وجود دارد',
  'invalid-argument': 'اطلاعات وارد شده نامعتبر است',
};

export const roomsService = {
  create: async (input: CreateRoomInput, creatorId: string): Promise<Room> => {
    try {
      const roomsRef = collection(db, ROOMS_COLLECTION);

      const roomData = {
        name: input.name.trim(),
        description: input.description?.trim() || '',
        type: input.type,
        creatorId,
        members: [creatorId, ...(input.initialMembers || [])],
        memberCount: 1 + (input.initialMembers?.length || 0),
        isActive: true,
        createdAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),
        lastMessage: null,
      };

      const docRef = await addDoc(roomsRef, roomData);
      const createdDoc = await getDoc(docRef);

      if (!createdDoc.exists()) {
        throw new Error('Room was created but document not found');
      }

      return mapFirestoreDocToRoom(createdDoc);
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  getAll: async (options?: {
    userId?: string;
    type?: Room['type'];
    limit?: number;
  }): Promise<Room[]> => {
    try {
      const roomsRef = collection(db, ROOMS_COLLECTION);
      let q = query(roomsRef, where('isActive', '==', true));

      if (options?.userId) {
        q = query(q, where('members', 'array-contains', options.userId));
      }

      if (options?.type) {
        q = query(q, where('type', '==', options.type));
      }

      q = query(q, orderBy('lastActivityAt', 'desc'));

      if (options?.limit) {
        q = query(q, limit(options.limit));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((docSnap) => mapFirestoreDocToRoom(docSnap));
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  getById: async (roomId: string): Promise<Room | null> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        return null;
      }

      return mapFirestoreDocToRoom(roomSnap);
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  update: async (roomId: string, input: UpdateRoomInput): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);

      const updateData: Record<string, unknown> = {};

      if (input.name !== undefined) updateData.name = input.name.trim();
      if (input.description !== undefined) updateData.description = input.description.trim();
      if (input.type !== undefined) updateData.type = input.type;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl;

      updateData.lastActivityAt = serverTimestamp();

      await updateDoc(roomRef, updateData);
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  delete: async (roomId: string): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomRef, {
        isActive: false,
        deletedAt: serverTimestamp(),
      });
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  deletePermanently: async (roomId: string): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await deleteDoc(roomRef);
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  join: async (roomId: string, userId: string): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomRef, {
        members: arrayUnion(userId),
        memberCount: increment(1),
        lastActivityAt: serverTimestamp(),
      });
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  leave: async (roomId: string, userId: string): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomRef, {
        members: arrayRemove(userId),
        memberCount: increment(-1),
        lastActivityAt: serverTimestamp(),
      });
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  updateLastMessage: async (roomId: string, message: LastMessage): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomRef, {
        lastMessage: message,
        lastActivityAt: serverTimestamp(),
      });
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  subscribeToAll: (
    callback: (rooms: Room[]) => void,
    options?: {
      userId?: string;
      limit?: number;
    }
  ): Unsubscribe => {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    let q = query(roomsRef, where('isActive', '==', true));

    if (options?.userId) {
      q = query(q, where('members', 'array-contains', options.userId));
    }

    q = query(q, orderBy('lastActivityAt', 'desc'));

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const rooms = snapshot.docs.map((docSnap) => mapFirestoreDocToRoom(docSnap));
        callback(rooms);
      },
      (error) => {
        console.error('Error in rooms subscription:', error);
        callback([]);
      }
    );
  },

  subscribeToOne: (roomId: string, callback: (room: Room | null) => void): Unsubscribe => {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);

    return onSnapshot(
      roomRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }
        callback(mapFirestoreDocToRoom(snapshot));
      },
      (error) => {
        console.error('Error in room subscription:', error);
        callback(null);
      }
    );
  },

  /**
   * Search rooms by name and description.
   *
   * PERFORMANCE NOTE: Firestore only supports prefix matching for string
   * queries (not substring search). For production full-text search,
   * consider integrating external services like Algolia or Meilisearch.
   *
   * This implementation:
   * 1. First attempts efficient Firestore prefix matching on room names
   *    using range queries (requires composite index on name + lastActivityAt)
   * 2. Falls back to client-side filtering if the Firestore query fails
   *    (e.g., missing composite index)
   *
   * @param queryText - The search query string
   * @param searchLimit - Maximum number of results to return (default: 20)
   */
  search: async (queryText: string, searchLimit = 20): Promise<Room[]> => {
    try {
      const normalizedQuery = queryText.trim();

      if (!normalizedQuery) {
        return [];
      }

      // Attempt Firestore prefix matching with range queries
      const roomsRef = collection(db, ROOMS_COLLECTION);

      const q = query(
        roomsRef,
        where('isActive', '==', true),
        orderBy('name'),
        startAt(normalizedQuery),
        endAt(normalizedQuery + '\uf8ff'),
        limit(searchLimit * 3) // Get extra results for case-insensitive filtering
      );

      const snapshot = await getDocs(q);
      const candidates = snapshot.docs.map((docSnap) => mapFirestoreDocToRoom(docSnap));

      // Client-side filter for case-insensitive matching + description search
      const lowerQuery = normalizedQuery.toLowerCase();
      const results = candidates.filter(
        (room) =>
          room.name.toLowerCase().includes(lowerQuery) ||
          room.description?.toLowerCase().includes(lowerQuery)
      );

      // If Firestore prefix matching returned few results, supplement
      // with client-side search on the broader dataset
      if (results.length < searchLimit) {
        const allRooms = await roomsService.getAll({ limit: 100 });
        const additionalResults = allRooms.filter(
          (room) =>
            !results.some((r) => r.id === room.id) &&
            (room.name.toLowerCase().includes(lowerQuery) ||
              room.description?.toLowerCase().includes(lowerQuery))
        );

        return [...results, ...additionalResults].slice(0, searchLimit);
      }

      return results.slice(0, searchLimit);
    } catch {
      // Fallback: if Firestore query fails (e.g., missing composite index),
      // fall back to full client-side search
      try {
        const allRooms = await roomsService.getAll({ limit: 100 });
        const lowerQuery = queryText.toLowerCase().trim();

        return allRooms
          .filter(
            (room: Room) =>
              room.name.toLowerCase().includes(lowerQuery) ||
              room.description?.toLowerCase().includes(lowerQuery)
          )
          .slice(0, searchLimit);
      } catch (fallbackError) {
        throw normalizeRoomError(fallbackError);
      }
    }
  },
};

function normalizeRoomError(error: unknown): Error {
  if (error && typeof error === 'object' && 'code' in error) {
    const firestoreError = error as { code: string; message: string };
    const userMessage = ERROR_MESSAGES[firestoreError.code] || firestoreError.message;

    const err = new Error(userMessage);
    (err as Error & { code?: string }).code = firestoreError.code;
    return err;
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('خطای ناشناخته‌ای رخ داد');
}

/**
 * Rooms Service (Repository Pattern)
 *
 * این لایه، جزئیات Firestore را از Business Logic پنهان می‌کند.
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

/**
 * Collection Names
 */
const ROOMS_COLLECTION = 'rooms';

/**
 * Error Messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'شما مجوز انجام این عملیات را ندارید',
  'not-found': 'اتاق مورد نظر یافت نشد',
  'already-exists': 'اتاقی با این نام از قبل وجود دارد',
  'invalid-argument': 'اطلاعات وارد شده نامعتبر است',
};

/**
 * Rooms Service API
 */
export const roomsService = {
  /**
   * Create a new room
   */
  create: async (
    input: CreateRoomInput,
    creatorId: string
  ): Promise<Room> => {
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

  /**
   * Get all rooms (with optional filters)
   */
  getAll: async (options?: {
    type?: Room['type'];
    limit?: number;
  }): Promise<Room[]> => {
    try {
      const roomsRef = collection(db, ROOMS_COLLECTION);
      let q = query(roomsRef, where('isActive', '==', true));

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

  /**
   * Get a single room by ID
   */
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

  /**
   * Update room details
   */
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

  /**
   * Delete a room (soft delete)
   */
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

  /**
   * Permanently delete a room
   */
  deletePermanently: async (roomId: string): Promise<void> => {
    try {
      const roomRef = doc(db, ROOMS_COLLECTION, roomId);
      await deleteDoc(roomRef);
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },

  /**
   * Join a room (Optimized)
   *
   * از increment استفاده می‌کنیم تا نیاز به fetch کردن اتاق نباشد
   */
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

  /**
   * Leave a room (Optimized)
   *
   * از increment(-1) استفاده می‌کنیم تا نیاز به fetch کردن اتاق نباشد
   */
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

  /**
   * Update last message (called when a new message is sent)
   */
  updateLastMessage: async (
    roomId: string,
    message: LastMessage
  ): Promise<void> => {
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

  /**
   * Subscribe to real-time room updates (Observer Pattern)
   */
  subscribeToAll: (
    callback: (rooms: Room[]) => void,
    options?: {
      userId?: string;
      limit?: number;
    }
  ): Unsubscribe => {
    const roomsRef = collection(db, ROOMS_COLLECTION);
    let q = query(roomsRef, where('isActive', '==', true));

    // فیلتر members در server-side (مهم برای Security Rules)
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

  /**
   * Subscribe to a single room
   */
  subscribeToOne: (
    roomId: string,
    callback: (room: Room | null) => void
  ): Unsubscribe => {
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
   * Search rooms
   *
   * توجه: Firestore از full-text search پشتیبانی نمی‌کند.
   * این یک پیاده‌سازی ساده client-side است.
   * برای production، از Algolia یا Typesense استفاده کنید.
   */
  search: async (queryText: string, searchLimit = 20): Promise<Room[]> => {
    try {
      const allRooms = await roomsService.getAll({ limit: 100 });

      const normalizedQuery = queryText.toLowerCase().trim();

      return allRooms
        .filter((room: Room) => {
          const nameMatch = room.name.toLowerCase().includes(normalizedQuery);
          const descMatch = room.description?.toLowerCase().includes(normalizedQuery);
          return nameMatch || descMatch;
        })
        .slice(0, searchLimit);
    } catch (error) {
      throw normalizeRoomError(error);
    }
  },
};

/**
 * Helper: Normalize Firestore errors to domain Error
 */
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
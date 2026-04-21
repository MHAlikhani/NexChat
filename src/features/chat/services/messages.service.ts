/**
 * Messages Service (Repository Pattern)
 *
 * @module features/chat/services/messages
 */

import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  writeBatch,
  type Unsubscribe,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import i18n from '@/lib/i18n';
import type { Message, SendMessageInput } from '../types';
import { mapFirestoreDocToMessage } from '../utils/mappers';

const ROOMS_COLLECTION = 'rooms';
const MESSAGES_SUBCOLLECTION = 'messages';
const MESSAGES_PER_PAGE = 50;
const DELETE_BATCH_SIZE = 400;
// Firestore batch limit is 500 ops. We use 400 for safety margin.
const MARK_AS_SEEN_BATCH_SIZE = 400;

export interface LastMessagePayload {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  type: string;
  timestamp: string;
}

export interface MessageSender {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

export const messagesService = {
  send: async (input: SendMessageInput, sender: MessageSender): Promise<string> => {
    try {
      const messagesRef = collection(db, ROOMS_COLLECTION, input.roomId, MESSAGES_SUBCOLLECTION);

      const messageData: Record<string, unknown> = {
        roomId: input.roomId,
        senderId: sender.uid,
        senderName: sender.displayName,
        senderPhoto: sender.photoURL,
        type: input.type,
        content: input.content,
        seenBy: [sender.uid],
        createdAt: serverTimestamp(),
      };

      if (input.replyTo) messageData.replyTo = input.replyTo;
      if (input.replyToContent) messageData.replyToContent = input.replyToContent;
      if (input.replyToSenderName) messageData.replyToSenderName = input.replyToSenderName;

      const docRef = await addDoc(messagesRef, messageData);

      const lastMessage: LastMessagePayload = {
        id: docRef.id,
        content: input.content,
        senderId: sender.uid,
        senderName: sender.displayName,
        type: input.type,
        timestamp: new Date().toISOString(),
      };

      await updateRoomLastMessage(input.roomId, lastMessage);

      return docRef.id;
    } catch (error) {
      throw normalizeMessageError(error);
    }
  },

  subscribeToLatest: (
    roomId: string,
    callback: (messages: Message[]) => void,
    messageLimit: number = MESSAGES_PER_PAGE
  ): Unsubscribe => {
    const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION);

    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(messageLimit));

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs
          .map((docSnap) => mapFirestoreDocToMessage(docSnap, roomId))
          .reverse();

        callback(messages);
      },
      (error) => {
        console.error('Error in messages subscription:', error);
        callback([]);
      }
    );
  },

  loadOlderMessages: async (
    roomId: string,
    lastMessageId: string
  ): Promise<{ messages: Message[]; hasMore: boolean }> => {
    try {
      const lastMessageDoc = await getMessageDocById(roomId, lastMessageId);

      if (!lastMessageDoc) {
        return { messages: [], hasMore: false };
      }

      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION);

      const q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastMessageDoc),
        limit(MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(q);

      const messages = snapshot.docs
        .map((docSnap) => mapFirestoreDocToMessage(docSnap, roomId))
        .reverse();

      return {
        messages,
        hasMore: snapshot.docs.length === MESSAGES_PER_PAGE,
      };
    } catch (error) {
      throw normalizeMessageError(error);
    }
  },

  delete: async (roomId: string, messageId: string): Promise<void> => {
    try {
      const messageRef = doc(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION, messageId);
      await deleteDoc(messageRef);

      // Update room's lastMessage after deletion
      await refreshRoomLastMessage(roomId);
    } catch (error) {
      throw normalizeMessageError(error);
    }
  },

  /**
   * Permanently delete ALL messages belonging to a room.
   * Called before deleting the room itself, because Firestore
   * subcollections are NOT automatically removed with their parent document.
   */
  deleteAllByRoom: async (roomId: string): Promise<void> => {
    try {
      const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION);

      // Firestore limits batch writes to 500 ops; we use 400 for safety.
      let snapshot = await getDocs(query(messagesRef, limit(DELETE_BATCH_SIZE)));

      while (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();

        snapshot = await getDocs(query(messagesRef, limit(DELETE_BATCH_SIZE)));
      }
    } catch (error) {
      throw normalizeMessageError(error);
    }
  },

  /**
   * Mark messages as seen by adding the current user to their seenBy array.
   *
   * Splits the operation into chunks to respect Firestore's batch limit
   * of 500 operations per batch. Each chunk is committed independently.
   */
  markAsSeen: async (roomId: string, messageIds: string[], userId: string): Promise<void> => {
    if (messageIds.length === 0) return;

    try {
      // Chunk the messageIds to avoid exceeding Firestore's 500-op batch limit
      for (let i = 0; i < messageIds.length; i += MARK_AS_SEEN_BATCH_SIZE) {
        const chunk = messageIds.slice(i, i + MARK_AS_SEEN_BATCH_SIZE);
        const batch = writeBatch(db);

        chunk.forEach((messageId) => {
          const messageRef = doc(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION, messageId);
          batch.update(messageRef, {
            seenBy: arrayUnion(userId),
          });
        });

        await batch.commit();
      }
    } catch (error) {
      console.warn('Failed to mark messages as seen:', error);
    }
  },
};

async function getMessageDocById(
  roomId: string,
  messageId: string
): Promise<QueryDocumentSnapshot | null> {
  const messageRef = doc(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION, messageId);

  const snapshot = await getDoc(messageRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot as QueryDocumentSnapshot;
}

async function updateRoomLastMessage(
  roomId: string,
  lastMessage: LastMessagePayload
): Promise<void> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      lastMessage,
      lastActivityAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Failed to update last message:', error);
  }
}

async function refreshRoomLastMessage(roomId: string): Promise<void> {
  try {
    const messagesRef = collection(db, ROOMS_COLLECTION, roomId, MESSAGES_SUBCOLLECTION);
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);

    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    if (snapshot.empty) {
      await updateDoc(roomRef, {
        lastMessage: null,
        lastActivityAt: serverTimestamp(),
      });
    } else {
      const lastMsgDoc = snapshot.docs[0];
      const lastMsgData = lastMsgDoc.data();
      const lastMessage: LastMessagePayload = {
        id: lastMsgDoc.id,
        content: lastMsgData.content,
        senderId: lastMsgData.senderId,
        senderName: lastMsgData.senderName,
        type: lastMsgData.type,
        timestamp: lastMsgData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
      await updateRoomLastMessage(roomId, lastMessage);
    }
  } catch (error) {
    console.warn('Failed to refresh last message:', error);
  }
}

function normalizeMessageError(error: unknown): Error {
  if (error && typeof error === 'object' && 'code' in error) {
    const firestoreError = error as { code: string; message: string };

    const userMessages: Record<string, string> = {
      'permission-denied': i18n.t('errors.permissionDenied'),
      'not-found': i18n.t('errors.notFound'),
      'resource-exhausted': i18n.t('errors.resourceExhausted'),
    };

    const userMessage = userMessages[firestoreError.code] || firestoreError.message;

    const err = new Error(userMessage);
    (err as Error & { code?: string }).code = firestoreError.code;
    return err;
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(i18n.t('errors.unknown'));
}

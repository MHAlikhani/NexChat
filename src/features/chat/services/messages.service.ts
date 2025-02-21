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
import type { Message, SendMessageInput } from '../types';
import { mapFirestoreDocToMessage } from '../utils/mappers';

const ROOMS_COLLECTION = 'rooms';
const MESSAGES_SUBCOLLECTION = 'messages';
const MESSAGES_PER_PAGE = 50;

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
  send: async (
    input: SendMessageInput,
    sender: MessageSender
  ): Promise<string> => {
    try {
      const messagesRef = collection(
        db,
        ROOMS_COLLECTION,
        input.roomId,
        MESSAGES_SUBCOLLECTION
      );

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

      if (input.fileName) messageData.fileName = input.fileName;
      if (input.fileSize) messageData.fileSize = input.fileSize;
      if (input.duration) messageData.duration = input.duration;
      if (input.replyTo) messageData.replyTo = input.replyTo;
      if (input.replyToContent) messageData.replyToContent = input.replyToContent;
      if (input.replyToSenderName) messageData.replyToSenderName = input.replyToSenderName;

      const docRef = await addDoc(messagesRef, messageData);

      const lastMessage: LastMessagePayload = {
        id: docRef.id,
        content:
          input.type === 'text' ? input.content : getMediaPreviewText(input.type),
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
    const messagesRef = collection(
      db,
      ROOMS_COLLECTION,
      roomId,
      MESSAGES_SUBCOLLECTION
    );

    const q = query(
      messagesRef,
      orderBy('createdAt', 'desc'),
      limit(messageLimit)
    );

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

      const messagesRef = collection(
        db,
        ROOMS_COLLECTION,
        roomId,
        MESSAGES_SUBCOLLECTION
      );

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
      const messageRef = doc(
        db,
        ROOMS_COLLECTION,
        roomId,
        MESSAGES_SUBCOLLECTION,
        messageId
      );
      await deleteDoc(messageRef);

      // Update room's lastMessage after deletion
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
          content: lastMsgData.type === 'text' ? lastMsgData.content : getMediaPreviewText(lastMsgData.type),
          senderId: lastMsgData.senderId,
          senderName: lastMsgData.senderName,
          type: lastMsgData.type,
          timestamp: lastMsgData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        };
        await updateRoomLastMessage(roomId, lastMessage);
      }
    } catch (error) {
      throw normalizeMessageError(error);
    }
  },

  markAsSeen: async (
    roomId: string,
    messageIds: string[],
    userId: string
  ): Promise<void> => {
    if (messageIds.length === 0) return;

    try {
      const batch = writeBatch(db);

      messageIds.forEach((messageId) => {
        const messageRef = doc(
          db,
          ROOMS_COLLECTION,
          roomId,
          MESSAGES_SUBCOLLECTION,
          messageId
        );
        batch.update(messageRef, {
          seenBy: arrayUnion(userId),
        });
      });

      await batch.commit();
    } catch (error) {
      console.warn('Failed to mark messages as seen:', error);
    }
  },
};

async function getMessageDocById(
  roomId: string,
  messageId: string
): Promise<QueryDocumentSnapshot | null> {
  const messageRef = doc(
    db,
    ROOMS_COLLECTION,
    roomId,
    MESSAGES_SUBCOLLECTION,
    messageId
  );

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

function getMediaPreviewText(type: string): string {
  switch (type) {
    case 'image':
      return '📷 تصویر';
    case 'audio':
      return '🎤 پیام صوتی';
    case 'video':
      return '🎥 ویدیو';
    case 'file':
      return '📎 فایل';
    default:
      return '';
  }
}

function normalizeMessageError(error: unknown): Error {
  if (error && typeof error === 'object' && 'code' in error) {
    const firestoreError = error as { code: string; message: string };

    const userMessages: Record<string, string> = {
      'permission-denied': 'شما اجازه انجام این عملیات را ندارید',
      'not-found': 'پیام مورد نظر یافت نشد',
      'resource-exhausted': 'پیام بیش از حد بزرگ است',
    };

    const userMessage =
      userMessages[firestoreError.code] || firestoreError.message;

    const err = new Error(userMessage);
    (err as Error & { code?: string }).code = firestoreError.code;
    return err;
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('خطای ناشناخته‌ای رخ داد');
}

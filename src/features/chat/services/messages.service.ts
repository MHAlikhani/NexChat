/**
 * Messages Service (Repository Pattern)
 *
 * مدیریت پیام‌ها در Firestore با پشتیبانی از:
 * - ارسال پیام (متن، تصویر، صوت)
 * - همگام‌سازی لحظه‌ای (Real-time) با onSnapshot
 * - صفحه‌بندی برای پیام‌های قدیمی
 * - علامت‌گذاری پیام‌ها به عنوان دیده‌شده (با writeBatch)
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

/**
 * Constants
 */
const ROOMS_COLLECTION = 'rooms';
const MESSAGES_SUBCOLLECTION = 'messages';
const MESSAGES_PER_PAGE = 50;

/**
 * ساختار آخرین پیام اتاق (برای پیش‌نمایش در لیست اتاق‌ها)
 */
export interface LastMessagePayload {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  type: string;
  timestamp: string;
}

/**
 * اطلاعات فرستنده برای ارسال پیام
 */
export interface MessageSender {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

/**
 * Messages Service API
 */
export const messagesService = {
  /**
   * ارسال پیام جدید
   *
   * @returns شناسه پیام ایجاد شده
   */
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

      // فیلدهای مخصوص رسانه
      if (input.fileName) messageData.fileName = input.fileName;
      if (input.fileSize) messageData.fileSize = input.fileSize;
      if (input.duration) messageData.duration = input.duration;

      const docRef = await addDoc(messagesRef, messageData);

      // به‌روزرسانی پیش‌نمایش اتاق (بدون توقف در صورت خطا)
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

  /**
   * گوش دادن لحظه‌ای به آخرین پیام‌های یک اتاق
   *
   * پیام‌ها به ترتیب نزولی از سرور گرفته شده و سپس معکوس می‌شوند
   * تا قدیمی‌ترین پیام در بالای لیست قرار بگیرد.
   */
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
          .reverse(); // قدیمی‌ترین در بالا

        callback(messages);
      },
      (error) => {
        console.error('Error in messages subscription:', error);
        callback([]);
      }
    );
  },

  /**
   * بارگذاری پیام‌های قدیمی‌تر (صفحه‌بندی با کرسر)
   */
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

  /**
   * حذف یک پیام
   */
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
    } catch (error) {
      throw normalizeMessageError(error);
    }
  },

  /**
   * علامت‌گذاری چند پیام به عنوان دیده‌شده (در یک عملیات اتمی)
   *
   * از writeBatch استفاده می‌شود تا همه به‌روزرسانی‌ها در یک درخواست انجام شوند.
   * در صورت خطا، فقط هشدار داده می‌شود (وضعیت دیده‌شدن حیاتی نیست).
   */
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
      // شکست در این عملیات نباید تجربه کاربری را خراب کند
      console.warn('Failed to mark messages as seen:', error);
    }
  },
};

/**
 * Helper: دریافت سند پیام بر اساس شناسه
 *
 * برای استفاده از کرسر در صفحه‌بندی نیاز است خود سند را داشته باشیم.
 */
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

/**
 * Helper: به‌روزرسانی آخرین پیام اتاق
 */
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
    // به‌روزرسانی پیش‌نمایش نباید ارسال پیام را شکست دهد
    console.warn('Failed to update last message:', error);
  }
}

/**
 * Helper: متن پیش‌نمایش برای پیام‌های رسانه‌ای
 */
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

/**
 * Helper: تبدیل خطاهای Firestore به خطای استاندارد با پیام کاربرپسند
 */
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
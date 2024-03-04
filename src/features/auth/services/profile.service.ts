/**
 * Profile Service
 *
 * @module features/auth/services/profile
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, UserProfile } from '../types';

const USERS_COLLECTION = 'users';

export const profileService = {
  upsertProfile: async (user: User): Promise<void> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
        });
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          status: 'online',
          settings: {
            theme: 'system',
            language: 'fa',
            notifications: true,
            showOnlineStatus: true,
          },
        });
      }
    } catch (error) {
      console.error('Failed to upsert profile:', error);
      throw error;
    }
  },

  getProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();

      const lastSeenAtDate =
        data.lastSeenAt &&
        typeof data.lastSeenAt === 'object' &&
        'toDate' in data.lastSeenAt
          ? data.lastSeenAt.toDate()
          : new Date();

      return {
        bio: data.bio,
        status: data.status || 'offline',
        settings: data.settings,
        lastSeenAt: lastSeenAtDate.toISOString(),
      };
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  },

  updateStatus: async (
    uid: string,
    status: UserProfile['status']
  ): Promise<void> => {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      status,
      lastSeenAt: serverTimestamp(),
    });
  },
};

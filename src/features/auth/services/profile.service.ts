/**
 * Profile Service
 *
 * مدیریت پروفایل کاربران در Firestore
 *
 * @module features/auth/services/profile
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, UserProfile } from '../types';

/**
 * Firestore Collection Name
 */
const USERS_COLLECTION = 'users';

/**
 * Profile Service API
 */
export const profileService = {
  /**
   * Create or update user profile
   *
   * اگر کاربر از قبل وجود داشته باشد، فقط lastLoginAt به‌روز می‌شود.
   * در غیر این صورت، پروفایل جدید ایجاد می‌شود.
   */
  upsertProfile: async (user: User): Promise<void> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // User exists - just update last login
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp(),
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
        });
      } else {
        // New user - create full profile
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

  /**
   * Get user profile
   */
  getProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      return {
        bio: data.bio,
        status: data.status || 'offline',
        settings: data.settings,
        lastSeenAt: data.lastSeenAt instanceof Timestamp
          ? data.lastSeenAt.toISOString()
          : new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  },

  /**
   * Update user status
   */
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
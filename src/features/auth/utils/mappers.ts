/**
 * User Mappers (Adapter Pattern)
 *
 * این فایل مسئول تبدیل بین Firebase User و Domain User است.
 * اگر ساختار Firebase User تغییر کند، فقط این فایل نیاز به تغییر دارد.
 *
 * @module features/auth/utils/mappers
 */

import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../types';

/**
 * Map Firebase User to Domain User
 *
 * @param firebaseUser - Firebase User object
 * @returns Domain User object
 */
export const mapFirebaseUserToDomain = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'کاربر ناشناس',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
    createdAt: firebaseUser.metadata.creationTime
      ? new Date(firebaseUser.metadata.creationTime).toISOString()
      : new Date().toISOString(),
    lastLoginAt: firebaseUser.metadata.lastSignInTime
      ? new Date(firebaseUser.metadata.lastSignInTime).toISOString()
      : new Date().toISOString(),
  };
};
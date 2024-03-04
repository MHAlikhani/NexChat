/**
 * User Mappers (Adapter Pattern)
 *
 * تبدیل بین Firebase User و Domain User.
 *
 * @module features/auth/utils/mappers
 */

import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../types';

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

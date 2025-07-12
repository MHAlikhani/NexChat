import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import i18n from '@/lib/i18n';
import type { User, AuthError, AuthProvider } from '../types';
import { profileService } from './profile.service';
import { mapFirebaseUserToDomain } from '../utils/mappers';

const ERROR_MESSAGE_KEYS: Record<string, string> = {
  'auth/popup-closed-by-user': 'auth.popupClosed',
  'auth/cancelled-popup-request': 'auth.popupCancelled',
  'auth/popup-blocked': 'auth.popupBlocked',
  'auth/network-request-failed': 'auth.networkError',
  'auth/user-disabled': 'auth.accountDisabled',
  'auth/operation-not-allowed': 'auth.operationNotAllowed',
  'auth/unauthorized-domain': 'auth.unauthorizedDomain',
};

const providers = {
  google: new GoogleAuthProvider(),
} as const;

export const authService = {
  signIn: async (provider: AuthProvider = 'google'): Promise<User> => {
    try {
      if (!(provider in providers)) {
        throw new Error(i18n.t('auth.unsupportedSignIn', { provider }));
      }

      const selectedProvider =
        providers[provider as keyof typeof providers];

      const result = await signInWithPopup(auth, selectedProvider);

      if (!result.user) {
        throw new Error('Authentication succeeded but no user returned');
      }

      const user = mapFirebaseUserToDomain(result.user);
      await profileService.upsertProfile(user);

      return user;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  signOut: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  onAuthChange: (callback: (user: User | null) => void): Unsubscribe => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = mapFirebaseUserToDomain(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  getCurrentUser: (): User | null => {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? mapFirebaseUserToDomain(firebaseUser) : null;
  },

  updateProfile: async (updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No user logged in');
      }

      // به‌روزرسانی در Firebase Auth
      await firebaseUpdateProfile(firebaseUser, updates);

      // به‌روزرسانی در Firestore
      if (updates.displayName) {
        await profileService.updateDisplayName(
          firebaseUser.uid,
          updates.displayName
        );
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw normalizeAuthError(error);
    }
  },
};

function normalizeAuthError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message: string };
    const messageKey = ERROR_MESSAGE_KEYS[firebaseError.code];
    return {
      code: firebaseError.code,
      message: messageKey ? i18n.t(messageKey) : firebaseError.message,
      details: error,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'unknown-error',
      message: error.message,
      details: error,
    };
  }

  return {
    code: 'unknown-error',
    message: i18n.t('auth.unknownError'),
    details: error,
  };
}

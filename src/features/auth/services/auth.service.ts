import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User, AuthError, AuthProvider } from '../types';
import { profileService } from './profile.service';
import { mapFirebaseUserToDomain } from '../utils/mappers';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'پنجره ورود توسط شما بسته شد',
  'auth/cancelled-popup-request': 'درخواست ورود لغو شد',
  'auth/popup-blocked': 'پنجره ورود توسط مرورگر مسدود شد',
  'auth/network-request-failed': 'خطای شبکه. اتصال اینترنت خود را بررسی کنید',
  'auth/user-disabled': 'این حساب غیرفعال شده است',
  'auth/operation-not-allowed': 'این روش ورود فعال نیست',
  'auth/unauthorized-domain': 'دامنه مجاز نیست',
};

const providers = {
  google: new GoogleAuthProvider(),
} as const;

export const authService = {
  signIn: async (provider: AuthProvider = 'google'): Promise<User> => {
    try {
      if (!(provider in providers)) {
        throw new Error(`روش ورود "${provider}" پشتیبانی نمی‌شود`);
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
};

function normalizeAuthError(error: unknown): AuthError {
  if (error && typeof error === 'object' && 'code' in error) {
    const firebaseError = error as { code: string; message: string };
    return {
      code: firebaseError.code,
      message: ERROR_MESSAGES[firebaseError.code] || firebaseError.message,
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
    message: 'خطای ناشناخته‌ای رخ داد',
    details: error,
  };
}

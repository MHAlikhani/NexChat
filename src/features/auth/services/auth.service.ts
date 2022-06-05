/**
 * Authentication Service (Repository Pattern)
 *
 * این لایه، جزئیات Firebase Auth را از لایه Business Logic پنهان می‌کند.
 * اگر روزی خواستیم از Auth0 یا Supabase استفاده کنیم، فقط این فایل تغییر می‌کند.
 *
 * @module features/auth/services/auth
 */

import {
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Unsubscribe,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User, AuthError, AuthProvider } from '../types';
import { profileService } from './profile.service';
import { mapFirebaseUserToDomain } from '../utils/mappers';

/**
 * Error Messages - User-Friendly Messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'پنجره ورود توسط شما بسته شد',
  'auth/cancelled-popup-request': 'درخواست ورود لغو شد',
  'auth/popup-blocked': 'پنجره ورود توسط مرورگر مسدود شد',
  'auth/network-request-failed': 'خطای شبکه. اتصال اینترنت خود را بررسی کنید',
  'auth/user-disabled': 'این حساب غیرفعال شده است',
  'auth/operation-not-allowed': 'این روش ورود فعال نیست',
  'auth/unauthorized-domain': 'دامنه مجاز نیست',
};

/**
 * Provider Instances
 */
const providers = {
  google: new GoogleAuthProvider(),
} as const;

/**
 * Authentication Service API
 */
export const authService = {
  /**
   * Sign in with specified provider
   *
   * @param provider - احراز هویت با کدام ارائه‌دهنده
   * @returns Promise containing the authenticated user
   * @throws {AuthError} If authentication fails
   */
  signIn: async (provider: AuthProvider = 'google'): Promise<User> => {
    try {
      const selectedProvider = providers[provider];

      if (!selectedProvider) {
        throw new Error(`Provider ${provider} is not supported`);
      }

      // Step 1: Authenticate with Firebase
      const result = await signInWithPopup(auth, selectedProvider);

      if (!result.user) {
        throw new Error('Authentication succeeded but no user returned');
      }

      // Step 2: Map Firebase user to domain model
      const user = mapFirebaseUserToDomain(result.user);

      // Step 3: Create or update profile in Firestore
      await profileService.upsertProfile(user);

      return user;
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  /**
   * Sign out current user
   */
  signOut: async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  /**
   * Subscribe to authentication state changes
   *
   * این متد یک unsubscribe function برمی‌گرداند که باید در cleanup فراخوانی شود.
   *
   * @param callback - تابعی که با تغییر وضعیت فراخوانی می‌شود
   * @returns Unsubscribe function
   */
  onAuthChange: (
    callback: (user: User | null) => void
  ): Unsubscribe => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = mapFirebaseUserToDomain(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Get currently authenticated user (synchronous)
   */
  getCurrentUser: (): User | null => {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? mapFirebaseUserToDomain(firebaseUser) : null;
  },
};

/**
 * Helper: Normalize Firebase errors to domain AuthError
 */
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
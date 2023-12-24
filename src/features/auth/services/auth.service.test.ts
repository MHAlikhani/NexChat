/**
 * Auth Service Tests
 *
 * تست‌های جامع برای AuthService
 * بررسی signIn، signOut، onAuthChange و مدیریت خطاها
 *
 * @module features/auth/services/auth.service.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from './auth.service';
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { profileService } from './profile.service';

// Mock کردن Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
}));

vi.mock('./profile.service', () => ({
  profileService: {
    upsertProfile: vi.fn(),
  },
}));

describe('Auth Service', () => {
  const mockFirebaseUser = {
    uid: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    metadata: {
      creationTime: '2024-01-01T00:00:00Z',
      lastSignInTime: '2024-01-01T00:00:00Z',
    },
  };

  const mockUser = {
    uid: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
    createdAt: expect.any(String),
    lastLoginAt: expect.any(String),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signIn', () => {
    it('should sign in successfully with Google provider', async () => {
      (signInWithPopup as any).mockResolvedValue({
        user: mockFirebaseUser,
      });

      const result = await authService.signIn('google');

      expect(signInWithPopup).toHaveBeenCalled();
      expect(profileService.upsertProfile).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should default to google provider if none specified', async () => {
      (signInWithPopup as any).mockResolvedValue({
        user: mockFirebaseUser,
      });

      await authService.signIn();

      expect(signInWithPopup).toHaveBeenCalled();
    });

    it('should throw error for unsupported provider', async () => {
      await expect(authService.signIn('github' as any)).rejects.toThrow(
        'روش ورود "github" پشتیبانی نمی‌شود'
      );
      expect(signInWithPopup).not.toHaveBeenCalled();
    });

    it('should throw error if no user returned from popup', async () => {
      (signInWithPopup as any).mockResolvedValue({
        user: null,
      });

      await expect(authService.signIn('google')).rejects.toThrow(
        'Authentication succeeded but no user returned'
      );
    });

    it('should normalize Firebase auth errors', async () => {
      const firebaseError = {
        code: 'auth/popup-closed-by-user',
        message: 'The popup has been closed by the user',
      };
      (signInWithPopup as any).mockRejectedValue(firebaseError);

      await expect(authService.signIn('google')).rejects.toEqual({
        code: 'auth/popup-closed-by-user',
        message: 'پنجره ورود توسط شما بسته شد',
        details: firebaseError,
      });
    });

    it('should handle unknown error types', async () => {
      (signInWithPopup as any).mockRejectedValue('string error');

      await expect(authService.signIn('google')).rejects.toEqual({
        code: 'unknown-error',
        message: 'خطای ناشناخته‌ای رخ داد',
        details: 'string error',
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      (signOut as any).mockResolvedValue(undefined);

      await authService.signOut();

      expect(signOut).toHaveBeenCalled();
    });

    it('should normalize sign out errors', async () => {
      const firebaseError = {
        code: 'auth/network-request-failed',
        message: 'Network error',
      };
      (signOut as any).mockRejectedValue(firebaseError);

      await expect(authService.signOut()).rejects.toEqual({
        code: 'auth/network-request-failed',
        message: 'خطای شبکه. اتصال اینترنت خود را بررسی کنید',
        details: firebaseError,
      });
    });
  });

  describe('onAuthChange', () => {
    it('should subscribe to auth state changes and map user', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();
      
      (onAuthStateChanged as any).mockImplementation((auth, callback) => {
        // شبیه‌سازی فراخوانی callback با کاربر
        callback(mockFirebaseUser);
        return mockUnsubscribe;
      });

      const unsubscribe = authService.onAuthChange(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockUser);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should call callback with null when user signs out', () => {
      const mockCallback = vi.fn();
      
      (onAuthStateChanged as any).mockImplementation((auth, callback) => {
        callback(null);
        return vi.fn();
      });

      authService.onAuthChange(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no current user', () => {
      // در محیط تست، auth.currentUser تعریف نشده است
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });
});

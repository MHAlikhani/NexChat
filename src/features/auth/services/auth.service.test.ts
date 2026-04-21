import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './auth.service';

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
}));

vi.mock('@/lib/i18n', () => ({
  default: {
    t: (key: string) => key,
  },
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

  describe('signIn', () => {
    it('should sign in successfully with Google', async () => {
      const { signInWithPopup } = await import('firebase/auth');
      (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: mockFirebaseUser,
      });

      const result = await authService.signIn();

      expect(signInWithPopup).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error if no user returned from popup', async () => {
      const { signInWithPopup } = await import('firebase/auth');
      (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: null,
      });

      await expect(authService.signIn()).rejects.toThrow(
        'Authentication succeeded but no user returned'
      );
    });

    it('should normalize Firebase auth errors', async () => {
      const { signInWithPopup } = await import('firebase/auth');
      const firebaseError = {
        code: 'auth/popup-closed-by-user',
        message: 'The popup has been closed by the user',
      };
      (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(firebaseError);

      await expect(authService.signIn()).rejects.toMatchObject({
        code: 'auth/popup-closed-by-user',
      });
    });

    it('should handle unknown error types', async () => {
      const { signInWithPopup } = await import('firebase/auth');
      (signInWithPopup as unknown as ReturnType<typeof vi.fn>).mockRejectedValue('string error');

      await expect(authService.signIn()).rejects.toMatchObject({
        code: 'unknown-error',
      });
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const { signOut } = await import('firebase/auth');
      (signOut as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await authService.signOut();

      expect(signOut).toHaveBeenCalled();
    });

    it('should normalize sign out errors', async () => {
      const { signOut } = await import('firebase/auth');
      const firebaseError = {
        code: 'auth/network-request-failed',
        message: 'Network error',
      };
      (signOut as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(firebaseError);

      await expect(authService.signOut()).rejects.toMatchObject({
        code: 'auth/network-request-failed',
      });
    });
  });

  describe('onAuthChange', () => {
    it('should subscribe to auth state changes and map user', async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (_auth: unknown, callback: (user: unknown) => void) => {
          callback(mockFirebaseUser);
          return mockUnsubscribe;
        }
      );

      const unsubscribe = authService.onAuthChange(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(mockUser);
      expect(unsubscribe).toBe(mockUnsubscribe);
    });

    it('should call callback with null when user signs out', async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const mockCallback = vi.fn();

      (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        (_auth: unknown, callback: (user: unknown) => void) => {
          callback(null);
          return vi.fn();
        }
      );

      authService.onAuthChange(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith(null);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no current user', () => {
      const result = authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });
});

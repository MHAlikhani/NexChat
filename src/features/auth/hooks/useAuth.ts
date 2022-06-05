/**
 * useAuth Hook (Facade Pattern)
 *
 * یک رابط ساده برای مدیریت احراز هویت ارائه می‌دهد.
 * کامپوننت‌ها نیازی به دانستن جزئیات service و store ندارند.
 *
 * @module features/auth/hooks/useAuth
 */

import { useCallback } from 'react';
import { useAuthStore, authSelectors } from '../stores/authStore';
import { authService } from '../services/auth.service';
import type { AuthProvider, AuthError } from '../types';

/**
 * useAuth Return Type
 */
export interface UseAuthReturn {
  user: ReturnType<typeof authSelectors.selectUser>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  signIn: (provider?: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Authentication Hook
 *
 * @example
 * ```tsx
 * const { user, signIn, signOut, isAuthenticated } = useAuth();
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const user = useAuthStore(authSelectors.selectUser);
  const isLoading = useAuthStore(authSelectors.selectIsLoading);
  const isAuthenticated = useAuthStore(authSelectors.selectIsAuthenticated);
  const error = useAuthStore(authSelectors.selectError);

  const { setUser, setLoading, setError } = useAuthStore();

  /**
   * Sign in with specified provider
   */
  const signIn = useCallback(
    async (provider: AuthProvider = 'google'): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const user = await authService.signIn(provider);
        setUser(user);
      } catch (error) {
        setError(error as AuthError);
        throw error;
      }
    },
    [setLoading, setError, setUser]
  );

  /**
   * Sign out current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      setError(error as AuthError);
      throw error;
    }
  }, [setLoading, setError, setUser]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signOut,
    clearError,
  };
};
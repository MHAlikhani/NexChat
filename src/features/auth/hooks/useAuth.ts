/**
 * useAuth Hook (Facade Pattern)
 *
 * @module features/auth/hooks/useAuth
 */

import { useCallback } from 'react';
import { useAuthStore, authSelectors } from '../stores/authStore';
import { authService } from '../services/auth.service';
import type { AuthProvider, AuthError } from '../types';

export interface UseAuthReturn {
  user: ReturnType<typeof authSelectors.selectUser>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  signIn: (provider?: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateDisplayName: (displayName: string) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const user = useAuthStore(authSelectors.selectUser);
  const isLoading = useAuthStore(authSelectors.selectIsLoading);
  const isAuthenticated = useAuthStore(authSelectors.selectIsAuthenticated);
  const error = useAuthStore(authSelectors.selectError);

  const { setUser, setLoading, setError } = useAuthStore();

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

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const updateDisplayName = useCallback(
    async (displayName: string): Promise<void> => {
      try {
        setLoading(true);
        await authService.updateProfile({ displayName });

        // به‌روزرسانی user در store
        if (user) {
          setUser({ ...user, displayName });
        }
      } catch (error) {
        setError(error as AuthError);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser, user]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    signIn,
    signOut,
    clearError,
    updateDisplayName,
  };
};

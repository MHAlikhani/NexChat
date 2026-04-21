/**
 * useAuth Hook (Facade Pattern)
 *
 * @module features/auth/hooks/useAuth
 */

import { useCallback } from 'react';
import { useAuthStore, authSelectors } from '../stores/authStore';
import { authService } from '../services/auth.service';
import type { AuthError } from '../types';

export interface UseAuthReturn {
  user: ReturnType<typeof authSelectors.selectUser>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  signIn: () => Promise<void>;
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

  const signIn = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.signIn();
      setUser(user);
    } catch (error) {
      setError(error as AuthError);
      throw error;
    }
  }, [setLoading, setError, setUser]);

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

        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUser({ ...currentUser, displayName });
        }
      } catch (error) {
        setError(error as AuthError);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setUser]
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

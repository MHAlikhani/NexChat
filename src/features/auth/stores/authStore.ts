/**
 * Authentication Store (Zustand)
 *
 * @module features/auth/stores/authStore
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthError } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  isInitialized: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: AuthError | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setUser: (user) => set({ user, isLoading: false, error: null }),

        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error, isLoading: false }),

        setInitialized: (isInitialized) => set({ isInitialized }),

        reset: () => set(initialState),
      }),
      {
        name: 'nexchat-auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          isInitialized: state.isInitialized,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

export const authSelectors = {
  selectUser: (state: AuthStore) => state.user,
  selectIsLoading: (state: AuthStore) => state.isLoading,
  selectIsAuthenticated: (state: AuthStore) => state.user !== null,
  selectError: (state: AuthStore) => state.error,
  selectIsInitialized: (state: AuthStore) => state.isInitialized,
};

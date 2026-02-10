/**
 * Authentication Store (Zustand)
 *
 * @module features/auth/stores/authStore
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthError } from '../types';

/**
 * Maximum age (in milliseconds) for persisted auth state.
 * After this period, the persisted user is considered stale and cleared.
 * This prevents showing a logged-in UI when the Firebase session has expired.
 */
const MAX_PERSISTED_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

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

interface PersistedState {
  user: User | null;
  isInitialized: boolean;
  lastUpdated: number;
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
        partialize: (state): PersistedState => ({
          user: state.user,
          isInitialized: state.isInitialized,
          lastUpdated: Date.now(),
        }),
        version: 1,
        /**
         * On rehydration, validate the persisted user's freshness.
         * If the persisted state is older than MAX_PERSISTED_AGE_MS,
         * clear the user to prevent showing stale logged-in state
         * when the Firebase session has actually expired.
         */
        onRehydrateStorage: () => {
          return (state) => {
            if (state) {
              // The persisted state includes lastUpdated from partialize
              const persistedRaw = localStorage.getItem('nexchat-auth-storage');
              if (persistedRaw) {
                try {
                  const parsed = JSON.parse(persistedRaw);
                  const lastUpdated = parsed?.state?.lastUpdated;

                  if (lastUpdated && Date.now() - lastUpdated > MAX_PERSISTED_AGE_MS) {
                    // Clear stale user data
                    useAuthStore.setState({
                      user: null,
                      isInitialized: false,
                      isLoading: true,
                    });
                  }
                } catch {
                  // If parsing fails, clear the state
                  useAuthStore.setState({
                    user: null,
                    isInitialized: false,
                    isLoading: true,
                  });
                }
              }
            }
          };
        },
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

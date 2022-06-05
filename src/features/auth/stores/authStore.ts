/**
 * Authentication Store (Zustand)
 *
 * مدیریت state سراسری احراز هویت با Zustand
 *
 * ویژگی‌ها:
 * - Devtools برای debugging
 * - Persistence برای حفظ session بین refresh
 * - Type-safe با TypeScript
 *
 * @module features/auth/stores/authStore
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthError } from '../types';

/**
 * Auth Store State
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  isInitialized: boolean;
}

/**
 * Auth Store Actions
 */
interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: AuthError | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Initial State
 */
const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
  isInitialized: false,
};

/**
 * Auth Store Hook
 */
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
        // فقط user را persist می‌کنیم، نه isLoading و error
        partialize: (state) => ({
          user: state.user,
          isInitialized: state.isInitialized,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);

/**
 * Selectors - برای دسترسی بهینه به بخش‌های خاص state
 *
 * استفاده از selector باعث می‌شود کامپوننت فقط وقتی re-render شود
 * که مقدار مورد نظرش تغییر کند، نه هر تغییری در store
 */
export const authSelectors = {
  selectUser: (state: AuthStore) => state.user,
  selectIsLoading: (state: AuthStore) => state.isLoading,
  selectIsAuthenticated: (state: AuthStore) => state.user !== null,
  selectError: (state: AuthStore) => state.error,
  selectIsInitialized: (state: AuthStore) => state.isInitialized,
};
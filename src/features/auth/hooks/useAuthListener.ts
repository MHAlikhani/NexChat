/**
 * useAuthListener Hook (Observer Pattern)
 *
 * @module features/auth/hooks/useAuthListener
 */

import { useEffect } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

export const useAuthListener = (): void => {
  const { setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setUser(user);
      setInitialized(true);
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, setInitialized]);
};

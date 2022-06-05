/**
 * useAuthListener Hook (Observer Pattern)
 *
 * در پس‌زمینه به تغییرات وضعیت احراز هویت گوش می‌دهد
 * و store را به‌روز می‌کند.
 *
 * @module features/auth/hooks/useAuthListener
 */

import { useEffect } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

/**
 * Auth Listener Hook
 *
 * این hook باید فقط یک بار در ریشه اپلیکیشن فراخوانی شود.
 */
export const useAuthListener = (): void => {
  const { setUser, setInitialized } = useAuthStore();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthChange((user) => {
      setUser(user);
      setInitialized(true);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [setUser, setInitialized]);
};
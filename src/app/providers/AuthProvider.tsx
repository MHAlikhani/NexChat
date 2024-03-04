/**
 * Auth Provider
 *
 * @module app/providers/AuthProvider
 */

import { useAuthListener } from '@/features/auth/hooks/useAuthListener';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  useAuthListener();
  return <>{children}</>;
};

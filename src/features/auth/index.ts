/**
 * Auth Feature - Public API
 *
 * @module features/auth
 */

export { SignInButton } from './components/SignInButton';
export { AuthGuard } from './components/AuthGuard';
export { EditNameModal } from './components/EditNameModal';
export { useAuth } from './hooks/useAuth';
export type { User, UserProfile, AuthState, AuthError, AuthProvider } from './types';

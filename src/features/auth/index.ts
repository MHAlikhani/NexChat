/**
 * Auth Feature - Public API
 *
 * فقط این فایل از بیرون feature import می‌شود.
 * این کار باعث می‌شود internal implementation details پنهان بمانند.
 */

// Components
export { SignInButton } from './components/SignInButton';
export { AuthGuard } from './components/AuthGuard';

// Hooks
export { useAuth } from './hooks/useAuth';

// Types
export type { User, UserProfile, AuthState, AuthError, AuthProvider } from './types';
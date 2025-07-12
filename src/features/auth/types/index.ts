/**
 * Authentication Domain Types
 *
 * @module features/auth/types
 */

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
}

export interface UserProfile {
  bio?: string;
  status: 'online' | 'offline' | 'away';
  settings: UserSettings;
  lastSeenAt: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fa' | 'en' | 'de';
  notifications: boolean;
  showOnlineStatus: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

export interface AuthError {
  code: string;
  message: string;
  details?: unknown;
}

export type AuthProvider = 'google' | 'github' | 'email';

/**
 * Shared Constants for NexChat
 *
 * @module shared/constants
 */

export const APP_NAME = 'NexChat';
export const APP_VERSION = '2.0.0';

export const COLLECTIONS = {
  USERS: 'users',
  ROOMS: 'rooms',
  MESSAGES: 'messages',
} as const;

export const UI = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_IMAGE_SIZE_MB: 5,
  MAX_AUDIO_DURATION_SECONDS: 300,
  DEBOUNCE_DELAY_MS: 300,
  TOAST_DURATION_MS: 3000,
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CHAT: '/chat/:roomId',
  SETTINGS: '/settings',
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

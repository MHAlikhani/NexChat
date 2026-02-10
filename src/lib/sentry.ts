/**
 * Sentry Configuration
 *
 * @module lib/sentry
 */

import * as Sentry from '@sentry/react';

export const SentryInit = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    if (import.meta.env.DEV) {
      console.warn('[Sentry] DSN not configured. Sentry will not be initialized.');
    }
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    // Don't send PII by default
    sendDefaultPii: false,
  });
};

export const captureError = (error: unknown, context?: Record<string, unknown>) => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('[Sentry fallback]', error, context);
  }
};

/**
 * Capture a message with Sentry at a specified severity level.
 *
 * Note: `Sentry.SeverityLevel` is used here as the type for the `level`
 * parameter. If this function is not used anywhere in the codebase,
 * it should be removed to avoid dead code.
 */
export const captureMessage = (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
};

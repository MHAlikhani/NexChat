/**
 * Sentry Configuration
 *
 * @module lib/sentry
 */

import * as Sentry from '@sentry/react';

let sentryInitialized = false;

export const SentryInit = () => {
  if (sentryInitialized) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    // Silently skip initialization when DSN is not configured.
    // No warning in production; in development this is expected.
    return;
  }

  try {
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
    sentryInitialized = true;
  } catch (error) {
    // Fail silently - Sentry errors should not break the app
    console.warn('[Sentry] Failed to initialize:', error);
  }
};

export const captureError = (error: unknown, context?: Record<string, unknown>) => {
  if (sentryInitialized) {
    Sentry.captureException(error, { extra: context });
  }
  // Always log to console in development for debugging
  if (import.meta.env.DEV) {
    console.error('[Error]', error, context);
  }
};

/**
 * Capture a message with Sentry at a specified severity level.
 */
export const captureMessage = (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
) => {
  if (sentryInitialized) {
    Sentry.captureMessage(message, level);
  }
};

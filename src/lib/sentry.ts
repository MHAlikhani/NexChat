/**
 * Sentry Configuration
 *
 * @module lib/sentry
 */

import * as Sentry from "@sentry/react";

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

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  }
};

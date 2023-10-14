import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import { useLocation, useRoutes } from "react-router-dom";

export const SentryInit = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
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
  });
};

export const SentryRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    Sentry.setTag("page", location.pathname);
  }, [location]);

  return useRoutes([]); // Placeholder, actual routes should be wrapped or handled by Sentry.reactRouterV6BrowserTracingIntegration
};

export const captureError = (error: unknown, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};
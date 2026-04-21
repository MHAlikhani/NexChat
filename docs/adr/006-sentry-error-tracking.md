# ADR 006: Sentry for Error Tracking

## Status

Accepted

## Context

Production applications need visibility into runtime errors. Without error tracking:

- Users encounter silent failures
- Developers can't reproduce issues
- Bug reports are incomplete
- Performance problems go unnoticed

We evaluated:

1. Sentry
2. LogRocket
3. Bugsnag
4. Rollbar
5. Custom error logging

## Decision

We chose **Sentry** for error tracking and performance monitoring.

## Consequences

### Positive

- ✅ **Rich context**: Automatically captures breadcrumbs, user info, request data
- ✅ **Source maps**: Maps minified errors to original TypeScript code
- ✅ **Performance monitoring**: Tracks slow API calls and render times
- ✅ **Alerting**: Email/Slack notifications for new errors
- ✅ **React integration**: Error boundaries with Sentry context
- ✅ **Free tier**: 5K errors/month free for small teams
- ✅ **Self-hosted option**: Available if data privacy is critical

### Negative

- ⚠️ **Bundle size**: Adds ~50KB to bundle
- ⚠️ **Cost at scale**: Expensive for high-traffic applications
- ⚠️ **Privacy concerns**: Sends error data to third party (mitigated by self-hosting)
- ⚠️ **Setup complexity**: Requires configuration for source maps and environments

## Alternatives Considered

### LogRocket

- **Rejected**: More focused on session replay than error tracking
- **When it makes sense**: Apps needing full session replay, debugging UX issues

### Bugsnag

- **Rejected**: Less feature-rich than Sentry, smaller community
- **When it makes sense**: Simpler error tracking needs, budget constraints

### Rollbar

- **Rejected**: Less intuitive UI, fewer integrations
- **When it makes sense**: Backend-heavy applications, on-premise requirements

### Custom error logging

- **Rejected**: Too much maintenance, missing features
- **When it makes sense**: Air-gapped environments, extreme privacy requirements

## Implementation

### Initialization (`src/lib/sentry.ts`)

```tsx
import * as Sentry from '@sentry/react';

export function SentryInit() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    // Silent no-op if DSN not configured
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.error('[Sentry]', error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}
```

### Error Boundary Integration

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    captureError(error, {
      componentStack: errorInfo.componentStack,
      source: 'App ErrorBoundary',
    });
  }}
>
  <App />
</ErrorBoundary>
```

### Console Stripping in Production

```ts
// vite.config.ts
esbuild: {
  pure: ['console.log', 'console.debug', 'console.trace'],
}
```

This ensures debug logs don't leak to production while preserving `console.error` for critical errors.

## Configuration

Required environment variable:

```
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

Optional:

- `VITE_SENTRY_ENVIRONMENT` (defaults to `import.meta.env.MODE`)
- `VITE_SENTRY_RELEASE` (defaults to package version)

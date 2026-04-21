# Environment Variables

NexChat uses environment variables for configuration. Variables are validated at startup to fail fast if misconfigured.

## Required Variables

These variables **must** be set for the application to run:

| Variable                            | Description                  | Example                   |
| ----------------------------------- | ---------------------------- | ------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase API key             | `AIza...`                 |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase auth domain         | `nexchat.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID          | `nexchat`                 |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket      | `nexchat.appspot.com`     |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789`               |
| `VITE_FIREBASE_APP_ID`              | Firebase app ID              | `1:123456789:web:abcdef`  |

## Optional Variables

| Variable                  | Description                   | Default                       |
| ------------------------- | ----------------------------- | ----------------------------- |
| `VITE_SENTRY_DSN`         | Sentry DSN for error tracking | `undefined` (Sentry disabled) |
| `VITE_SENTRY_ENVIRONMENT` | Sentry environment name       | `import.meta.env.MODE`        |
| `VITE_SENTRY_RELEASE`     | Sentry release version        | `package.json` version        |

## Environment Files

### `.env.local` (Development)

Create this file in the project root:

```bash
# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Sentry (OPTIONAL)
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

⚠️ **Important**: `.env.local` is in `.gitignore` — never commit this file.

### `.env.example` (Template)

A template file is provided for reference:

```bash
# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Sentry (OPTIONAL)
VITE_SENTRY_DSN=
```

## Validation

Environment variables are validated at startup in `src/lib/env.ts`:

```tsx
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

function validateEnv(): Record<RequiredEnvVar, string> {
  const missingVars = requiredEnvVars.filter((envVar) => !import.meta.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please check your .env.local file and ensure all required variables are set.`
    );
  }

  return {/* validated env */};
}

export const env = validateEnv();
```

If any required variable is missing, the app throws an error immediately with a clear message.

## Accessing Variables

Import the validated `env` object:

```tsx
import { env } from '@/lib/env';

// Use variables
console.log(env.VITE_FIREBASE_PROJECT_ID);
```

Or access directly (not recommended, no type safety):

```tsx
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
```

## Build-Time Variables

Vite injects environment variables at build time:

```ts
// vite.config.ts
define: {
  // Not needed — Vite handles import.meta.env automatically
}
```

Variables starting with `VITE_` are exposed to client code. Never put secrets in `VITE_` variables.

## Security Considerations

### ✅ Do

- Store secrets in `.env.local` (ignored by git)
- Use `VITE_` prefix only for client-safe values
- Validate variables at startup

### ❌ Don't

- Commit `.env.local` to version control
- Put Firebase Admin SDK credentials in client variables
- Store API keys that grant privileged access in client variables

## Production Deployment

For production deployments:

### Vercel

1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Deploy — Vercel injects variables at build time

### Netlify

1. Go to Site settings → Environment variables
2. Add all required variables
3. Deploy — Netlify injects variables at build time

### Docker

```dockerfile
ENV VITE_FIREBASE_API_KEY=your_key
ENV VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... etc
```

⚠️ **Note**: Docker `ENV` variables are baked into the image. Use secrets management for production.

## CI/CD Variables

For CI/CD pipelines (GitHub Actions, GitLab CI):

```yaml
# .github/workflows/deploy.yml
env:
  VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
  VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
  # ... etc
```

Store sensitive values as repository secrets, never in code.

## Troubleshooting

### "Missing required environment variables" Error

- **Cause**: `.env.local` file missing or variables not set
- **Solution**: Create `.env.local` with all required variables

### Variables Not Loading in Dev

- **Cause**: File not in project root, wrong name
- **Solution**: Ensure file is `.env.local` in project root

### Variables Not Loading in Build

- **Cause**: Variables not prefixed with `VITE_`
- **Solution**: All client variables must start with `VITE_`

### Type Errors

- **Cause**: TypeScript doesn't know about custom env variables
- **Solution**: Add to `src/vite-env.d.ts`:

```ts
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  // ... etc
}
```

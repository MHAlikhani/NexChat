/**
 * Environment variable validation
 * Ensures all required environment variables are present at runtime.
 *
 * The `env` export is validated at module import time (fail-fast).
 * Do NOT call `validateEnv()` separately — import `env` instead.
 *
 * @module lib/env
 */

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

function validateEnv(): Record<RequiredEnvVar, string> {
  const missingVars = requiredEnvVars.filter((envVar) => !import.meta.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please check your .env.local file and ensure all required variables are set.`
    );
  }

  return {
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

/**
 * Validated environment variables.
 * Throws at module import time if any required variables are missing.
 */
export const env = validateEnv();

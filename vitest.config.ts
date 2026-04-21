import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfigFn from './vite.config';
import type { ConfigEnv, UserConfig } from 'vite';

export default defineConfig(async (configEnv) => {
  // Resolve the callback-based vite config
  const resolvedViteConfig =
    typeof viteConfigFn === 'function'
      ? await (viteConfigFn as (env: ConfigEnv) => UserConfig | Promise<UserConfig>)(configEnv)
      : viteConfigFn;

  return mergeConfig(
    resolvedViteConfig,
    defineConfig({
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          exclude: [
            'node_modules/',
            'src/test/',
            '**/*.d.ts',
            '**/*.config.ts',
            '**/*.config.js',
            'src/main.tsx',
            '**/*.mock.ts',
            '**/*.mock.tsx',
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.ts',
            '**/*.spec.tsx',
          ],
        },
      },
    })
  );
});

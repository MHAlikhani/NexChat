// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        babel: false,
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['react', 'react-dom'],
    },

    server: {
      port: 5173,
      strictPort: false,
      hmr: {
        overlay: true,
      },
      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/App.tsx',
          './src/lib/firebase.ts',
          './src/lib/i18n.ts',
        ],
      },
    },

    build: {
      target: 'es2022',
      sourcemap: 'hidden',
      minify: isProd ? 'esbuild' : false,
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 300,
      modulePreload: {
        polyfill: false,
      },
      reportCompressedSize: false,

      rollupOptions: {
        treeshake: {
          moduleSideEffects: false,
        },
        output: {
          manualChunks(id) {
            // React core
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'vendor-react';
            }

            // Router
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router';
            }

            // MUI
            if (id.includes('node_modules/@mui/material')) {
              return 'vendor-mui-core';
            }
            if (id.includes('node_modules/@mui/icons-material')) {
              return 'vendor-mui-icons';
            }
            if (id.includes('node_modules/@emotion')) {
              return 'vendor-emotion';
            }

            // Firebase
            if (
              id.includes('node_modules/@firebase/auth') ||
              id.includes('node_modules/firebase/auth')
            ) {
              return 'vendor-firebase-auth';
            }
            if (
              id.includes('node_modules/@firebase/firestore') ||
              id.includes('node_modules/firebase/firestore')
            ) {
              return 'vendor-firebase-firestore';
            }
            if (
              id.includes('node_modules/firebase/app') ||
              id.includes('node_modules/@firebase/app')
            ) {
              return 'vendor-firebase-app';
            }

            // i18n
            if (id.includes('node_modules/i18next')) {
              return 'vendor-i18n';
            }

            // State management & utilities
            if (id.includes('node_modules/zustand')) {
              return 'vendor-state';
            }
            if (id.includes('node_modules/@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('node_modules/@tanstack/react-virtual')) {
              return 'vendor-virtual';
            }

            // Forms
            if (
              id.includes('node_modules/zod') ||
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform')
            ) {
              return 'vendor-forms';
            }

            // Sentry
            if (id.includes('node_modules/@sentry')) {
              return 'vendor-sentry';
            }
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = path.extname(assetInfo.name || '').slice(1);
            if (ext === 'css') return 'assets/css/[name]-[hash].css';
            if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },

      ...(isProd && {
        esbuild: {
          drop: ['debugger'],
          pure: ['console.log', 'console.debug', 'console.trace'],
          legalComments: 'none',
          treeShaking: true,
          minifyIdentifiers: true,
          minifySyntax: true,
          minifyWhitespace: true,
        },
      }),
    },

    define: {},

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'src/test/setup.ts', '**/*.d.ts'],
      },
    },
  };
});

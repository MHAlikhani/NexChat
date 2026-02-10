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
    plugins: [react()],

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
    },

    build: {
      // Target modern browsers for smaller output
      target: 'es2022',
      // Hidden sourcemaps in production for debugging without exposing to public
      sourcemap: 'hidden',
      // Use esbuild for minification (fastest, smallest output)
      minify: isProd ? 'esbuild' : false,
      // Remove all console/debugger in production
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 300,

      rollupOptions: {
        // Tree-shaking optimizations
        treeshake: true,
        output: {
          // Manual chunking for optimal loading
          manualChunks(id) {
            // Vendor - React core
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'vendor-react';
            }

            // Router (lazy loaded)
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router';
            }

            // MUI - split core and icons
            if (id.includes('node_modules/@mui/material')) {
              return 'vendor-mui-core';
            }
            if (id.includes('node_modules/@mui/icons-material')) {
              // Icons are tree-shakeable - this chunk will only contain used icons
              return 'vendor-mui-icons';
            }
            if (id.includes('node_modules/@emotion')) {
              return 'vendor-emotion';
            }

            // Firebase - split by service
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

            // i18n - lazy loaded, separate chunk
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

            // Validation (only loaded when creating rooms)
            if (
              id.includes('node_modules/zod') ||
              id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/@hookform')
            ) {
              return 'vendor-forms';
            }

            // Sentry - loaded lazily in its own chunk
            if (id.includes('node_modules/@sentry')) {
              return 'vendor-sentry';
            }
          },
          // Optimize chunk file names
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const ext = path.extname(assetInfo.name || '').slice(1);
            if (ext === 'css') return 'assets/css/[name]-[hash].css';
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },

      // esbuild options for production
      ...(isProd && {
        // Drop debugger statements, but keep console.error for production error logging
        esbuild: {
          drop: ['debugger'],
          legalComments: 'none',
          treeShaking: true,
          minifyIdentifiers: true,
          minifySyntax: true,
          minifyWhitespace: true,
        },
      }),
    },

    // Define compile-time constants to remove dev-only code
    define: {
      'import.meta.env.PROD': isProd,
      'import.meta.env.DEV': !isProd,
    },

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

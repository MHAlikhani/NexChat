// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

// Validate environment variables early to fail fast.
import { env } from './lib/env';
void env;

// Initialize i18n and Sentry before rendering
import './lib/i18n';
import { SentryInit } from './lib/sentry';

import { App } from './App';
import { theme } from './styles/theme';
import './styles/global.css';

// Initialize Sentry silently (no warning if DSN not configured)
SentryInit();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
      gcTime: 1000 * 60 * 10,
    },
  },
});

// Remove initial loader after React mounts
const removeInitialLoader = () => {
  const loader = document.querySelector('.initial-loader');
  if (loader?.parentNode) {
    loader.parentNode.removeChild(loader);
  }
};

const rootElement = document.getElementById('root')!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '0.875rem',
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

requestAnimationFrame(removeInitialLoader);

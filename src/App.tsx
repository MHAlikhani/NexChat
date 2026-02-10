/**
 * App Component
 *
 * @module App
 *
 * Wraps each route with an ErrorBoundary to prevent a single page
 * crash from taking down the entire application. Each page is
 * isolated so that errors in one route don't affect others.
 *
 * Uses React.lazy with Suspense for code-splitting, so each page
 * is loaded on demand, reducing the initial bundle size.
 */

import { lazy, Suspense, type ErrorInfo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AuthGuard } from '@/features/auth';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { captureError } from '@/lib/sentry';

// Lazy-loaded pages for code-splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));

/**
 * Route-level fallback component shown while lazy-loaded pages
 * are being fetched, or when a page encounters a rendering error.
 */
const PageLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: '#0B0F19',
    }}
  >
    <CircularProgress sx={{ color: '#0A84FF' }} size={48} thickness={4} />
  </Box>
);

/**
 * Handles errors caught by page-level ErrorBoundaries and reports
 * them to Sentry with the page context.
 */
const handlePageError = (pageName: string) => (error: Error, errorInfo: ErrorInfo) => {
  captureError(error, {
    componentStack: errorInfo.componentStack,
    source: `${pageName} ErrorBoundary`,
    page: pageName,
  });
};

export const App = () => {
  return (
    <ErrorBoundary
      onError={(error: Error, errorInfo: ErrorInfo) => {
        captureError(error, {
          componentStack: errorInfo.componentStack,
          source: 'App ErrorBoundary',
        });
      }}
    >
      <AuthProvider>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <ErrorBoundary onError={handlePageError('HomePage')}>
                  <HomePage />
                </ErrorBoundary>
              }
            />

            {/* Guest-only Routes */}
            <Route
              path="/login"
              element={
                <ErrorBoundary onError={handlePageError('LoginPage')}>
                  <AuthGuard guestOnly>
                    <LoginPage />
                  </AuthGuard>
                </ErrorBoundary>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/chat"
              element={
                <ErrorBoundary onError={handlePageError('ChatPage')}>
                  <AuthGuard>
                    <ChatPage />
                  </AuthGuard>
                </ErrorBoundary>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
};

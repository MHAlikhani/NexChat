/**
 * App Component
 *
 * @module App
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AuthGuard } from '@/features/auth';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { captureError } from '@/lib/sentry';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import ChatPage from '@/pages/ChatPage';

export const App = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        captureError(error, {
          componentStack: errorInfo.componentStack,
          source: 'App ErrorBoundary',
        });
      }}
    >
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />

          {/* Guest-only Routes */}
          <Route
            path="/login"
            element={
              <AuthGuard guestOnly>
                <LoginPage />
              </AuthGuard>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/chat"
            element={
              <AuthGuard>
                <ChatPage />
              </AuthGuard>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
};

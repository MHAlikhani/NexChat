/**
 * App Component
 *
 * @module app/App
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AuthGuard } from '@/features/auth';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));

/**
 * Loading fallback
 */
const LoadingFallback = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="100vh"
    gap={2}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" color="text.secondary">
      در حال بارگذاری...
    </Typography>
  </Box>
);

export const App = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>

      {/* React Query Devtools (فقط در توسعه) */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </AuthProvider>
  );
};
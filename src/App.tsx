// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AuthGuard } from '@/features/auth';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import ChatPage from '@/pages/ChatPage';

export const App = () => {
  return (
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
  );
};
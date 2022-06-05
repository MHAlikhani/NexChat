/**
 * Auth Guard Component (Guard Pattern)
 *
 * از routeهای محافظت‌شده اطمینان حاصل می‌کند.
 * اگر کاربر لاگین نکرده باشد، به صفحه ورود هدایت می‌شود.
 *
 * @module features/auth/components/AuthGuard
 */

import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuthStore, authSelectors } from '../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  /** اگر true باشد، فقط کاربران لاگین‌نشده دسترسی دارند (مثل صفحه ورود) */
  guestOnly?: boolean;
}

/**
 * Auth Guard
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  guestOnly = false,
}) => {
  const location = useLocation();
  const user = useAuthStore(authSelectors.selectUser);
  const isInitialized = useAuthStore(authSelectors.selectIsInitialized);
  const isAuthenticated = user !== null;

  // Still loading auth state
  if (!isInitialized) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Route requires authentication but user is not logged in
  if (!guestOnly && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Route is for guests only but user is already logged in
  if (guestOnly && isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  // User is authorized
  return <>{children}</>;
};
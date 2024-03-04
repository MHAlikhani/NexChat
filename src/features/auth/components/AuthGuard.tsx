/**
 * Auth Guard Component (Guard Pattern)
 *
 * @module features/auth/components/AuthGuard
 */

import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuthStore, authSelectors } from '../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  guestOnly?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  guestOnly = false,
}) => {
  const location = useLocation();
  const user = useAuthStore(authSelectors.selectUser);
  const isInitialized = useAuthStore(authSelectors.selectIsInitialized);
  const isAuthenticated = user !== null;

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

  if (!guestOnly && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (guestOnly && isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

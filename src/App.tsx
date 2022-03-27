import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

// Lazy load routes for code splitting - باید از lazy() استفاده شود
const HomePage = lazy(() => import('./pages/HomePage'));

// Loading fallback component
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
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
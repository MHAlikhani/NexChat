/**
 * ErrorBoundary Component
 *
 * @module app/components/ErrorBoundary
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline as ErrorOutlineIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import i18n from '@/lib/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            gap: 2,
            bgcolor: '#0B0F19',
            color: '#F8FAFC',
          }}
          dir={i18n.dir()}
        >
          <Box
            sx={{
              p: 2.5,
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0.05) 100%)',
              border: '1px solid rgba(255, 107, 107, 0.2)',
              mb: 1,
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 56, color: '#FF6B6B' }} />
          </Box>

          <Typography variant="h4" fontWeight="800" gutterBottom>
            {i18n.t('errors.unknown')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8' }} align="center">
            {i18n.t('errors.serverError')}
          </Typography>

          {import.meta.env.DEV && this.state.error && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'rgba(255, 107, 107, 0.08)',
                border: '1px solid rgba(255, 107, 107, 0.15)',
                borderRadius: 1,
                fontFamily: 'monospace',
                maxWidth: 600,
                overflow: 'auto',
              }}
            >
              {this.state.error.message}
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={this.handleReload}
              startIcon={<RefreshIcon />}
              sx={{
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #7000FF 0%, #00F0FF 100%)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(112, 0, 255, 0.3)',
                },
              }}
            >
              {i18n.t('common.retry')}
            </Button>
            <Button
              variant="outlined"
              onClick={this.handleReset}
              sx={{
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                color: '#94A3B8',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              {i18n.t('common.retry')}
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

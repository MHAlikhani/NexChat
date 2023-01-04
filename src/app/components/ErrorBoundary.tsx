import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
  }

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
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            خطایی رخ داد
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center">
            متأسفانه مشکلی در بارگذاری صفحه پیش آمده است.
          </Typography>
          {this.state.error && (
            <Typography
              variant="body2"
              color="error"
              sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}
            >
              {this.state.error.message}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            بارگذاری مجدد صفحه
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
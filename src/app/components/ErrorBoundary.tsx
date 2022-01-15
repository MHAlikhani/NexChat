import React, { Component, ErrorInfo, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary برای گرفتن خطاهای غیرمنتظره در سطح کامپوننت
 * و جلوگیری از کرش کامل اپلیکیشن
 */
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // TODO: Send error to monitoring service (e.g., Sentry)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          p={3}
          bgcolor="background.default"
        >
          <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              خطای غیرمنتظره
            </Typography>
            <Typography variant="body2">
              متأسفانه مشکلی در بارگذاری برنامه پیش آمده است. لطفاً صفحه را رفرش کنید.
            </Typography>
          </Alert>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              component="pre"
              sx={{
                bgcolor: 'grey.900',
                color: 'grey.100',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxWidth: '80vw',
                fontSize: '0.875rem',
              }}
            >
              {this.state.error.toString()}
            </Box>
          )}
          
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
            sx={{ mt: 3 }}
          >
            بازگشت به صفحه اصلی
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
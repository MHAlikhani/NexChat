import { Box, Typography, Button, Container } from '@mui/material';
import { Chat as ChatIcon, Google as GoogleIcon } from '@mui/icons-material';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // TODO: Implement Firebase Google Sign-In
    alert('Google Sign-In will be implemented soon');
  };

  return (
    <>
      <div className="aurora-background" />

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 3,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container maxWidth="xs">
          <Box
            className="glass-panel"
            sx={{
              padding: { xs: 4, sm: 5 },
              textAlign: 'center',
              borderRadius: 3,
              animation: 'slideUpFade 0.25s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                mb: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChatIcon sx={{ fontSize: 36, color: '#FFFFFF' }} />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              fontWeight="700"
              sx={{ color: '#FFFFFF', letterSpacing: '-0.02em', mb: 1 }}
            >
              NexChat
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: '#8E8E93', mb: 1, lineHeight: 1.5 }}
            >
              Next-generation enterprise messaging platform
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: '#636366', display: 'block', mb: 4 }}
            >
              Version 2.0.0 (Enterprise Edition)
            </Typography>

            <Button
              variant="contained"
              size="large"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2.5,
                textTransform: 'none',
                bgcolor: '#FFFFFF',
                color: '#1C1C1E',
                '&:hover': {
                  bgcolor: '#F5F5F7',
                },
              }}
            >
              Sign in with Google
            </Button>

            <Typography
              variant="caption"
              sx={{ color: '#636366', mt: 4, display: 'block' }}
            >
              Built with React 18 + TypeScript + Firebase
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}

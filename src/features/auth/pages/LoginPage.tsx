import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { Chat as ChatIcon, Google as GoogleIcon } from '@mui/icons-material';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    // TODO: Implement Firebase Google Sign-In
    alert('ورود با گوگل به زودی پیاده‌سازی می‌شود');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: 5,
            textAlign: 'center',
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <ChatIcon sx={{ fontSize: 80, color: '#25D366', mb: 2 }} />
          
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            NexChat
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            پلتفرم پیام‌رسان سازمانی نسل جدید
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            نسخه 2.0.0 (Enterprise Edition)
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3,
                textTransform: 'none',
                backgroundColor: '#fff',
                color: '#757575',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                }
              }}
            >
              ورود با حساب گوگل
            </Button>
          </Box>
          
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="caption" color="text.secondary">
              ساخته شده با React 18 + TypeScript + Firebase
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
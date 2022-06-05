import { Box, Typography, Container, Paper } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { SignInButton } from '@/features/auth';

export default function LoginPage() {
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
      <Container maxWidth="xs">
        <Paper
          elevation={8}
          sx={{
            padding: 5,
            textAlign: 'center',
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
          }}
        >
          <ChatIcon sx={{ fontSize: 60, color: '#25D366', mb: 2 }} />

          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            خوش آمدید
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            برای ادامه وارد حساب خود شوید
          </Typography>

          <Box sx={{ mt: 4 }}>
            <SignInButton fullWidth />
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            با ورود، شرایط استفاده را می‌پذیرید
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
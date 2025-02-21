import { Box, Typography, Container, Button } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { SignInButton } from '@/features/auth';

export default function LoginPage() {
  return (
    <>
      {/* Aurora Background */}
      <div className="aurora-background">
        <div className="aurora-orb"></div>
      </div>

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
              padding: 5,
              textAlign: 'center',
              borderRadius: 4,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              animation: 'slideUpFade 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}
          >
            <Box 
              sx={{ 
                display: 'inline-flex',
                p: 2.5,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.2) 0%, rgba(0, 240, 255, 0.2) 100%)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                mb: 3,
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
              }}
            >
              <ChatIcon sx={{ fontSize: 56, color: '#00F0FF' }} />
            </Box>

            <Typography variant="h3" component="h1" gutterBottom fontWeight="800" sx={{ color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              به <span className="text-gradient">NexChat</span> خوش آمدید
            </Typography>

            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4, lineHeight: 1.7 }}>
              تجربه‌ای مدرن، سریع و امن از گفتگو را آغاز کنید.
            </Typography>

            <Box sx={{ mt: 2 }}>
              <SignInButton fullWidth />
            </Box>

            <Typography variant="caption" sx={{ color: '#64748B', mt: 4, display: 'block', lineHeight: 1.6 }}>
              با ورود، <span style={{ color: '#00F0FF', cursor: 'pointer' }}>شرایط استفاده</span> و <span style={{ color: '#00F0FF', cursor: 'pointer' }}>حریم خصوصی</span> را می‌پذیرید.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}
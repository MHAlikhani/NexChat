import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <ChatIcon sx={{ fontSize: 80, color: '#25D366', mb: 2 }} />

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            NexChat
          </Typography>

          <Typography variant="h6" color="text.secondary" paragraph>
            {t('home.subtitle')}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            {t('home.version')}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 3,
                textTransform: 'none',
              }}
              onClick={() => navigate('/login')}
            >
              {t('home.getStarted')}
            </Button>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="caption" color="text.secondary">
              {t('home.builtWith')}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

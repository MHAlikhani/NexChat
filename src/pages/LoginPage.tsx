import { Trans, useTranslation } from 'react-i18next';
import { Box, Typography, Container } from '@mui/material';
import { Chat as ChatIcon } from '@mui/icons-material';
import { SignInButton } from '@/features/auth';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <>
      {/* Ambient Background */}
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

            {/* Title */}
            <Typography
              variant="h4"
              component="h1"
              fontWeight="700"
              sx={{
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                mb: 1,
              }}
            >
              <Trans
                i18nKey="auth.welcomeTo"
                components={{
                  gradient: <span className="text-gradient" />,
                }}
              />
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body1"
              sx={{
                color: '#8E8E93',
                mb: 4,
                lineHeight: 1.5,
              }}
            >
              {t('auth.loginSubtitle')}
            </Typography>

            {/* Sign In Button */}
            <Box sx={{ mt: 1 }}>
              <SignInButton fullWidth />
            </Box>

            {/* Terms */}
            <Typography
              variant="caption"
              sx={{
                color: '#636366',
                mt: 4,
                display: 'block',
                lineHeight: 1.6,
              }}
            >
              <Trans
                i18nKey="auth.termsAgreement"
                components={{
                  terms: (
                    <span style={{ color: '#0A84FF', cursor: 'pointer' }} />
                  ),
                  privacy: (
                    <span style={{ color: '#0A84FF', cursor: 'pointer' }} />
                  ),
                }}
              />
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}

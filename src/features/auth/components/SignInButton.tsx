/**
 * Sign In Button Component
 *
 * @module features/auth/components/SignInButton
 */

import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

interface SignInButtonProps {
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  className?: string;
}

export const SignInButton: React.FC<SignInButtonProps> = ({
  size = 'large',
  fullWidth = false,
  className,
}) => {
  const { t } = useTranslation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signIn, clearError } = useAuth();

  const handleClick = async () => {
    setIsSigningIn(true);
    clearError();

    try {
      const toastId = toast.loading(t('auth.signingIn'));
      await signIn();
      toast.success(t('auth.signInSuccess'), { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.signInFailed');
      toast.error(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Button
      variant="contained"
      size={size}
      fullWidth={fullWidth}
      onClick={handleClick}
      disabled={isSigningIn}
      className={className}
      startIcon={
        isSigningIn ? (
          <CircularProgress size={20} sx={{ color: '#0B0F19' }} />
        ) : (
          <GoogleIcon sx={{ color: '#EA4335' }} />
        )
      }
      sx={{
        textTransform: 'none',
        fontWeight: 700,
        fontSize: size === 'large' ? '1.05rem' : '0.9rem',
        paddingX: 3,
        paddingY: size === 'large' ? 1.75 : 1.25,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
        color: '#0B0F19',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: '0 4px 15px rgba(0, 240, 255, 0.25)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        '&:hover': {
          background: 'linear-gradient(135deg, #66F9FF 0%, #9D4DFF 100%)',
          boxShadow: '0 8px 25px rgba(0, 240, 255, 0.4)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
        '&:disabled': {
          background: 'rgba(255,255,255,0.1)',
          color: '#64748B',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'none',
        },
      }}
    >
      {isSigningIn ? t('auth.signingIn') : t('auth.signInWithGoogle')}
    </Button>
  );
};

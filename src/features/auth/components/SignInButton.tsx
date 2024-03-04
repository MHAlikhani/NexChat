/**
 * Sign In Button Component
 *
 * @module features/auth/components/SignInButton
 */

import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

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
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { signIn, clearError } = useAuth();

  const handleClick = async () => {
    setIsSigningIn(true);
    clearError();

    try {
      const toastId = toast.loading('در حال ورود...');
      await signIn('google');
      toast.success('ورود موفقیت‌آمیز بود', { id: toastId });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'ورود ناموفق بود';
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
          <CircularProgress size={20} color="inherit" />
        ) : (
          <GoogleIcon />
        )
      }
      sx={{
        textTransform: 'none',
        fontWeight: 600,
        fontSize: size === 'large' ? '1rem' : '0.875rem',
        paddingX: 3,
        paddingY: size === 'large' ? 1.5 : 1,
        background: '#ffffff',
        color: '#757575',
        border: '1px solid #dadce0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        '&:hover': {
          background: '#f8f9fa',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
        '&:disabled': {
          background: '#f5f5f5',
          color: '#9e9e9e',
        },
      }}
    >
      {isSigningIn ? 'در حال ورود...' : 'ورود با گوگل'}
    </Button>
  );
};

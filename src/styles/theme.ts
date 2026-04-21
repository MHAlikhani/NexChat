/**
 * MUI Theme Configuration
 *
 * Apple-inspired dark mode design with careful attention to
 * typography, spacing, and component consistency.
 *
 * @module styles/theme
 */

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0A84FF',
      light: '#409CFF',
      dark: '#0064D2',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5E5CE6',
      light: '#7A78F0',
      dark: '#3634A3',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF453A',
      light: '#FF6961',
      dark: '#D70015',
    },
    warning: {
      main: '#FF9F0A',
      light: '#FFB84D',
      dark: '#C67C00',
    },
    success: {
      main: '#30D158',
      light: '#5FE37D',
      dark: '#00A33A',
    },
    background: {
      default: '#000000',
      paper: 'rgba(28, 28, 30, 0.8)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
    },
    divider: 'rgba(84, 84, 88, 0.65)',
  },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.015em' },
    h3: { fontWeight: 600, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.5, letterSpacing: '-0.005em' },
    body2: { lineHeight: 1.45, color: '#8E8E93' },
    caption: { letterSpacing: '0' },
  },
  shape: {
    borderRadius: 10,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.15) transparent',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 22px',
          transition: 'opacity 0.15s ease, transform 0.1s ease',
          boxShadow: 'none',
          '&:hover': {
            opacity: 0.85,
            boxShadow: 'none',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        containedPrimary: {
          background: '#0A84FF',
          color: '#FFFFFF',
          '&:hover': {
            background: '#0A84FF',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(28, 28, 30, 0.8)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: 'rgba(118, 118, 128, 0.12)',
            border: 'none',
            transition: 'background-color 0.15s ease',
            '& fieldset': { border: 'none' },
            '&:hover': {
              backgroundColor: 'rgba(118, 118, 128, 0.18)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(118, 118, 128, 0.24)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: '0.5px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'background-color 0.15s ease',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: 'none',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: 16,
          paddingRight: 16,
          '@media (min-width: 600px)': {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
  },
});

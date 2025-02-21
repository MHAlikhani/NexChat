import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00F0FF',
      light: '#66F9FF',
      dark: '#00B8C4',
      contrastText: '#0B0F19',
    },
    secondary: {
      main: '#7000FF',
      light: '#9D4DFF',
      dark: '#4A00A8',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#CC4444',
    },
    warning: {
      main: '#FFA500',
      light: '#FFB833',
      dark: '#CC8400',
    },
    background: {
      default: '#0B0F19',
      paper: 'rgba(255, 255, 255, 0.03)',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: '"Vazirmatn", "Yekan Bakh", "Inter", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.7, letterSpacing: '0.01em' },
    body2: { lineHeight: 1.6, color: '#94A3B8' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 12,
          padding: '10px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px -5px rgba(0, 240, 255, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)',
          color: '#0B0F19',
          '&:hover': {
            background: 'linear-gradient(135deg, #66F9FF 0%, #9D4DFF 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            '& fieldset': { border: 'none' },
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid #00F0FF',
              boxShadow: '0 0 0 4px rgba(0, 240, 255, 0.1)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
      },
    },
  },
});
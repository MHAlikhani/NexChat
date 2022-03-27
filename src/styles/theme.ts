import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#25D366',
      light: '#6FFFCB',
      dark: '#128C7E',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#075E54',
      light: '#548b7f',
      dark: '#04362f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Iran Sans", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
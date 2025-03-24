import { createTheme } from '@mui/material/styles';

export const COLOR_PALETTE = {
  light: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundActive: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    hover: '#f1f5f9',
  },
  dark: {
    primary: '#3b82f6',
    secondary: '#94a3b8',
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundActive: '#334155',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    border: '#334155',
    hover: '#1e293b',
  },
};

export const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: COLOR_PALETTE[mode].primary,
      },
      secondary: {
        main: COLOR_PALETTE[mode].secondary,
      },
      background: {
        default: COLOR_PALETTE[mode].background,
        paper: COLOR_PALETTE[mode].backgroundSecondary,
      },
      text: {
        primary: COLOR_PALETTE[mode].text,
        secondary: COLOR_PALETTE[mode].textSecondary,
      },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: COLOR_PALETTE[mode].background,
            color: COLOR_PALETTE[mode].text,
          },
        },
      },
    },
  });
};

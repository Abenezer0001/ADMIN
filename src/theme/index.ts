import { createTheme } from '@mui/material/styles';

export const COLOR_PALETTE = {
  dark: {
    primary: '#255ee3',
    secondary: '#905cec',
    success: '#4da34e',
    warning: '#ee7325',
    purple: '#795583',
    background: '#101825',
    backgroundSecondary: '#1a2332',
    backgroundActive: '#255ee3',
    text: '#fefefe',
    textSecondary: '#adaeb0',
    border: 'rgba(254, 254, 254, 0.12)',
    hover: 'rgba(254, 254, 254, 0.08)',
    selected: '#4da34e',
    chart: {
      gradient1: '#255ee3',
      gradient2: 'rgba(37, 94, 227, 0.3)',
    },
  },
  light: {
    primary: '#255ee3',
    secondary: '#905cec',
    success: '#4da34e',
    warning: '#ee7325',
    purple: '#795583',
    background: '#f8fafc',
    backgroundSecondary: '#ffffff',
    backgroundActive: '#f1f5f9',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: '#4da34e',
    sidebarBackground: '#f1f5f9',
    navbarBackground: '#f8fafc',
    cardBackground: '#ffffff',
    chart: {
      gradient1: '#255ee3',
      gradient2: 'rgba(37, 94, 227, 0.3)',
    },
  },
};

export const createAppTheme = (mode: 'light' | 'dark') => {
  const colors = mode === 'dark' ? COLOR_PALETTE.dark : COLOR_PALETTE.light;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: '#6c8cff',
        dark: '#2d47c9',
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary,
        light: '#65ffbe',
        dark: '#00a06d',
        contrastText: '#ffffff',
      },
      background: {
        default: colors.background,
        paper: colors.backgroundSecondary,
      },
      text: {
        primary: colors.text,
        secondary: colors.textSecondary,
      },
      divider: colors.border,
      action: {
        hover: colors.hover,
        selected: colors.selected,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.backgroundSecondary,
            boxShadow: 'none',
            borderBottom: `1px solid ${colors.border}`,
            height: '64px',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colors.backgroundSecondary,
            borderRight: `1px solid ${colors.border}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: colors.backgroundSecondary,
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
          },
        },
      },
    },
    typography: {
      fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        letterSpacing: '-0.025em',
      },
      h2: {
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '-0.025em',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        letterSpacing: '-0.015em',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        letterSpacing: '-0.015em',
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        letterSpacing: '-0.01em',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '-0.01em',
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.025em',
      },
    },
    shape: {
      borderRadius: 12,
    },
  });
};

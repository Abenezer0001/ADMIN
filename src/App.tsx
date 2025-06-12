import React from 'react';
const { useState, useEffect, useMemo } = React;
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import MainLayout from './components/Layout';
import AppRoutes from './routes';
import { ConfigProvider, theme as antTheme } from 'antd';
import { createAppTheme, COLOR_PALETTE } from './theme';
import './styles/global.css';
import { PreferenceProvider } from './context/PreferenceContext';
import { AuthProvider } from './context/AuthContext';
import { RbacProvider } from './context/RbacContext';
import { BusinessProvider } from './context/BusinessContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PasswordSetup from './pages/PasswordSetup';
import ProtectedRoute from './components/common/ProtectedRoute';

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark';
    if (savedMode === 'light' || savedMode === 'dark') {
      return savedMode;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
  });

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const antdTheme = useMemo(() => ({
    token: {
      colorPrimary: mode === 'dark' ? COLOR_PALETTE.dark.primary : COLOR_PALETTE.light.primary,
      colorBgBase: mode === 'dark' ? COLOR_PALETTE.dark.background : COLOR_PALETTE.light.background,
      colorBgContainer: mode === 'dark' ? COLOR_PALETTE.dark.backgroundSecondary : COLOR_PALETTE.light.backgroundSecondary,
      colorBgElevated: mode === 'dark' ? COLOR_PALETTE.dark.backgroundActive : COLOR_PALETTE.light.backgroundActive,
      colorText: mode === 'dark' ? COLOR_PALETTE.dark.text : COLOR_PALETTE.light.text,
      colorTextSecondary: mode === 'dark' ? COLOR_PALETTE.dark.textSecondary : COLOR_PALETTE.light.textSecondary,
      colorBorder: mode === 'dark' ? COLOR_PALETTE.dark.border : COLOR_PALETTE.light.border,
      borderRadius: 8,
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      Menu: {
        colorItemBg: mode === 'dark' ? COLOR_PALETTE.dark.backgroundSecondary : COLOR_PALETTE.light.backgroundSecondary,
        colorItemText: mode === 'dark' ? COLOR_PALETTE.dark.text : COLOR_PALETTE.light.text,
        colorItemTextSelected: mode === 'dark' ? COLOR_PALETTE.dark.primary : COLOR_PALETTE.light.primary,
        colorItemBgSelected: mode === 'dark' ? COLOR_PALETTE.dark.backgroundActive : COLOR_PALETTE.light.backgroundActive,
        colorItemBgHover: mode === 'dark' ? COLOR_PALETTE.dark.hover : COLOR_PALETTE.light.hover,
      },
    },
    algorithm: mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  }), [mode]);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newMode = e.matches ? 'dark' : 'light';
      setMode(newMode);
      localStorage.setItem('themeMode', newMode);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <Provider store={store}>
      <PreferenceProvider>
        <ConfigProvider theme={antdTheme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
              <AuthProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/password-setup" element={<PasswordSetup />} />
                  
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={
                      <RbacProvider>
                        <BusinessProvider>
                          <MainLayout toggleTheme={toggleTheme} themeMode={mode}>
                            <AppRoutes />
                          </MainLayout>
                        </BusinessProvider>
                      </RbacProvider>
                    }>
                      <Route path="/*" element={null} />
                    </Route>
                  </Route>
                  
                  {/* Redirect to login if no route matches */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </AuthProvider>
            </Router>
          </ThemeProvider>
        </ConfigProvider>
      </PreferenceProvider>
    </Provider>
  );
};

export default App;

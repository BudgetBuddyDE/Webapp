import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@/style/global.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppConfig } from './app.config.ts';
import { AuthProvider } from '@/components/Auth';
import { SnackbarProvider } from '@/components/Snackbar';

const Wrapper = () => (
  <ThemeProvider theme={AppConfig.theme}>
    <AuthProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </AuthProvider>
    <CssBaseline />
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Wrapper />
    <SpeedInsights />
  </React.StrictMode>
);

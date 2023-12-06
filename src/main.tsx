import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@/style/global.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AuthProvider } from '@/core/Auth';
import { SnackbarProvider } from './core/Snackbar';
import { AppConfig } from './app.config.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={AppConfig.theme}>
      <AuthProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </AuthProvider>
      <CssBaseline />
    </ThemeProvider>
  </React.StrictMode>
);

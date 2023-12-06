import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/style/global_override.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import App from './App.tsx';
import { AuthProvider } from './context/Auth.context.tsx';
import { SnackbarProvider } from './context/Snackbar.context.tsx';
import { StoreProvider } from './context/Store.context.tsx';
import { DefaultTheme } from './style/theme/default.theme.ts';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={DefaultTheme}>
      <AuthProvider>
        <CssBaseline />
        <StoreProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

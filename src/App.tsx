import { Box, Container } from '@mui/material';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Copyright, Drawer, FilterDrawer, Main, ProtectedComponent, ProtectedRoute } from './components';
import {
  Budget,
  Categories,
  Dashboard,
  PaymentMethods,
  RequestReset,
  ResetPassword,
  Settings,
  SignIn,
  SignUp,
  Subscriptions,
  Transactions,
} from './routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex' }}>
        <Drawer />
        <Main
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflow: 'auto',
            height: '100vh',
            backgroundColor: (theme) => theme.palette.background.default,
          }}
        >
          <ProtectedComponent>
            <AppBar />
          </ProtectedComponent>
          <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/budget"
                element={
                  <ProtectedRoute>
                    <Budget />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscriptions"
                element={
                  <ProtectedRoute>
                    <Subscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-methods"
                element={
                  <ProtectedRoute>
                    <PaymentMethods />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/request-reset" element={<RequestReset />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/sign-up" element={<SignUp />} />
            </Routes>

            <ProtectedComponent>
              <FilterDrawer />
            </ProtectedComponent>
          </Container>
          <Box
            component="div"
            sx={{
              mt: 'auto',
            }}
          >
            <Copyright />
          </Box>
        </Main>
      </Box>
    </BrowserRouter>
  );
};

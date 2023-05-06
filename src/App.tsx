import { Box, Container } from '@mui/material';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Copyright, Drawer, FilterDrawer, Main, ProtectedComponents, ProtectedRoutes } from './components';
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
        <ProtectedComponents children={<Drawer />} />
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
          <ProtectedComponents children={<AppBar />} />
          <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
            <Routes>
              <Route path="/" element={<ProtectedRoutes />}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="budget" element={<Budget />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="payment-methods" element={<PaymentMethods />} />
                <Route path="categories" element={<Categories />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/request-reset" element={<RequestReset />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="*" element={<h1>404 Page Not Found</h1>} />
            </Routes>
            <ProtectedComponents children={<FilterDrawer />} />
          </Container>
          <Box sx={{ mt: 'auto' }}>
            <Copyright />
          </Box>
        </Main>
      </Box>
    </BrowserRouter>
  );
};

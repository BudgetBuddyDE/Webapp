import * as React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Main } from './components/main.component';
import { Copyright } from './components/copyright.component';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Dashboard } from './routes/dashboard.route';
import { Transactions } from './routes/transactions.route';
import { Budget } from './routes/budget.route';
import { Subscriptions } from './routes/subscriptions.route';
import { PaymentMethods } from './routes/payment-method.route';
import { Categories } from './routes/categories.route';
import { SignIn } from './routes/sign-in.route';
import { SignUp } from './routes/sign-up.route';
import { ProtectedRoute } from './components/protected-route.component';
import Drawer from './components/drawer.component';
import { RequestReset } from './routes/request-reset';
import { ResetPassword } from './routes/reset-password.route';
import { Settings } from './routes/settings.route';

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
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" />
                  </ProtectedRoute>
                }
              />
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

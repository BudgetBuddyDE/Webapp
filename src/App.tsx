import * as React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Main } from './components/main.component';
import { Copyright } from './components/copyright.component';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Dashboard } from './routes/dashboard.route';
import { SignIn } from './routes/sign-in.route';
import { SignUp } from './routes/sign-up.route';
import { ProtectedRoute } from './components/protected-route.component';
import Drawer from './components/drawer.component';

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
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/sign-in" element={<SignIn />} />
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

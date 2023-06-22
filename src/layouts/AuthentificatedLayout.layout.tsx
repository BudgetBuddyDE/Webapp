import { Box, Container } from '@mui/material';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppBar, Copyright, Drawer, FilterDrawer, Main } from '../components';
import { AuthContext } from '../context';

export type AuthentificatedLayoutProps = React.PropsWithChildren<{}>;

export const AuthentificatedLayout: React.FC<AuthentificatedLayoutProps> = ({ children }) => {
  const { loading, session } = React.useContext(AuthContext);

  if (loading) return <p>loading...</p>;
  if (!session || !session.user) return <Navigate to="/sign-in" />;
  return (
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
        <AppBar />

        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
          {children}
          <Outlet />
          <FilterDrawer />
        </Container>

        <Box sx={{ mt: 'auto' }}>
          <Copyright />
        </Box>
      </Main>
    </Box>
  );
};

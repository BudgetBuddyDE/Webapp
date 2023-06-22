import { Box, Container } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Copyright, Main } from '../components';

export type NotAuthentificatedLayoutProps = React.PropsWithChildren<{}>;

export const NotAuthentificatedLayout: React.FC<NotAuthentificatedLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
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
        <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
          {children}
          <Outlet />
        </Container>

        <Box sx={{ mt: 'auto' }}>
          <Copyright />
        </Box>
      </Main>
    </Box>
  );
};

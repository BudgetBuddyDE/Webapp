import React from 'react';
import { Box, Container } from '@mui/material';
import { AppBar, Footer } from '@/components/Layout';
import { Drawer, useDrawerStore } from '@/components/Layout/Drawer';
import { Main } from '@/components/Base';
import { FilterDrawer } from '@/core/Filter';
import { useKeyPress } from '@/hooks';

export type TAuthLayout = React.PropsWithChildren;

export const AuthLayout: React.FC<TAuthLayout> = ({ children }) => {
  const { toggle } = useDrawerStore();
  useKeyPress(
    'b',
    (event) => {
      event.preventDefault();
      toggle();
    },
    { requiresCtrl: true }
  );

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
        </Container>

        <Box sx={{ mt: 'auto' }}>
          <Footer />
        </Box>
      </Main>

      <FilterDrawer />
    </Box>
  );
};

import {Box, Container} from '@mui/material';
import React from 'react';

import {Main} from '@/components/Base';
import {FilterDrawer} from '@/components/Filter';
import {AppBar, Footer} from '@/components/Layout';
import {Drawer} from '@/components/Layout/Drawer';

export type TAuthLayout = React.PropsWithChildren;

export const AuthLayout: React.FC<TAuthLayout> = ({children}) => {
  return (
    <Box sx={{display: 'flex'}}>
      <Drawer />
      <Main
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'auto',
          height: '100vh',
          backgroundColor: theme => theme.palette.background.default,
        }}>
        <AppBar />

        <Container maxWidth="xl" sx={{mt: 2, mb: 4}}>
          {children}
        </Container>

        <Box sx={{mt: 'auto'}}>
          <Footer />
        </Box>
      </Main>

      <FilterDrawer />
    </Box>
  );
};

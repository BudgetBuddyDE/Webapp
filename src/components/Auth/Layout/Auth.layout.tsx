import {Box, Container, alpha} from '@mui/material';
import React from 'react';

import {Main} from '@/components/Base';
import {CookieDisclaimer} from '@/components/CookieDisclaimer';
import {FilterDrawer} from '@/components/Filter';
import {AppBar, Footer} from '@/components/Layout';
import {Drawer} from '@/components/Layout/Drawer';

import {EnvironmentDisclaimer} from './EnvironmentDisclaimer.component';

export type TAuthLayout = React.PropsWithChildren;

export const AuthLayout: React.FC<TAuthLayout> = ({children}) => {
  return (
    <Box sx={{display: 'flex'}}>
      <Drawer />
      <Main
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'auto',
          height: '100vh',
          backgroundColor: theme => alpha(theme.palette.background.default, 1),
        }}>
        <EnvironmentDisclaimer />

        <AppBar />

        <Container maxWidth="xl" sx={{mt: 2, mb: 4}}>
          {children}
        </Container>

        <Box sx={{mt: 'auto'}} children={<Footer />} />
        <CookieDisclaimer />
      </Main>

      <FilterDrawer />
    </Box>
  );
};

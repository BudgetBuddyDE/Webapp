import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import React from 'react';

import {CookieDisclaimer} from '@/components/CookieDisclaimer/CookieDisclaimer.component';
import {FilterDrawer} from '@/components/Filter/FilterDrawer.component';
import {AppBar} from '@/components/Layout/AppBar.component';
import {Drawer} from '@/components/Layout/Drawer/Drawer.component';
import {Footer} from '@/components/Layout/Footer.component';

import {EnvironmentDisclaimer} from './EnvironmentDisclaimer.component';
import {Main} from './Main.component';

export type TNewAuthLayoutProps = React.PropsWithChildren;

export const NewAuthLayout: React.FC<TNewAuthLayoutProps> = ({children}) => {
  return (
    <Box sx={{display: 'flex', backgroundColor: 'red'}}>
      <Drawer />
      <Main
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'auto',
          height: '100dvh',
          backgroundColor: theme => theme.palette.background.default,
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
